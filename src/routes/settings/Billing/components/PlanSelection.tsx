import { client as rpcClient } from '@/api/rpcclient';
import CheckIcon from '@/components/icons/CheckIcon.vue';
import Credit from '@/components/icons/Credit.vue';
import { cn } from '@/lib/utils';
import type { Plan as ModelPlan } from '@/server/api/proto/app/v1/common';
import { useAuthStore } from '@/stores/auth';
import { useQuery } from '@pinia/colada';
import { useTranslation } from 'i18next-vue';
import { computed, defineComponent } from 'vue';
const PlanSelection = defineComponent({
  name: 'PlanSelection',
  props: {
    currentPlanId: String,
    selectedPlanId: {
      type: String,
      default: '',
    },
  },
  emits: {
    "upgrade": (plan: ModelPlan) => true,
  },
  setup(props, { emit }) {
    const { t } = useTranslation();
    const auth = useAuthStore();
    const { data, isLoading } = useQuery({
      key: () => ['billing-plans'],
      query: () => rpcClient.listPlans(),
    });

    const currentPlanId = computed(() => props.currentPlanId || undefined);

    const subscriptionSummary = computed(() => {
      const expiresAt = auth.user?.planExpiresAt || auth.user?.plan_expires_at;
      const formattedDate = auth.formatHistoryDate(expiresAt);
      const currentPlanName = data.value?.plans?.find((plan) => plan.id === currentPlanId.value)?.name
        || t('settings.billing.subscription.unknownPlan');

      if (currentPlanId.value) {
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

    const sortedPlans = computed(() =>
      [...(data.value?.plans || [])].sort((a, b) => (a.price || 0) - (b.price || 0))
    );

    const isCurrentPlan = (planId?: string) => planId === currentPlanId.value;
    const isSelectingPlan = (planId?: string) => planId === props.selectedPlanId;

    return () => (
      <div class="px-6 py-4">
        <div class="mb-4 flex items-center gap-4">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <Credit filled class="h-5 w-5 text-primary" />
          </div>
          <div>
            <p class="text-sm font-medium text-foreground">{t('settings.billing.availablePlans')}</p>
            <p class="mt-0.5 text-xs text-foreground/60">{t('settings.billing.availablePlansHint')}</p>
          </div>
        </div>

        {isLoading.value ? (
          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div class="h-[200px] animate-pulse rounded-lg bg-muted/50"></div>
              </div>
            ))}
          </div>
        ) : (
          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            {sortedPlans.value.map((plan) => (
              <div
                key={plan.id}
                class={[
                  'flex flex-col rounded-lg border p-4 transition-all hover:bg-muted/30',
                  isCurrentPlan(plan.id) ? 'border-primary/40 bg-primary/5' : 'border-border',
                ]}
              >
                <div class="mb-3">
                  <div class="flex items-center justify-between gap-3">
                    <h3 class="text-lg font-semibold text-foreground">{plan.name}</h3>
                    {isCurrentPlan(plan.id) && (
                      <span class={cn('inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary', subscriptionSummary.value.tone === 'warning' && 'bg-warning/10 text-warning')}>
                        {subscriptionSummary.value.description}
                      </span>
                    )}
                  </div>
                  <p class="mt-1 min-h-[2.5rem] text-sm text-foreground/60">{plan.description}</p>
                </div>

                <div class="mb-4">
                  <span class="text-2xl font-bold text-foreground">{auth.formatMoney(plan.price || 0)}</span>
                  <span class="text-sm text-foreground/60"> / {t(`settings.billing.cycle.${plan.cycle}`)}</span>
                </div>

                <ul class="mb-4 space-y-2 text-sm">
                  {(plan.features || []).map((feature: string) => (
                    <li key={feature} class="flex items-center gap-2 text-foreground/70">
                      <CheckIcon class="h-4 w-4 shrink-0 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {!isCurrentPlan(plan.id) && (
                  <button
                    disabled={isSelectingPlan(plan.id)}
                    class={[
                      'mt-auto w-full rounded-md px-4 py-2 text-sm font-medium transition-all',
                      isSelectingPlan(plan.id)
                        ? 'cursor-wait bg-muted/50 text-foreground/60'
                        : 'bg-primary text-white hover:bg-primary/90',
                    ]}
                    onClick={() => emit('upgrade', plan)}
                  >
                    {isSelectingPlan(plan.id)
                      ? t('settings.billing.upgradeDialog.selecting')
                      : t('settings.billing.upgradeDialog.choosePlan')}
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
