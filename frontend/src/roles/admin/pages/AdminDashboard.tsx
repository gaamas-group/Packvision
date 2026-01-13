import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from '@/components/data-table';
import { SectionCards } from '@/components/section-cards';
import SimpleSidebar from '../components/SimpleSidebar';
import { Menu, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/auth/AuthContext';
import { setStats, setRecordings, RootState } from '@/store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const { stats, recordings } = useSelector((state: RootState) => state.admin);
  const { user, logout, accessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = { Authorization: `Bearer ${accessToken}` };

        // Fetch stats
        const statsRes = await fetch(
          'http://localhost:8000/api/v1/admin/stats',
          {
            headers,
          }
        );
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          dispatch(setStats(statsData));
        }

        // Fetch recordings
        const recordingsRes = await fetch(
          'http://localhost:8000/api/v1/admin/recordings',
          { headers }
        );
        if (recordingsRes.ok) {
          const recordingsData = await recordingsRes.json();
          // Map backend recording data to match expected DataTable schema
          const mappedRecordings = recordingsData.recordings.map((r: any) => ({
            id: r.id,
            header: r.package_code,
            type: `By ${r.packager_name}`,
            status: r.status === 'completed' ? 'Done' : r.status,
            target: `${Math.round(r.duration_seconds)}s`,
            limit: `${(r.file_size / (1024 * 1024)).toFixed(1)}MB`,
            reviewer: new Date(r.created_at).toLocaleDateString(),
          }));
          dispatch(setRecordings(mappedRecordings));
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };

    if (accessToken) {
      fetchDashboardData();
    }
  }, [accessToken, dispatch]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <SimpleSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-white px-4 dark:bg-zinc-900 dark:border-zinc-800">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="mr-4 rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Menu className="h-6 w-6" />
          </button>

          <h1 className="text-lg font-semibold">Packvision</h1>

          <div className="ml-auto flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full outline-none focus:ring-2 focus:ring-primary/20">
                  <Avatar className="h-8 w-8 border">
                    <AvatarImage src="" alt={user?.username} />
                    <AvatarFallback className="bg-primary/10 text-primary uppercase">
                      {user?.username?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.username}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="w-full space-y-6">
            <SectionCards stats={stats || undefined} />
            <DataTable data={recordings} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
