import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown, LogOut, PieChart, User, Home, BookOpen, BarChart, FileText, HelpCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
interface DashboardHeaderProps {
  isAdmin?: boolean;
}
export function DashboardHeader({
  isAdmin = false
}: DashboardHeaderProps) {
  const {
    user,
    signOut
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const initials = user?.user_metadata?.full_name ? `${user.user_metadata.full_name.split(' ')[0][0]}${user.user_metadata.full_name.split(' ').slice(-1)[0][0]}` : user?.email?.substring(0, 2).toUpperCase() || 'U';
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  const getActiveClass = (path: string) => {
    return location.pathname === path ? "bg-blue-700 text-white" : "text-white/80 hover:text-white hover:bg-blue-700/50";
  };
  return <header className="bg-blue-600 shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2">
              <img alt="MAR Logo" className="h-8 w-auto" src="https://static.wixstatic.com/media/783feb_890235ce80dc447984f5634b5aef0efa~mv2.png" />
            </Link>
            
            <nav className="hidden md:flex space-x-1">
              <Link to="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${getActiveClass('/dashboard')}`}>
                <span className="flex items-center gap-1.5">
                  <Home className="h-4 w-4" />
                  Dashboard
                </span>
              </Link>
              
              <Link to="/quiz" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${getActiveClass('/quiz')}`}>
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  Questionário
                </span>
              </Link>
              
              <Link to="/quiz/review" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${getActiveClass('/quiz/review')}`}>
                <span className="flex items-center gap-1.5">
                  <BarChart className="h-4 w-4" />
                  Análises
                </span>
              </Link>
              
              <Link to="/member" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${getActiveClass('/member')}`}>
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  Área do Membro
                </span>
              </Link>
              
              <Link to="/materials" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${getActiveClass('/materials')}`}>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  Materiais
                </span>
              </Link>
              
              <Link to="/faq" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${getActiveClass('/faq')}`}>
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4" />
                  FAQ
                </span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && <Link to="/admin/users">
                <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2 text-white hover:bg-blue-700/50">
                  <PieChart className="h-4 w-4" />
                  <span>Admin</span>
                </Button>
              </Link>}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-white hover:bg-blue-700/50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-blue-800 text-white text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-xs font-medium leading-none">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                    </span>
                    <span className="text-xs text-blue-100 leading-none mt-1">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-blue-100" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link to="/member" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link to="/quiz/view-answers" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="h-4 w-4" />
                    <span>Minhas Respostas</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link to="/materials" className="flex items-center gap-2 cursor-pointer">
                    <BookOpen className="h-4 w-4" />
                    <span>Materiais</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link to="/faq" className="flex items-center gap-2 cursor-pointer">
                    <HelpCircle className="h-4 w-4" />
                    <span>Ajuda</span>
                  </Link>
                </DropdownMenuItem>
                
                {isAdmin && <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin/users" className="flex items-center gap-2 cursor-pointer">
                        <PieChart className="h-4 w-4" />
                        <span>Painel Admin</span>
                      </Link>
                    </DropdownMenuItem>
                  </>}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 flex items-center gap-2 cursor-pointer">
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>;
}