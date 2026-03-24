import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function debounce<Func extends (...args: any[]) => any>(
  func: Func,
  wait: number
): Func {
  let timeout: ReturnType<typeof setTimeout> | null;
  return function (this: any, ...args: any[]) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  } as Func;
}
type AspectInfo = {
  width: number;
  height: number;
  ratio: string; // ví dụ: "16:9"
  float: number; // ví dụ: 1.777...
};

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function getImageAspectRatio(url: string): Promise<AspectInfo> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;

      const g = gcd(w, h);

      resolve({
        width: w,
        height: h,
        ratio: `${w / g}:${h / g}`,
        float: w / h,
      });
    };

    img.onerror = () => reject(new Error("Cannot load image"));

    img.src = url;
  });
}

export const formatBytes = (bytes?: number) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${value} ${sizes[i]}`;
  // return `${new Intl.NumberFormat(getRuntimeLocaleTag()).format(value)} ${sizes[i]}`;
};

export const formatDuration = (seconds?: number) => {
  if (!seconds) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const formatDate = (
  dateString: string = "",
  dateOnly: boolean = false
) => {
  if (!dateString) return "";
  const locale =
    typeof document !== "undefined"
      ? document.documentElement.lang === "vi"
        ? "vi-VN"
        : "en-US"
      : "en-US";
  return new Date(dateString).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(dateOnly ? {} : { hour: "2-digit", minute: "2-digit" }),
  });
};
type Status = "success" | "failed" | "pending" | string;
export const getStatusSeverity = (status: Status = "") => {
  switch (status) {
    case "success":
    case "ready":
      return "success";
    case "failed":
      return "danger";
    case "pending":
      return "warn";
    default:
      return "info";
  }
};
export const getStatusStyles = (status: Status = "") => {
  switch (status) {
    case "success":
      return "bg-success/10 text-success";
    case "failed":
      return "bg-danger/10 text-danger";
    case "pending":
      return "bg-warning/10 text-warning";
    default:
      return "bg-info/10 text-info";
  }
};
export const isAdmin = (role: string = "") => {
  const r = String(role).toLowerCase();
  return r === "admin" || r === "superadmin";
};
export type ApiErrorPayload = {
  code?: number;
  message?: string;
  data?: Record<string, any>;
};
export const getApiErrorPayload = (error: unknown): ApiErrorPayload | null => {
  if (!error || typeof error !== "object") return null;
  const candidate = error as {
    error?: ApiErrorPayload;
    data?: ApiErrorPayload;
    message?: string;
  };

  if (candidate.error && typeof candidate.error === "object")
    return candidate.error;
  if (candidate.data && typeof candidate.data === "object")
    return candidate.data;
  if (candidate.message) return { message: candidate.message };

  return null;
};
export const getApiErrorMessage = (error: unknown, fallback: string) => {
  const payload = getApiErrorPayload(error);
  return payload?.message || fallback;
};
