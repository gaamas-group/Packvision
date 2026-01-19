import { Package, Video, TrendingDown } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface DashboardStats {
  total_orders: number
  total_recordings: number
  total_returned: number
}

interface StatsCardsProps {
  stats?: DashboardStats
  isLoading?: boolean
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const totalOrders = stats?.total_orders || 0
  const totalRecordings = stats?.total_recordings || 0
  const totalReturned = stats?.total_returned || 0
  const rtoRate =
    totalOrders > 0 ? ((totalReturned / totalOrders) * 100).toFixed(1) : "0.0"

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-3 lg:px-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 w-24 bg-muted rounded mb-2" />
              <div className="h-8 w-16 bg-muted rounded" />
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-3 lg:px-6">
      {/* Total Orders */}
      <Card className="bg-card border-border">
        <CardHeader className="relative">
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <CardDescription className="text-muted-foreground">Total Orders Packed</CardDescription>
          </div>
          <CardTitle className="text-3xl font-bold tabular-nums text-foreground">
            {totalOrders.toLocaleString()}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-2">+18.2% from last month</p>
        </CardHeader>
      </Card>

      {/* Videos Recorded */}
      <Card className="bg-card border-border">
        <CardHeader className="relative">
          <div className="flex items-center gap-3 mb-2">
            <Video className="h-5 w-5 text-muted-foreground" />
            <CardDescription className="text-muted-foreground">Videos Recorded</CardDescription>
          </div>
          <CardTitle className="text-3xl font-bold tabular-nums text-foreground">
            {totalRecordings.toLocaleString()}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-2">99.7% coverage rate</p>
        </CardHeader>
      </Card>

      {/* Number of Returns (RTO Rate) */}
      <Card className="bg-card border-border">
        <CardHeader className="relative">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="h-5 w-5 text-muted-foreground" />
            <CardDescription className="text-muted-foreground">Orders Returned</CardDescription>
          </div>
          <CardTitle className="text-3xl font-bold tabular-nums text-foreground">
            {totalReturned.toLocaleString()}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-2">{rtoRate}% return rate</p>
        </CardHeader>
      </Card>
    </div>
  )
}

