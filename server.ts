import express from "express";
import path from "path";
import fs from "fs";

const app = express();
const PORT = 3000;

// Resolve paths
const workspaceRoot = process.cwd();
const assetsDir = path.join(workspaceRoot, "assets");
const imgDir = path.join(assetsDir, "img");

// Create assets directory structure if it doesn't exist
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

// Serve static assets with correct MIME types and headers
app.use("/assets", express.static(assetsDir));

// Serve other files in root
app.use(express.static(workspaceRoot));

// Fallback to index.html for spa
app.get("*", (req, res) => {
  res.sendFile(path.join(workspaceRoot, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
