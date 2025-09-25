import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatUtils = {
  formatDateTime: (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  },
  
  formatDate: (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  },
  
  formatTimeAgo: (dateString: string): string => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  }
};

interface AuditLogEntry {
  id: string;
  admin_user_id: string;
  action: string;
  target_table: string | null;
  target_record_id: string | null;
  old_values: any;
  new_values: any;
  created_at: string;
  admin_email?: string;
}

export const AdminAuditLog: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar logs de auditoria
      const { data, error } = await supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        setError('Erro ao carregar logs de auditoria: ' + error.message);
        return;
      }

      // Buscar emails dos administradores para os logs
      const adminIds = [...new Set(data?.map(log => log.admin_user_id) || [])];
      const adminEmails: Record<string, string> = {};
      
      for (const adminId of adminIds) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_email')
            .eq('id', adminId)
            .single();
          adminEmails[adminId] = profile?.user_email || 'Usuário não encontrado';
        } catch {
          adminEmails[adminId] = 'Usuário não encontrado';
        }
      }

      // Processar dados para incluir email do admin
      const processedLogs = data?.map(log => ({
        ...log,
        admin_email: adminEmails[log.admin_user_id] || 'Usuário não encontrado'
      })) || [];

      setAuditLogs(processedLogs);
    } catch (error) {
      setError('Erro ao carregar logs de auditoria: ' + String(error));
    } finally {
      setIsLoading(false);
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'GRANT_ADMIN_ROLE':
        return 'default';
      case 'REVOKE_ADMIN_ROLE':
        return 'destructive';
      case 'UPDATE_WEBHOOK_CONFIG':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getActionDescription = (action: string) => {
    switch (action) {
      case 'GRANT_ADMIN_ROLE':
        return 'Concedeu privilégios de administrador';
      case 'REVOKE_ADMIN_ROLE':
        return 'Removeu privilégios de administrador';
      case 'UPDATE_WEBHOOK_CONFIG':
        return 'Atualizou configuração do webhook';
      default:
        return action;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando logs de auditoria...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Logs de Auditoria
            </CardTitle>
            <CardDescription>
              Registro de todas as ações administrativas realizadas no sistema
            </CardDescription>
          </div>
          <Button variant="outline" onClick={loadAuditLogs} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {auditLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum log de auditoria encontrado
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Administrador</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Tabela</TableHead>
                  <TableHead>Registro ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {formatUtils.formatDateTime(log.created_at)}
                    </TableCell>
                    <TableCell>{log.admin_email}</TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {getActionDescription(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.target_table || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.target_record_id ? 
                        log.target_record_id.substring(0, 8) + '...' : 
                        '-'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {auditLogs.length >= 50 && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Mostrando os 50 logs mais recentes
          </div>
        )}
      </CardContent>
    </Card>
  );
};