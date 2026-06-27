"use strict";

const assert = require("assert");
const plugin = require("../src");
const migu = require("../src/migu");

async function main() {
  const types = ["music", "album", "artist", "sheet"];

  for (const type of types) {
    try {
      const result = await plugin.search("周杰伦", 1, type);
      assert.ok(Array.isArray(result.data));
      console.log(type, "count:", result.data.length);
      if (result.data[0]) {
        console.log(JSON.stringify(result.data[0], null, 2));
      }
    } catch (error) {
      console.log(type, "failed:", error.message);
    }
  }

  console.log("headers sample:", JSON.stringify(migu.requestJson ? "ok" : "missing"));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
