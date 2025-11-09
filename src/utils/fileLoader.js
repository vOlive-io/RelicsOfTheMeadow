// src/utils/fileLoader.js
import fs from "fs";
import path from "path";

export function loadFactions(folderPath = path.resolve("./data/factions")) {
  const data = {};
  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    if (file.endsWith(".json")) {
      const key = path.basename(file, ".json");
      const content = JSON.parse(fs.readFileSync(path.join(folderPath, file), "utf8"));
      data[key] = content;
    }
  }
  return data;
}

export function loadRelics(rootRelicsPath = path.resolve("./data/relics")) {
  const relics = {};

  function recurse(currentPath, categoryKey) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        const cat = entry.name;
        relics[cat] = relics[cat] || {};
        recurse(full, cat);
      } else if (entry.isFile() && entry.name.endsWith(".json")) {
        const key = path.basename(entry.name, ".json");
        const content = JSON.parse(fs.readFileSync(full, "utf8"));
        if (categoryKey) {
          relics[categoryKey][key] = content;
        } else {
          relics.misc = relics.misc || {};
          relics.misc[key] = content;
        }
      }
    }
  }

  recurse(rootRelicsPath, null);
  return relics;
}
