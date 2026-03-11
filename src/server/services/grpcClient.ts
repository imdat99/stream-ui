import { ChannelCredentials, credentials } from "@grpc/grpc-js";
import { tryGetContext } from "hono/context-storage";
import { Hono } from "node_modules/hono/dist/types/hono";
import { PromisifiedClient, promisifyClient } from "../utils/grpcHelper";
import { UserServiceClient } from "../utils/proto/v1/user";
declare module "hono" {
  interface ContextVariableMap {
    userServiceClient: PromisifiedClient<UserServiceClient>;
  }
}
const DEFAULT_GRPC_ADDRESS = '127.0.0.1:9000';

const grpcAddress = () => process.env.STREAM_API_GRPC_ADDR || DEFAULT_GRPC_ADDRESS;
let sharedCredentials: ChannelCredentials | undefined;
const getCredentials = () => {
  if (!sharedCredentials) {
    sharedCredentials = credentials.createInsecure();
  }
  return sharedCredentials;
};
export const getUserServiceClient = () => {
    const context = tryGetContext();
    if (context) {
        return context.get("userServiceClient");
    }
    throw new Error("No context available to get UserServiceClient");
};
// (method) UserServiceClient.getUserByEmail(request: GetUserByEmailRequest, callback: (error: ServiceError | null, response: GetUserResponse) => void): ClientUnaryCall (+2 overloads)

// const unaryCall = <TResponse>(
//   executor: (
//     metadata: Metadata,
//     options: Partial<CallOptions>,
//     callback: (error: ServiceError | null, response: TResponse) => void,
//   ) => { metadata?: Metadata; trailer?: Metadata },
// ): Promise<TResponse> => {
//   // const { metadata } = createMetadataFromContext();

//   return new Promise<TResponse>((resolve, reject) => {
//     executor({
//       deadline: Date.now() + 10_000,
//     }, (error, response) => {
//       if (error) {
//         reject(normalizeGrpcError(error));
//         return;
//       }

//       // appendSetCookiesToResponse(call.metadata?.get('set-cookie') ?? []);
//       resolve(response);
//     });
//   });
// };


export const setupServices = (app: Hono) => {
    app.use("*", async (c, next) => {
        c.set("userServiceClient", promisifyClient(new UserServiceClient(grpcAddress(), getCredentials())));
        return await next();
    });
}