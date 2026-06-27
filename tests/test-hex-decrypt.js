"use strict";

const sw = 171; // 0xAB
const uw = 205; // 0xCD
const cw = 1;

function decryptMiguResponse(buffer, keyStr) {
  const e = new Uint8Array(buffer);
  const n = e.length;
  
  console.log(`First 4 bytes of input: ${e[0]}, ${e[1]}, ${e[2]}, ${e[3]}`);
  
  if (n < 4 || e[0] !== sw || e[1] !== uw || e[2] !== cw) {
      console.log("Magic bytes mismatch!");
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

// The hex string from our previous test
const hexStr = "DE85B7C6C5D594925491879D847997638F85BDC5C7DF94925447EAFA38060327EBF339E100929E7A96C2CBCE7683E263C7CCB5C3D0D7BBC698D079A7CF6BDAA9D2DAA8D0D1D59492648D79E1B9C1DB639D853AE112561FE1211DE3520EDD4ECAEB49F1DA47062B40D8E23D1ED63823CD4B12F93CE7F55706EB47F1EF3AE0072716F839F309552FEB17EAE452F0F94CCD1D49E3E7452E0D3ECEEE3CF7F56B9363D7C8CCCBB4E4EBC4978391C8B17589A3D8D7C8C6CFBCDBCBA68391C8CF6BC9B6D7D7C3C5B5D5EACC549B795202E34BFEF049F0E0491F2147EE00799976AACAB5CCD2C2ACD3DC949254CEBEDAC9BCD0A49D9283C6D7D5E4CB97C2B6D5B9B5D7638F85C8D0D1D5949263DEB4EA806BCAA2D1D1C3CBA4DFD6BD549B79A18879977194858079C7E2D7BD7ECACAE1B9B7BBBAD3C8769183A0948454C9B8E3B99FD0B4D8C4C0A4D792ACBE93CDCAD2D1C6";

// Convert hex to bytes
const bytes = Buffer.from(hexStr, 'hex');

console.log("Hex decoded length:", bytes.length);

const keys = [
    "Jk8qzuePiJ1qE3mDYhLQ3T73DtDoAhLP", // Env 0/2
    "6L0*8CaNS4thcDlOj5k3J1R-rfdzWqxE", // Env 10/20
    "Qr5GDs6MmEx0RH2I473qe/JYZkXLhiKO"  // Env 12/14
];

for (const key of keys) {
    console.log(`\nTesting key: ${key}`);
    const result = decryptMiguResponse(bytes, key);
    if (result) {
        console.log("Success! Decrypted:");
        console.log(result.substring(0, 500));
        break;
    }
}
