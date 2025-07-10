import * as fs from 'fs';
import path from 'path';

export interface ContentPackage {
  id: string;
  name: string;
  description: string;
  district: string;
  course: string;
  topic: string;
  assessmentBot: BotConfig;
  teachingBots: {
    high: BotConfig;
    medium: BotConfig;
    low: BotConfig;
  };
  assessmentCriteria?: AssessmentCriteria;
  feedbackInstructions?: FeedbackInstructions;
}

export interface AssessmentCriteria {
  name: string;
  description: string;
  subject: string;
  gradeLevel: string;
  evaluationPrompt: string;
  routingCriteria: {
    high: RoutingLevel;
    medium: RoutingLevel;
    low: RoutingLevel;
  };
  fallbackLevel: string;
}

export interface RoutingLevel {
  description: string;
  indicators: string[];
  teachingBot: string;
  minScore: number;
}

export interface FeedbackInstructions {
  name: string;
  description: string;
  subject: string;
  gradeLevel: string;
  gradingPrompt: string;
  feedbackComponents: {
    summary: FeedbackComponent;
    contentKnowledgeScore: FeedbackComponent;
    writingScore: FeedbackComponent;
    nextSteps: FeedbackComponent;
  };
  rubricGuidelines: {
    excellentPerformance: PerformanceLevel;
    proficientPerformance: PerformanceLevel;
    developingPerformance: PerformanceLevel;
    beginningPerformance: PerformanceLevel;
  };
}

export interface FeedbackComponent {
  description: string;
  scale?: string;
  focusAreas?: string[];
  requirements?: string[];
  length?: string;
  examples?: string[];
}

export interface PerformanceLevel {
  contentRange: string;
  writingRange: string;
  characteristics: string[];
}

export interface BotConfig {
  name: string;
  description: string;
  avatar: string;
  role: string;
  personality: string;
  config: any;
  keywords?: any;
  uiConfig?: any;
}

export class ContentManager {
  private contentRoot = path.join(process.cwd(), 'content');

  async scanContentPackages(): Promise<ContentPackage[]> {
    const packages: ContentPackage[] = [];
    
    try {
      const districts = await fs.promises.readdir(this.contentRoot, { withFileTypes: true });
      
      for (const district of districts) {
        if (!district.isDirectory()) continue;
        
        const districtPath = path.join(this.contentRoot, district.name);
        const courses = await fs.promises.readdir(districtPath, { withFileTypes: true });
        
        for (const course of courses) {
          if (!course.isDirectory()) continue;
          
          const coursePath = path.join(districtPath, course.name);
          const topics = await fs.promises.readdir(coursePath, { withFileTypes: true });
          
          for (const topic of topics) {
            if (!topic.isDirectory()) continue;
            
            const topicPath = path.join(coursePath, topic.name);
            const packageData = await this.loadContentPackage(district.name, course.name, topic.name);
            
            if (packageData) {
              packages.push(packageData);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error scanning content packages:', error);
    }
    
    return packages;
  }

  async loadContentPackage(district: string, course: string, topic: string): Promise<ContentPackage | null> {
    try {
      const topicPath = path.join(this.contentRoot, district, course, topic);
      
      // Check if this is a new-style unified config (single config.json file)
      const unifiedConfigPath = path.join(topicPath, 'config.json');
      if (fs.existsSync(unifiedConfigPath)) {
        return await this.loadUnifiedContentPackage(topicPath, district, course, topic);
      }
      
      // Fall back to old-style individual bot configs
      // Load assessment bot
      const assessmentBot = await this.loadBotConfig(
        path.join(topicPath, 'assessment-bot')
      );
      
      // Load teaching bots
      const teachingBots = {
        high: await this.loadBotConfig(
          path.join(topicPath, 'teaching-bots', 'high-level')
        ),
        medium: await this.loadBotConfig(
          path.join(topicPath, 'teaching-bots', 'medium-level')
        ),
        low: await this.loadBotConfig(
          path.join(topicPath, 'teaching-bots', 'low-level')
        )
      };

      // Load assessment criteria and feedback instructions
      const assessmentCriteria = await this.loadAssessmentCriteria(topicPath);
      const feedbackInstructions = await this.loadFeedbackInstructions(topicPath);

      return {
        id: `${district}/${course}/${topic}`,
        name: topic.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: `${course} - ${topic}`,
        district,
        course,
        topic,
        assessmentBot,
        teachingBots,
        assessmentCriteria,
        feedbackInstructions
      };
    } catch (error) {
      console.error(`Error loading content package ${district}/${course}/${topic}:`, error);
      return null;
    }
  }

  private async loadUnifiedContentPackage(topicPath: string, district: string, course: string, topic: string): Promise<ContentPackage | null> {
    try {
      const configPath = path.join(topicPath, 'config.json');
      console.log('Loading unified config from:', configPath);
      const configData = JSON.parse(await fs.promises.readFile(configPath, 'utf8'));
      console.log('Loaded unified config:', configData);
      
      return {
        id: `${district}/${course}/${topic}`,
        name: configData.name || topic.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        description: configData.description || `${course} - ${topic}`,
        district: configData.district || district,
        course: configData.course || course,
        topic: configData.topic || topic,
        assessmentBot: configData.assessmentBot,
        teachingBots: configData.teachingBots
      };
    } catch (error) {
      console.error('Error loading unified content package:', error);
      return null;
    }
  }

  private async loadBotConfig(botPath: string): Promise<BotConfig> {
    try {
      // Load config (personality is now stored in config.json)
      const configPath = path.join(botPath, 'config.json');
      const configData = await fs.promises.readFile(configPath, 'utf8');
      const config = JSON.parse(configData);
      
      // Load keywords if available
      let keywords = null;
      try {
        const keywordsPath = path.join(botPath, 'keywords.json');
        const keywordsData = await fs.promises.readFile(keywordsPath, 'utf8');
        keywords = JSON.parse(keywordsData);
      } catch (error) {
        // Keywords are optional
      }
      
      // Load UI config if available
      let uiConfig = null;
      try {
        const uiConfigPath = path.join(botPath, 'ui-config.json');
        const uiConfigData = await fs.promises.readFile(uiConfigPath, 'utf8');
        uiConfig = JSON.parse(uiConfigData);
      } catch (error) {
        // UI config is optional
      }
      
      return {
        name: config.name,
        description: config.description,
        avatar: config.avatar,
        role: config.role,
        personality: config.personality || "",
        config,
        keywords,
        uiConfig
      };
    } catch (error) {
      console.error(`Error loading bot config from ${botPath}:`, error);
      throw error;
    }
  }

  async savePersonality(district: string, course: string, topic: string, botType: string, level: string | null, personality: string): Promise<void> {
    try {
      let botPath: string;
      
      if (botType === 'assessment') {
        botPath = path.join(this.contentRoot, district, course, topic, 'assessment-bot');
      } else if (botType === 'teaching' && level) {
        botPath = path.join(this.contentRoot, district, course, topic, 'teaching-bots', `${level}-level`);
      } else {
        throw new Error('Invalid bot type or missing level');
      }
      
      const personalityPath = path.join(botPath, 'personality.txt');
      await fs.promises.writeFile(personalityPath, personality, 'utf8');
    } catch (error) {
      console.error(`Error saving personality for ${district}/${course}/${topic}:`, error);
      throw error;
    }
  }

  async getPersonality(district: string, course: string, topic: string, botType: string, level: string | null): Promise<string> {
    try {
      let botPath: string;
      
      if (botType === 'assessment') {
        botPath = path.join(this.contentRoot, district, course, topic, 'assessment-bot');
      } else if (botType === 'teaching' && level) {
        botPath = path.join(this.contentRoot, district, course, topic, 'teaching-bots', `${level}-level`);
      } else {
        throw new Error('Invalid bot type or missing level');
      }
      
      const personalityPath = path.join(botPath, 'personality.txt');
      return await fs.promises.readFile(personalityPath, 'utf8');
    } catch (error) {
      console.error(`Error getting personality for ${district}/${course}/${topic}:`, error);
      throw error;
    }
  }

  async createContentPackage(district: string, course: string, topic: string, template?: string): Promise<void> {
    try {
      const topicPath = path.join(this.contentRoot, district, course, topic);
      
      // Create directory structure
      await fs.promises.mkdir(path.join(topicPath, 'assessment-bot'), { recursive: true });
      await fs.promises.mkdir(path.join(topicPath, 'teaching-bots', 'high-level'), { recursive: true });
      await fs.promises.mkdir(path.join(topicPath, 'teaching-bots', 'medium-level'), { recursive: true });
      await fs.promises.mkdir(path.join(topicPath, 'teaching-bots', 'low-level'), { recursive: true });
      
      if (template) {
        // Copy from template
        await this.copyTemplate(template, topicPath);
      } else {
        // Create basic files
        await this.createBasicFiles(topicPath, topic);
      }
    } catch (error) {
      console.error(`Error creating content package ${district}/${course}/${topic}:`, error);
      throw error;
    }
  }

  private async copyTemplate(templatePath: string, targetPath: string): Promise<void> {
    // Copy template implementation - for now just create basic files
    await this.createBasicFiles(targetPath, path.basename(targetPath));
  }

  private async loadAssessmentCriteria(topicPath: string): Promise<AssessmentCriteria | undefined> {
    try {
      const criteriaPath = path.join(topicPath, 'assessment-criteria.json');
      if (fs.existsSync(criteriaPath)) {
        const data = await fs.promises.readFile(criteriaPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading assessment criteria:', error);
    }
    return undefined;
  }

  private async loadFeedbackInstructions(topicPath: string): Promise<FeedbackInstructions | undefined> {
    try {
      const instructionsPath = path.join(topicPath, 'feedback-instructions.json');
      if (fs.existsSync(instructionsPath)) {
        const data = await fs.promises.readFile(instructionsPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading feedback instructions:', error);
    }
    return undefined;
  }

  private async createBasicFiles(topicPath: string, topic: string): Promise<void> {
    // Create basic assessment bot files
    await fs.promises.writeFile(
      path.join(topicPath, 'assessment-bot', 'personality.txt'),
      'You are an assessment bot. Please customize this personality for your specific topic.',
      'utf8'
    );
    
    await fs.promises.writeFile(
      path.join(topicPath, 'assessment-bot', 'config.json'),
      JSON.stringify({
        name: 'Assessment Bot',
        description: `Assessment bot for ${topic}`,
        avatar: 'default-avatar.png',
        role: 'assessment',
        subject: 'general',
        gradeLevel: 'varies'
      }, null, 2),
      'utf8'
    );
    
    await fs.promises.writeFile(
      path.join(topicPath, 'assessment-bot', 'keywords.json'),
      JSON.stringify({
        progressKeywords: [],
        completionKeywords: [],
        topicMapping: {}
      }, null, 2),
      'utf8'
    );
    
    // Create teaching bot files
    const levels = ['high-level', 'medium-level', 'low-level'];
    const levelNames = ['High Level', 'Medium Level', 'Low Level'];
    
    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];
      const levelName = levelNames[i];
      
      await fs.promises.writeFile(
        path.join(topicPath, 'teaching-bots', level, 'personality.txt'),
        `You are a ${levelName} teaching bot. Please customize this personality for your specific topic.`,
        'utf8'
      );
      
      await fs.promises.writeFile(
        path.join(topicPath, 'teaching-bots', level, 'config.json'),
        JSON.stringify({
          name: `${levelName} Teacher`,
          description: `${levelName} teaching bot for ${topic}`,
          avatar: 'default-avatar.png',
          role: 'teaching',
          level: level.replace('-level', ''),
          subject: 'general'
        }, null, 2),
        'utf8'
      );
    }
  }
}

export const contentManager = new ContentManager();