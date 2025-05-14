import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cookieParser from "cookie-parser";
import { sessionMiddleware } from "./middleware/session";
import { corsMiddleware, securityHeadersMiddleware, cookieConfig } from "./middleware/security";
import { runMigrations } from "./migrations";

// Initialize Express app
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Security middleware
app.use(corsMiddleware);
app.use(securityHeadersMiddleware);

// Cookie handling with secure settings
app.use(cookieParser(process.env.COOKIE_SECRET || 'learning-platform-secret-key'));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Global flag to track database availability
let isDatabaseAvailable = false;

// Apply session middleware 
app.use(sessionMiddleware);

// Add middleware to handle database status
app.use((req: Request, res: Response, next: NextFunction) => {
  // Add header for database availability
  res.setHeader('X-Database-Available', isDatabaseAvailable.toString());
  next();
});

(async () => {
  try {
    // Set up server and routes first, so it can run even if DB fails
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      console.error(err);
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
    
    // Try to run migrations, but continue even if database is unavailable
    try {
      console.log("Running database migrations...");
      await runMigrations();
      console.log("All migrations completed successfully");
      isDatabaseAvailable = true;
    } catch (dbError) {
      console.error("Error running migrations:", dbError);
      log("WARNING: Database is not available. The application will run with limited functionality.", "express");
      // Don't exit, allow the app to run without database
    }
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
