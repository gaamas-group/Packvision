import React from 'react';
import { cn } from '@/lib/utils';

interface SimpleSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SimpleSidebar: React.FC<SimpleSidebarProps> = ({ isOpen }) => {
  return (
    <div
      className={cn(
        'h-screen sticky top-0 z-40 bg-white border-r transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden shrink-0',
        isOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 pointer-events-none'
      )}
    >
      <div className="flex h-full w-64 flex-col">
        <div className="flex h-16 items-center border-b px-4 dark:border-zinc-800">
          <h2 className="text-xl font-bold">Admin</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Dashboard
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                User Management
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Pacakger Management
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Package scanner
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default SimpleSidebar;
