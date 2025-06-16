import axios from 'axios';
import jwt from 'jsonwebtoken';
import { LtiKeyManager } from './config';
import { storage } from '../storage';
import { LtiClaims } from './auth';

export interface GradePassbackData {
  userId: string;
  lineitemId: string;
  scoreGiven: number;
  scoreMaximum: number;
  comment?: string;
  timestamp?: string;
}

export interface LineItem {
  id: string;
  label: string;
  scoreMaximum: number;
  resourceId?: string;
  resourceLinkId?: string;
  tag?: string;
}

export interface ContextMembership {
  id: string;
  context: {
    id: string;
    label?: string;
    title?: string;
  };
  members: Array<{
    status: string;
    name?: string;
    picture?: string;
    given_name?: string;
    family_name?: string;
    email?: string;
    user_id: string;
    roles: string[];
  }>;
}

export class LtiServices {
  private static instance: LtiServices;
  
  private constructor() {}
  
  static getInstance(): LtiServices {
    if (!LtiServices.instance) {
      LtiServices.instance = new LtiServices();
    }
    return LtiServices.instance;
  }

  /**
   * Generate access token for Canvas API calls
   */
  private async generateAccessToken(claims: LtiClaims, scopes: string[]): Promise<string> {
    const keyManager = LtiKeyManager.getInstance();
    const privateKey = await keyManager.getPrivateKey();
    
    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
      iss: claims.aud, // Our client ID
      sub: claims.aud, // Our client ID
      aud: claims.iss, // Canvas platform
      iat: now,
      exp: now + 3600, // 1 hour
      jti: Math.random().toString(36),
      scopes: scopes.join(' ')
    };

    return jwt.sign(tokenPayload, privateKey.toPEM(true), { algorithm: 'RS256' });
  }

  /**
   * Get access token from Canvas
   */
  private async getCanvasAccessToken(claims: LtiClaims, scopes: string[]): Promise<string> {
    const platform = await storage.getLtiPlatformByIssuer(claims.iss);
    if (!platform) {
      throw new Error('Platform not found');
    }

    const clientAssertion = await this.generateAccessToken(claims, scopes);
    
    const tokenRequest = {
      grant_type: 'client_credentials',
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: clientAssertion,
      scope: scopes.join(' ')
    };

    try {
      const response = await axios.post(platform.accesstokenEndpoint, new URLSearchParams(tokenRequest), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      });

      return response.data.access_token;
    } catch (error) {
      console.error('Failed to get Canvas access token:', error);
      throw new Error('Access token request failed');
    }
  }

  /**
   * Submit grade to Canvas via Assignment and Grade Services (AGS)
   */
  async submitGrade(claims: LtiClaims, gradeData: GradePassbackData): Promise<boolean> {
    try {
      const agsEndpoint = claims['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'];
      if (!agsEndpoint?.lineitems) {
        console.warn('No AGS endpoint available for grade passback');
        return false;
      }

      const scopes = ['https://purl.imsglobal.org/spec/lti-ags/scope/score'];
      const accessToken = await this.getCanvasAccessToken(claims, scopes);

      const scoreData = {
        timestamp: gradeData.timestamp || new Date().toISOString(),
        scoreGiven: gradeData.scoreGiven,
        scoreMaximum: gradeData.scoreMaximum,
        comment: gradeData.comment,
        activityProgress: 'Completed',
        gradingProgress: 'FullyGraded',
        userId: gradeData.userId
      };

      const scoreUrl = `${gradeData.lineitemId}/scores`;
      
      await axios.post(scoreUrl, scoreData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/vnd.ims.lis.v1.score+json',
          'Accept': 'application/vnd.ims.lis.v1.score+json'
        }
      });

      console.log(`Grade successfully submitted to Canvas: ${gradeData.scoreGiven}/${gradeData.scoreMaximum}`);
      return true;
    } catch (error) {
      console.error('Grade passback failed:', error);
      return false;
    }
  }

  /**
   * Get line items (assignments) from Canvas
   */
  async getLineItems(claims: LtiClaims): Promise<LineItem[]> {
    try {
      const agsEndpoint = claims['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'];
      if (!agsEndpoint?.lineitems) {
        return [];
      }

      const scopes = ['https://purl.imsglobal.org/spec/lti-ags/scope/lineitem'];
      const accessToken = await this.getCanvasAccessToken(claims, scopes);

      const response = await axios.get(agsEndpoint.lineitems, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.ims.lis.v2.lineitemcontainer+json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get line items:', error);
      return [];
    }
  }

  /**
   * Get context membership (course roster) via Names and Role Provisioning Service (NRPS)
   */
  async getContextMembership(claims: LtiClaims): Promise<ContextMembership | null> {
    try {
      const nrpsEndpoint = claims['https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice'];
      if (!nrpsEndpoint?.context_memberships_url) {
        return null;
      }

      const scopes = ['https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly'];
      const accessToken = await this.getCanvasAccessToken(claims, scopes);

      const response = await axios.get(nrpsEndpoint.context_memberships_url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.ims.lti-nrps.v2.membershipcontainer+json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get context membership:', error);
      return null;
    }
  }

  /**
   * Create a new line item (assignment) in Canvas
   */
  async createLineItem(claims: LtiClaims, lineItem: Omit<LineItem, 'id'>): Promise<string | null> {
    try {
      const agsEndpoint = claims['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'];
      if (!agsEndpoint?.lineitems) {
        return null;
      }

      const scopes = ['https://purl.imsglobal.org/spec/lti-ags/scope/lineitem'];
      const accessToken = await this.getCanvasAccessToken(claims, scopes);

      const response = await axios.post(agsEndpoint.lineitems, lineItem, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/vnd.ims.lis.v2.lineitem+json',
          'Accept': 'application/vnd.ims.lis.v2.lineitem+json'
        }
      });

      return response.data.id;
    } catch (error) {
      console.error('Failed to create line item:', error);
      return null;
    }
  }

  /**
   * Process assessment completion and submit grade
   */
  async processAssessmentCompletion(
    sessionId: string,
    claims: LtiClaims,
    assessmentData: {
      contentKnowledgeScore: number;
      writingScore: number;
      totalPossible?: number;
    }
  ): Promise<boolean> {
    try {
      // Calculate final grade (average of content and writing scores)
      const finalScore = Math.round((assessmentData.contentKnowledgeScore + assessmentData.writingScore) / 2);
      const maxScore = assessmentData.totalPossible || 100;

      // Store grade in database
      const ltiUser = await storage.getLtiUserByUserId(
        claims.iss === 'https://canvas.instructure.com' ? 1 : 1, // Platform ID logic
        claims.sub
      );

      if (!ltiUser) {
        console.error('LTI user not found for grade submission');
        return false;
      }

      const grade = await storage.createLtiGrade({
        sessionId,
        ltiUserId: ltiUser.id,
        lineitemId: claims['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint']?.lineitem || '',
        score: finalScore,
        maxScore,
        submissionStatus: 'submitted'
      });

      // Submit to Canvas if AGS is available
      const agsEndpoint = claims['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'];
      if (agsEndpoint?.lineitem) {
        const success = await this.submitGrade(claims, {
          userId: claims.sub,
          lineitemId: agsEndpoint.lineitem,
          scoreGiven: finalScore,
          scoreMaximum: maxScore,
          comment: `Assessment completed. Content Knowledge: ${assessmentData.contentKnowledgeScore}%, Writing: ${assessmentData.writingScore}%`,
          timestamp: new Date().toISOString()
        });

        if (success) {
          await storage.updateLtiGradeSubmission(grade.id, 'submitted_to_lms');
        }

        return success;
      }

      console.log(`Grade recorded locally: ${finalScore}/${maxScore} for user ${claims.sub}`);
      return true;
    } catch (error) {
      console.error('Assessment completion processing failed:', error);
      return false;
    }
  }

  /**
   * Get user's grades and progress
   */
  async getUserProgress(claims: LtiClaims): Promise<any> {
    try {
      const ltiUser = await storage.getLtiUserByUserId(1, claims.sub); // Platform ID logic
      if (!ltiUser) {
        return null;
      }

      const grades = await storage.getLtiGradesByUser(ltiUser.id);
      
      return {
        user: {
          id: claims.sub,
          name: claims.name,
          email: claims.email
        },
        grades: grades.map(grade => ({
          id: grade.id,
          score: grade.score,
          maxScore: grade.maxScore,
          submissionStatus: grade.submissionStatus,
          submittedAt: grade.submittedAt,
          createdAt: grade.createdAt
        })),
        averageScore: grades.length > 0 
          ? Math.round(grades.reduce((sum, g) => sum + (g.score || 0), 0) / grades.length)
          : 0
      };
    } catch (error) {
      console.error('Failed to get user progress:', error);
      return null;
    }
  }
}

export const ltiServices = LtiServices.getInstance();