import {
  AccountClient,
  NotificationsClient,
  type AccountClient as AccountClientType,
  type NotificationsClient as NotificationsClientType,
} from "@/server/api/proto/app/v1/account";
import {
  AdminClient,
  type AdminClient as AdminClientType,
} from "@/server/api/proto/app/v1/admin";
import {
  AuthClient,
  type AuthClient as AuthClientType,
} from "@/server/api/proto/app/v1/auth";
import {
  AdTemplatesClient,
  DomainsClient,
  PlayerConfigsClient,
  PlansClient,
  PopupAdsClient,
  type AdTemplatesClient as AdTemplatesClientType,
  type DomainsClient as DomainsClientType,
  type PlayerConfigsClient as PlayerConfigsClientType,
  type PlansClient as PlansClientType,
  type PopupAdsClient as PopupAdsClientType,
} from "@/server/api/proto/app/v1/catalog";
import {
  PaymentsClient,
  type PaymentsClient as PaymentsClientType,
} from "@/server/api/proto/app/v1/payments";
import {
  VideosClient,
  type VideosClient as VideosClientType,
} from "@/server/api/proto/app/v1/videos";
import { ChannelCredentials, Metadata, credentials } from "@grpc/grpc-js";
import type { Hono } from "hono";
import { tryGetContext } from "hono/context-storage";
import { PromisifiedClient, promisifyClient } from "../utils/grpcHelper";

declare module "hono" {
  interface ContextVariableMap {
    accountClient: PromisifiedClient<AccountClientType>;
    authClient: PromisifiedClient<AuthClientType>;
    adminClient: PromisifiedClient<AdminClientType>;
    adTemplatesClient: PromisifiedClient<AdTemplatesClientType>;
    popupAdsClient: PromisifiedClient<PopupAdsClientType>;
    videosClient: PromisifiedClient<VideosClientType>;
    domainsClient: PromisifiedClient<DomainsClientType>;
    playerConfigsClient: PromisifiedClient<PlayerConfigsClientType>;
    plansClient: PromisifiedClient<PlansClientType>;
    paymentsClient: PromisifiedClient<PaymentsClientType>;
    notificationsClient: PromisifiedClient<NotificationsClientType>;
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

export const getAccountClient = () => {
  const context = tryGetContext();
  if (!context) {
    throw new Error("No context available to get AccountClient");
  }
  return context.get("accountClient");
};

export const getAuthClient = () => {
  const context = tryGetContext();
  if (!context) {
    throw new Error("No context available to get AuthClient");
  }
  return context.get("authClient");
};

export const getAdminClient = () => {
  const context = tryGetContext();
  if (!context) {
    throw new Error("No context available to get AdminClient");
  }
  return context.get("adminClient");
};

export const getAdTemplatesClient = () => {
  const context = tryGetContext();
  if (!context) {
    throw new Error("No context available to get AdTemplatesClient");
  }
  return context.get("adTemplatesClient");
};

export const getPopupAdsClient = () => {
  const context = tryGetContext();
  if (!context) {
    throw new Error("No context available to get PopupAdsClient");
  }
  return context.get("popupAdsClient");
};

export const getVideosClient = () => {
  const context = tryGetContext();
  if (!context) {
    throw new Error("No context available to get VideosClient");
  }
  return context.get("videosClient");
};

export const getDomainsClient = () => {
  const context = tryGetContext();
  if (!context) {
    throw new Error("No context available to get DomainsClient");
  }
  return context.get("domainsClient");
};

export const getPlayerConfigsClient = () => {
  const context = tryGetContext();
  if (!context) {
    throw new Error("No context available to get PlayerConfigsClient");
  }
  return context.get("playerConfigsClient");
};

export const getPlansClient = () => {
  const context = tryGetContext();
  if (!context) {
    throw new Error("No context available to get PlansClient");
  }
  return context.get("plansClient");
};

export const getPaymentsClient = () => {
  const context = tryGetContext();
  if (!context) {
    throw new Error("No context available to get PaymentsClient");
  }
  return context.get("paymentsClient");
};

export const getNotificationsClient = () => {
  const context = tryGetContext();
  if (!context) {
    throw new Error("No context available to get NotificationsClient");
  }
  return context.get("notificationsClient");
};

export const getGrpcMetadataFromContext = () => buildActorMetadata();

export const getInternalGrpcMetadata = () => buildInternalMetadata();

export const setupServices = (app: Hono) => {
  app.use("*", async (c, next) => {
    const creds = getCredentials();

    const accountClient = new AccountClient(grpcAddress(), creds);
    const authClient = new AuthClient(grpcAddress(), creds);
    const adminClient = new AdminClient(grpcAddress(), creds);
    const adTemplatesClient = new AdTemplatesClient(grpcAddress(), creds);
    const popupAdsClient = new PopupAdsClient(grpcAddress(), creds);
    const videosClient = new VideosClient(grpcAddress(), creds);
    const domainsClient = new DomainsClient(grpcAddress(), creds);
    const playerConfigsClient = new PlayerConfigsClient(grpcAddress(), creds);
    const plansClient = new PlansClient(grpcAddress(), creds);
    const paymentsClient = new PaymentsClient(grpcAddress(), creds);
    const notificationsClient = new NotificationsClient(grpcAddress(), creds);

    c.set("accountClient", promisifyClient(accountClient));
    c.set("authClient", promisifyClient(authClient));
    c.set("adminClient", promisifyClient(adminClient));
    c.set("adTemplatesClient", promisifyClient(adTemplatesClient));
    c.set("popupAdsClient", promisifyClient(popupAdsClient));
    c.set("videosClient", promisifyClient(videosClient));
    c.set("domainsClient", promisifyClient(domainsClient));
    c.set("playerConfigsClient", promisifyClient(playerConfigsClient));
    c.set("plansClient", promisifyClient(plansClient));
    c.set("paymentsClient", promisifyClient(paymentsClient));
    c.set("notificationsClient", promisifyClient(notificationsClient));
    c.set("internalGrpcMetadata", getInternalGrpcMetadata());

    await next();
  });
};
