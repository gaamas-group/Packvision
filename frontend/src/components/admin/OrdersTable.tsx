import { Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable, type Column } from "@/components/ui/data-table"

export interface Order {
  id: string
  package_code: string
  status: string
  external_order_id?: string
  created_at?: string
  updated_at?: string
  packager_name?: string
  duration_seconds?: number
  file_size?: number
  object_key?: string
  bucket?: string
}

interface OrdersTableProps {
  orders: Order[]
  isLoading?: boolean
}

export function OrdersTable({ orders, isLoading }: OrdersTableProps) {
  const handleDownload = async (order: Order) => {
    if (!order.object_key) {
      alert("No recording available for download")
      return
    }

    try {
      // Generate download URL from videos API
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"
      const response = await fetch(
        `${API_BASE_URL}/api/v1/videos/download-url/${encodeURIComponent(order.object_key)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to generate download URL")
      }

      const data = await response.json()

      if (data.downloadUrl) {
        // Create a temporary anchor element to trigger download
        const link = document.createElement("a")
        link.href = data.downloadUrl
        link.download = order.package_code || "recording"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        alert("Download URL not available")
      }
    } catch (error) {
      console.error("Error downloading recording:", error)
      alert("Failed to download recording")
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "packed":
      case "done":
      case "completed":
        return "completed"
      case "returned":
        return "destructive"
      case "pending":
        return "secondary"
      default:
        return "outline"
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A"
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A"
    return `${seconds}s`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return dateString
    }
  }

  const columns: Column<Order>[] = [
    {
      id: "package_code",
      header: "Package Code",
      accessorKey: "package_code",
      filterable: false,
      filterPlaceholder: "Search...",
      className: "font-medium text-foreground",
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      filterable: false,
      filterPlaceholder: "Search...",
      cell: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status)}>
          {row.status.toUpperCase() || "Unknown"}
        </Badge>
      ),
      className: "font-medium text-foreground",

    },
    // {
    //   id: "external_order_id",
    //   header: "External Order ID",
    //   accessorKey: "external_order_id",
    //   filterable: false,
    //   filterPlaceholder: "Search...",
    // },
    {
      id: "packager_name",
      header: "Packager",
      accessorKey: "packager_name",
      filterable: false,
      filterPlaceholder: "Search...",
      className: "font-medium text-foreground",
    },
    {
      id: "duration",
      header: "Duration",
      accessorKey: "duration_seconds",
      filterable: false,
      filterPlaceholder: "Search...",
      cell: (row) => formatDuration(row.duration_seconds),
      className: "font-medium text-foreground",
    },
    {
      id: "file_size",
      header: "File Size",
      accessorKey: "file_size",
      filterable: false,
      filterPlaceholder: "Search...",
      cell: (row) => formatFileSize(row.file_size),
      className: "font-medium text-foreground",
    },
    {
      id: "created_at",
      header: "Created At",
      accessorKey: "created_at",
      filterable: false,
      filterPlaceholder: "Search...",
      cell: (row) => formatDate(row.created_at),
      className: "font-medium text-foreground",
    },
    {
      id: "download",
      header: "Download",
      filterable: false,
      cell: (row) =>
        row.object_key ? (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleDownload(row)
            }}
            className="h-8"
          >
            <Download className="h-4 w-4 mr-2 text-foreground" />
            <span className="text-foreground text-sm">Download</span>
          </Button>
        ) : (
          <span className="text-muted-foreground text-sm">N/A</span>
        ),
        className: "font-medium text-foreground",
    },
  ]

  return (
    <div className="space-y-4 px-4 lg:px-6">
      <DataTable
        data={orders}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No orders found."
        searchPlaceholder="Search orders..."
      />
    </div>
  )
}
