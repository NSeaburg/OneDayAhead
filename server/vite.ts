import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

/* ──────────────── DEV‑TIME Vite middleware ──────────────── */
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

  /* transform client/index.html on the fly */
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).type("html").end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

/* ──────────────── PRODUCTION static handler ──────────────── */
export function serveStatic(app: Express) {
  /*  ➜  Point to the **built** files written by `npm run build`  */
  const distPath = path.resolve(import.meta.dirname, "..", "dist");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}. Run "npm run build" first.`,
    );
  }

  /* serve real files first */
  app.use(express.static(distPath));

  /* fall back to index.html for SPA routes */
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
