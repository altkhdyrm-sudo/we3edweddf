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

// Copy the uploaded teacher logo from /input_file_3.png to assets/logo.png and assets/img/logo.png if it exists
const originalLogoPath = path.join(workspaceRoot, "input_file_3.png");
const targetLogoPath = path.join(assetsDir, "logo.png");
const targetLogoPath2 = path.join(imgDir, "logo.png");

if (fs.existsSync(originalLogoPath)) {
  try {
    fs.copyFileSync(originalLogoPath, targetLogoPath);
    fs.copyFileSync(originalLogoPath, targetLogoPath2);
    console.log("SUCCESS: Copied official logo input_file_3.png to assets successfully!");
  } catch (error) {
    console.error("ERROR: Failed to copy official logo:", error);
  }
} else {
  console.log("WARNING: input_file_3.png not found at root workspace. Checking other paths...");
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
