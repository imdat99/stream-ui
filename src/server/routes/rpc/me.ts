// import { validateFn } from "@hiogawa/tiny-rpc";
import { validateFn } from "@/server/utils";
import { createManifest, saveManifest, validateChunkUrls } from "@/server/utils/s3Helper";
import { getContext } from "hono/context-storage";
import z from "zod";

const optionalTrimmed = () => z.string().trim().min(1).optional();

export const meMethods = {
  getMe: async () => {
    const context = getContext();
    const accountClient = context.get("accountClient");
    const metadata = context.get("grpcMetadata");
    const response = await accountClient.getMe({}, metadata);
    return response.user ?? null;
  },
  updateMe: validateFn(
    z.object({
      username: z.string().min(3).optional(),
      email: z.string().email().optional(),
      language: z.string().optional(),
      locale: z.string().optional(),
    }),
  )(async (data) => {
    const context = getContext();
    const accountClient = context.get("accountClient");
    const metadata = context.get("grpcMetadata");
    const response = await accountClient.updateMe(data, metadata);
    return response.user ?? null;
  }),
  deleteMe: async () => {
    const context = getContext();
    const accountClient = context.get("accountClient");
    const metadata = context.get("grpcMetadata");
    return await accountClient.deleteMe({}, metadata);
  },
  clearMyData: async () => {
    const context = getContext();
    const accountClient = context.get("accountClient");
    const metadata = context.get("grpcMetadata");
    return await accountClient.clearMyData({}, metadata);
  },
  listVideos: validateFn(
    z.object({
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
      search: optionalTrimmed(),
      status: optionalTrimmed(),
    }).optional().default({}),
  )(async (data) => {
    const context = getContext();
    const videosClient = context.get("videosClient");
    const metadata = context.get("grpcMetadata");
    return await videosClient.listVideos(data, metadata);
  }),
  getVideo: validateFn(
    z.object({
      id: z.string().trim().min(1),
    }),
  )(async (data) => {
    const context = getContext();
    const videosClient = context.get("videosClient");
    const metadata = context.get("grpcMetadata");
    return await videosClient.getVideo(data, metadata);
  }),
  updateVideo: validateFn(
    z.object({
      id: z.string().trim().min(1),
      title: z.string().trim().min(1),
      description: z.string().optional(),
      url: optionalTrimmed(),
      size: z.number().min(0).optional(),
      duration: z.number().min(0).optional(),
      format: optionalTrimmed(),
      status: optionalTrimmed(),
    }),
  )(async (data) => {
    const context = getContext();
    const videosClient = context.get("videosClient");
    const metadata = context.get("grpcMetadata");
    return await videosClient.updateVideo(data, metadata);
  }),
  deleteVideo: validateFn(
    z.object({
      id: z.string().trim().min(1),
    }),
  )(async (data) => {
    const context = getContext();
    const videosClient = context.get("videosClient");
    const metadata = context.get("grpcMetadata");
    return await videosClient.deleteVideo(data, metadata);
  }),
  listAdTemplates: async () => {
    const context = getContext();
    const adTemplatesClient = context.get("adTemplatesClient");
    const metadata = context.get("grpcMetadata");
    return await adTemplatesClient.listAdTemplates({}, metadata);
  },
  createAdTemplate: validateFn(
    z.object({
      name: z.string().trim().min(1),
      description: z.string().optional(),
      vastTagUrl: z.string().trim().url(),
      adFormat: optionalTrimmed(),
      duration: z.number().int().min(0).optional(),
      isActive: z.boolean().optional(),
      isDefault: z.boolean().optional(),
    }),
  )(async (data) => {
    const context = getContext();
    const adTemplatesClient = context.get("adTemplatesClient");
    const metadata = context.get("grpcMetadata");
    return await adTemplatesClient.createAdTemplate(data, metadata);
  }),
  updateAdTemplate: validateFn(
    z.object({
      id: z.string().trim().min(1),
      name: z.string().trim().min(1),
      description: z.string().optional(),
      vastTagUrl: z.string().trim().url(),
      adFormat: optionalTrimmed(),
      duration: z.number().int().min(0).optional(),
      isActive: z.boolean().optional(),
      isDefault: z.boolean().optional(),
    }),
  )(async (data) => {
    const context = getContext();
    const adTemplatesClient = context.get("adTemplatesClient");
    const metadata = context.get("grpcMetadata");
    return await adTemplatesClient.updateAdTemplate(data, metadata);
  }),
  deleteAdTemplate: validateFn(
    z.object({
      id: z.string().trim().min(1),
    }),
  )(async (data) => {
    const context = getContext();
    const adTemplatesClient = context.get("adTemplatesClient");
    const metadata = context.get("grpcMetadata");
    return await adTemplatesClient.deleteAdTemplate(data, metadata);
  }),
  listPopupAds: validateFn(
    z.object({
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
    }).optional().default({}),
  )(async (data) => {
    const context = getContext();
    const popupAdsClient = context.get("popupAdsClient");
    const metadata = context.get("grpcMetadata");
    return await popupAdsClient.listPopupAds(data, metadata);
  }),
  createPopupAd: validateFn(
    z.object({
      type: z.enum(['url', 'script']),
      label: z.string().trim().min(1),
      value: z.string().trim().min(1),
      isActive: z.boolean().optional(),
      maxTriggersPerSession: z.number().int().min(1).optional(),
    }),
  )(async (data) => {
    const context = getContext();
    const popupAdsClient = context.get("popupAdsClient");
    const metadata = context.get("grpcMetadata");
    return await popupAdsClient.createPopupAd(data, metadata);
  }),
  updatePopupAd: validateFn(
    z.object({
      id: z.string().trim().min(1),
      type: z.enum(['url', 'script']),
      label: z.string().trim().min(1),
      value: z.string().trim().min(1),
      isActive: z.boolean().optional(),
      maxTriggersPerSession: z.number().int().min(1).optional(),
    }),
  )(async (data) => {
    const context = getContext();
    const popupAdsClient = context.get("popupAdsClient");
    const metadata = context.get("grpcMetadata");
    return await popupAdsClient.updatePopupAd(data, metadata);
  }),
  deletePopupAd: validateFn(
    z.object({ id: z.string().trim().min(1) }),
  )(async (data) => {
    const context = getContext();
    const popupAdsClient = context.get("popupAdsClient");
    const metadata = context.get("grpcMetadata");
    return await popupAdsClient.deletePopupAd(data, metadata);
  }),
  getActivePopupAd: async () => {
    const context = getContext();
    const popupAdsClient = context.get("popupAdsClient");
    const metadata = context.get("grpcMetadata");
    return await popupAdsClient.getActivePopupAd({}, metadata);
  },
  listPlayerConfigs: async () => {
    const context = getContext();
    const playerConfigsClient = context.get("playerConfigsClient");
    const metadata = context.get("grpcMetadata");
    return await playerConfigsClient.listPlayerConfigs({}, metadata);
  },
  createPlayerConfig: validateFn(
    z.object({
      name: z.string().trim().min(1),
      description: z.string().optional(),
      autoplay: z.boolean().optional(),
      loop: z.boolean().optional(),
      muted: z.boolean().optional(),
      showControls: z.boolean().optional(),
      pip: z.boolean().optional(),
      airplay: z.boolean().optional(),
      chromecast: z.boolean().optional(),
      encrytionM3u8: z.boolean().optional(),
      logoUrl: z.string().trim().optional(),
      isActive: z.boolean().optional(),
      isDefault: z.boolean().optional(),
    }),
  )(async (data) => {
    const context = getContext();
    const playerConfigsClient = context.get("playerConfigsClient");
    const metadata = context.get("grpcMetadata");
    return await playerConfigsClient.createPlayerConfig(data, metadata);
  }),
  updatePlayerConfig: validateFn(
    z.object({
      id: z.string().trim().min(1),
      name: z.string().trim().min(1),
      description: z.string().optional(),
      autoplay: z.boolean().optional(),
      loop: z.boolean().optional(),
      muted: z.boolean().optional(),
      showControls: z.boolean().optional(),
      pip: z.boolean().optional(),
      airplay: z.boolean().optional(),
      chromecast: z.boolean().optional(),
      encrytionM3u8: z.boolean().optional(),
      logoUrl: z.string().trim().optional(),
      isActive: z.boolean().optional(),
      isDefault: z.boolean().optional(),
    }),
  )(async (data) => {
    const context = getContext();
    const playerConfigsClient = context.get("playerConfigsClient");
    const metadata = context.get("grpcMetadata");
    return await playerConfigsClient.updatePlayerConfig(data, metadata);
  }),
  deletePlayerConfig: validateFn(
    z.object({
      id: z.string().trim().min(1),
    }),
  )(async (data) => {
    const context = getContext();
    const playerConfigsClient = context.get("playerConfigsClient");
    const metadata = context.get("grpcMetadata");
    return await playerConfigsClient.deletePlayerConfig(data, metadata);
  }),
  getPreferences: async () => {
    const context = getContext();
    const accountClient = context.get("accountClient");
    const metadata = context.get("grpcMetadata");
    return await accountClient.getPreferences({}, metadata);
  },
  updatePreferences: validateFn(
    z.object({
      emailNotifications: z.boolean().optional(),
      pushNotifications: z.boolean().optional(),
      marketingNotifications: z.boolean().optional(),
      telegramNotifications: z.boolean().optional(),
      language: z.string().optional(),
      locale: z.string().optional(),
    }),
  )(async (data) => {
    const context = getContext();
    const accountClient = context.get("accountClient");
    const metadata = context.get("grpcMetadata");
    return await accountClient.updatePreferences(data, metadata);
  }),
  listNotifications: async () => {
    const context = getContext();
    const notificationsClient = context.get("notificationsClient");
    const metadata = context.get("grpcMetadata");
    return await notificationsClient.listNotifications({}, metadata);
  },
  markNotificationRead: validateFn(
    z.object({
      id: z.string().trim().min(1),
    }),
  )(async (data) => {
    const context = getContext();
    const notificationsClient = context.get("notificationsClient");
    const metadata = context.get("grpcMetadata");
    return await notificationsClient.markNotificationRead(data, metadata);
  }),
  markAllNotificationsRead: async () => {
    const context = getContext();
    const notificationsClient = context.get("notificationsClient");
    const metadata = context.get("grpcMetadata");
    return await notificationsClient.markAllNotificationsRead({}, metadata);
  },
  deleteNotification: validateFn(
    z.object({
      id: z.string().trim().min(1),
    }),
  )(async (data) => {
    const context = getContext();
    const notificationsClient = context.get("notificationsClient");
    const metadata = context.get("grpcMetadata");
    return await notificationsClient.deleteNotification(data, metadata);
  }),
  clearNotifications: async () => {
    const context = getContext();
    const notificationsClient = context.get("notificationsClient");
    const metadata = context.get("grpcMetadata");
    return await notificationsClient.clearNotifications({}, metadata);
  },
  getUploadUrl: validateFn(
    z.object({
      filename: z.string().trim().min(1),
    }),
  )(async (data) => {
    const context = getContext();
    const videosClient = context.get("videosClient");
    const metadata = context.get("grpcMetadata");
    return await videosClient.getUploadUrl(data, metadata);
  }),
  createVideo: validateFn(
    z.object({
      title: z.string().trim().min(1),
      description: z.string().optional(),
      url: z.string().trim().min(1),
      size: z.number().min(0).optional(),
      duration: z.number().min(0).optional(),
      format: optionalTrimmed(),
    }),
  )(async (data) => {
    const context = getContext();
    const videosClient = context.get("videosClient");
    const metadata = context.get("grpcMetadata");
    return await videosClient.createVideo(data, metadata);
  }),
  getUsage: async () => {
    const context = getContext();
    const accountClient = context.get("accountClient");
    const metadata = context.get("grpcMetadata");
    return await accountClient.getUsage({}, metadata);
  },
  listDomains: async () => {
    const context = getContext();
    const domainsClient = context.get("domainsClient");
    const metadata = context.get("grpcMetadata");
    return await domainsClient.listDomains({}, metadata);
  },
  createDomain: validateFn(
    z.object({
      name: z.string().trim().min(1),
    }),
  )(async (data) => {
    const context = getContext();
    const domainsClient = context.get("domainsClient");
    const metadata = context.get("grpcMetadata");
    return await domainsClient.createDomain(data, metadata);
  }),
  deleteDomain: validateFn(
    z.object({
      id: z.string().trim().min(1),
    }),
  )(async (data) => {
    const context = getContext();
    const domainsClient = context.get("domainsClient");
    const metadata = context.get("grpcMetadata");
    return await domainsClient.deleteDomain(data, metadata);
  }),
  listPlans: async () => {
    const context = getContext();
    const plansClient = context.get("plansClient");
    const metadata = context.get("grpcMetadata");
    return await plansClient.listPlans({}, metadata);
  },
  listPaymentHistory: validateFn(
    z.number().int().min(1).optional(),
    z.number().int().min(1).max(100).optional(),
  )(async (page, limit) => {
    const context = getContext();
    const paymentsClient = context.get("paymentsClient");
    const metadata = context.get("grpcMetadata");
    return await paymentsClient.listPaymentHistory({ page, limit }, metadata);
  }),
  createPayment: validateFn(
    z.object({
      planId: z.string().trim().min(1),
      termMonths: z.number().int().min(1),
      paymentMethod: z.string().trim().min(1),
      topupAmount: z.number().min(0).optional(),
    }),
  )(async (data) => {
    const context = getContext();
    const paymentsClient = context.get("paymentsClient");
    const metadata = context.get("grpcMetadata");
    return await paymentsClient.createPayment(data, metadata);
  }),
  topupWallet: validateFn(
    z.object({
      amount: z.number().min(0.01),
    }),
  )(async (data) => {
    const context = getContext();
    const paymentsClient = context.get("paymentsClient");
    const metadata = context.get("grpcMetadata");
    return await paymentsClient.topupWallet(data, metadata);
  }),
  downloadInvoice: validateFn(
    z.object({
      id: z.string().trim().min(1),
    }),
  )(async (data) => {
    const context = getContext();
    const paymentsClient = context.get("paymentsClient");
    const metadata = context.get("grpcMetadata");
    return await paymentsClient.downloadInvoice(data, metadata);
  }),
  merge: validateFn(
      z.string().trim().min(6).includes("."),
      z.array(z.url()).min(1).refine(validateChunkUrls, { message: "One or more chunk URLs are invalid or not allowed" }),
      z.number().min(5 * 1024 * 1024),// min 5mb
    )
  (async (filename, chunks, size) => {
    const manifest = createManifest(filename, chunks, size);
    await saveManifest(manifest);
    return manifest;
    // return await videosClient.merge({ name, chunks, size }, metadata);
  }),
};
// export function registerMergeRoutes(app: Hono) {
//   app.post('/merge', authMiddleware, async (c) => {
//     try {
//       const body = await c.req.json();
//       const { filename, chunks, size } = body;

//       if (!filename || !Array.isArray(chunks) || chunks.length === 0) {
//         return c.json({ error: 'invalid payload' }, 400);
//       }

//       const hostError = validateChunkUrls(chunks);
//       if (hostError) return c.json({ error: hostError }, 400);

//       const manifest = createManifest(filename, chunks, size);
//       await saveManifest(manifest);

//       return c.json({
//         status: 'ok',
//         id: manifest.id,
//         filename: manifest.filename,
//         total_parts: manifest.total_parts,
//         size: manifest.size,
//       });
//     } catch (e: any) {
//       return c.json({ error: e?.message ?? String(e) }, 500);
//     }
//   });
// }