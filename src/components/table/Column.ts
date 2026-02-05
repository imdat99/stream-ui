import { createColumnHelper, type ColumnDef } from '@tanstack/vue-table'

export { createColumnHelper }
export type { ColumnDef }

// Helper function to create a simple column
export function createColumn<T>(
  accessorKey: keyof T,
  header: string,
  options?: {
    cell?: (value: any, row: T) => any
    enableSorting?: boolean
    size?: number
  }
): ColumnDef<T, any> {
  return {
    accessorKey: accessorKey as string,
    header,
    enableSorting: options?.enableSorting ?? true,
    size: options?.size,
    cell: options?.cell
      ? ({ getValue, row }) => options.cell!(getValue(), row.original)
      : ({ getValue }) => getValue()
  }
}

// Helper for selection column
export function createSelectionColumn<T>(): ColumnDef<T, any> {
  return {
    id: 'select',
    header: ({ table }) => null,
    cell: () => null,
    size: 50,
    enableSorting: false
  }
}
