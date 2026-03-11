/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import { customFetch } from '@httpClientAdapter';

export interface AdminCreateAdminPaymentRequest {
  payment_method: string;
  plan_id: string;
  term_months: number;
  topup_amount?: number;
  user_id: string;
}

export interface AdminCreateAdminUserRequest {
  email: string;
  /** @minLength 6 */
  password: string;
  plan_id?: string;
  role?: string;
  username?: string;
}

export interface AdminDashboardPayload {
  active_subscriptions?: number;
  new_users_today?: number;
  new_videos_today?: number;
  total_ad_templates?: number;
  total_payments?: number;
  total_revenue?: number;
  total_storage_used?: number;
  total_users?: number;
  total_videos?: number;
}

export interface AdminSaveAdminAdTemplateRequest {
  ad_format?: string;
  description?: string;
  duration?: number;
  is_active?: boolean;
  is_default?: boolean;
  name: string;
  user_id: string;
  vast_tag_url: string;
}

export interface AdminSaveAdminVideoRequest {
  ad_template_id?: string;
  description?: string;
  duration?: number;
  format?: string;
  size: number;
  status?: string;
  title: string;
  url: string;
  user_id: string;
}

export interface AdminSavePlanRequest {
  cycle: string;
  description?: string;
  features?: string[];
  is_active?: boolean;
  name: string;
  price: number;
  storage_limit: number;
  upload_limit: number;
}

export interface AdminUpdateAdminPaymentRequest {
  status: string;
}

export interface AdminUpdateAdminUserRequest {
  email?: string;
  password?: string;
  plan_id?: string;
  role?: string;
  username?: string;
}

export interface AdminUpdateUserRoleRequest {
  role: string;
}

export interface AdtemplatesSaveAdTemplateRequest {
  ad_format?: string;
  description?: string;
  duration?: number;
  is_active?: boolean;
  is_default?: boolean;
  name: string;
  vast_tag_url: string;
}

export interface AdtemplatesTemplateListPayload {
  templates?: ManualAdTemplate[];
}

export interface AdtemplatesTemplatePayload {
  template?: ManualAdTemplate;
}

export interface AuthChangePasswordRequest {
  current_password: string;
  /** @minLength 6 */
  new_password: string;
}

export interface AuthForgotPasswordRequest {
  email: string;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthRegisterRequest {
  email: string;
  /** @minLength 6 */
  password: string;
  username: string;
}

export interface AuthResetPasswordRequest {
  /** @minLength 6 */
  new_password: string;
  token: string;
}

export interface AuthUpdateMeRequest {
  email?: string;
  language?: string;
  locale?: string;
  username?: string;
}

export interface AuthUserPayload {
  avatar?: string;
  created_at?: string;
  email?: string;
  google_id?: string;
  id?: string;
  language?: string;
  locale?: string;
  plan_expires_at?: string;
  plan_expiring_soon?: boolean;
  plan_id?: string;
  plan_payment_method?: string;
  plan_started_at?: string;
  plan_term_months?: number;
  role?: string;
  storage_used?: number;
  updated_at?: string;
  username?: string;
  wallet_balance?: number;
}

export interface DomainsCreateDomainRequest {
  name: string;
}

export interface ManualAdTemplate {
  ad_format?: string;
  created_at?: string;
  description?: string;
  duration?: number;
  id?: string;
  is_active?: boolean;
  is_default?: boolean;
  name?: string;
  updated_at?: string;
  user_id?: string;
  vast_tag_url?: string;
}

export interface ModelPlan {
  cycle?: string;
  description?: string;
  duration_limit?: number;
  features?: string[];
  id?: string;
  is_active?: boolean;
  name?: string;
  price?: number;
  quality_limit?: string;
  storage_limit?: number;
  upload_limit?: number;
}

export interface ModelVideo {
  created_at?: string;
  description?: string;
  duration?: number;
  format?: string;
  hls_path?: string;
  hls_token?: string;
  id?: string;
  name?: string;
  processing_status?: string;
  size?: number;
  status?: string;
  storage_type?: string;
  thumbnail?: string;
  title?: string;
  updated_at?: string;
  url?: string;
  user_id?: string;
  views?: number;
}

export interface PaymentCreatePaymentRequest {
  payment_method: string;
  plan_id: string;
  term_months: number;
  topup_amount?: number;
}

export interface PaymentTopupWalletRequest {
  amount: number;
}

export interface PreferencesSettingsPreferencesRequest {
  airplay?: boolean;
  autoplay?: boolean;
  chromecast?: boolean;
  email_notifications?: boolean;
  language?: string;
  locale?: string;
  loop?: boolean;
  marketing_notifications?: boolean;
  muted?: boolean;
  pip?: boolean;
  push_notifications?: boolean;
  show_controls?: boolean;
  telegram_notifications?: boolean;
}

export interface ResponseResponse {
  code?: number;
  data?: any;
  message?: string;
}

export interface UsageUsagePayload {
  total_storage?: number;
  total_videos?: number;
  user_id?: string;
}

export interface VideoCreateVideoRequest {
  description?: string;
  /** Maybe client knows, or we process later */
  duration?: number;
  format?: string;
  size: number;
  title: string;
  /** The S3 Key or Full URL */
  url: string;
}

export interface VideoUpdateVideoRequest {
  ad_template_id?: string;
  description?: string;
  title: string;
}

export interface VideoUploadURLRequest {
  content_type: string;
  filename: string;
  size: number;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "//localhost:8080";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Stream API
 * @version 1.0
 * @license Apache 2.0 (http://www.apache.org/licenses/LICENSE-2.0.html)
 * @termsOfService http://swagger.io/terms/
 * @baseUrl //localhost:8080
 * @contact API Support <support@swagger.io> (http://www.swagger.io/support)
 *
 * This is the API server for Stream application.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  adTemplates = {
    /**
     * @description Get all VAST ad templates for the current user
     *
     * @tags ad-templates
     * @name AdTemplatesList
     * @summary List Ad Templates
     * @request GET:/ad-templates
     * @secure
     */
    adTemplatesList: (params: RequestParams = {}) =>
      this.request<
        ResponseResponse & {
          data?: AdtemplatesTemplateListPayload;
        },
        ResponseResponse
      >({
        path: `/ad-templates`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a VAST ad template for the current user
     *
     * @tags ad-templates
     * @name AdTemplatesCreate
     * @summary Create Ad Template
     * @request POST:/ad-templates
     * @secure
     */
    adTemplatesCreate: (
      request: AdtemplatesSaveAdTemplateRequest,
      params: RequestParams = {},
    ) =>
      this.request<
        ResponseResponse & {
          data?: AdtemplatesTemplatePayload;
        },
        ResponseResponse
      >({
        path: `/ad-templates`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Update a VAST ad template for the current user
     *
     * @tags ad-templates
     * @name AdTemplatesUpdate
     * @summary Update Ad Template
     * @request PUT:/ad-templates/{id}
     * @secure
     */
    adTemplatesUpdate: (
      id: string,
      request: AdtemplatesSaveAdTemplateRequest,
      params: RequestParams = {},
    ) =>
      this.request<
        ResponseResponse & {
          data?: AdtemplatesTemplatePayload;
        },
        ResponseResponse
      >({
        path: `/ad-templates/${id}`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete a VAST ad template for the current user
     *
     * @tags ad-templates
     * @name AdTemplatesDelete
     * @summary Delete Ad Template
     * @request DELETE:/ad-templates/{id}
     * @secure
     */
    adTemplatesDelete: (id: string, params: RequestParams = {}) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/ad-templates/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  admin = {
    /**
     * @description Get paginated list of all ad templates across users (admin only)
     *
     * @tags admin
     * @name AdTemplatesList
     * @summary List All Ad Templates
     * @request GET:/admin/ad-templates
     * @secure
     */
    adTemplatesList: (
      query?: {
        /**
         * Page
         * @default 1
         */
        page?: number;
        /**
         * Limit
         * @default 20
         */
        limit?: number;
        /** Filter by user ID */
        user_id?: string;
        /** Search by name */
        search?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/admin/ad-templates`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Create an ad template for any user (admin only)
     *
     * @tags admin
     * @name AdTemplatesCreate
     * @summary Create Ad Template
     * @request POST:/admin/ad-templates
     * @secure
     */
    adTemplatesCreate: (
      request: AdminSaveAdminAdTemplateRequest,
      params: RequestParams = {},
    ) =>
      this.request<ResponseResponse, any>({
        path: `/admin/ad-templates`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get ad template detail (admin only)
     *
     * @tags admin
     * @name AdTemplatesDetail
     * @summary Get Ad Template Detail
     * @request GET:/admin/ad-templates/{id}
     * @secure
     */
    adTemplatesDetail: (id: string, params: RequestParams = {}) =>
      this.request<ResponseResponse, any>({
        path: `/admin/ad-templates/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Update an ad template for any user (admin only)
     *
     * @tags admin
     * @name AdTemplatesUpdate
     * @summary Update Ad Template
     * @request PUT:/admin/ad-templates/{id}
     * @secure
     */
    adTemplatesUpdate: (
      id: string,
      request: AdminSaveAdminAdTemplateRequest,
      params: RequestParams = {},
    ) =>
      this.request<ResponseResponse, any>({
        path: `/admin/ad-templates/${id}`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete any ad template by ID (admin only)
     *
     * @tags admin
     * @name AdTemplatesDelete
     * @summary Delete Ad Template (Admin)
     * @request DELETE:/admin/ad-templates/{id}
     * @secure
     */
    adTemplatesDelete: (id: string, params: RequestParams = {}) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/admin/ad-templates/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get system-wide statistics for the admin dashboard
     *
     * @tags admin
     * @name DashboardList
     * @summary Admin Dashboard
     * @request GET:/admin/dashboard
     * @secure
     */
    dashboardList: (params: RequestParams = {}) =>
      this.request<
        ResponseResponse & {
          data?: AdminDashboardPayload;
        },
        ResponseResponse
      >({
        path: `/admin/dashboard`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get paginated list of all payments across users (admin only)
     *
     * @tags admin
     * @name PaymentsList
     * @summary List All Payments
     * @request GET:/admin/payments
     * @secure
     */
    paymentsList: (
      query?: {
        /**
         * Page
         * @default 1
         */
        page?: number;
        /**
         * Limit
         * @default 20
         */
        limit?: number;
        /** Filter by user ID */
        user_id?: string;
        /** Filter by status */
        status?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/admin/payments`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a manual subscription charge for a user (admin only)
     *
     * @tags admin
     * @name PaymentsCreate
     * @summary Create Payment
     * @request POST:/admin/payments
     * @secure
     */
    paymentsCreate: (
      request: AdminCreateAdminPaymentRequest,
      params: RequestParams = {},
    ) =>
      this.request<ResponseResponse, any>({
        path: `/admin/payments`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get payment detail (admin only)
     *
     * @tags admin
     * @name PaymentsDetail
     * @summary Get Payment Detail
     * @request GET:/admin/payments/{id}
     * @secure
     */
    paymentsDetail: (id: string, params: RequestParams = {}) =>
      this.request<ResponseResponse, any>({
        path: `/admin/payments/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Update payment status safely without hard delete (admin only)
     *
     * @tags admin
     * @name PaymentsUpdate
     * @summary Update Payment
     * @request PUT:/admin/payments/{id}
     * @secure
     */
    paymentsUpdate: (
      id: string,
      request: AdminUpdateAdminPaymentRequest,
      params: RequestParams = {},
    ) =>
      this.request<ResponseResponse, any>({
        path: `/admin/payments/${id}`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get all plans with usage counts (admin only)
     *
     * @tags admin
     * @name PlansList
     * @summary List Plans
     * @request GET:/admin/plans
     * @secure
     */
    plansList: (params: RequestParams = {}) =>
      this.request<ResponseResponse, any>({
        path: `/admin/plans`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a plan (admin only)
     *
     * @tags admin
     * @name PlansCreate
     * @summary Create Plan
     * @request POST:/admin/plans
     * @secure
     */
    plansCreate: (request: AdminSavePlanRequest, params: RequestParams = {}) =>
      this.request<ResponseResponse, any>({
        path: `/admin/plans`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Update a plan (admin only)
     *
     * @tags admin
     * @name PlansUpdate
     * @summary Update Plan
     * @request PUT:/admin/plans/{id}
     * @secure
     */
    plansUpdate: (
      id: string,
      request: AdminSavePlanRequest,
      params: RequestParams = {},
    ) =>
      this.request<ResponseResponse, any>({
        path: `/admin/plans/${id}`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete a plan, or deactivate it if already used (admin only)
     *
     * @tags admin
     * @name PlansDelete
     * @summary Delete Plan
     * @request DELETE:/admin/plans/{id}
     * @secure
     */
    plansDelete: (id: string, params: RequestParams = {}) =>
      this.request<ResponseResponse, any>({
        path: `/admin/plans/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get paginated list of all users (admin only)
     *
     * @tags admin
     * @name UsersList
     * @summary List Users
     * @request GET:/admin/users
     * @secure
     */
    usersList: (
      query?: {
        /**
         * Page
         * @default 1
         */
        page?: number;
        /**
         * Limit
         * @default 20
         */
        limit?: number;
        /** Search by email or username */
        search?: string;
        /** Filter by role */
        role?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/admin/users`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a user from admin panel (admin only)
     *
     * @tags admin
     * @name UsersCreate
     * @summary Create User
     * @request POST:/admin/users
     * @secure
     */
    usersCreate: (
      request: AdminCreateAdminUserRequest,
      params: RequestParams = {},
    ) =>
      this.request<ResponseResponse, any>({
        path: `/admin/users`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get detailed info about a single user (admin only)
     *
     * @tags admin
     * @name UsersDetail
     * @summary Get User Detail
     * @request GET:/admin/users/{id}
     * @secure
     */
    usersDetail: (id: string, params: RequestParams = {}) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/admin/users/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Update a user from admin panel (admin only)
     *
     * @tags admin
     * @name UsersUpdate
     * @summary Update User
     * @request PUT:/admin/users/{id}
     * @secure
     */
    usersUpdate: (
      id: string,
      request: AdminUpdateAdminUserRequest,
      params: RequestParams = {},
    ) =>
      this.request<ResponseResponse, any>({
        path: `/admin/users/${id}`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete a user and their data (admin only)
     *
     * @tags admin
     * @name UsersDelete
     * @summary Delete User
     * @request DELETE:/admin/users/{id}
     * @secure
     */
    usersDelete: (id: string, params: RequestParams = {}) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/admin/users/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Change user role (admin only). Valid: USER, ADMIN, BLOCK
     *
     * @tags admin
     * @name UsersRoleUpdate
     * @summary Update User Role
     * @request PUT:/admin/users/{id}/role
     * @secure
     */
    usersRoleUpdate: (
      id: string,
      request: AdminUpdateUserRoleRequest,
      params: RequestParams = {},
    ) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/admin/users/${id}/role`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get paginated list of all videos across users (admin only)
     *
     * @tags admin
     * @name VideosList
     * @summary List All Videos
     * @request GET:/admin/videos
     * @secure
     */
    videosList: (
      query?: {
        /**
         * Page
         * @default 1
         */
        page?: number;
        /**
         * Limit
         * @default 20
         */
        limit?: number;
        /** Search by title */
        search?: string;
        /** Filter by user ID */
        user_id?: string;
        /** Filter by status */
        status?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/admin/videos`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a manual video record for a user (admin only)
     *
     * @tags admin
     * @name VideosCreate
     * @summary Create Video
     * @request POST:/admin/videos
     * @secure
     */
    videosCreate: (
      request: AdminSaveAdminVideoRequest,
      params: RequestParams = {},
    ) =>
      this.request<ResponseResponse, any>({
        path: `/admin/videos`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get video detail by ID (admin only)
     *
     * @tags admin
     * @name VideosDetail
     * @summary Get Video Detail
     * @request GET:/admin/videos/{id}
     * @secure
     */
    videosDetail: (id: string, params: RequestParams = {}) =>
      this.request<ResponseResponse, any>({
        path: `/admin/videos/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Update video metadata and status (admin only)
     *
     * @tags admin
     * @name VideosUpdate
     * @summary Update Video
     * @request PUT:/admin/videos/{id}
     * @secure
     */
    videosUpdate: (
      id: string,
      request: AdminSaveAdminVideoRequest,
      params: RequestParams = {},
    ) =>
      this.request<ResponseResponse, any>({
        path: `/admin/videos/${id}`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete any video by ID (admin only)
     *
     * @tags admin
     * @name VideosDelete
     * @summary Delete Video (Admin)
     * @request DELETE:/admin/videos/{id}
     * @secure
     */
    videosDelete: (id: string, params: RequestParams = {}) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/admin/videos/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  auth = {
    /**
     * @description Change the authenticated user's local password
     *
     * @tags auth
     * @name ChangePasswordCreate
     * @summary Change Password
     * @request POST:/auth/change-password
     * @secure
     */
    changePasswordCreate: (
      request: AuthChangePasswordRequest,
      params: RequestParams = {},
    ) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/auth/change-password`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Request password reset link
     *
     * @tags auth
     * @name ForgotPasswordCreate
     * @summary Forgot Password
     * @request POST:/auth/forgot-password
     */
    forgotPasswordCreate: (
      request: AuthForgotPasswordRequest,
      params: RequestParams = {},
    ) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/auth/forgot-password`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Callback for Google Login
     *
     * @tags auth
     * @name GoogleCallbackList
     * @summary Google Callback
     * @request GET:/auth/google/callback
     */
    googleCallbackList: (params: RequestParams = {}) =>
      this.request<
        ResponseResponse & {
          data?: AuthUserPayload;
        },
        ResponseResponse
      >({
        path: `/auth/google/callback`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Redirect to Google for Login
     *
     * @tags auth
     * @name GoogleLoginList
     * @summary Google Login
     * @request GET:/auth/google/login
     */
    googleLoginList: (params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/auth/google/login`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Login with email and password
     *
     * @tags auth
     * @name LoginCreate
     * @summary Login
     * @request POST:/auth/login
     */
    loginCreate: (request: AuthLoginRequest, params: RequestParams = {}) =>
      this.request<
        ResponseResponse & {
          data?: AuthUserPayload;
        },
        ResponseResponse
      >({
        path: `/auth/login`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Logout user and clear cookies
     *
     * @tags auth
     * @name LogoutCreate
     * @summary Logout
     * @request POST:/auth/logout
     * @secure
     */
    logoutCreate: (params: RequestParams = {}) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/auth/logout`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Register a new user
     *
     * @tags auth
     * @name RegisterCreate
     * @summary Register
     * @request POST:/auth/register
     */
    registerCreate: (
      request: AuthRegisterRequest,
      params: RequestParams = {},
    ) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/auth/register`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Reset password using token
     *
     * @tags auth
     * @name ResetPasswordCreate
     * @summary Reset Password
     * @request POST:/auth/reset-password
     */
    resetPasswordCreate: (
      request: AuthResetPasswordRequest,
      params: RequestParams = {},
    ) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/auth/reset-password`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  domains = {
    /**
     * @description Get all whitelisted domains for the current user
     *
     * @tags domains
     * @name DomainsList
     * @summary List Domains
     * @request GET:/domains
     * @secure
     */
    domainsList: (params: RequestParams = {}) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/domains`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Add a domain to the current user's whitelist
     *
     * @tags domains
     * @name DomainsCreate
     * @summary Create Domain
     * @request POST:/domains
     * @secure
     */
    domainsCreate: (
      request: DomainsCreateDomainRequest,
      params: RequestParams = {},
    ) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/domains`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Remove a domain from the current user's whitelist
     *
     * @tags domains
     * @name DomainsDelete
     * @summary Delete Domain
     * @request DELETE:/domains/{id}
     * @secure
     */
    domainsDelete: (id: string, params: RequestParams = {}) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/domains/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  me = {
    /**
     * @description Get the authenticated user's profile payload
     *
     * @tags auth
     * @name GetMe
     * @summary Get Current User
     * @request GET:/me
     * @secure
     */
    getMe: (params: RequestParams = {}) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/me`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Update the authenticated user's profile information
     *
     * @tags auth
     * @name PutMe
     * @summary Update Current User
     * @request PUT:/me
     * @secure
     */
    putMe: (request: AuthUpdateMeRequest, params: RequestParams = {}) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/me`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Permanently delete the authenticated user's account and related data
     *
     * @tags auth
     * @name DeleteMe
     * @summary Delete My Account
     * @request DELETE:/me
     * @secure
     */
    deleteMe: (params: RequestParams = {}) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/me`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Remove videos and settings-related resources for the authenticated user
     *
     * @tags auth
     * @name ClearDataCreate
     * @summary Clear My Data
     * @request POST:/me/clear-data
     * @secure
     */
    clearDataCreate: (params: RequestParams = {}) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/me/clear-data`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  notifications = {
    /**
     * @description Get notifications for the current user
     *
     * @tags notifications
     * @name NotificationsList
     * @summary List Notifications
     * @request GET:/notifications
     * @secure
     */
    notificationsList: (params: RequestParams = {}) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/notifications`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete all notifications for the current user
     *
     * @tags notifications
     * @name NotificationsDelete
     * @summary Clear Notifications
     * @request DELETE:/notifications
     * @secure
     */
    notificationsDelete: (params: RequestParams = {}) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/notifications`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Mark all notifications as read for the current user
     *
     * @tags notifications
     * @name ReadAllCreate
     * @summary Mark All Notifications Read
     * @request POST:/notifications/read-all
     * @secure
     */
    readAllCreate: (params: RequestParams = {}) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/notifications/read-all`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete a single notification for the current user
     *
     * @tags notifications
     * @name NotificationsDelete2
     * @summary Delete Notification
     * @request DELETE:/notifications/{id}
     * @originalName notificationsDelete
     * @duplicate
     * @secure
     */
    notificationsDelete2: (id: string, params: RequestParams = {}) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/notifications/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Mark a single notification as read for the current user
     *
     * @tags notifications
     * @name ReadCreate
     * @summary Mark Notification Read
     * @request POST:/notifications/{id}/read
     * @secure
     */
    readCreate: (id: string, params: RequestParams = {}) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/notifications/${id}/read`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  payments = {
    /**
     * @description Create a new payment for buying or renewing a plan
     *
     * @tags payment
     * @name PaymentsCreate
     * @summary Create Payment
     * @request POST:/payments
     * @secure
     */
    paymentsCreate: (
      request: PaymentCreatePaymentRequest,
      params: RequestParams = {},
    ) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/payments`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get payment history for the current user
     *
     * @tags payment
     * @name HistoryList
     * @summary List Payment History
     * @request GET:/payments/history
     * @secure
     */
    historyList: (params: RequestParams = {}) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/payments/history`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Download invoice text for a payment or wallet top-up
     *
     * @tags payment
     * @name InvoiceList
     * @summary Download Invoice
     * @request GET:/payments/{id}/invoice
     * @secure
     */
    invoiceList: (id: string, params: RequestParams = {}) =>
      this.request<string, ResponseResponse>({
        path: `/payments/${id}/invoice`,
        method: "GET",
        secure: true,
        ...params,
      }),
  };
  plans = {
    /**
     * @description Get all active plans
     *
     * @tags plan
     * @name PlansList
     * @summary List Plans
     * @request GET:/plans
     * @secure
     */
    plansList: (params: RequestParams = {}) =>
      this.request<
        ResponseResponse & {
          data?: ModelPlan[];
        },
        ResponseResponse
      >({
        path: `/plans`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  settings = {
    /**
     * @description Get notification, player, and locale preferences for the current user
     *
     * @tags settings
     * @name PreferencesList
     * @summary Get Preferences
     * @request GET:/settings/preferences
     * @secure
     */
    preferencesList: (params: RequestParams = {}) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/settings/preferences`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Update notification, player, and locale preferences for the current user
     *
     * @tags settings
     * @name PreferencesUpdate
     * @summary Update Preferences
     * @request PUT:/settings/preferences
     * @secure
     */
    preferencesUpdate: (
      request: PreferencesSettingsPreferencesRequest,
      params: RequestParams = {},
    ) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/settings/preferences`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  usage = {
    /**
     * @description Get the authenticated user's total video count and total storage usage
     *
     * @tags usage
     * @name UsageList
     * @summary Get Usage
     * @request GET:/usage
     * @secure
     */
    usageList: (params: RequestParams = {}) =>
      this.request<
        ResponseResponse & {
          data?: UsageUsagePayload;
        },
        ResponseResponse
      >({
        path: `/usage`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  videos = {
    /**
     * @description Get paginated videos
     *
     * @tags video
     * @name VideosList
     * @summary List Videos
     * @request GET:/videos
     * @secure
     */
    videosList: (
      query?: {
        /**
         * Page number
         * @default 1
         */
        page?: number;
        /**
         * Page size
         * @default 10
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/videos`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Create video record after upload
     *
     * @tags video
     * @name VideosCreate
     * @summary Create Video
     * @request POST:/videos
     * @secure
     */
    videosCreate: (
      request: VideoCreateVideoRequest,
      params: RequestParams = {},
    ) =>
      this.request<
        ResponseResponse & {
          data?: ModelVideo;
        },
        ResponseResponse
      >({
        path: `/videos`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Generate presigned URL for video upload
     *
     * @tags video
     * @name UploadUrlCreate
     * @summary Get Upload URL
     * @request POST:/videos/upload-url
     * @secure
     */
    uploadUrlCreate: (
      request: VideoUploadURLRequest,
      params: RequestParams = {},
    ) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/videos/upload-url`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get video details by ID
     *
     * @tags video
     * @name VideosDetail
     * @summary Get Video
     * @request GET:/videos/{id}
     * @secure
     */
    videosDetail: (id: string, params: RequestParams = {}) =>
      this.request<
        ResponseResponse & {
          data?: ModelVideo;
        },
        ResponseResponse
      >({
        path: `/videos/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Update title and description for a video owned by the current user
     *
     * @tags video
     * @name VideosUpdate
     * @summary Update Video
     * @request PUT:/videos/{id}
     * @secure
     */
    videosUpdate: (
      id: string,
      request: VideoUpdateVideoRequest,
      params: RequestParams = {},
    ) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/videos/${id}`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete a video owned by the current user
     *
     * @tags video
     * @name VideosDelete
     * @summary Delete Video
     * @request DELETE:/videos/{id}
     * @secure
     */
    videosDelete: (id: string, params: RequestParams = {}) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/videos/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  wallet = {
    /**
     * @description Add funds to wallet balance for the current user
     *
     * @tags payment
     * @name TopupsCreate
     * @summary Top Up Wallet
     * @request POST:/wallet/topups
     * @secure
     */
    topupsCreate: (
      request: PaymentTopupWalletRequest,
      params: RequestParams = {},
    ) =>
      this.request<ResponseResponse, ResponseResponse>({
        path: `/wallet/topups`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}

export const client = new Api({
  baseUrl: '/r',
  customFetch,
});
