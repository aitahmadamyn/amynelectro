import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.get("/api/files", (req, res) => {
    const rootDir = process.cwd();
    const directories = ['docs', 'hardware', 'software'];
    const files: any[] = [];

    // Add README
    if (fs.existsSync(path.join(rootDir, 'README.md'))) {
      files.push({ path: '/README.md', name: 'README.md', type: 'file' });
    }

    directories.forEach(dir => {
      const dirPath = path.join(rootDir, dir);
      if (fs.existsSync(dirPath)) {
        files.push({ path: `/${dir}`, name: dir, type: 'directory' });
        const dirFiles = fs.readdirSync(dirPath);
        dirFiles.forEach(file => {
          files.push({ path: `/${dir}/${file}`, name: file, type: 'file', parent: `/${dir}` });
        });
      }
    });

    res.json(files);
  });

  app.get("/api/file", (req, res) => {
    const filePath = req.query.path as string;
    if (!filePath) {
      return res.status(400).json({ error: "Path is required" });
    }
    
    // Prevent directory traversal
    const safePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
    const fullPath = path.join(process.cwd(), safePath);

    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      res.send(content);
    } else {
      res.status(404).json({ error: "File not found" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
