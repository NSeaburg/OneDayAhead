import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cookieParser from "cookie-parser";
import { sessionMiddleware } from "./middleware/session";
import {
  corsMiddleware,
  securityHeadersMiddleware,
} from "./middleware/security";
import { runMigrations } from "./migrations";
import { pool } from "./db";
import { useMemoryStorage } from "./storage";

const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(corsMiddleware);
app.use(securityHeadersMiddleware);
app.use(
  cookieParser(process.env.COOKIE_SECRET || "learning-platform-secret-key"),
);

app.use((req, res, next) => {
  const start = Date.now();
  let captured: any;
  const ogJson = res.json;
  res.json = function (body, ...a) {
    captured = body;
    return ogJson.apply(res, [body, ...a]);
  };
  res.on("finish", () => {
    if (!req.path.startsWith("/api")) return;
    const ms = Date.now() - start;
    let line = `${req.method} ${req.path} ${res.statusCode} in ${ms}ms`;
    if (captured) line += ` :: ${JSON.stringify(captured)}`;
    if (line.length > 80) line = line.slice(0, 79) + "…";
    log(line);
  });
  next();
});

// Test database connection before anything else
async function testDatabaseConnection(retries = 5) {
  console.log("🔍 Testing basic database connection...");
  console.log(
    "📍 Database URL:",
    process.env.DATABASE_URL?.replace(/\/\/.*:.*@/, "//***:***@"),
  );

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Connection attempt ${attempt}/${retries}...`);
      
      // Use a timeout wrapper for the entire connection attempt
      const connectionPromise = pool.connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 25 seconds')), 25000)
      );
      
      const client = await Promise.race([connectionPromise, timeoutPromise]) as any;
      console.log("✅ Database connection successful!");
      
      // Simple test query
      try {
        const result = await client.query('SELECT NOW() as current_time');
        console.log("📊 Database query test successful at:", result.rows[0].current_time);
      } catch (queryError) {
        console.log("⚠️ Database connected but query test failed:", queryError);
      }
      
      client.release();
      return true;
    } catch (error) {
      console.error(`❌ Connection attempt ${attempt}/${retries} failed:`);
      console.error("🚨 Error details:", error);
      
      if (attempt < retries) {
        const waitTime = Math.min(attempt * 3000, 10000); // Progressive backoff: 3s, 6s, 9s, 10s, 10s
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  return false;
}

(async () => {
  try {
    const skipDb = process.env.SKIP_DB_MIGRATIONS === "true";
    let dbAvailable = false;

    if (skipDb) {
      console.log("⚠️  Skipping DB migrations (CI smoke-test)");
    } else {
      // Test connection first
      const connectionSuccess = await testDatabaseConnection();
      if (!connectionSuccess) {
        console.log("⚠️  Database connection failed - running in offline mode");
        console.log("📝 App will function with limited features (no data persistence)");
        useMemoryStorage(); // Switch to in-memory storage
        dbAvailable = false;
      } else {
        console.log("🔄 Running database migrations...");
        await runMigrations();
        console.log("✅ Migrations completed successfully");
        dbAvailable = true;
      }
    }

    // Skip session store when DB is not available
    if (skipDb || !dbAvailable) {
      console.log("⚠️  Skipping session store (no database available)");
    } else {
      app.use(sessionMiddleware);
    }

    // Pass database availability to routes
    const server = await registerRoutes(app, { dbAvailable });

    app.get("/health", (_req, res) => res.status(200).send("OK"));

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.status || 500).json({ message: err.message || "Error" });
      throw err;
    });

    if (app.get("env") === "development") {
      app.use((req, res, next) => {
        if (req.query.production === "true") {
          serveStatic(app);
        } else next();
      });
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = Number(process.env.PORT) || 5000;
    server.listen({ port, host: "0.0.0.0", reusePort: true }, () =>
      log(`🚀 serving on port ${port}`),
    );
  } catch (err) {
    console.error("💥 Failed to start server:", err);
    process.exit(1);
  }
})();
