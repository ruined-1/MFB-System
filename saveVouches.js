import fs from "fs";

export function saveVouches(data) {
  const content = `export const vouches = ${JSON.stringify(data, null, 2)};`;
  fs.writeFileSync("./vouches.js", content);
}
