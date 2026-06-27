const fs = require('fs');
const crypto = require('crypto');

const sdkCode = fs.readFileSync('.debug/migusdk.js', 'utf8');

// 提取所有像密钥的字符串 (16位或32位长)
const stringRegex = /['"]([a-zA-Z0-9!@#$%^&*()_+]{16,32})['"]/g;
const strings = new Set();
let match;
while ((match = stringRegex.exec(sdkCode)) !== null) {
  strings.add(match[1]);
}

console.log('找到的候选字符串数量:', strings.size);

// 尝试解密的密文 (刚才测试拿到的)
const encryptedHex = "DE85B7C6C5D594925491879D847997638F85BDC5C7DF94925447EAFA38060327EBF339E100929E7A96C2CBCE7683E263C7CCB5C3D0D7BBC698D079A7CF6BDAA9D2DAA8D0D1D59492648D79E1B9C1DB639D853AE112561FE1211DE3520EDD4ECAEB49F1DA47062B40D8E23D1ED63823CD4B12F93CE7F55706EB47F1EF3AE0072716F839F309552FEB17EAE452F0F94CCD1D49E3E7452E0D3ECEEE3CF7F56B9363D7C8CCCBB4E4EBC4978391C8B17589A3D8D7C8C6CFBCDBCBA68391C8CF6BC9B6D7D7C3C5B5D5EACC549B795202E34BFEF049F0E0491F2147EE00799976AACAB5CCD2C2ACD3DC949254CEBEDAC9BCD0A49D9283C6D7D5E4CB97C2B6D5B9B5D7638F85C8D0D1D5949263DEB4EA806BCAA2D1D1C3CBA4DFD6BD549B79A18879977194858079C7E2D7BD7ECACAE1B9B7BBBAD3C8769183A0948454C9B8E3B99FD0B4D8C4C0A4D792ACBE93CDCAD2D1C6";
const encryptedBuffer = Buffer.from(encryptedHex, 'hex');

// 常用的算法
const algorithms = ['aes-128-ecb', 'aes-128-cbc', 'aes-256-ecb', 'aes-256-cbc'];

console.log('开始暴力测试解密...');

let found = false;
const stringArray = Array.from(strings);

// 提取可能包含"key"或"iv"上下文的字符串，增加权重
const highPriorityStrings = [];
for (const s of stringArray) {
    if (sdkCode.includes(`key:"${s}"`) || sdkCode.includes(`iv:"${s}"`) || 
        sdkCode.includes(`key:'${s}'`) || sdkCode.includes(`iv:'${s}'`) ||
        sdkCode.includes(`"${s}"`)) {
        highPriorityStrings.push(s);
    }
}

// 加入一些咪咕之前用过的已知 key
highPriorityStrings.push('4ea5c508a6566e76240543f8feb06fd4'); // 咪咕常用 MD5
highPriorityStrings.push('Byly!#$%^&*()_+');
highPriorityStrings.push('migu_music_web_v5');

for (const algo of algorithms) {
  for (const key of highPriorityStrings) {
    let keyBuf = Buffer.from(key, 'utf8');
    if (algo.includes('128') && keyBuf.length !== 16) continue;
    if (algo.includes('256') && keyBuf.length !== 32) continue;

    const ivs = algo.includes('cbc') ? highPriorityStrings.filter(s => Buffer.from(s, 'utf8').length === 16) : [''];

    for (const iv of ivs) {
      try {
        const decipher = crypto.createDecipheriv(algo, keyBuf, iv ? Buffer.from(iv, 'utf8') : null);
        decipher.setAutoPadding(false); // 很多自定义加密不使用标准 padding
        let decrypted = decipher.update(encryptedBuffer, null, 'utf8');
        decrypted += decipher.final('utf8');
        
        // 检查解密出的内容是否像 JSON
        if (decrypted.includes('{"') || decrypted.includes('url') || decrypted.includes('code')) {
            console.log(`\n🎉 成功找到密钥!`);
            console.log(`算法: ${algo}`);
            console.log(`Key: ${key}`);
            if (iv) console.log(`IV: ${iv}`);
            console.log(`解密结果预览: ${decrypted.substring(0, 150)}`);
            found = true;
            break;
        }
      } catch (e) {
        // 忽略解密失败
      }
    }
    if (found) break;
  }
  if (found) break;
}

if (!found) {
    console.log('\n暴力测试失败，正在尝试基于代码的结构分析...');
    // 分析 crypto-js 相关的调用
    const cryptoMatches = [...sdkCode.matchAll(/[a-zA-Z0-9_$]+\.AES\.decrypt\([^)]+\)/g)];
    if (cryptoMatches.length > 0) {
        console.log('找到 AES decrypt 调用点:', cryptoMatches[0][0]);
    } else {
        console.log('未找到明显的 AES decrypt 调用');
    }
}
