import type { Manifest } from "vite";
export interface GetHrefOptions {
  href: string;
  manifest?: Manifest;
  prod?: boolean;
  baseUrl?: string;
}
// Use Vite's import.meta.glob to dynamically search for manifest.json
export const loadManifest = (): Manifest | undefined => {
  // Check if manifest content is provided via plugin
  const manifestContent = import.meta.env.VITE_MANIFEST_CONTENT as
    | string
    | undefined;
  if (manifestContent) {
    try {
      return JSON.parse(manifestContent) as Manifest;
    } catch {
      // Fall through to auto-detection if parsing fails
    }
  }

  // Placeholder replaced by inject-manifest plugin during SSR build
  const MANIFEST = "__VITE_MANIFEST_CONTENT__" as unknown as Record<
    string,
    { default: Manifest }
  >;

  let manifestData = {};
  for (const [, manifestFile] of Object.entries(MANIFEST)) {
    manifestData = { ...manifestData, ...manifestFile.default };
  }
  // Return merged values
  return manifestData;
};
const ensureTrailingSlash = (path: string) => {
  return path.endsWith("/") ? path : path + "/";
};
export const getHrefFromManifest = ({
  href,
  manifest,
  prod,
  baseUrl = "/",
}: GetHrefOptions) => {
  if (!href) return undefined;
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain, @typescript-eslint/no-unnecessary-condition
  if (prod ?? (import.meta.env && import.meta.env.PROD)) {
    manifest ??= loadManifest();

    if (manifest) {
      const assetInManifest = manifest[href.replace(/^\//, "")];
      return href.startsWith("/")
        ? `${ensureTrailingSlash(baseUrl)}${assetInManifest.file}`
        : assetInManifest.file;
    }
    return undefined;
  } else {
    return href;
  }
};
export const loadCssByModules = (m: Array<string>) => {
  let manifest: Manifest = import.meta.env.PROD
    ? loadManifest() ?? {} : {};
  let cssFiles: string[] = [];
  m.forEach((moduleName) => {
    const assetInManifest = manifest[moduleName];
    if (assetInManifest && assetInManifest.css) {
      cssFiles = cssFiles.concat(assetInManifest.css);
    }
  });
  return cssFiles;
}
export function buildBootstrapScript() {
  let script = "";
  let styles = "";
  let manifest: Manifest = import.meta.env.PROD
    ? loadManifest() ?? {}
    : {
        "0": {
          file: "@vite/client",
          isEntry: true,
          css: [],
          imports: [],
          dynamicImports: [],
          assets: [],
        },
        "1": {
          file: "src/client.ts",
          isEntry: true,
          css: [],
        },
      };
  Object.values(manifest).forEach((chunk) => {
    if (chunk.isEntry) {
      script += `<script type="module" src="/${chunk.file}"></script>`;
      (chunk.css || []).forEach((cssFile) => {
        styles += `<link rel="stylesheet" crossorigin href="/${cssFile}">`;
      });
    } else {
      script += `<link rel="modulepreload" href="/${chunk.file}">`;
      (chunk.css || []).forEach((cssFile) => {
        styles += `<link rel="preload" as="style" href="/${cssFile}">`;
      });
    }
  });
  return styles + script;
}
