// scripts/gen-nacl-keys.ts
import nacl from "tweetnacl";

const kp = nacl.box.keyPair();

console.log("PUBLIC_KEY_BASE64=", Buffer.from(kp.publicKey).toString("base64"));
console.log("SECRET_KEY_BASE64=", Buffer.from(kp.secretKey).toString("base64"));