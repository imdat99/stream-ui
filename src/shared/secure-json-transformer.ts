// src/shared/trpc-secure-transformer.ts
import superjson from "superjson";
import nacl from "tweetnacl";

const secureConfig = { kid: 'xUJh4/ADCkL/mZTsxSofIVTgLrTLw2C8h/X8/StUc0E=', publicKeyBase64: 'hvtS8b4RWXkau3B2UXbWhCV1NxS/97DGLfcftf/0TG8=' };
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

function toBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function fromBase64(base64: string): Uint8Array {
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
export function stringify(object: any) {
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

      return JSON.stringify({
        kid: secureConfig.kid,
        nonce: toBase64(nonce),
        pk: toBase64(clientKeypair.publicKey),
        data: toBase64(cipher),
      });
    }
export function parse(d: unknown): unknown {
      const object = typeof d === "string" ? JSON.parse(d) : d;
      if (!isSecureEnvelope(object)) {
        // console.log("parse RPC payload:", object);
        return object;
      }

      // const serverSecretKey = opts.getSecretKeyByKid(object.kid);
      // if (!serverSecretKey) {
      //   throw new Error(`Unknown secure transformer kid: ${object.kid}`);
      // }
      const nonce = fromBase64(object.nonce);
      const clientPublicKey = fromBase64(object.pk);
      const ciphertext = fromBase64(object.data);

      const opened = nacl.box.open(
        ciphertext,
        nonce,
        clientPublicKey,
        // serverSecretKey
        fromBase64(secureConfig.kid), // for testing, should be replaced with real secret key retrieval
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