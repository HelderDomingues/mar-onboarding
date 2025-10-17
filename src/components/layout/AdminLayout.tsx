import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-b from-blue-50 to-white">
        {/* Sidebar - sempre presente mas colapsada em mobile */}
        <AdminSidebar />

        {/* Conteúdo principal */}
        <div className="flex-1 flex flex-col w-full overflow-hidden">
          {/* Header com trigger da sidebar para mobile */}
          <header className="h-14 flex items-center border-b bg-background px-4 sticky top-0 z-30 lg:hidden">
            <SidebarTrigger />
          </header>

          {/* Conteúdo da página */}
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-background border-t py-6">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
              <p>
                © {new Date().getFullYear()} Crie Valor. Todos os direitos reservados.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
