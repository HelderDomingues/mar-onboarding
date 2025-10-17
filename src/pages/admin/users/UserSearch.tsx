
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, RefreshCw } from "lucide-react";

interface UserSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleAddUser: () => void;
  fetchUsers: () => void;
  isLoading: boolean;
}

export const UserSearch = ({
  searchQuery,
  setSearchQuery,
  handleAddUser,
  fetchUsers,
  isLoading
}: UserSearchProps) => {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-4 mb-4 md:mb-6">
      <Button 
        className="flex items-center justify-center gap-2 bg-primary min-h-[44px]" 
        onClick={handleAddUser}
      >
        <UserPlus className="h-4 w-4" />
        <span className="text-sm md:text-base">Novo Usuário</span>
      </Button>
      
      <div className="relative flex-1 md:flex-grow md:max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          className="pl-9 w-full min-h-[44px] text-sm md:text-base" 
          placeholder="Buscar usuários..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Button 
        variant="outline" 
        size="icon"
        onClick={fetchUsers}
        disabled={isLoading}
        title="Atualizar lista de usuários"
        className="min-h-[44px] min-w-[44px]"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};
