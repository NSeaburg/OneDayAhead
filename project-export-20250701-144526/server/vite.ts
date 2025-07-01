import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

/* ───────────────────────────── helpers ───────────────────────────── */
export function log(message: string, source = "express") {
  const ts = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${ts} [${source}] ${message}`);
}

/* ───────────────── Dev middleware (only when NODE_ENV≠production) ───────────────── */
export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: { middlewareMode: true, hmr: { server }, allowedHosts: true },
    appType: "custom",
  });

  app.use(vite.middlewares);

  /* live‑transforms client/index.html so /src/main.tsx works during dev */
  app.use("*", async (req, res, next) => {
    try {
      const templatePath = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );
      let template = await fs.promises.readFile(templatePath, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(req.originalUrl, template);
      res.status(200).type("html").end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

/* ───────────────── Production static handler ───────────────── */
export function serveStatic(app: Express) {
  const distRoot = path.resolve(import.meta.dirname, "..", "dist"); // dist/index.js
  const publicRoot = path.join(distRoot, "public"); // dist/public/index.html, assets/*

  if (!fs.existsSync(path.join(publicRoot, "index.html"))) {
    throw new Error(
      `dist/public/index.html not found in ${distRoot}. Run "npm run build" first.`,
    );
  }

  /* 1️⃣  serve JS bundle at /index.js */
  app.use(express.static(distRoot));

  /* 2️⃣  serve HTML & assets under /public/* */
  app.use(express.static(publicRoot));

  /* 3️⃣  SPA fallback: always return built index.html */
  app.use("*", (_req, res) => {
    res.sendFile(path.join(publicRoot, "index.html"));
  });
}
