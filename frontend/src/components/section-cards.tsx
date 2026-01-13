import { Package, Video, TrendingDown } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface DashboardStats {
  total_orders: number;
  total_recordings: number;
  total_returned: number;
}

export function SectionCards({ stats }: { stats?: DashboardStats }) {
  const totalOrders = stats?.total_orders || 0;
  const totalRecordings = stats?.total_recordings || 0;
  const totalReturned = stats?.total_returned || 0;
  const rtoRate =
    totalOrders > 0 ? ((totalReturned / totalOrders) * 100).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-3 lg:px-6">
      {/* Total Orders Packed */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Total Orders</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {totalOrders.toLocaleString()}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Orders in system</p>
        </CardHeader>
      </Card>

      {/* Videos Recorded */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Videos Recorded</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {totalRecordings.toLocaleString()}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Video className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Total recordings</p>
        </CardHeader>
      </Card>

      {/* Number of Returns (RTO Rate) */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Number of Returns (RTO)</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {totalReturned.toLocaleString()}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingDown className="size-3" />
              {rtoRate}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">RTO rate</p>
        </CardHeader>
      </Card>
    </div>
  );
}
