export type { PopupAd } from '@/server/api/proto/app/v1/common';
export type {
  CreatePopupAdRequest,
  DeletePopupAdRequest,
  UpdatePopupAdRequest,
} from '@/server/api/proto/app/v1/catalog';

export type PopupAdType = 'url' | 'script';
export type PopupAdItem = PopupAd;

export interface PopupAdFormData {
  type: PopupAdType;
  label: string;
  value: string;
  isActive: boolean;
  maxTriggersPerSession: number;
}
