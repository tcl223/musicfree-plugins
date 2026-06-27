"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");
const outFile = path.join(distDir, "migu-musicfree.js");

const mapper = fs.readFileSync(path.join(root, "src", "mapper.js"), "utf8");
const migu = fs.readFileSync(path.join(root, "src", "migu.js"), "utf8");
const index = fs.readFileSync(path.join(root, "src", "index.js"), "utf8");

function body(source) {
  return source
    .replace(/^"use strict";\s*/, "")
    .replace(/module\.exports\s*=\s*/, "return ");
}

const bundle = `"use strict";

const __mapper = (() => {
${body(mapper)}
})();

const __migu = (() => {
const { mapAlbumItem, mapArtistItem, mapMusicItem, mapSheetItem } = __mapper;
${body(migu)
  .replace('const { mapAlbumItem, mapArtistItem, mapMusicItem, mapSheetItem } = require("./mapper");', "")
  .replace("module.exports = {", "return {")}
})();

const migu = __migu;
${index
  .replace(/^"use strict";\s*/, "")
  .replace('const migu = require("./migu");', "")}
`;

fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(outFile, bundle, "utf8");
console.log(`Built ${outFile}`);
