import {
  AccountServiceClient,
  NotificationsServiceClient,
  PreferencesServiceClient,
  UsageServiceClient,
  type AccountServiceClient as AccountServiceClientType,
  type NotificationsServiceClient as NotificationsServiceClientType,
  type PreferencesServiceClient as PreferencesServiceClientType,
  type UsageServiceClient as UsageServiceClientType,
} from "@/server/gen/proto/app/v1/account";
import {
  AdminServiceClient,
  type AdminServiceClient as AdminServiceClientType,
} from "@/server/gen/proto/app/v1/admin";
import {
  AuthServiceClient,
  type AuthServiceClient as AuthServiceClientType,
} from "@/server/gen/proto/app/v1/auth";
import {
  AdTemplatesServiceClient,
  DomainsServiceClient,
  PlayerConfigsServiceClient,
  PlansServiceClient,
  type AdTemplatesServiceClient as AdTemplatesServiceClientType,
  type DomainsServiceClient as DomainsServiceClientType,
  type PlayerConfigsServiceClient as PlayerConfigsServiceClientType,
  type PlansServiceClient as PlansServiceClientType,
} from "@/server/gen/proto/app/v1/catalog";
import {
  PaymentsServiceClient,
  type PaymentsServiceClient as PaymentsServiceClientType,
} from "@/server/gen/proto/app/v1/payments";
import {
  VideosServiceClient,
  type VideosServiceClient as VideosServiceClientType,
} from "@/server/gen/proto/app/v1/videos";
import { ChannelCredentials, Metadata, credentials } from "@grpc/grpc-js";
import type { Hono } from "hono";
import { tryGetContext } from "hono/context-storage";
import { PromisifiedClient, promisifyClient } from "../utils/grpcHelper";

declare module "hono" {
  interface ContextVariableMap {
    accountServiceClient: PromisifiedClient<AccountServiceClientType>;
    authServiceClient: PromisifiedClient<AuthServiceClientType>;
    adminServiceClient: PromisifiedClient<AdminServiceClientType>;
    adTemplatesServiceClient: PromisifiedClient<AdTemplatesServiceClientType>;
    videosServiceClient: PromisifiedClient<VideosServiceClientType>;
    domainsServiceClient: PromisifiedClient<DomainsServiceClientType>;
    playerConfigsServiceClient: PromisifiedClient<PlayerConfigsServiceClientType>;
    plansServiceClient: PromisifiedClient<PlansServiceClientType>;
    paymentsServiceClient: PromisifiedClient<PaymentsServiceClientType>;
    preferencesServiceClient: PromisifiedClient<PreferencesServiceClientType>;
    notificationsServiceClient: PromisifiedClient<NotificationsServiceClientType>;
    usageServiceClient: PromisifiedClient<UsageServiceClientType>;
    internalGrpcMetadata: Metadata;
  }
}

const DEFAULT_GRPC_ADDRESS = "42.96.15.109:9000";

const grpcAddress = () => process.env.STREAM_API_GRPC_ADDR || DEFAULT_GRPC_ADDRESS;

let sharedCredentials: ChannelCredentials | undefined;
const getCredentials = () => {
  if (!sharedCredentials) {
    sharedCredentials = credentials.createInsecure();
  }
  return sharedCredentials;
};

const buildForwardMetadataFromHeaders = (headers: Headers): Metadata => {
  const metadata = new Metadata();

  for (const name of ["user-agent", "x-forwarded-for", "x-real-ip", "x-request-id"]) {
    const value = headers.get(name);
    if (value) {
      metadata.set(name, value);
    }
  }

  return metadata;
};

export const buildInternalMetadata = () => {
  const context = tryGetContext();
  const metadata = context ? buildForwardMetadataFromHeaders(context.req.raw.headers) : new Metadata();
  const marker = process.env.STREAM_INTERNAL_AUTH_MARKER;

  if (!marker) {
    throw new Error("STREAM_INTERNAL_AUTH_MARKER is not configured");
  }

  metadata.set("x-stream-internal-auth", marker);
  return metadata;
};

const buildActorMetadata = () => {
  const context = tryGetContext();
  if (!context) {
    throw new Error("No context available to build actor metadata");
  }

  const metadata = buildInternalMetadata();
  const userId = context.get("userId");
  const role = context.get("role");
  const email = context.get("email");

  if (!userId || !role) {
    throw new Error("Authenticated actor context is missing");
  }

  metadata.set("x-stream-actor-id", userId);
  metadata.set("x-stream-actor-role", role);
  if (email) {
    metadata.set("x-stream-actor-email", email);
  }

  return metadata;
};

export const getAccountServiceClient = () => {
  const context = tryGetContext();
  if (!context) {
    throw new Error("No context available to get AccountServiceClient");
  }
  return context.get("accountServiceClient");
};

export const getAuthServiceClient = () => {
  const context = tryGetContext();
  if (!context) {
    throw new Error("No context available to get AuthServiceClient");
  }
  return context.get("authServiceClient");
};

export const getAdminServiceClient = () => {
  const context = tryGetContext();
  if (!context) {
    throw new Error("No context available to get AdminServiceClient");
  }
  return context.get("adminServiceClient");
};

export const getAdTemplatesServiceClient = () => {
  const context = tryGetContext();
  if (!context) {
    throw new Error("No context available to get AdTemplatesServiceClient");
  }
  return context.get("adTemplatesServiceClient");
};

export const getVideosServiceClient = () => {
  const context = tryGetContext();
  if (!context) {
    throw new Error("No context available to get VideosServiceClient");
  }
  return context.get("videosServiceClient");
};

export const getDomainsServiceClient = () => {
  const context = tryGetContext();
  if (!context) {
    throw new Error("No context available to get DomainsServiceClient");
  }
  return context.get("domainsServiceClient");
};

export const getPlayerConfigsServiceClient = () => {
  const context = tryGetContext();
  if (!context) {
    throw new Error("No context available to get PlayerConfigsServiceClient");
  }
  return context.get("playerConfigsServiceClient");
};

export const getPlansServiceClient = () => {
  const context = tryGetContext();
  if (!context) {
    throw new Error("No context available to get PlansServiceClient");
  }
  return context.get("plansServiceClient");
};

export const getPaymentsServiceClient = () => {
  const context = tryGetContext();
  if (!context) {
    throw new Error("No context available to get PaymentsServiceClient");
  }
  return context.get("paymentsServiceClient");
};

export const getPreferencesServiceClient = () => {
  const context = tryGetContext();
  if (!context) {
    throw new Error("No context available to get PreferencesServiceClient");
  }
  return context.get("preferencesServiceClient");
};

export const getNotificationsServiceClient = () => {
  const context = tryGetContext();
  if (!context) {
    throw new Error("No context available to get NotificationsServiceClient");
  }
  return context.get("notificationsServiceClient");
};

export const getUsageServiceClient = () => {
  const context = tryGetContext();
  if (!context) {
    throw new Error("No context available to get UsageServiceClient");
  }
  return context.get("usageServiceClient");
};

export const getGrpcMetadataFromContext = () => buildActorMetadata();

export const getInternalGrpcMetadata = () => buildInternalMetadata();

export const setupServices = (app: Hono) => {
  app.use("*", async (c, next) => {
    const creds = getCredentials();

    const accountClient = new AccountServiceClient(grpcAddress(), creds);
    const authClient = new AuthServiceClient(grpcAddress(), creds);
    const adminClient = new AdminServiceClient(grpcAddress(), creds);
    const adTemplatesClient = new AdTemplatesServiceClient(grpcAddress(), creds);
    const videosClient = new VideosServiceClient(grpcAddress(), creds);
    const domainsClient = new DomainsServiceClient(grpcAddress(), creds);
    const playerConfigsClient = new PlayerConfigsServiceClient(grpcAddress(), creds);
    const plansClient = new PlansServiceClient(grpcAddress(), creds);
    const paymentsClient = new PaymentsServiceClient(grpcAddress(), creds);
    const preferencesClient = new PreferencesServiceClient(grpcAddress(), creds);
    const notificationsClient = new NotificationsServiceClient(grpcAddress(), creds);
    const usageClient = new UsageServiceClient(grpcAddress(), creds);

    c.set("accountServiceClient", promisifyClient(accountClient));
    c.set("authServiceClient", promisifyClient(authClient));
    c.set("adminServiceClient", promisifyClient(adminClient));
    c.set("adTemplatesServiceClient", promisifyClient(adTemplatesClient));
    c.set("videosServiceClient", promisifyClient(videosClient));
    c.set("domainsServiceClient", promisifyClient(domainsClient));
    c.set("playerConfigsServiceClient", promisifyClient(playerConfigsClient));
    c.set("plansServiceClient", promisifyClient(plansClient));
    c.set("paymentsServiceClient", promisifyClient(paymentsClient));
    c.set("preferencesServiceClient", promisifyClient(preferencesClient));
    c.set("notificationsServiceClient", promisifyClient(notificationsClient));
    c.set("usageServiceClient", promisifyClient(usageClient));
    c.set("internalGrpcMetadata", getInternalGrpcMetadata());

    await next();
  });
};
