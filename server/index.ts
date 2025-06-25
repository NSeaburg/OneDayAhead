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

const app = express();
app.set("trust proxy", 1); // allow rate-limit IP detection behind proxy

// ────────────────── basic middleware ──────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(corsMiddleware);
app.use(securityHeadersMiddleware);
app.use(
  cookieParser(process.env.COOKIE_SECRET || "learning-platform-secret-key"),
);

// ─────────────── per-request logging helper ───────────
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJson: Record<string, any> | undefined;

  const ogJson = res.json;
  res.json = function (body, ...a) {
    capturedJson = body;
    return ogJson.apply(res, [body, ...a]);
  };

  res.on("finish", () => {
    if (!path.startsWith("/api")) return;
    const dur = Date.now() - start;
    let line = `${req.method} ${path} ${res.statusCode} in ${dur}ms`;
    if (capturedJson) line += ` :: ${JSON.stringify(capturedJson)}`;
    if (line.length > 80) line = line.slice(0, 79) + "…";
    log(line);
  });
  next();
});

(async () => {
  try {
    // ──────────────── NEW: skip flag ────────────────
    if (process.env.SKIP_DB_MIGRATIONS === "true") {
      console.log("⚠️  Skipping DB migrations (CI smoke-test)");
    } else {
      await runMigrations();
      console.log("Migrations completed successfully");
    }

    // sessions only after (or instead of) migrations
    app.use(sessionMiddleware);

    const server = await registerRoutes(app);

    // global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.status || 500).json({ message: err.message || "Error" });
      throw err;
    });

    // dev vs prod asset handling
    if (app.get("env") === "development") {
      // serve static files if ?production=true, else Vite dev middleware
      app.use((req, res, next) => {
        if (req.query.production === "true") {
          console.log("Serving static build for " + req.originalUrl);
          serveStatic(app);
        } else {
          next();
        }
      });
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // listen on PORT env-var or default 5000
    const port = Number(process.env.PORT) || 5000;
    server.listen({ port, host: "0.0.0.0", reusePort: true }, () =>
      log(`serving on port ${port}`),
    );
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
