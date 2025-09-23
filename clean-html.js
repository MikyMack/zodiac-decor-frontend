const fs = require("fs");
const path = require("path");

const folderPath = process.argv[2] || "./"; 

// Regex patterns
const httrackRegex = /<!--\s*Mirrored from[\s\S]*?HTTrack Website Copier[\s\S]*?-->/gi;
const generatorRegex = /<meta[^>]+name=["']generator["'][^>]*>/gi;

// Whitelisted safe meta tags
const safeMetaKeywords = ["charset", "viewport", "description", "keywords", "author", "robots"];

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");

  // Remove HTTrack comments
  content = content.replace(httrackRegex, "");

  // Remove <meta name="generator">
  content = content.replace(generatorRegex, "");

  // Process meta tags line by line
  const lines = content.split(/\r?\n/);
  const cleanedLines = [];
  const seenMeta = new Set();

  for (let line of lines) {
    if (line.toLowerCase().includes("<meta")) {
      const lower = line.toLowerCase();

      // Check if this line contains a safe meta keyword
      const match = safeMetaKeywords.find((kw) => lower.includes(kw));

      if (match) {
        if (!seenMeta.has(match)) {
          seenMeta.add(match);
          cleanedLines.push(line);
        }
        // If duplicate, skip it
      }
      // If meta tag not in whitelist -> skip
    } else {
      cleanedLines.push(line);
    }
  }

  // Save cleaned content back
  fs.writeFileSync(filePath, cleanedLines.join("\n"), "utf-8");
  console.log(`✅ Cleaned: ${filePath}`);
}

function scanDir(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      scanDir(filePath); // Recurse into subfolders
    } else if (file.toLowerCase().endsWith(".html")) {
      cleanFile(filePath); // ✅ Only process .html files
    }
  });
}

scanDir(folderPath);
console.log("🎉 All HTML files cleaned!");
