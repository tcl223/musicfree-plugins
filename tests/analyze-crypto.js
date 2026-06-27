const fs = require('fs');

const sdkCode = fs.readFileSync('.debug/migusdk.js', 'utf8');

// 搜索 SM4 特征 (SM4 S-Box 前几个值: 0xd6, 0x90, 0xe9, 0xfe, 0xcc, 0xe1, 0x3d, 0xb7)
if (sdkCode.includes('214') && sdkCode.includes('144') && sdkCode.includes('233') && sdkCode.includes('254')) {
    console.log('发现可能的 SM4 S-Box 特征!');
}

// 搜索 SM4 系统参数 (FK)
if (sdkCode.includes('2746333894') || sdkCode.includes('0xa3b1bac6')) {
    console.log('发现 SM4 FK 参数!');
}

// 搜索特定的加密头部处理或关键词
const patterns = [
    'decrypt', 'encrypt', 'crypto', 'sm4', 'sm2', 'sm3', 'aes', 'des'
];

for (const p of patterns) {
    const regex = new RegExp(`.{0,30}${p}.{0,50}`, 'gi');
    const matches = sdkCode.match(regex);
    if (matches) {
        console.log(`\n包含 "${p}" 的一些代码片段 (共 ${matches.length} 处):`);
        for (let i = 0; i < Math.min(5, matches.length); i++) {
            console.log(`  - ${matches[i]}`);
        }
    }
}
