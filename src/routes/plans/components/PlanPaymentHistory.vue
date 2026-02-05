<script setup lang="ts">
import { createColumnHelper } from '@/components/table/Column'
import DataTable from '@/components/table/DataTable.vue'
import Tag from '@/components/ui/Tag.vue'
import Toast from '@/components/ui/Toast.vue'
import { useToast } from '@/composables/useToast'
import { h } from 'vue'

interface PaymentHistoryItem {
  id: string
  date: string
  amount: number
  plan: string
  status: string
  invoiceId: string
}

const props = defineProps<{
  history: PaymentHistoryItem[]
}>()

const toast = useToast()

const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'success':
      return 'success' as const
    case 'failed':
      return 'danger' as const
    case 'pending':
      return 'warning' as const
    default:
      return 'info' as const
  }
}

const columnHelper = createColumnHelper<PaymentHistoryItem>()

const columns = [
  columnHelper.accessor('date', {
    header: 'Date',
    cell: ({ getValue }) => h('span', { class: 'font-medium' }, getValue()),
    enableSorting: true
  }),
  columnHelper.accessor('amount', {
    header: 'Amount',
    cell: ({ getValue }) => h('span', {}, `$${getValue()}`)
  }),
  columnHelper.accessor('plan', {
    header: 'Plan'
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: ({ getValue }) => h(Tag, {
      value: getValue(),
      severity: getStatusSeverity(getValue())
    })
  })
]

const downloadInvoice = (item: PaymentHistoryItem) => {
  toast.info(`Downloading invoice #${item.invoiceId}...`, 'Downloading')

  setTimeout(() => {
    toast.success(`Invoice #${item.invoiceId} downloaded successfully`, 'Downloaded')
  }, 1500)
}
</script>

<template>
  <section>
    <Toast />
    <h2 class="text-2xl font-bold mb-6 text-gray-900">Billing History</h2>
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <DataTable :data="history" :columns="columns" />
    </div>
  </section>
</template>
