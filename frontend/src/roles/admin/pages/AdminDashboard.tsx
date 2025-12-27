import { useState } from 'react';
import { DataTable } from '@/components/data-table';
import { SectionCards } from '@/components/section-cards';
import SimpleSidebar from '../components/SimpleSidebar';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import data from './data.json';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

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
                    <AvatarImage src="" alt={user?.name} />
                    <AvatarFallback className="bg-primary/10 text-primary uppercase">
                      {user?.name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="w-full space-y-6">
            <SectionCards />
            <DataTable data={data} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
