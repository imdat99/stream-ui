import { validateFn } from "@hiogawa/tiny-rpc";
import { getContext } from "hono/context-storage";
import z from "zod";

const optionalTrimmed = () => z.string().trim().min(1).optional();
export const adminMethods = {
    getAdminDashboard: async () => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    const response = await adminClient.getAdminDashboard({}, metadata);
    return response.dashboard ?? null;
  },
  listAdminUsers: validateFn(
    z.object({
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
      search: optionalTrimmed(),
      role: optionalTrimmed(),
    }).optional().default({}),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.listAdminUsers(data, metadata);
  }),
  createAdminUser: validateFn(
    z.object({
      email: z.string().trim().email(),
      username: optionalTrimmed(),
      password: z.string().min(6),
      role: z.string().trim().min(1),
      planId: optionalTrimmed(),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.createAdminUser(data, metadata);
  }),
  updateAdminUser: validateFn(
    z.object({
      id: z.string().trim().min(1),
      email: z.string().trim().email().optional(),
      username: optionalTrimmed(),
      password: z.string().min(6).optional(),
      role: z.string().trim().min(1).optional(),
      planId: optionalTrimmed(),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.updateAdminUser(data, metadata);
  }),
  getAdminUser: validateFn(
    z.object({
      id: z.string().trim().min(1),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.getAdminUser(data, metadata);
  }),
  updateAdminUserReferralSettings: validateFn(
    z.object({
      id: z.string().trim().min(1),
      refUsername: optionalTrimmed(),
      clearReferrer: z.boolean().optional(),
      referralEligible: z.boolean().optional(),
      referralRewardBps: z.number().int().min(0).max(10000).optional(),
      clearReferralRewardBps: z.boolean().optional(),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.updateAdminUserReferralSettings(data, metadata);
  }),
  updateAdminUserRole: validateFn(
    z.object({
      id: z.string().trim().min(1),
      role: z.string().trim().min(1),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.updateAdminUserRole(data, metadata);
  }),
  deleteAdminUser: validateFn(
    z.object({
      id: z.string().trim().min(1),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.deleteAdminUser(data, metadata);
  }),
  listAdminVideos: validateFn(
    z.object({
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
      search: optionalTrimmed(),
      userId: optionalTrimmed(),
      status: optionalTrimmed(),
    }).optional().default({}),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.listAdminVideos(data, metadata);
  }),
  createAdminVideo: validateFn(
    z.object({
      userId: z.string().trim().min(1),
      title: z.string().trim().min(1),
      description: optionalTrimmed(),
      url: z.string().trim().url(),
      size: z.number().min(0).optional(),
      duration: z.number().min(0).optional(),
      format: optionalTrimmed(),
      status: z.string().trim().min(1),
      adTemplateId: optionalTrimmed(),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.createAdminVideo(data, metadata);
  }),
  updateAdminVideo: validateFn(
    z.object({
      id: z.string().trim().min(1),
      userId: z.string().trim().min(1),
      title: z.string().trim().min(1),
      description: optionalTrimmed(),
      url: z.string().trim().url(),
      size: z.number().min(0).optional(),
      duration: z.number().min(0).optional(),
      format: optionalTrimmed(),
      status: z.string().trim().min(1),
      adTemplateId: optionalTrimmed(),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.updateAdminVideo(data, metadata);
  }),
  deleteAdminVideo: validateFn(
    z.object({
      id: z.string().trim().min(1),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.deleteAdminVideo(data, metadata);
  }),
  listAdminPayments: validateFn(
    z.object({
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
      userId: optionalTrimmed(),
      status: optionalTrimmed(),
    }).optional().default({}),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.listAdminPayments(data, metadata);
  }),
  createAdminPayment: validateFn(
    z.object({
      userId: z.string().trim().min(1),
      planId: z.string().trim().min(1),
      termMonths: z.number().int().min(1),
      paymentMethod: z.string().trim().min(1),
      topupAmount: z.number().min(0).optional(),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.createAdminPayment(data, metadata);
  }),
  updateAdminPayment: validateFn(
    z.object({
      id: z.string().trim().min(1),
      status: z.string().trim().min(1),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.updateAdminPayment(data, metadata);
  }),
  listAdminPlans: async () => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.listAdminPlans({}, metadata);
  },
  createAdminPlan: validateFn(
    z.object({
      name: z.string().trim().min(1),
      description: optionalTrimmed(),
      features: z.array(z.string().trim().min(1)).optional(),
      price: z.number().min(0),
      cycle: z.string().trim().min(1),
      storageLimit: z.number().int().min(1),
      uploadLimit: z.number().int().min(1),
      isActive: z.boolean(),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.createAdminPlan(data, metadata);
  }),
  updateAdminPlan: validateFn(
    z.object({
      id: z.string().trim().min(1),
      name: z.string().trim().min(1),
      description: optionalTrimmed(),
      features: z.array(z.string().trim().min(1)).optional(),
      price: z.number().min(0),
      cycle: z.string().trim().min(1),
      storageLimit: z.number().int().min(1),
      uploadLimit: z.number().int().min(1),
      isActive: z.boolean(),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.updateAdminPlan(data, metadata);
  }),
  deleteAdminPlan: validateFn(
    z.object({
      id: z.string().trim().min(1),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.deleteAdminPlan(data, metadata);
  }),
  listAdminAdTemplates: validateFn(
    z.object({
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
      userId: optionalTrimmed(),
      search: optionalTrimmed(),
    }).optional().default({}),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.listAdminAdTemplates(data, metadata);
  }),
  createAdminAdTemplate: validateFn(
    z.object({
      userId: z.string().trim().min(1),
      name: z.string().trim().min(1),
      description: optionalTrimmed(),
      vastTagUrl: z.string().trim().url(),
      adFormat: z.string().trim().min(1).optional(),
      duration: z.number().int().min(0).optional(),
      isActive: z.boolean(),
      isDefault: z.boolean(),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.createAdminAdTemplate(data, metadata);
  }),
  updateAdminAdTemplate: validateFn(
    z.object({
      id: z.string().trim().min(1),
      userId: z.string().trim().min(1),
      name: z.string().trim().min(1),
      description: optionalTrimmed(),
      vastTagUrl: z.string().trim().url(),
      adFormat: z.string().trim().min(1).optional(),
      duration: z.number().int().min(0).optional(),
      isActive: z.boolean(),
      isDefault: z.boolean(),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.updateAdminAdTemplate(data, metadata);
  }),
  deleteAdminAdTemplate: validateFn(
    z.object({
      id: z.string().trim().min(1),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.deleteAdminAdTemplate(data, metadata);
  }),
  listAdminPopupAds: validateFn(
    z.object({
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
      userId: optionalTrimmed(),
      search: optionalTrimmed(),
    }).optional().default({}),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.listAdminPopupAds(data, metadata);
  }),
  createAdminPopupAd: validateFn(
    z.object({
      userId: z.string().trim().min(1),
      type: z.enum(['url', 'script']),
      label: z.string().trim().min(1),
      value: z.string().trim().min(1),
      isActive: z.boolean().optional(),
      maxTriggersPerSession: z.number().int().min(1).optional(),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.createAdminPopupAd(data, metadata);
  }),
  updateAdminPopupAd: validateFn(
    z.object({
      id: z.string().trim().min(1),
      userId: z.string().trim().min(1),
      type: z.enum(['url', 'script']),
      label: z.string().trim().min(1),
      value: z.string().trim().min(1),
      isActive: z.boolean().optional(),
      maxTriggersPerSession: z.number().int().min(1).optional(),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.updateAdminPopupAd(data, metadata);
  }),
  deleteAdminPopupAd: validateFn(
    z.object({ id: z.string().trim().min(1) }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.deleteAdminPopupAd(data, metadata);
  }),
  listAdminPlayerConfigs: validateFn(
    z.object({
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
      userId: optionalTrimmed(),
      search: optionalTrimmed(),
    }).optional().default({}),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.listAdminPlayerConfigs(data, metadata);
  }),
  createAdminPlayerConfig: validateFn(
    z.object({
      userId: z.string().trim().min(1),
      name: z.string().trim().min(1),
      description: optionalTrimmed(),
      autoplay: z.boolean().optional(),
      loop: z.boolean().optional(),
      muted: z.boolean().optional(),
      showControls: z.boolean().optional(),
      pip: z.boolean().optional(),
      airplay: z.boolean().optional(),
      chromecast: z.boolean().optional(),
      encrytionM3u8: z.boolean().optional(),
      logoUrl: z.string().trim().optional(),
      isActive: z.boolean(),
      isDefault: z.boolean(),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.createAdminPlayerConfig(data, metadata);
  }),
  updateAdminPlayerConfig: validateFn(
    z.object({
      id: z.string().trim().min(1),
      userId: z.string().trim().min(1),
      name: z.string().trim().min(1),
      description: optionalTrimmed(),
      autoplay: z.boolean().optional(),
      loop: z.boolean().optional(),
      muted: z.boolean().optional(),
      showControls: z.boolean().optional(),
      pip: z.boolean().optional(),
      airplay: z.boolean().optional(),
      chromecast: z.boolean().optional(),
      encrytionM3u8: z.boolean().optional(),
      logoUrl: z.string().trim().optional(),
      isActive: z.boolean(),
      isDefault: z.boolean(),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.updateAdminPlayerConfig(data, metadata);
  }),
  deleteAdminPlayerConfig: validateFn(
    z.object({
      id: z.string().trim().min(1),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.deleteAdminPlayerConfig(data, metadata);
  }),
  listAdminJobs: validateFn(
    z.object({
      cursor: optionalTrimmed(),
      pageSize: z.number().int().min(1).max(100).optional(),
      offset: z.number().int().min(0).optional(),
      limit: z.number().int().min(1).max(100).optional(),
      agentId: optionalTrimmed(),
    }).optional().default({}),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.listAdminJobs(data, metadata);
  }),
  getAdminJob: validateFn(
    z.object({
      id: z.string().trim().min(1),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.getAdminJob(data, metadata);
  }),
  getAdminJobLogs: validateFn(
    z.object({
      id: z.string().trim().min(1),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.getAdminJobLogs(data, metadata);
  }),
  createAdminJob: validateFn(
    z.object({
      command: z.string().trim().min(1),
      image: optionalTrimmed(),
      env: z.record(z.string(), z.string()).optional(),
      priority: z.number().int().optional(),
      userId: optionalTrimmed(),
      name: optionalTrimmed(),
      timeLimit: z.number().int().min(0).optional(),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.createAdminJob(data, metadata);
  }),
  cancelAdminJob: validateFn(
    z.object({
      id: z.string().trim().min(1),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.cancelAdminJob(data, metadata);
  }),
  retryAdminJob: validateFn(
    z.object({
      id: z.string().trim().min(1),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.retryAdminJob(data, metadata);
  }),
  listAdminAgents: async () => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.listAdminAgents({}, metadata);
  },
  restartAdminAgent: validateFn(
    z.object({
      id: z.string().trim().min(1),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.restartAdminAgent(data, metadata);
  }),
  updateAdminAgent: validateFn(
    z.object({
      id: z.string().trim().min(1),
    }),
  )(async (data) => {
    const context = getContext();
    const adminClient = context.get("adminClient");
    const metadata = context.get("grpcMetadata");
    return await adminClient.updateAdminAgent(data, metadata);
  }),
}