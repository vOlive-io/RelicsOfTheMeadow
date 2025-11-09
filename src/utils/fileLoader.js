import fs from 'fs';
import path from 'path';

/**
 * Recursively loads all .json files from a directory.
 * Returns an object with keys = filenames (no extension),
 * and values = parsed JSON data.
 */
export function loadJSONDirectory(dirPath) {
  const data = {};

  function recurse(currentPath) {
    const files = fs.readdirSync(currentPath);
    for (const file of files) {
      const fullPath = path.join(currentPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        recurse(fullPath);
      } else if (file.endsWith('.json')) {
        const key = path.basename(file, '.json');
        const fileData = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
        data[key] = fileData;
      }
    }
  }

  recurse(dirPath);
  return data;
}
