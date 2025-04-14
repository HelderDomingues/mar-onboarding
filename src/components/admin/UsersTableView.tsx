
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
import { Mail, CheckCircle, XCircle } from "lucide-react";
import type { UserProfile } from "@/types/admin";

interface UsersTableViewProps {
  users: UserProfile[];
  isLoading: boolean;
  searchQuery: string;
  onToggleAdmin: (userId: string, isCurrentlyAdmin: boolean) => Promise<void>;
  onSendEmail: (userId: string) => void;
}

export const UsersTableView = ({
  users,
  isLoading,
  searchQuery,
  onToggleAdmin,
  onSendEmail
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
    <div className="rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Questionário</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                {searchQuery ? 'Nenhum usuário encontrado com os critérios informados' : 'Nenhum usuário cadastrado'}
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
                  <Button 
                    variant={user.is_admin ? "default" : "outline"}
                    size="sm"
                    onClick={() => onToggleAdmin(user.id, !!user.is_admin)}
                  >
                    {user.is_admin ? 'Admin' : 'Usuário'}
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onSendEmail(user.id)}>
                    <Mail className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
