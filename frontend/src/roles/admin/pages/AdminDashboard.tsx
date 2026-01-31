import { useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { StatsCards, type DashboardStats } from '@/components/admin/StatsCards';
import { OrdersTable, type Order } from '@/components/admin/OrdersTable';
import { adminAPI } from '@/api/admin';
import { GalleryVerticalEnd } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingStats(true);
        setIsLoadingOrders(true);
        setError(null);

        // Fetch stats and orders in parallel
        const [statsData, ordersData] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getOrders(),
        ]);

        setStats(statsData);
        setOrders(ordersData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load dashboard data',
        );
      } finally {
        setIsLoadingStats(false);
        setIsLoadingOrders(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden dark bg-background">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden bg-background">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 text-white flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <span className="font-semibold text-lg text-white">PackVision</span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {error && (
            <div className="mx-4 mt-4 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="py-6">
            <StatsCards stats={stats || undefined} isLoading={isLoadingStats} />
          </div>

          {/* Orders Table */}
          <div className="pb-6">
            <OrdersTable orders={orders} isLoading={isLoadingOrders} />
          </div>
        </main>
      </div>
    </div>
  );
}
