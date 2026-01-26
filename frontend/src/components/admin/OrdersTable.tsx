import { Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/ui/data-table';
import { useState } from 'react';
import { videoAPI } from '@/api/video';

export interface Order {
  id: string;
  package_code: string;
  status: string;
  external_order_id?: string;
  created_at?: string;
  updated_at?: string;
  packager_name?: string;
  duration_seconds?: number;
  file_size?: number;
  object_key?: string;
  bucket?: string;
}

interface OrdersTableProps {
  orders: Order[];
  isLoading?: boolean;
}

export function OrdersTable({ orders, isLoading }: OrdersTableProps) {
  const [viewVideoUrl, setViewVideoUrl] = useState<string | null>(null);

  const handleView = async (order: Order) => {
    if (!order.object_key) {
      alert('No recording available');
      return;
    }

    try {
      const response = await videoAPI.viewVideo(order.object_key)

      if (response.downloadUrl) {
        setViewVideoUrl(response.downloadUrl);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load video');
    }
  };

  const handleDownload = async (order: Order) => {
    if (!order.object_key) return;

    try {
      const response = await videoAPI.viewVideo(order.object_key)

      if (response.downloadUrl) {
        // Fetch the file as a blob
        const fileResponse = await fetch(response.downloadUrl);
        const blob = await fileResponse.blob();

        // Create a temporary link to download
        const a = document.createElement('a');
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = `${order.package_code}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Revoke the blob URL
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download recording');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'packed':
      case 'done':
      case 'completed':
        return 'completed';
      case 'returned':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    return `${seconds}s`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const columns: Column<Order>[] = [
    {
      id: 'package_code',
      header: 'Package Code',
      accessorKey: 'package_code',
      filterable: false,
      filterPlaceholder: 'Search...',
      className: 'font-medium text-foreground',
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      filterable: false,
      filterPlaceholder: 'Search...',
      cell: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status)}>
          {row.status.toUpperCase() || 'Unknown'}
        </Badge>
      ),
      className: 'font-medium text-foreground',
    },
    // {
    //   id: "external_order_id",
    //   header: "External Order ID",
    //   accessorKey: "external_order_id",
    //   filterable: false,
    //   filterPlaceholder: "Search...",
    // },
    {
      id: 'packager_name',
      header: 'Packager',
      accessorKey: 'packager_name',
      filterable: false,
      filterPlaceholder: 'Search...',
      className: 'font-medium text-foreground',
    },
    {
      id: 'duration',
      header: 'Duration',
      accessorKey: 'duration_seconds',
      filterable: false,
      filterPlaceholder: 'Search...',
      cell: (row) => formatDuration(row.duration_seconds),
      className: 'font-medium text-foreground',
    },
    {
      id: 'file_size',
      header: 'File Size',
      accessorKey: 'file_size',
      filterable: false,
      filterPlaceholder: 'Search...',
      cell: (row) => formatFileSize(row.file_size),
      className: 'font-medium text-foreground',
    },
    {
      id: 'created_at',
      header: 'Created At',
      accessorKey: 'created_at',
      filterable: false,
      filterPlaceholder: 'Search...',
      cell: (row) => formatDate(row.created_at),
      className: 'font-medium text-foreground',
    },
    {
      id: 'actions',
      header: 'Actions',
      filterable: false,
      cell: (row) =>
        row.object_key ? (
          <div className="flex gap-2">
            {/* View button */}
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleView(row);
              }}
              className="h-8 text-foreground" // add text color
            >
              View
            </Button>

            {/* Download button */}
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(row);
              }}
              className="h-8 text-foreground flex items-center"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">N/A</span>
        ),
    },
  ];

  return (
    <div className="space-y-4 px-4 lg:px-6">
      <DataTable
        data={orders}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No orders found."
        searchPlaceholder="Search orders..."
      />

      {/* Video preview modal */}
      {viewVideoUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="bg-background rounded-lg w-[90%] max-w-3xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Video Preview</h3>
              <Button
                className="text-foreground"
                variant="outline"
                onClick={() => setViewVideoUrl(null)}
              >
                Back
              </Button>
            </div>

            <video
              src={viewVideoUrl}
              controls
              autoPlay
              className="w-full rounded-md"
            />
          </div>
        </div>
      )}
    </div>
  );
}
