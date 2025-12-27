import { Package, Video, TrendingDown } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-3 lg:px-6">
      {/* Total Orders Packed (Month) */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Total Orders Packed</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            1,234
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">This month</p>
        </CardHeader>
      </Card>

      {/* Videos Recorded */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Videos Recorded</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            856
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
            23
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingDown className="size-3" />
              2.1%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">RTO rate</p>
        </CardHeader>
      </Card>
    </div>
  );
}
