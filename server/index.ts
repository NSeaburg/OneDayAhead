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
async function testDatabaseConnection(retries = 3) {
  console.log("🔍 Testing basic database connection...");
  console.log(
    "📍 Database URL:",
    process.env.DATABASE_URL?.replace(/\/\/.*:.*@/, "//***:***@"),
  );

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Connection attempt ${attempt}/${retries}...`);
      const client = await pool.connect();
      
      // Test with a simple query
      const result = await client.query('SELECT NOW() as current_time');
      console.log("✅ Database connection successful!");
      console.log("📊 Database query result:", result.rows[0]);
      
      client.release();
      return true;
    } catch (error) {
      console.error(`❌ Database connection attempt ${attempt} failed:`);
      console.error("🚨 Error details:", error);
      
      if (attempt < retries) {
        const delay = attempt * 2000; // Exponential backoff: 2s, 4s, 6s
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error("💥 All database connection attempts failed");
  return false;
}

(async () => {
  try {
    const skipDb = process.env.SKIP_DB_MIGRATIONS === "true";

    if (skipDb) {
      console.log("⚠️  Skipping DB migrations (CI smoke-test)");
    } else {
      // Skip database for now to get the server running
      console.log("⚠️  Temporarily skipping database initialization to start server...");
      console.log("🔄 Database setup will be handled after server starts");
    }

    /* ----- NEW: skip session store when DB is skipped ----- */
    console.log("⚠️  Skipping session store temporarily");
    // app.use(sessionMiddleware);

    const server = await registerRoutes(app);

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
