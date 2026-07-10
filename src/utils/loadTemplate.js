import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const loadTemplate = (fileName, replacements = {}) => {
  const filePath = path.join(__dirname, "../templates", fileName);
  console.log("Loading template from:", filePath);

  let html = fs.readFileSync(filePath, "utf-8");

  for (const key in replacements) {
    html = html.replace(new RegExp(`{{${key}}}`, "g"), replacements[key]);
  }

  return html;
};
