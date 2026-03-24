import { client } from "@/api/rpcclient";
import DownloadIcon from "@/components/icons/DownloadIcon.vue";
import ListIcon from "@/components/icons/ListIcon.vue";
import { useAppToast } from "@/composables/useAppToast";
import { getApiErrorMessage, getStatusStyles } from "@/lib/utils";
import { PaymentHistoryItem } from "@/server/gen/proto/app/v1/common";
import { useAuthStore } from "@/stores/auth";
import { useQuery } from "@pinia/colada";
import { useTranslation } from "i18next-vue";

const normalizeHistoryStatus = (status?: string) => {
    switch ((status || '').toLowerCase()) {
        case 'success':
        case 'succeeded':
        case 'paid':
            return 'success';
        case 'failed':
        case 'error':
        case 'canceled':
        case 'cancelled':
            return 'failed';
        case 'pending':
        case 'processing':
        default:
            return 'pending';
    }
};

const PaymentHistory = defineComponent({
    name: 'PaymentHistory',
    setup(props, ctx) {
        const auth = useAuthStore();
        const { t } = useTranslation();
        const toast = useAppToast();
        const downloadingInvoiceId = ref<string | null>(null);

        const formatTermLabel = (months: number) => t('settings.billing.termOption', { months });
        const formatPaymentMethodLabel = (value?: string) => {
            switch ((value || '').toLowerCase()) {
                case 'topup':
                    return t('settings.billing.paymentMethod.topup');
                case 'wallet':
                default:
                    return t('settings.billing.paymentMethod.wallet');
            }
        };
        const mapHistoryItem = (item: PaymentHistoryItem) => {
            const details: string[] = [];

            if (item.kind !== 'wallet_topup' && item.termMonths) {
                details.push(formatTermLabel(item.termMonths));
            }
            if (item.kind !== 'wallet_topup' && item.paymentMethod) {
                details.push(formatPaymentMethodLabel(item.paymentMethod));
            }
            if (item.kind !== 'wallet_topup' && item.expiresAt) {
                details.push(t('settings.billing.history.validUntil', { date: auth.formatHistoryDate(item.expiresAt) }));
            }

            return {
                id: item.id || '',
                date: auth.formatHistoryDate(item.createdAt),
                amount: item.amount || 0,
                plan: item.kind === 'wallet_topup'
                    ? t('settings.billing.walletTopup')
                    : (item.planName || t('settings.billing.unknownPlan')),
                status: normalizeHistoryStatus(item.status),
                invoiceId: item.invoiceId || '-',
                currency: item.currency || 'USD',
                kind: item.kind || 'subscription',
                details,
            };
        };
        const { data, isLoading } = useQuery({
            key: ['paymentHistory'],
            query: () => client.listPaymentHistory().then(res => (res.payments || []).map(mapHistoryItem)),
        });
        
        const handleDownloadInvoice = async (item: PaymentHistoryItem) => {
            if (!item.id) return;

            downloadingInvoiceId.value = item.id;
            toast.add({
                severity: 'info',
                summary: t('settings.billing.toast.downloadingSummary'),
                detail: t('settings.billing.toast.downloadingDetail', { invoiceId: item.invoiceId }),
                life: 2000,
            });

            try {
                const response = await client.downloadInvoice({ id: item.id });
                const content = response.content || '';
                const contentType = response.contentType || 'text/plain;charset=utf-8';
                const filename = response.filename || `${item.invoiceId}.txt`;
                const blob = new Blob([content], { type: contentType });
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download = filename;
                document.body.appendChild(anchor);
                anchor.click();
                document.body.removeChild(anchor);
                URL.revokeObjectURL(url);

                toast.add({
                    severity: 'success',
                    summary: t('settings.billing.toast.downloadedSummary'),
                    detail: t('settings.billing.toast.downloadedDetail', { invoiceId: item.invoiceId }),
                    life: 3000,
                });
            } catch (error) {
                console.error(error);
                toast.add({
                    severity: 'error',
                    summary: t('settings.billing.toast.downloadFailedSummary'),
                    detail: getApiErrorMessage(error, t('settings.billing.toast.downloadFailedDetail')),
                    life: 5000,
                });
            } finally {
                downloadingInvoiceId.value = null;
            }
        };
        return () => (
            <div class="px-6 py-4">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-10 h-10 rounded-md bg-info/10 flex items-center justify-center shrink-0">
                        <ListIcon class="w-6 h-6 text-info" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">{t('settings.billing.paymentHistory')}</p>
                        <p class="text-xs text-foreground/60 mt-0.5">{t('settings.billing.paymentHistorySubtitle')}</p>
                    </div>
                </div>

                <div class="border border-border rounded-lg overflow-hidden">
                    <div class="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-foreground/60 uppercase tracking-wider bg-muted/30">
                        <div class="col-span-3">{t('settings.billing.table.date')}</div>
                        <div class="col-span-2">{t('settings.billing.table.amount')}</div>
                        <div class="col-span-3">{t('settings.billing.table.plan')}</div>
                        <div class="col-span-2">{t('settings.billing.table.status')}</div>
                        <div class="col-span-2 text-right">{t('settings.billing.table.invoice')}</div>
                    </div>
                    {isLoading.value && (<div class="px-4 py-6 space-y-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} class="grid grid-cols-12 gap-4 items-center animate-pulse">
                                <div class="col-span-3 h-4 rounded bg-muted/50" />
                                <div class="col-span-2 h-4 rounded bg-muted/50" />
                                <div class="col-span-3 h-4 rounded bg-muted/50" />
                                <div class="col-span-2 h-6 rounded bg-muted/50" />
                                <div class="col-span-2 h-8 rounded bg-muted/50" />
                            </div>
                        ))}
                    </div>)}
                    {data.value?.length === 0 && !isLoading.value && (<div class="text-center py-12 text-foreground/60">
                        <div class="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                            <DownloadIcon class="w-8 h-8 text-foreground/40" />
                        </div>
                        <p>{t('settings.billing.noPaymentHistory')}</p>
                    </div>)}

                    {data.value?.map((item) => (
                        <div
                            key={item.id}
                            class="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-all border-t border-border"
                        >
                            <div class="col-span-3">
                                <p class="text-sm font-medium text-foreground">{item.date}</p>
                            </div>
                            <div class="col-span-2">
                                <p class="text-sm text-foreground">{auth.formatMoney(item.amount)}</p>
                            </div>
                            <div class="col-span-3">
                                <p class="text-sm text-foreground">{item.plan}</p>
                                {
                                    item.details?.length ? (
                                        <p class="mt-1 text-xs text-foreground/60">
                                            {item.details.join(' · ')}
                                        </p>
                                    ) : null
                                }
                            </div>
                            <div class="col-span-2">
                                <span class={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusStyles(item.status)}`}>
                                    {t('settings.billing.status.' + item.status)}
                                </span>
                            </div>
                            <div class="col-span-2 flex justify-end">
                                <button
                                    class="flex items-center gap-2 px-3 py-1.5 text-sm text-foreground/70 hover:text-foreground hover:bg-muted/50 rounded-md transition-all disabled:opacity-60 disabled:cursor-wait"
                                    disabled={downloadingInvoiceId.value === item.id}
                                    onClick={() => handleDownloadInvoice(item)}
                                >
                                    <DownloadIcon class="w-4 h-4" />
                                    <span>{downloadingInvoiceId.value === item.id ? '...' : t('settings.billing.download')}</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
});
export default PaymentHistory;