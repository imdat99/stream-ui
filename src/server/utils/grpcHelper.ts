import { ClientUnaryCall, ServiceError, status } from "@grpc/grpc-js";

// 1. Định nghĩa lại UnaryCallback để bắt được kiểu TRes chính xác hơn
type UnaryCallback<TRes> = (error: ServiceError | null, response: TRes) => void;

// 2. Ép TypeScript tìm đúng Overload có Callback
// Chúng ta sử dụng tham số thứ 2 của hàm (index 1) để lấy TRes
type ResponseOf<T> = T extends {
  (req: any, callback: UnaryCallback<infer TRes>): ClientUnaryCall;
  (req: any, metadata: any, callback: UnaryCallback<infer TRes>): ClientUnaryCall;
  (req: any, metadata: any, options: any, callback: UnaryCallback<infer TRes>): ClientUnaryCall;
} ? TRes : any;

type RequestOf<T> = T extends {
  (req: infer TReq, callback: UnaryCallback<any>): ClientUnaryCall;
  (req: infer TReq, metadata: any, callback: UnaryCallback<any>): ClientUnaryCall;
} ? TReq : any;

// 3. Filter để chỉ lấy các Method thực sự là Unary
type UnaryKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => ClientUnaryCall ? K : never;
}[keyof T];

export type PromisifiedClient<TClient> = {
  [K in UnaryKeys<TClient>]: (
    req: RequestOf<TClient[K]>
  ) => Promise<ResponseOf<TClient[K]>>;
};

// ... Các hàm normalizeGrpcError giữ nguyên ...

export function promisifyClient<TClient extends object>(
  client: TClient
): PromisifiedClient<TClient> {
  const result = {} as any;

  // Thay vì quét Prototype, ta quét các key thực tế hiện có trên instance của client
  // gRPC dynamic clients thường định nghĩa method trực tiếp hoặc qua proxy
  const allKeys = new Set([
    ...Object.getOwnPropertyNames(client),
    ...Object.getOwnPropertyNames(Object.getPrototypeOf(client))
  ]);

  allKeys.forEach((key) => {
    if (key === "constructor") return;

    const originalMethod = (client as any)[key];
    
    // Chỉ xử lý nếu nó là function và không phải là các hàm tiện ích của gRPC (bắt đầu bằng $)
    if (typeof originalMethod === "function" && !key.startsWith('$')) {
      
      result[key] = (req: any) =>
        new Promise((resolve, reject) => {
          // QUAN TRỌNG: Sử dụng .bind(client) hoặc .call(client, ...) 
          // để tránh lỗi "No implementation found" do mất context 'this'
          originalMethod.call(
            client,
            req,
            (error: ServiceError | null, response: any) => {
              if (error) {
                reject(normalizeGrpcError(error));
                return;
              }
              resolve(response);
            }
          );
        });
    }
  });

  return result;
}


function grpcCodeToHttpStatus (code?: number) {
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
};
function normalizeGrpcError(error: ServiceError) {
  const normalized = new Error(error.details || error.message) as Error & {
    status?: number;
    code?: number;
    body?: { code?: number; message?: string; data?: unknown };
  };
  normalized.code = error.code;
  normalized.status = grpcCodeToHttpStatus(error.code);

  const trailerBody = error.metadata?.get('x-error-body')?.[0];
  if (typeof trailerBody === 'string' && trailerBody) {
    try {
      normalized.body = JSON.parse(trailerBody) as { code?: number; message?: string; data?: unknown };
      if (normalized.body?.message) {
        normalized.message = normalized.body.message;
      }
      if (typeof normalized.body?.code === 'number') {
        normalized.status = normalized.body.code;
      }
    } catch {
      // ignore malformed structured error payloads
    }
  }

  return normalized;
};
