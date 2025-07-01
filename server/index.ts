import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cookieParser from "cookie-parser";
import session from "express-session";
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

// Configure express-session for persistent development context
app.use(session({
  secret: process.env.SESSION_SECRET || "learning-platform-session-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    httpOnly: true
  }
}));

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
async function testDatabaseConnection() {
  console.log("🔍 Testing basic database connection...");
  console.log(
    "📍 Database URL:",
    process.env.DATABASE_URL?.replace(/\/\/.*:.*@/, "//***:***@"),
  );

  try {
    const client = await pool.connect();
    console.log("✅ Database connection successful!");
    console.log("📊 Connected to database:", client.database);
    console.log("🏠 Connected to host:", client.host);
    console.log("🔌 Connected on port:", client.port);
    client.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error("🚨 Error details:", error);
    return false;
  }
}

(async () => {
  try {
    const skipDb = process.env.SKIP_DB_MIGRATIONS === "true";
    // Check if we should use memory storage
    const useMemoryStorage = process.env.NODE_ENV === "development" && process.env.USE_MEMORY_STORAGE === "true";

    if (skipDb) {
      console.log("⚠️  Skipping DB migrations (CI smoke-test)");
    } else if (useMemoryStorage) {
      console.log("🔧 Development mode with in-memory storage - no database required");
    } else {
      // Test connection first
      const connectionSuccess = await testDatabaseConnection();
      if (!connectionSuccess) {
        if (process.env.NODE_ENV === "development") {
          console.log("🔧 Database connection failed in development mode - switching to in-memory storage");
          process.env.USE_MEMORY_STORAGE = "true";
          // Reinitialize storage with new environment variable
          const { reinitializeStorage } = await import("./storage");
          reinitializeStorage();
        } else {
          console.error("💥 Cannot connect to database. Exiting...");
          process.exit(1);
        }
      } else {
        console.log("🔄 Running database migrations...");
        await runMigrations();
      }
      console.log("✅ Migrations completed successfully");
    }

    /* ----- NEW: skip session store when DB is skipped ----- */
    if (skipDb) {
      console.log("⚠️  Skipping session store (CI smoke-test)");
    } else {
      app.use(sessionMiddleware);
    }

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
