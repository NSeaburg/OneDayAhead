import { promises as fs } from 'fs';
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
}

export interface BotConfig {
  name: string;
  description: string;
  avatar: string;
  role: string;
  personality: string;
  config: any;
  keywords?: any;
}

export class ContentManager {
  private contentRoot = path.join(process.cwd(), 'content');

  async scanContentPackages(): Promise<ContentPackage[]> {
    const packages: ContentPackage[] = [];
    
    try {
      const districts = await fs.readdir(this.contentRoot, { withFileTypes: true });
      
      for (const district of districts) {
        if (!district.isDirectory()) continue;
        
        const districtPath = path.join(this.contentRoot, district.name);
        const courses = await fs.readdir(districtPath, { withFileTypes: true });
        
        for (const course of courses) {
          if (!course.isDirectory()) continue;
          
          const coursePath = path.join(districtPath, course.name);
          const topics = await fs.readdir(coursePath, { withFileTypes: true });
          
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

      return {
        id: `${district}/${course}/${topic}`,
        name: topic.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: `${course} - ${topic}`,
        district,
        course,
        topic,
        assessmentBot,
        teachingBots
      };
    } catch (error) {
      console.error(`Error loading content package ${district}/${course}/${topic}:`, error);
      return null;
    }
  }

  private async loadBotConfig(botPath: string): Promise<BotConfig> {
    try {
      // Try to load personality from config.json instead of personality.txt
      let personality = 'You are a helpful AI assistant.';
      
      // Load config
      const configPath = path.join(botPath, 'config.json');
      const configData = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configData);
      
      // Load keywords if available
      let keywords = null;
      try {
        const keywordsPath = path.join(botPath, 'keywords.json');
        const keywordsData = await fs.readFile(keywordsPath, 'utf8');
        keywords = JSON.parse(keywordsData);
      } catch (error) {
        // Keywords are optional
      }
      
      return {
        name: config.name,
        description: config.description,
        avatar: config.avatar,
        role: config.role,
        personality: config.personality || personality,
        config,
        keywords
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
      await fs.writeFile(personalityPath, personality, 'utf8');
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
      return await fs.readFile(personalityPath, 'utf8');
    } catch (error) {
      console.error(`Error getting personality for ${district}/${course}/${topic}:`, error);
      throw error;
    }
  }

  async createContentPackage(district: string, course: string, topic: string, template?: string): Promise<void> {
    try {
      const topicPath = path.join(this.contentRoot, district, course, topic);
      
      // Create directory structure
      await fs.mkdir(path.join(topicPath, 'assessment-bot'), { recursive: true });
      await fs.mkdir(path.join(topicPath, 'teaching-bots', 'high-level'), { recursive: true });
      await fs.mkdir(path.join(topicPath, 'teaching-bots', 'medium-level'), { recursive: true });
      await fs.mkdir(path.join(topicPath, 'teaching-bots', 'low-level'), { recursive: true });
      
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

  private async createBasicFiles(topicPath: string, topic: string): Promise<void> {
    // Create basic assessment bot files
    await fs.writeFile(
      path.join(topicPath, 'assessment-bot', 'personality.txt'),
      'You are an assessment bot. Please customize this personality for your specific topic.',
      'utf8'
    );
    
    await fs.writeFile(
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
    
    await fs.writeFile(
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
      
      await fs.writeFile(
        path.join(topicPath, 'teaching-bots', level, 'personality.txt'),
        `You are a ${levelName} teaching bot. Please customize this personality for your specific topic.`,
        'utf8'
      );
      
      await fs.writeFile(
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