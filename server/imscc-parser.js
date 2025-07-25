const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const xml2js = require('xml2js');
const cheerio = require('cheerio');

class IMSCCParser {
  constructor() {
    this.parser = new xml2js.Parser();
  }

  // Main parsing function
  async parseIMSCC(filePath) {
    const tempDir = path.join(__dirname, 'temp', Date.now().toString());
    
    try {
      // Create temp directory
      if (!fs.existsSync(path.join(__dirname, 'temp'))) {
        fs.mkdirSync(path.join(__dirname, 'temp'), { recursive: true });
      }
      
      // Extract the .imscc file
      await this.extractZip(filePath, tempDir);
      
      // Parse the manifest
      const manifestPath = path.join(tempDir, 'imsmanifest.xml');
      const manifest = await this.parseXMLFile(manifestPath);
      
      // Extract course structure
      const courseData = {
        title: this.getCourseTitle(manifest),
        modules: await this.parseModules(tempDir, manifest),
        assignments: await this.parseAssignments(tempDir),
        quizzes: await this.parseQuizzes(tempDir),
        pages: await this.parsePages(tempDir),
        files: await this.parseFiles(tempDir),
        rawManifest: manifest // Include for debugging
      };
      
      // Clean up temp directory
      this.cleanupTemp(tempDir);
      
      return courseData;
    } catch (error) {
      this.cleanupTemp(tempDir);
      throw error;
    }
  }

  // Extract ZIP file
  extractZip(filePath, outputDir) {
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(unzipper.Extract({ path: outputDir }))
        .on('close', resolve)
        .on('error', reject);
    });
  }

  // Parse XML file
  async parseXMLFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`XML file not found: ${filePath}`);
    }
    const xml = fs.readFileSync(filePath, 'utf8');
    return await this.parser.parseStringPromise(xml);
  }

  // Get course title from manifest
  getCourseTitle(manifest) {
    try {
      // Try multiple possible locations for course title
      if (manifest.manifest?.metadata?.[0]?.lom?.[0]?.general?.[0]?.title?.[0]?.string?.[0]?._) {
        return manifest.manifest.metadata[0].lom[0].general[0].title[0].string[0]._;
      }
      if (manifest.manifest?.metadata?.[0]?.schema?.[0]) {
        return manifest.manifest.metadata[0].schema[0];
      }
      if (manifest.manifest?.organizations?.[0]?.organization?.[0]?.title?.[0]) {
        return manifest.manifest.organizations[0].organization[0].title[0];
      }
      return 'Untitled Course';
    } catch (e) {
      return 'Untitled Course';
    }
  }

  // Parse modules
  async parseModules(tempDir, manifest) {
    const modules = [];
    
    try {
      const organizations = manifest.manifest?.organizations?.[0]?.organization?.[0];
      
      if (organizations?.item) {
        for (const item of organizations.item) {
          modules.push({
            title: item.title ? item.title[0] : 'Untitled Module',
            identifier: item.$.identifier,
            items: await this.parseModuleItems(item)
          });
        }
      }
    } catch (e) {
      console.log('Error parsing modules:', e.message);
    }
    
    return modules;
  }

  // Parse individual module items
  async parseModuleItems(moduleItem) {
    const items = [];
    
    try {
      if (moduleItem.item) {
        for (const item of moduleItem.item) {
          items.push({
            title: item.title ? item.title[0] : 'Untitled Item',
            type: item.$.identifierref ? 'content' : 'folder',
            identifier: item.$.identifier,
            resourceRef: item.$.identifierref || null
          });
        }
      }
    } catch (e) {
      console.log('Error parsing module items:', e.message);
    }
    
    return items;
  }

  // Parse assignments
  async parseAssignments(tempDir) {
    const assignments = [];
    const assignmentsDir = path.join(tempDir, 'course_settings');
    
    try {
      if (fs.existsSync(assignmentsDir)) {
        const files = fs.readdirSync(assignmentsDir);
        for (const file of files) {
          if (file.includes('assignment') && file.endsWith('.xml')) {
            const assignmentData = await this.parseXMLFile(path.join(assignmentsDir, file));
            assignments.push({
              filename: file,
              data: assignmentData
            });
          }
        }
      }
    } catch (e) {
      console.log('Error parsing assignments:', e.message);
    }
    
    return assignments;
  }

  // Parse quiz data
  async parseQuizzes(tempDir) {
    const quizzes = [];
    const quizDir = path.join(tempDir, 'quizzes');
    
    try {
      if (fs.existsSync(quizDir)) {
        const quizFiles = fs.readdirSync(quizDir);
        for (const file of quizFiles) {
          if (file.endsWith('.xml')) {
            const quizData = await this.parseXMLFile(path.join(quizDir, file));
            quizzes.push({
              filename: file,
              title: this.extractQuizTitle(quizData),
              questions: this.extractQuizQuestions(quizData),
              rawData: quizData
            });
          }
        }
      }
    } catch (e) {
      console.log('Error parsing quizzes:', e.message);
    }
    
    return quizzes;
  }

  // Parse HTML pages
  async parsePages(tempDir) {
    const pages = [];
    const wikiDir = path.join(tempDir, 'wiki_content');
    
    try {
      if (fs.existsSync(wikiDir)) {
        const pageFiles = fs.readdirSync(wikiDir);
        for (const file of pageFiles) {
          if (file.endsWith('.html')) {
            const content = fs.readFileSync(path.join(wikiDir, file), 'utf8');
            const $ = cheerio.load(content);
            
            pages.push({
              filename: file,
              title: $('title').text() || file.replace('.html', ''),
              textContent: $('body').text().trim(),
              html: content,
              wordCount: $('body').text().trim().split(/\s+/).length
            });
          }
        }
      }
    } catch (e) {
      console.log('Error parsing pages:', e.message);
    }
    
    return pages;
  }

  // List all files
  async parseFiles(tempDir) {
    const files = [];
    const webDir = path.join(tempDir, 'web_resources');
    
    try {
      if (fs.existsSync(webDir)) {
        this.walkDir(webDir, (filePath) => {
          const stats = fs.statSync(filePath);
          files.push({
            path: path.relative(webDir, filePath),
            name: path.basename(filePath),
            type: path.extname(filePath),
            size: stats.size
          });
        });
      }
    } catch (e) {
      console.log('Error parsing files:', e.message);
    }
    
    return files;
  }

  // Helper functions
  extractQuizTitle(quizData) {
    try {
      if (quizData.quiz?.title?.[0]) {
        return quizData.quiz.title[0];
      }
      if (quizData.quiz?.$?.title) {
        return quizData.quiz.$.title;
      }
      return 'Untitled Quiz';
    } catch (e) {
      return 'Untitled Quiz';
    }
  }

  extractQuizQuestions(quizData) {
    const questions = [];
    try {
      if (quizData.quiz?.question) {
        for (const question of quizData.quiz.question) {
          questions.push({
            text: question.question_text?.[0] || 'Question text not available',
            type: question.question_type?.[0] || 'unknown',
            points: question.points_possible?.[0] || 0
          });
        }
      }
    } catch (e) {
      console.log('Error extracting quiz questions:', e.message);
    }
    return questions;
  }

  walkDir(dir, callback) {
    try {
      fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? this.walkDir(dirPath, callback) : callback(dirPath);
      });
    } catch (e) {
      console.log('Error walking directory:', e.message);
    }
  }

  cleanupTemp(dir) {
    try {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    } catch (e) {
      console.log('Error cleaning up temp directory:', e.message);
    }
  }

  // Generate a summary for the AI assistant
  generateCourseSummary(courseData) {
    const summary = {
      title: courseData.title,
      structure: {
        moduleCount: courseData.modules.length,
        totalItems: courseData.modules.reduce((sum, module) => sum + module.items.length, 0),
        pagesCount: courseData.pages.length,
        quizzesCount: courseData.quizzes.length,
        filesCount: courseData.files.length
      },
      content: {
        totalWords: courseData.pages.reduce((sum, page) => sum + (page.wordCount || 0), 0),
        hasQuizzes: courseData.quizzes.length > 0,
        hasAssignments: courseData.assignments.length > 0
      },
      modules: courseData.modules.map(module => ({
        name: module.title,
        itemCount: module.items.length
      })),
      pages: courseData.pages.slice(0, 5).map(page => ({
        title: page.title,
        wordCount: page.wordCount,
        preview: page.textContent.substring(0, 200) + '...'
      }))
    };

    return summary;
  }
}

module.exports = IMSCCParser;