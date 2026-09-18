import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background dark:bg-darkBackground">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-y-auto md:ml-64">
        <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur dark:border-darkBorder dark:bg-darkBackground/80 sm:px-6">
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-textSecondary transition-colors hover:bg-white hover:text-textPrimary dark:text-darkTextSecondary dark:hover:bg-darkCard dark:hover:text-darkTextPrimary md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Header />
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}