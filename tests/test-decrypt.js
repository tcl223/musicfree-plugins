"use strict";
const axios = require("axios");

// The decryption logic reverse-engineered from Migu SDK
function decryptMiguResponse(buffer, keyStr) {
  const e = new Uint8Array(buffer);
  const n = e.length;
  
  // Magic bytes check (we can skip strict checking if we don't know sw, uw, cw yet)
  // Let's print the first 4 bytes to see what they are
  console.log(`First 4 bytes: ${e[0]}, ${e[1]}, ${e[2]}, ${e[3]}`);
  
  if (n < 4) return null;
  
  const t = e[3]; // offset/salt
  const a = new TextEncoder().encode(keyStr);
  const i = a.length;
  const o = new Uint8Array(n - 4);
  
  let s = 0;
  for (let u = 4; u < n; u++, s++) {
    // Note: The original code does e[u] + t - a[s % i], but in JS Uint8Array handles wrapping 
    // However, to be safe from underflow we should do proper JS math for uint8
    let val = e[u] + t - a[s % i];
    o[s] = val & 0xFF; // keep it within 0-255
  }
  
  return new TextDecoder().decode(o);
}

async function test() {
  try {
    const headers = {
      appid: "h5",
      origin: "https://music.migu.cn",
      platform: "H5",
      referer: "https://music.migu.cn/",
      ua: "Android_migu",
      accept: "application/json, text/plain, */*",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      timestamp: String(Date.now()),
      deviceid: "5220F205-2F28-4B53-9AD0-CAC868059B72",
      channel: "014X031"
    };

    // 1. Search for a song
    const searchRes = await axios.get("https://app.u.nf.migu.cn/pc/resource/song/item/search/v1.0?text=" + encodeURIComponent("晴天") + "&pageNo=1&pageSize=1", { headers, timeout: 15000 });
    const song = searchRes.data[0];
    console.log("Song:", song.songName, "| copyrightId:", song.copyrightId, "| contentId:", song.contentId);

    // 2. Call the v5 listen endpoint
    // We MUST use responseType: 'arraybuffer' to get the raw binary data
    console.log("\n--- Calling strategy/pc/listen/v2.0 ---");
    const r = await axios.get("https://app.c.nf.migu.cn/MIGUM3.0/strategy/pc/listen/v2.0", {
      params: {
        contentId: song.contentId || "",
        copyrightId: song.copyrightId || "",
        resourceType: song.resourceType || "2",
        netType: "01",
        toneFlag: "PQ", // Standard quality
        scene: ""
      },
      headers: {
        ...headers,
        signversion: "H001",
        ua: "H5_migu"
      },
      responseType: 'arraybuffer', // CRITICAL
      timeout: 15000
    });
    
    console.log(`Received ${r.data.length} bytes`);
    
    // 3. Decrypt
    const prodKey = "Jk8qzuePiJ1qE3mDYhLQ3T73DtDoAhLP";
    const decrypted = decryptMiguResponse(r.data, prodKey);
    
    console.log("\nDecrypted Output:");
    console.log(decrypted.substring(0, 1000));
    
    if (decrypted.includes("url")) {
        console.log("\n✅ SUCCESS! We got the playback URLs!");
        const json = JSON.parse(decrypted);
        console.log("Play URL:", json.data?.url);
    }

  } catch (e) {
    console.error("Fatal:", e.message);
    if (e.response) console.error("Status:", e.response.status);
  }
}

test();
