
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Mail, CheckCircle, XCircle, MoreVertical, UserCog, Shield, ShieldOff, Trash2 } from "lucide-react";
import type { UserProfile } from "@/types/admin";

interface UsersTableViewProps {
  users: UserProfile[];
  isLoading: boolean;
  searchQuery: string;
  onToggleAdmin: (userId: string, isCurrentlyAdmin: boolean) => Promise<void>;
  onSendEmail: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
  onDeleteUser?: (userId: string) => void;
}

export const UsersTableView = ({
  users,
  isLoading,
  searchQuery,
  onToggleAdmin,
  onSendEmail,
  onViewProfile,
  onDeleteUser
}: UsersTableViewProps) => {
  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchLower)) ||
      (user.username && user.username.toLowerCase().includes(searchLower))
    );
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {/* Tabela para desktop */}
      <div className="hidden md:block rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Questionário</TableHead>
              <TableHead>Função</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  {searchQuery ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {user.full_name || user.username || 'Sem nome'}
                  </TableCell>
                  <TableCell>{user.email || 'Email não disponível'}</TableCell>
                  <TableCell>
                    {user.has_submission ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Completo</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-orange-500">
                        <XCircle className="h-4 w-4" />
                        <span>Pendente</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.is_admin ? (
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-primary" />
                        <span className="text-sm font-medium">Admin</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Usuário</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Gerenciar Usuário</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {onViewProfile && (
                          <DropdownMenuItem onClick={() => onViewProfile(user.id)}>
                            <UserCog className="h-4 w-4 mr-2" />
                            Ver Perfil
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem onClick={() => onSendEmail(user.id)}>
                          <Mail className="h-4 w-4 mr-2" />
                          Enviar Email
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem onClick={() => onToggleAdmin(user.id, !!user.is_admin)}>
                          {user.is_admin ? (
                            <>
                              <ShieldOff className="h-4 w-4 mr-2" />
                              Remover Admin
                            </>
                          ) : (
                            <>
                              <Shield className="h-4 w-4 mr-2" />
                              Tornar Admin
                            </>
                          )}
                        </DropdownMenuItem>
                        
                        {onDeleteUser && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onDeleteUser(user.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir Usuário
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Cards para mobile */}
      <div className="md:hidden space-y-2 p-3">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-xs">
            {searchQuery ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div 
              key={user.id} 
              className="bg-background border rounded-lg p-3 space-y-2 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">
                    {user.full_name || user.username || 'Sem nome'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {user.email || 'Email não disponível'}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Gerenciar</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {onViewProfile && (
                      <DropdownMenuItem onClick={() => onViewProfile(user.id)}>
                        <UserCog className="h-4 w-4 mr-2" />
                        Ver Perfil
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem onClick={() => onSendEmail(user.id)}>
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar Email
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={() => onToggleAdmin(user.id, !!user.is_admin)}>
                      {user.is_admin ? (
                        <>
                          <ShieldOff className="h-4 w-4 mr-2" />
                          Remover Admin
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Tornar Admin
                        </>
                      )}
                    </DropdownMenuItem>
                    
                    {onDeleteUser && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDeleteUser(user.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-3 text-xs pt-1 border-t">
                <div className="flex items-center gap-1">
                  {user.has_submission ? (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-green-600 text-xs">Completo</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 text-orange-500" />
                      <span className="text-orange-500 text-xs">Pendente</span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  {user.is_admin ? (
                    <>
                      <Shield className="h-3 w-3 text-primary" />
                      <span className="text-primary font-medium text-xs">Admin</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground text-xs">Usuário</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};
