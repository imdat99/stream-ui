import { ClientUnaryCall, Metadata, ServiceError, StatusObject, status } from "@grpc/grpc-js";

type UnaryCallback<TRes> = (error: ServiceError | null, response: TRes) => void;

type ResponseOf<T> = T extends {
  (req: any, callback: UnaryCallback<infer TRes>): ClientUnaryCall;
  (req: any, metadata: any, callback: UnaryCallback<infer TRes>): ClientUnaryCall;
  (req: any, metadata: any, options: any, callback: UnaryCallback<infer TRes>): ClientUnaryCall;
} ? TRes : any;

type RequestOf<T> = T extends {
  (req: infer TReq, callback: UnaryCallback<any>): ClientUnaryCall;
  (req: infer TReq, metadata: any, callback: UnaryCallback<any>): ClientUnaryCall;
} ? TReq : any;

type UnaryKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => ClientUnaryCall ? K : never;
}[keyof T];

export type GrpcCallHooks = {
  onMetadata?: (metadata: Metadata) => void;
  onStatus?: (status: StatusObject) => void;
};

export type PromisifiedClient<TClient> = {
  [K in UnaryKeys<TClient>]: (
    req: RequestOf<TClient[K]>,
    metadata?: Metadata,
    hooks?: GrpcCallHooks,
  ) => Promise<ResponseOf<TClient[K]>>;
};

export function promisifyClient<TClient extends object>(
  client: TClient,
): PromisifiedClient<TClient> {
  const result = {} as any;

  const allKeys = new Set([
    ...Object.getOwnPropertyNames(client),
    ...Object.getOwnPropertyNames(Object.getPrototypeOf(client)),
  ]);

  allKeys.forEach((key) => {
    if (key === "constructor") return;

    const originalMethod = (client as any)[key];
    if (typeof originalMethod === "function" && !key.startsWith("$")) {
      result[key] = (
        req: any,
        metadata?: Metadata,
        hooks?: GrpcCallHooks,
      ) => new Promise((resolve, reject) => {
        const call: ClientUnaryCall = originalMethod.call(
          client,
          req,
          metadata ?? new Metadata(),
          (error: ServiceError | null, response: any) => {
            if (error) {
              reject(normalizeGrpcError(error));
              return;
            }
            resolve(response);
          },
        );

        if (hooks?.onMetadata) {
          call.on("metadata", hooks.onMetadata);
        }
        if (hooks?.onStatus) {
          call.on("status", hooks.onStatus);
        }
      });
    }
  });

  return result;
}

function grpcCodeToHttpStatus(code?: number) {
  switch (code) {
    case status.INVALID_ARGUMENT:
      return 400;
    case status.UNAUTHENTICATED:
      return 401;
    case status.PERMISSION_DENIED:
      return 403;
    case status.NOT_FOUND:
      return 404;
    default:
      return 500;
  }
}

function normalizeGrpcError(error: ServiceError) {
  const normalized = new Error(error.details || error.message) as Error & {
    status?: number;
    code?: number;
    body?: { code?: number; message?: string; data?: unknown };
  };

  normalized.code = error.code;
  normalized.status = grpcCodeToHttpStatus(error.code);

  const trailerBody = error.metadata?.get("x-error-body")?.[0];
  if (typeof trailerBody === "string" && trailerBody) {
    try {
      normalized.body = JSON.parse(trailerBody) as {
        code?: number;
        message?: string;
        data?: unknown;
      };
      if (normalized.body?.message) {
        normalized.message = normalized.body.message;
      }
      if (typeof normalized.body?.code === "number") {
        normalized.status = normalized.body.code;
      }
    } catch {
      // ignore malformed payload
    }
  }

  return normalized;
}
