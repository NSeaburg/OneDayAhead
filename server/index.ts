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
  console.log("🔍 Testing database connection...");
  console.log(
    "📍 Database URL:",
    process.env.DATABASE_URL?.replace(/\/\/.*:.*@/, "//***:***@"),
  );

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Connection attempt ${attempt}/${retries}...`);
      const client = await pool.connect();
      console.log("✅ Database connection successful!");
      
      // Get basic connection info
      const result = await client.query('SELECT current_database(), inet_server_addr(), inet_server_port()');
      const [dbInfo] = result.rows;
      console.log("📊 Connected to database:", dbInfo.current_database);
      console.log("🏠 Connected to host:", dbInfo.inet_server_addr);
      console.log("🔌 Connected on port:", dbInfo.inet_server_port);
      
      client.release();
      return true;
    } catch (error) {
      console.error(`❌ Connection attempt ${attempt}/${retries} failed:`);
      console.error("🚨 Error details:", error);
      
      if (attempt < retries) {
        const waitTime = attempt * 2000; // Progressive backoff: 2s, 4s, 6s
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

    if (skipDb) {
      console.log("⚠️  Skipping DB migrations (CI smoke-test)");
    } else {
      // Test connection first
      const connectionSuccess = await testDatabaseConnection();
      if (!connectionSuccess) {
        console.error("💥 Cannot connect to database. Exiting...");
        process.exit(1);
      }

      console.log("🔄 Running database migrations...");
      await runMigrations();
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
