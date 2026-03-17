// backend/key-resolver.ts

export type ServerKeyPair = {
  kid: string;
  publicKeyPem: string;
  privateKeyPem: string;
  active?: boolean;
};

export class StaticKeyResolver {
  private readonly keys = new Map<string, ServerKeyPair>();
  private activeKid: string;

  constructor(pairs: ServerKeyPair[]) {
    if (!pairs.length) throw new Error("At least one key pair is required");

    for (const pair of pairs) {
      this.keys.set(pair.kid, pair);
    }

    const active = pairs.find((x) => x.active) ?? pairs[0];
    this.activeKid = active.kid;
  }

  getPrivateKeyByKid(kid: string): string | null {
    return this.keys.get(kid)?.privateKeyPem ?? null;
  }

  getPublicConfig() {
    const pair = this.keys.get(this.activeKid);
    if (!pair) throw new Error("Active key not found");

    return {
      kid: pair.kid,
      publicKeyPem: pair.publicKeyPem,
    };
  }

  getActiveKid(): string {
    return this.activeKid;
  }

  setActiveKid(kid: string): void {
    if (!this.keys.has(kid)) throw new Error(`Unknown kid: ${kid}`);
    this.activeKid = kid;
  }
}