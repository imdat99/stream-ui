// src/shared/trpc-secure-transformer.ts
import superjson from "superjson";
import nacl from "tweetnacl";

const kp = nacl.box.keyPair();

const uToBase64 = (u8: Uint8Array) => btoa(String.fromCharCode(...u8));
const secureConfig = { kid: uToBase64(kp.secretKey), publicKeyBase64: uToBase64(kp.publicKey) };
export type SecureEnvelopeV1 = {
  kid: string;
  nonce: string;   // base64
  pk: string;      // client public key, base64
  data: string;    // ciphertext, base64
};

export type ServerPublicKeyConfig = {
  kid: string;
  publicKeyBase64: string;
};

export function toBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

export function fromBase64(base64: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(base64, "base64"));
  }
  const s = atob(base64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

function utf8Encode(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function utf8Decode(value: Uint8Array): string {
  return new TextDecoder().decode(value);
}

function isSecureEnvelope(value: unknown): value is SecureEnvelopeV1 {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.kid === "string" &&
    typeof v.nonce === "string" &&
    typeof v.pk === "string" &&
    typeof v.data === "string"
  );
}

export function createClientKeypair() {
  const keyPair = nacl.box.keyPair();
  return {
    publicKey: keyPair.publicKey,
    secretKey: keyPair.secretKey,
  };
}

export function createEncryptedInputTransformer(opts: {
  serverKid: string;
  serverPublicKeyBase64: string;
  clientKeypair: { publicKey: Uint8Array; secretKey: Uint8Array };
}): JsonTransformer {
  const serverPublicKey = fromBase64(opts.serverPublicKeyBase64);

  return {
    stringify(object: any) {
      const payload = superjson.serialize(object);
      const plaintext = utf8Encode(JSON.stringify(payload));
      const nonce = nacl.randomBytes(nacl.box.nonceLength);
      
      const cipher = nacl.box(
        plaintext,
        nonce,
        serverPublicKey,
        opts.clientKeypair.secretKey,
      );

      return JSON.stringify({
        kid: opts.serverKid,
        nonce: toBase64(nonce),
        pk: toBase64(opts.clientKeypair.publicKey),
        data: toBase64(cipher),
      });
    },

    parse(object: unknown): unknown {
      // Trên client, input transformer hầu như không cần dùng deserialize.
      return object;
    },
  };
}
export function stringify(object: any, setHeader?: (headers: Record<string, string>) => void): string {
      const clientKeypair = createClientKeypair();
      const payload = superjson.serialize(object);
      const plaintext = utf8Encode(JSON.stringify(payload));
      const nonce = nacl.randomBytes(nacl.box.nonceLength);

      const cipher = nacl.box(
        plaintext,
        nonce,
        fromBase64(secureConfig.publicKeyBase64), // for testing, should be replaced with real server public key retrieval
        // serverPublicKey,
        clientKeypair.secretKey,
      );
      setHeader?.({
        kid: secureConfig.kid,
        nonce: toBase64(nonce),
        pk: toBase64(clientKeypair.publicKey),
      });
      // return JSON.stringify({
      //   kid: secureConfig.kid,
      //   nonce: toBase64(nonce),
      //   pk: toBase64(clientKeypair.publicKey),
      //   data: toBase64(cipher),
      // });
      return toBase64(cipher);
    }
export function parse(d: string, getHeader?: () => Record<string, string>): any {
      // const object = typeof d === "string" ? JSON.parse(d) : d;
      // if (!isSecureEnvelope(object)) {
      //   // console.log("parse RPC payload:", object);
      //   return object;
      // }
      const headers = getHeader ? getHeader() : {};
      // const serverSecretKey = opts.getSecretKeyByKid(object.kid);
      // if (!serverSecretKey) {
      //   throw new Error(`Unknown secure transformer kid: ${object.kid}`);
      // }
      const nonce = fromBase64(headers.nonce);
      const clientPublicKey = fromBase64(headers.pk);
      const ciphertext = fromBase64(d);

      const opened = nacl.box.open(
        ciphertext,
        nonce,
        clientPublicKey,
        // serverSecretKey
        fromBase64(headers.kid), // for testing, should be replaced with real secret key retrieval
      );
      if (!opened) {
        throw new Error("Failed to decrypt tRPC input payload");
      }
      const parsed = JSON.parse(utf8Decode(opened));
      return superjson.deserialize(parsed);
    }
export const clientJSON: JsonTransformer = {
  stringify,
  parse,
}
// export function createServerInputDecryptor(opts?: {
//   getSecretKeyByKid: (kid: string) => Uint8Array | null;
// }): Partial<JsonTransformer> {
//   return {
//     // stringify(object: unknown): any {
//     //   console.log("stringify Payload:", object);

//     //   // Trên server, input transformer hầu như không cần dùng serialize.
//     //   return object;
//     // },

//     parse,
//   };
// }