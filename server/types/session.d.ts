import 'express-session';

declare module 'express-session' {
  interface SessionData {
    ltiContext?: {
      userId: string;
      courseId: string;
      isDevelopment: boolean;
      claims?: any;
    };
  }
}