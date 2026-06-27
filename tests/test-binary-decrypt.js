"use strict";
const axios = require("axios");

// 魔数定义
const sw = 171; // 0xAB
const uw = 205; // 0xCD
const cw = 1;

// 咪咕自定义二进制解密算法
function decryptMiguResponse(buffer, keyStr) {
  const e = new Uint8Array(buffer);
  const n = e.length;
  
  if (n < 4) return null;
  console.log(`First 4 bytes: ${e[0]}, ${e[1]}, ${e[2]}, ${e[3]}`);
  
  if (e[0] !== sw || e[1] !== uw || e[2] !== cw) {
      console.log("Magic bytes mismatch! (Server did not return proper encrypted binary)");
      return null;
  }
  
  const t = e[3]; // offset
  const a = new TextEncoder().encode(keyStr);
  const i = a.length;
  const o = new Uint8Array(n - 4);
  
  let s = 0;
  for (let u = 4; u < n; u++, s++) {
    let val = e[u] + t - a[s % i];
    o[s] = val & 0xFF;
  }
  
  return new TextDecoder().decode(o);
}

async function test() {
  try {
    // 完整的浏览器请求头
    const headers = {
      appid: "h5",
      origin: "https://music.migu.cn",
      platform: "H5",
      referer: "https://music.migu.cn/",
      ua: "H5_migu",
      accept: "application/json, text/plain, */*",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      timestamp: String(Date.now()),
      deviceid: "5220F205-2F28-4B53-9AD0-CAC868059B72",
      channel: "014X031",
      signversion: "H001",
      // === 核心关键：触发服务器返回真实加密流 ===
      birth: "h5page",
      signature: "1" 
    };

    // 1. 搜一首歌拿 contentId
    const searchRes = await axios.get("https://app.u.nf.migu.cn/pc/resource/song/item/search/v1.0?text=" + encodeURIComponent("晴天 周杰伦") + "&pageNo=1&pageSize=1", { 
        headers, 
        timeout: 15000 
    });
    const song = searchRes.data[0];
    console.log("Song:", song.songName, "| copyrightId:", song.copyrightId, "| contentId:", song.contentId);

    // 2. 调用听歌 API 获取加密二进制流
    console.log("\n--- Calling strategy/pc/listen/v2.0 with signature:1 ---");
    const r = await axios.get("https://app.c.nf.migu.cn/MIGUM3.0/strategy/pc/listen/v2.0", {
      params: {
        contentId: song.contentId || "",
        copyrightId: song.copyrightId || "",
        resourceType: song.resourceType || "2",
        netType: "01",
        toneFlag: "PQ", 
        scene: ""
      },
      headers,
      responseType: 'arraybuffer', // 必须使用 arraybuffer 接收二进制
      timeout: 15000
    });
    
    console.log(`Received ${r.data.byteLength} bytes`);
    
    // 3. 解密
    const prodKey = "Jk8qzuePiJ1qE3mDYhLQ3T73DtDoAhLP";
    const decrypted = decryptMiguResponse(r.data, prodKey);
    
    if (decrypted) {
        console.log("\nDecrypted Output Preview:");
        console.log(decrypted.substring(0, 500));
        
        if (decrypted.includes("url")) {
            console.log("\n✅ SUCCESS! We got the playback URLs!");
            const json = JSON.parse(decrypted);
            console.log("Play URL:", json.data?.url);
        }
    } else {
        // 如果魔数不匹配，打印响应到底是什么
        console.log("\nFailed to decrypt. Response was:");
        const e = new Uint8Array(r.data);
        console.log(Buffer.from(e.slice(0, 100)).toString('utf8'));
    }

  } catch (e) {
    console.error("Fatal:", e.message);
    if (e.response) console.error("Status:", e.response.status);
  }
}

test();
