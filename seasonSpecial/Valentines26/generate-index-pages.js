#!/usr/bin/env node
/**
 * Generates index.html files in every folder to mimic Apache-style directory listing
 * for GitHub Pages (which doesn't support directory listing natively).
 * 
 * Usage: node generate-index-pages.js
 */

const fs = require("fs");
const path = require("path");

const APACHE_STYLES = `
  /* ===== GLOBAL RESET ===== */
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    overflow-x: hidden;
  }

  /* ===== APACHE INDEX (MOBILE FIRST) ===== */
  .apache {
    width: 100%;
    max-width: 100%;
    padding: 12px;
    box-sizing: border-box;
    background: #ffffff;
    color: #000000;
    font-family: "Courier New", Courier, monospace;
    font-size: 14px;
    line-height: 1.4;
  }

  .apache .title {
    font-weight: bold;
    margin-bottom: 8px;
    font-size: 15px;
  }

  .apache pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .apache a {
    color: #0000ee;
    text-decoration: none;
    padding: 4px 0;
    display: inline-block;
  }

  .apache a:hover {
    text-decoration: underline;
    text-size-adjust: 100%;
  }

  .apache .active {
    background: #ffffcc;
    display: block;
    padding: 2px 4px;
  }

  @media (min-width: 768px) {
    .apache {
      max-width: 760px;
      margin: 30px auto;
      font-size: 14px;
    }
    .apache pre {
      white-space: pre;
    }
  }
`;

function pad(str, len) {
  return (str + " ".repeat(len)).slice(0, len);
}

function getDateStr() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

const SKIP_DIRS = new Set([".git", "node_modules", ".github"]);
const SKIP_FILES = new Set(["generate-index-pages.js", ".DS_Store"]);

function getDirContents(dirPath, baseDir) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const folders = [];
  const files = [];

  for (const ent of entries) {
    if (ent.name.startsWith(".") && ent.name !== "..") continue;
    if (SKIP_DIRS.has(ent.name)) continue;
    if (SKIP_FILES.has(ent.name)) continue;
    if (ent.name === "index.html") continue; // avoid self-reference in listing

    if (ent.isDirectory()) {
      folders.push(ent.name);
    } else {
      files.push(ent.name);
    }
  }

  folders.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  files.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  return { folders, files };
}

function generateIndexHtml(dirPath, displayPath, baseDir) {
  const { folders, files } = getDirContents(dirPath, baseDir);
  const dateStr = getDateStr();

  const rows = [];

  // Parent directory link (unless root)
  if (displayPath !== "/") {
    rows.push({
      icon: "📁",
      name: "../",
      link: "../",
      date: dateStr,
      active: false,
    });
  }

  // Subfolders
  for (const folder of folders) {
    rows.push({
      icon: "📁",
      name: folder + "/",
      link: folder + "/",
      date: dateStr,
      active: false,
    });
  }

  // Files
  for (const file of files) {
    rows.push({
      icon: "📄",
      name: file,
      link: file,
      date: dateStr,
      active: false,
    });
  }

  const listingHtml = rows
    .map((r) => {
      const activeClass = r.active ? ' class="active"' : "";
      return `<span${activeClass}>${r.icon} <a href="${r.link}">${pad(r.name, 24)}</a> ${pad(r.date, 18)}</span>`;
    })
    .join("\n");

  const title = `Index of ${displayPath}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>${APACHE_STYLES}</style>
</head>
<body>
<div class="apache">
  <div class="title">${title}</div>
  <pre>Name                       Last modified     
-------------------------------------------</pre>
  <pre>
${listingHtml}
</pre>
</div>
</body>
</html>
`;
}

function collectDirs(dirPath, baseDir, acc = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  acc.push(dirPath);

  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    if (SKIP_DIRS.has(ent.name)) continue;
    if (ent.name.startsWith(".")) continue;

    const fullPath = path.join(dirPath, ent.name);
    collectDirs(fullPath, baseDir, acc);
  }

  return acc;
}

function main() {
  const baseDir = process.cwd();
  const dirs = collectDirs(baseDir, baseDir);

  for (const dirPath of dirs) {
    const relativePath = path.relative(baseDir, dirPath);
    const displayPath = relativePath === "" ? "/" : "/" + relativePath.replace(/\\/g, "/") + "/";

    const html = generateIndexHtml(dirPath, displayPath, baseDir);
    const outPath = path.join(dirPath, "index.html");
    fs.writeFileSync(outPath, html, "utf8");
    console.log("Created:", outPath);
  }

  console.log(`\nDone! Created ${dirs.length} index.html files.`);
}

main();
