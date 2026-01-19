import { useState, useMemo, ReactNode } from "react"
import { Search } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"

export interface Column<T> {
  id: string
  header: string
  accessorKey?: keyof T
  cell?: (row: T) => ReactNode
  filterable?: boolean
  filterPlaceholder?: string
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  isLoading?: boolean
  emptyMessage?: string
  searchPlaceholder?: string
  showGlobalSearch?: boolean
  onRowClick?: (row: T) => void
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  emptyMessage = "No data found.",
  searchPlaceholder = "Search...",
  showGlobalSearch = true,
  onRowClick,
}: DataTableProps<T>) {
  const [globalSearch, setGlobalSearch] = useState("")
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(() => {
    const filters: Record<string, string> = {}
    columns.forEach((col) => {
      if (col.filterable) {
        filters[col.id] = ""
      }
    })
    return filters
  })

  // Filter data based on global search and column filters
  const filteredData = useMemo(() => {
    let filtered = [...data]

    // Apply global search if enabled
    if (showGlobalSearch && globalSearch.trim()) {
      const query = globalSearch.toLowerCase()
      filtered = filtered.filter((row) => {
        return columns.some((col) => {
          if (col.accessorKey) {
            const value = row[col.accessorKey]
            return value?.toString().toLowerCase().includes(query)
          }
          return false
        })
      })
    }

    // Apply column-specific filters
    columns.forEach((col) => {
      if (col.filterable && columnFilters[col.id]?.trim()) {
        const filterValue = columnFilters[col.id].toLowerCase()
        filtered = filtered.filter((row) => {
          if (col.accessorKey) {
            const value = row[col.accessorKey]
            return value?.toString().toLowerCase().includes(filterValue)
          }
          return false
        })
      }
    })

    return filtered
  }, [data, columns, globalSearch, columnFilters, showGlobalSearch])

  const updateColumnFilter = (columnId: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnId]: value,
    }))
  }

  const getCellValue = (row: T, column: Column<T>): ReactNode => {
    if (column.cell) {
      return column.cell(row)
    }
    if (column.accessorKey) {
      return row[column.accessorKey] ?? "N/A"
    }
    return "N/A"
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {showGlobalSearch && (
          <div className="flex items-center justify-end">
            <div className="relative w-64">
              <div className="h-9 w-full bg-muted rounded-md animate-pulse" />
            </div>
          </div>
        )}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.id}>
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.id}>
                      <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Global Search */}
      {showGlobalSearch && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent Recordings</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.id} className={col.className}>
                  <div className="flex flex-col gap-2">
                    <span>{col.header}</span>
                    {col.filterable && (
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder={col.filterPlaceholder || searchPlaceholder}
                          value={columnFilters[col.id] || ""}
                          onChange={(e) => updateColumnFilter(col.id, e.target.value)}
                          className="h-7 pl-7 text-xs"
                        />
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground py-8"
                >
                  {globalSearch || Object.values(columnFilters).some((f) => f.trim())
                    ? "No data found matching your filters."
                    : emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row, index) => (
                <TableRow
                  key={index}
                  onClick={() => onRowClick?.(row)}
                  className={onRowClick ? "cursor-pointer" : ""}
                >
                  {columns.map((col) => (
                    <TableCell key={col.id} className={col.className}>
                      {getCellValue(row, col)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      {filteredData.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredData.length} of {data.length} item(s)
        </div>
      )}
    </div>
  )
}

