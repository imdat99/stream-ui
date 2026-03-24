import { client as rpcClient } from '@/api/rpcclient';
import CheckIcon from '@/components/icons/CheckIcon.vue';
import CreditCardIcon from '@/components/icons/CreditCardIcon.vue';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { useQuery } from '@pinia/colada';
import { useTranslation } from 'i18next-vue';
import { computed, defineComponent } from 'vue';
const PlanSelection = defineComponent({
  name: 'PlanSelection',
  props: {
    currentPlanId: { type: String, default: '', required: true },
    selectedPlanId: { type: String, default: null, required: true },
  },
  emits: ['upgrade'],
  setup(props, { emit }) {
    const { t } = useTranslation();
    const auth = useAuthStore();
    const { data, isLoading } = useQuery({
        key: () => ['billing-plans'],
        query: () => rpcClient.listPlans(),
    });
    const subscriptionSummary = computed(() => {
    const expiresAt = auth.user?.planExpiresAt || auth.user?.plan_expires_at;
    const formattedDate = auth.formatHistoryDate(expiresAt);
    const currentPlanName = data.value?.plans?.find((p) => p.id === auth.user?.plan_id)?.name || t('settings.billing.subscription.unknownPlan');
    if (auth.user?.plan_id) {
        if (auth.user?.plan_expiring_soon && expiresAt) {
            return {
                title: t('settings.billing.subscription.expiringTitle'),
                description: t('settings.billing.subscription.expiringDescription', {
                    date: formattedDate,
                }),
                tone: 'warning' as const,
            };
        }

        if (expiresAt) {
            return {
                title: t('settings.billing.subscription.activeTitle'),
                description: t('settings.billing.subscription.activeDescription', {
                    date: formattedDate,
                }),
                tone: 'default' as const,
            };
        }

        return {
            title: t('settings.billing.subscription.activeTitle'),
            description: currentPlanName,
            tone: 'default' as const,
        };
    }

    if (expiresAt) {
        return {
            title: t('settings.billing.subscription.expiredTitle'),
            description: t('settings.billing.subscription.expiredDescription', { date: formattedDate }),
            tone: 'warning' as const,
        };
    }

    return {
        title: t('settings.billing.subscription.freeTitle'),
        description: t('settings.billing.subscription.freeDescription'),
        tone: 'default' as const,
    };
});
    // Sắp xếp plan theo giá tăng dần
    const sortedPlans = computed(() => 
      [...(data.value?.plans || [])].sort((a, b) => (a.price || 0) - (b.price || 0))
    );

    return () => (
      <div class="px-6 py-4">
        {/* Header Section */}
        <div class="flex items-center gap-4 mb-4">
          <div class="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <CreditCardIcon class="w-5 h-5 text-primary" />
          </div>
          <div>
            <p class="text-sm font-medium text-foreground">{t('settings.billing.availablePlans')}</p>
            <p class="text-xs text-foreground/60 mt-0.5">{t('settings.billing.availablePlansHint')}</p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading.value ? (
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div class="h-[200px] rounded-lg bg-muted/50 animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : (
          /* Plans Grid */
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sortedPlans.value.map((plan) => (
              <div
                key={plan.id}
                class={[
                  'border rounded-lg p-4 hover:bg-muted/30 transition-all flex flex-col',
                  plan.id === props.currentPlanId ? 'border-primary/40 bg-primary/5' : 'border-border',
                ]}
              >
                <div class="mb-3">
                  <div class="flex items-center justify-between gap-3">
                    <h3 class="text-lg font-semibold text-foreground">{plan.name}</h3>
                    {plan.id === props.currentPlanId && (
                      <span class={cn("inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary", subscriptionSummary.value.tone === 'warning' && 'bg-warning/10 text-warning')}>
                        {subscriptionSummary.value.description}
                      </span>
                    )}
                  </div>
                  <p class="text-sm text-foreground/60 mt-1 min-h-[2.5rem]">{plan.description}</p>
                </div>

                <div class="mb-4">
                  <span class="text-2xl font-bold text-foreground">{auth.formatMoney(plan.price || 0)}</span>
                  <span class="text-foreground/60 text-sm"> / {t(`settings.billing.cycle.${plan.cycle}`)}</span>
                </div>

                <ul class="space-y-2 mb-4 text-sm">
                  {(plan.features || []).map((feature: string) => (
                    <li key={feature} class="flex items-center gap-2 text-foreground/70">
                      <CheckIcon class="w-4 h-4 text-success shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {plan.id !== props.currentPlanId && (
                  <button
                    disabled={props.selectedPlanId === plan.id}
                    class={[
                      'w-full py-2 px-4 rounded-md text-sm font-medium transition-all mt-auto',
                      props.selectedPlanId === plan.id
                        ? 'bg-muted/50 text-foreground/60 cursor-wait'
                        : 'bg-primary text-white hover:bg-primary/90',
                    ]}
                    onClick={() => emit('upgrade', plan)}
                  >
                    {props.selectedPlanId === plan.id 
                      ? t('settings.billing.upgradeDialog.selecting') 
                      : t('settings.billing.upgradeDialog.choosePlan')
                    }
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
});
export default PlanSelection;