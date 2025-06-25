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

(async () => {
  try {
    const skipDb = process.env.SKIP_DB_MIGRATIONS === "true";

    if (skipDb) {
      console.log("⚠️  Skipping DB migrations (CI smoke-test)");
    } else {
      await runMigrations();
      console.log("Migrations completed successfully");
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
      log(`serving on port ${port}`),
    );
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();
