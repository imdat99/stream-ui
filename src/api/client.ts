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
import { customFetch } from "@httpClientAdapter";
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

export interface ModelPlan {
  cycle?: string;
  description?: string;
  duration_limit?: number;
  features?: string;
  id?: string;
  is_active?: boolean;
  name?: string;
  price?: number;
  quality_limit?: string;
  storage_limit?: number;
  upload_limit?: number;
}

export interface ModelUser {
  avatar?: string;
  created_at?: string;
  email?: string;
  google_id?: string;
  id?: string;
  password?: string;
  plan_id?: string;
  role?: string;
  storage_used?: number;
  updated_at?: string;
  username?: string;
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
  amount: number;
  plan_id: string;
}

export interface ResponseResponse {
  code?: number;
  message?: string;
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
  public baseUrl: string = "";
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
            : payloadFormatter(body)
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
 * @contact API Support <support@swagger.io> (http://www.swagger.io/support)
 *
 * This is the API server for Stream application.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  auth = {
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
          data?: ModelUser;
        },
        ResponseResponse
      >({
        path: `/auth/google/callback`,
        method: "GET",
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
      this.request<any, void>({
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
          data?: ModelUser;
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
     */
    logoutCreate: (params: RequestParams = {}) =>
      this.request<ResponseResponse, any>({
        path: `/auth/logout`,
        method: "POST",
        type: ContentType.Json,
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
  payments = {
    /**
     * @description Create a new payment
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
      this.request<ResponseResponse & {
        data: {
          limit: number;
          page: number;
          total: number;
          videos: ModelVideo[];
        }
      }, ResponseResponse>({
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
  };
}

export const client = new Api({
  baseUrl: 'r',
  // baseUrl: 'https://api.pipic.fun',
  customFetch
});