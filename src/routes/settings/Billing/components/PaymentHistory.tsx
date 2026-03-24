import { client } from "@/api/rpcclient";
import DownloadIcon from "@/components/icons/DownloadIcon.vue";
import ListIcon from "@/components/icons/ListIcon.vue";
import BaseTable from "@/components/ui/BaseTable.vue";
import { useAppToast } from "@/composables/useAppToast";
import { getApiErrorMessage, getStatusStyles } from "@/lib/utils";
import { PaymentHistoryItem } from "@/server/gen/proto/app/v1/common";
import { useAuthStore } from "@/stores/auth";
import { useQuery } from "@pinia/colada";
import { useTranslation } from "i18next-vue";
import type { ColumnDef } from "@tanstack/vue-table";
import { computed, defineComponent, ref } from "vue";
import AppButton from "@/components/ui/AppButton.vue";

const pageSizeOptions = [5, 10, 20, 50] as const;

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
    setup() {
        const auth = useAuthStore();
        const { t } = useTranslation();
        const toast = useAppToast();
        const downloadingInvoiceId = ref<string | null>(null);
        const page = ref(1);
        const limit = ref(10);

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
            key: () => ['paymentHistory', page.value, limit.value],
            query: () => client.listPaymentHistory(page.value, limit.value).then(res => ({
                ...res, 
                items: (res.payments || []).map(mapHistoryItem)
            })),
        });
        const totalPages = computed(() => Math.max(1, Math.ceil((data.value?.total || 0) / (data.value?.limit || limit.value || 1))));

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

        const columns: ColumnDef<ReturnType<typeof mapHistoryItem>>[] = [
            {
                accessorKey: 'date',
                header:  t('settings.billing.table.date'),
                cell: ({ getValue }) => (
                    <p class="text-sm font-medium text-foreground">{getValue<string>()}</p>
                ),
                meta: {
                    headerClass: 'col-span-3',
                    cellClass: 'col-span-3',
                },
            },
            {
                accessorKey: 'amount',
                header:  t('settings.billing.table.amount'),
                cell: ({ row }) => (
                    <p class="text-sm text-foreground">{auth.formatMoney(row.original.amount)}</p>
                ),
                meta: {
                    headerClass: 'col-span-2',
                    cellClass: 'col-span-2',
                },
            },
            {
                accessorKey: 'plan',
                header:  t('settings.billing.table.plan'),
                cell: ({ row }) => (
                    <>
                        <p class="text-sm text-foreground">{row.original.plan}</p>
                        {row.original.details?.length ? (
                            <p class="mt-1 text-xs text-foreground/60">
                                {row.original.details.join(' · ')}
                            </p>
                        ) : null}
                    </>
                ),
                meta: {
                    headerClass: 'col-span-3',
                    cellClass: 'col-span-3',
                },
            },
            {
                accessorKey: 'status',
                header:  t('settings.billing.table.status'),
                cell: ({ row }) => (
                    <span class={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusStyles(row.original.status)}`}>
                        {t('settings.billing.status.' + row.original.status)}
                    </span>
                ),
                meta: {
                    headerClass: 'col-span-2',
                    cellClass: 'col-span-2',
                },
            },
            {
                accessorKey: 'invoice',
                enableSorting: false,
                header:  t('settings.billing.table.invoice'),
                cell: ({ row }) => (
                    <button
                        class="flex items-center gap-2 px-3 py-1.5 text-sm text-foreground/70 hover:text-foreground hover:bg-muted/50 rounded-md transition-all disabled:opacity-60 disabled:cursor-wait"
                        disabled={downloadingInvoiceId.value === row.original.id}
                        onClick={() => handleDownloadInvoice(row.original as PaymentHistoryItem)}
                    >
                        <DownloadIcon class="w-4 h-4" />
                        <span>{downloadingInvoiceId.value === row.original.id ? '...' : t('settings.billing.download')}</span>
                    </button>
                ),
                meta: {
                    headerClass: 'col-span-2 flex justify-center',
                    cellClass: 'col-span-2 flex justify-center',
                },
            },
        ];

        const previousPage = () => {
            if (!data.value?.hasPrev || isLoading.value) return;
            page.value -= 1;
        };
        const nextPage = () => {
            if (!data.value?.hasNext || isLoading.value) return;
            page.value += 1;
        };
        const changePageSize = (event: Event) => {
            const nextLimit = Number((event.target as HTMLSelectElement).value) || 10;
            if (nextLimit === limit.value) return;
            limit.value = nextLimit;
            page.value = 1;
        };

        return () => (
            <div class="px-6 py-4">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                        <ListIcon class="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">{t('settings.billing.paymentHistory')}</p>
                        <p class="text-xs text-foreground/60 mt-0.5">{t('settings.billing.paymentHistorySubtitle')}</p>
                    </div>
                </div>

                <BaseTable
                    data={data.value?.items || []}
                    columns={columns}
                    loading={isLoading.value}
                    emptyText={t('settings.billing.noPaymentHistory')}
                >
                    {{
                        loading: () => (
                            <div class="px-4 py-6 space-y-3">
                                {Array.from({ length: 10 }).map((_, index) => (
                                    <div key={index} class="grid grid-cols-12 gap-4 items-center animate-pulse">
                                        <div class="col-span-3 h-4 rounded bg-muted/50" />
                                        <div class="col-span-2 h-4 rounded bg-muted/50" />
                                        <div class="col-span-3 h-4 rounded bg-muted/50" />
                                        <div class="col-span-2 h-6 rounded bg-muted/50" />
                                        <div class="col-span-2 h-8 rounded bg-muted/50" />
                                    </div>
                                ))}
                            </div>
                        ),
                        empty: () => (
                            <div class="text-center py-12 text-foreground/60">
                                <div class="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                                    <DownloadIcon class="w-8 h-8 text-foreground/40" />
                                </div>
                                <p>{t('settings.billing.noPaymentHistory')}</p>
                            </div>
                        )
                    }}
                </BaseTable>

                <div class="mt-4 flex flex-col gap-3 text-xs text-foreground/55 sm:flex-row sm:items-center sm:justify-between">
                    <div>{t('common.page', { current: data.value?.page || page.value, total: totalPages.value })} · {data.value?.total || 0} {t('common.records')}</div>
                    <div class="flex flex-wrap items-center gap-2">
                        <label class="flex items-center gap-2">
                            <span>{t('common.rowsPerPage')}</span>
                            <select
                                class="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
                                value={String(limit.value)}
                                onChange={changePageSize}
                            >
                                {pageSizeOptions.map((option) => (
                                    <option key={option} value={String(option)}>{option}</option>
                                ))}
                            </select>
                        </label>
                        <div class="flex items-center gap-2 xl:justify-end">
                        <AppButton size="sm" variant="secondary" disabled={!data.value?.hasPrev || isLoading.value} onClick={previousPage}>{t('common.previous')}</AppButton>
                        <AppButton size="sm" variant="secondary" disabled={!data.value?.hasNext || isLoading.value} onClick={nextPage}>{t('common.next')}</AppButton>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});
export default PaymentHistory;