const SM4 = require('gm-crypt').sm4;

const hexStr = "DE85B7C6C5D594925491879D847997638F85BDC5C7DF94925447EAFA38060327EBF339E100929E7A96C2CBCE7683E263C7CCB5C3D0D7BBC698D079A7CF6BDAA9D2DAA8D0D1D59492648D79E1B9C1DB639D853AE112561FE1211DE3520EDD4ECAEB49F1DA47062B40D8E23D1ED63823CD4B12F93CE7F55706EB47F1EF3AE0072716F839F309552FEB17EAE452F0F94CCD1D49E3E7452E0D3ECEEE3CF7F56B9363D7C8CCCBB4E4EBC4978391C8B17589A3D8D7C8C6CFBCDBCBA68391C8CF6BC9B6D7D7C3C5B5D5EACC549B795202E34BFEF049F0E0491F2147EE00799976AACAB5CCD2C2ACD3DC949254CEBEDAC9BCD0A49D9283C6D7D5E4CB97C2B6D5B9B5D7638F85C8D0D1D5949263DEB4EA806BCAA2D1D1C3CBA4DFD6BD549B79A18879977194858079C7E2D7BD7ECACAE1B9B7BBBAD3C8769183A0948454C9B8E3B99FD0B4D8C4C0A4D792ACBE93CDCAD2D1C6";

const keys = [
    "Jk8qzuePiJ1qE3mDYhLQ3T73DtDoAhLP",
    "6L0*8CaNS4thcDlOj5k3J1R-rfdzWqxE",
    "Qr5GDs6MmEx0RH2I473qe/JYZkXLhiKO"
];

for (const key of keys) {
    // sm4 key needs to be 16 bytes. Wait, these keys are 32 bytes!
    // SM4 key MUST be 128-bit (16 bytes). 
    // Maybe they use the first 16 bytes? Or the hex representation of a 16-byte key?
    // Let's try both: first 16 chars, and half of the key if it's hex (it's not hex).
    
    const tryKeys = [
        key.substring(0, 16),
        key.substring(16, 32)
    ];

    for (const k of tryKeys) {
        let sm4Config = {
            key: k,
            mode: 'ecb',
            cipherType: 'text' // expects hex input
        };
        
        let sm4 = new SM4(sm4Config);
        try {
            let decrypted = sm4.decrypt(hexStr);
            if (decrypted && (decrypted.includes('{') || decrypted.includes('url'))) {
                console.log("✅ SM4 ECB Decrypt Success!");
                console.log("Key:", k);
                console.log("Result:", decrypted);
                process.exit(0);
            }
        } catch (e) {}

        // Try CBC (needs IV, usually same as key or 0)
        sm4Config.mode = 'cbc';
        sm4Config.iv = k;
        let sm4Cbc = new SM4(sm4Config);
        try {
            let decrypted = sm4Cbc.decrypt(hexStr);
            if (decrypted && (decrypted.includes('{') || decrypted.includes('url'))) {
                console.log("✅ SM4 CBC Decrypt Success!");
                console.log("Key:", k);
                console.log("Result:", decrypted);
                process.exit(0);
            }
        } catch (e) {}
    }
}
console.log("SM4 tests failed.");
