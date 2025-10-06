import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getSupabaseAdminClient } from "@/utils/supabaseAdminClient";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { 
  Download, 
  Search, 
  FileText, 
  Send, 
  RefreshCw, 
  Filter, 
  MoreVertical, 
  ExternalLink, 
  FileSpreadsheet
} from "lucide-react";
import { logger } from "@/utils/logger";
import { 
  getQuizCompletedAnswers, 
  formatCompletedAnswersToCSV, 
  formatCompletedAnswersForPDF 
} from "@/utils/supabaseUtils";
import { sendQuizDataToWebhook } from "@/utils/webhookUtils";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface QuizSubmission {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string;
  started_at: string;
  completed_at: string | null;
  completed: boolean;
  // webhook_processed removed as it doesn't exist in schema
}

const QuizResponses = () => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [processingWebhook, setProcessingWebhook] = useState<string | null>(null);
  const [downloadingPDF, setDownloadingPDF] = useState<string | null>(null);
  const [downloadingCSV, setDownloadingCSV] = useState<string | null>(null);
  
  useEffect(() => {
    document.title = "Respostas do Questionário | Admin - Crie Valor";
    
    if (!isAuthenticated) {
      navigate('/');
    } else if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isAdmin, navigate]);
  
  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);
  
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      
      const supabaseAdmin = getSupabaseAdminClient();
      let query = supabaseAdmin
        .from('quiz_submissions')
        .select('id, user_id, user_email, started_at, completed_at, completed')
        .order('started_at', { ascending: false });

      if (statusFilter === 'complete') {
        query = query.eq('completed', true);
      } else if (statusFilter === 'incomplete') {
        query = query.eq('completed', false);
      }
      // Por padrão, mostrar todos os registros se nenhum filtro for selecionado
      // Removed webhook_processed filters as field doesn't exist in schema

      const { data, error } = await query;

      if (error) {
        throw error;
      }
      
      setSubmissions(data as unknown as QuizSubmission[]);
      setSelectedRows([]);
    } catch (error: any) {
      logger.error('Erro ao buscar submissões:', {
        tag: 'Admin',
        data: error
      });
      
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as submissões do questionário.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const downloadCSV = () => {
    try {
      const dataToExport = selectedRows.length > 0 
        ? submissions.filter(s => selectedRows.includes(s.id))
        : submissions;
      
      if (dataToExport.length === 0) {
        toast({
          title: "Nenhum dado para exportar",
          description: "Selecione pelo menos uma submissão para exportar.",
          variant: "destructive"
        });
        return;
      }
      
      const headers = [
        'ID', 'Usuário', 'Email', 
        'Data de Início', 'Data de Conclusão', 
        'Status'
      ];
      
      const rows = dataToExport.map(s => [
        s.id,
        s.user_id,
        s.user_email,
        new Date(s.started_at).toLocaleString('pt-BR'),
        s.completed_at ? new Date(s.completed_at).toLocaleString('pt-BR') : 'N/A',
        s.completed ? 'Completo' : 'Incompleto'
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `respostas-questionario-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Exportação concluída",
        description: `${dataToExport.length} submissões exportadas com sucesso.`,
      });
    } catch (error: any) {
      logger.error('Erro ao exportar CSV:', {
        tag: 'Admin',
        data: error
      });
      
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados para CSV.",
        variant: "destructive"
      });
    }
  };
  
  const downloadDetailedCSV = async (submissionId: string) => {
    try {
      const supabaseAdmin = getSupabaseAdminClient();
      const { data: submission, error: submissionError } = await supabaseAdmin
        .from('quiz_submissions')
        .select('*')
        .eq('id', submissionId)
        .single();

      if (submissionError) throw submissionError;

      // Simplified query to avoid type recursion
      const { data: answers, error: answersError } = await supabaseAdmin
        .from('quiz_answers')
        .select('question_id, answer')
        .eq('submission_id', submissionId);

      if (answersError) throw answersError;

      const { data: questions, error: questionsError } = await supabaseAdmin
        .from('quiz_questions')
        .select('*');

      if (questionsError) throw questionsError;

      const headers = [
        'ID da Pergunta', 'Texto da Pergunta', 'Módulo', 'Tipo', 'Resposta'
      ];
      
      const questionMap = new Map();
      questions.forEach(q => {
        questionMap.set(q.id, q);
      });

      const rows = answers.map(a => {
        const question = questionMap.get(a.question_id) || {};
        return [
          a.question_id,
          question.text || 'N/A', // Use question.text instead of a.question_text
          question.module_id || 'N/A',
          question.type || 'N/A',
          a.answer || 'Sem resposta'
        ];
      });
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => 
          typeof cell === 'string' && (cell.includes(',') || cell.includes('\n')) 
            ? `"${cell.replace(/"/g, '""')}"` 
            : cell
        ).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `respostas-detalhadas-${submission.user_email.replace('@', '_')}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Exportação detalhada concluída",
        description: `${rows.length} respostas exportadas com sucesso.`,
      });
    } catch (error: any) {
      logger.error('Erro ao exportar detalhes CSV:', {
        tag: 'Admin',
        data: error
      });
      
      toast({
        title: "Erro na exportação detalhada",
        description: "Não foi possível exportar as respostas detalhadas.",
        variant: "destructive"
      });
    }
  };
  
  const downloadFullAnswersCSV = async (submissionId: string) => {
    try {
      setDownloadingCSV(submissionId);
      
      const completedAnswers = await getQuizCompletedAnswers(submissionId);
      
      if (!completedAnswers) {
        throw new Error("Não foi possível obter as respostas completas");
      }
      
      const csvContent = formatCompletedAnswersToCSV(completedAnswers);
      
      if (!csvContent) {
        throw new Error("Erro ao formatar respostas para CSV");
      }
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const fileName = `respostas-completas-${completedAnswers.user_email.replace('@', '_')}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "CSV exportado com sucesso",
        description: "As respostas completas foram baixadas em formato CSV.",
      });
    } catch (error: any) {
      logger.error('Erro ao exportar respostas completas para CSV:', {
        tag: 'Admin',
        data: { submissionId, error }
      });
      
      toast({
        title: "Erro na exportação",
        description: error.message || "Não foi possível exportar as respostas completas para CSV.",
        variant: "destructive"
      });
    } finally {
      setDownloadingCSV(null);
    }
  };
  
  const downloadFullAnswersPDF = async (submissionId: string) => {
    try {
      setDownloadingPDF(submissionId);
      
      const completedAnswers = await getQuizCompletedAnswers(submissionId);
      
      if (!completedAnswers) {
        throw new Error("Não foi possível obter as respostas completas");
      }
      
      const pdfData = formatCompletedAnswersForPDF(completedAnswers);
      
      if (!pdfData) {
        throw new Error("Erro ao formatar respostas para PDF");
      }
      
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.text("Relatório de Respostas MAR - Crie Valor Consultoria", 14, 22);
      
      doc.setFontSize(12);
      doc.text(`Usuário: ${pdfData.cabecalho.usuario}`, 14, 32);
      doc.text(`Email: ${pdfData.cabecalho.email}`, 14, 40);
      doc.text(`Data de submissão: ${pdfData.cabecalho.dataSubmissao}`, 14, 48);
      
      const tableColumn = ["Pergunta", "Resposta"];
      const tableRows = pdfData.respostas.map((item: any) => [
        item.pergunta,
        item.resposta
      ]);
      
      (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 55,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [16, 185, 129] },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 'auto' }
        },
        didDrawPage: (data: any) => {
          doc.setFontSize(10);
          doc.text(
            `Relatório gerado em ${new Date().toLocaleDateString('pt-BR')}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
        }
      });
      
      const fileName = `respostas-completas-${completedAnswers.user_email.replace('@', '_')}.pdf`;
      
      doc.save(fileName);
      
      toast({
        title: "PDF exportado com sucesso",
        description: "As respostas completas foram baixadas em formato PDF.",
      });
    } catch (error: any) {
      logger.error('Erro ao exportar respostas completas para PDF:', {
        tag: 'Admin',
        data: { submissionId, error }
      });
      
      toast({
        title: "Erro na exportação",
        description: error.message || "Não foi possível exportar as respostas completas para PDF.",
        variant: "destructive"
      });
    } finally {
      setDownloadingPDF(null);
    }
  };
  
  const triggerWebhook = async (submissionId: string) => {
    try {
      setProcessingWebhook(submissionId);
      
      const result = await sendQuizDataToWebhook(submissionId);
      
      if (result.success) {
        toast({
          title: "Webhook executado com sucesso",
          description: result.message,
        });
        
        fetchSubmissions();
      } else {
        throw new Error(result.message || "Falha ao processar webhook");
      }
    } catch (error: any) {
      logger.error('Erro ao executar webhook:', {
        tag: 'Admin',
        data: error
      });
      
      toast({
        title: "Erro ao executar webhook",
        description: "Não foi possível enviar os dados para o Make.com.",
        variant: "destructive"
      });
    } finally {
      setProcessingWebhook(null);
    }
  };
  
  const viewDetails = (submissionId: string, userId: string) => {
    // Redirecionar para as respostas do usuário específico
    navigate(`/quiz/view-answers?id=${submissionId}&userId=${userId}&admin=true`);
  };
  
  const toggleSelectAll = () => {
    if (selectedRows.length === submissions.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(submissions.map(s => s.id));
    }
  };
  
  const toggleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };
  
  const renderDropdownMenu = (submission: QuizSubmission) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => viewDetails(submission.id, submission.user_id)}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Ver detalhes
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadDetailedCSV(submission.id)}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar respostas detalhadas
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => downloadFullAnswersCSV(submission.id)}
          disabled={downloadingCSV === submission.id}
        >
          <Download className={`h-4 w-4 mr-2 ${downloadingCSV === submission.id ? 'animate-spin' : ''}`} />
          {downloadingCSV === submission.id ? 'Exportando CSV...' : 'Exportar CSV completo'}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => downloadFullAnswersPDF(submission.id)}
          disabled={downloadingPDF === submission.id}
        >
          <FileText className={`h-4 w-4 mr-2 ${downloadingPDF === submission.id ? 'animate-spin' : ''}`} />
          {downloadingPDF === submission.id ? 'Gerando PDF...' : 'Exportar PDF completo'}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => triggerWebhook(submission.id)}
          disabled={processingWebhook === submission.id || !submission.completed}
        >
          <Send className={`h-4 w-4 mr-2 ${processingWebhook === submission.id ? 'animate-pulse' : ''}`} />
          {processingWebhook === submission.id ? 'Enviando...' : 'Enviar para webhook'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
  
  const renderSubmissionRow = (submission: QuizSubmission) => (
    <TableRow key={submission.id}>
      <TableCell>
        <Checkbox 
          checked={selectedRows.includes(submission.id)}
          onCheckedChange={() => toggleSelectRow(submission.id)}
          aria-label={`Selecionar ${submission.user_email}`}
        />
      </TableCell>
      <TableCell>
        {submission.user_name || 'Sem nome'}
      </TableCell>
      <TableCell>
        {submission.user_email}
      </TableCell>
      <TableCell>
        {new Date(submission.started_at).toLocaleString('pt-BR')}
      </TableCell>
      <TableCell>
        {submission.completed ? (
          <Badge variant="outline" className="bg-green-100 border-green-300 text-green-800">
            Completo
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-yellow-100 border-yellow-300 text-yellow-800">
            Em andamento
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        {renderDropdownMenu(submission)}
      </TableCell>
    </TableRow>
  );
  
  const filteredSubmissions = submissions.filter(s => 
    s.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.user_name && s.user_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  if (!isAuthenticated || !isAdmin) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <DashboardHeader isAdmin={isAdmin} />
      
      <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-md">
          <CardHeader className="bg-slate-50">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">Respostas do Questionário</CardTitle>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={fetchSubmissions} 
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={downloadCSV}
                  disabled={loading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex items-center w-full md:w-1/2">
                <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por email ou nome..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center w-full md:w-1/2 md:justify-end gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select 
                  value={statusFilter || "all"} 
                  onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
                >
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os registros</SelectItem>
                    <SelectItem value="complete">Apenas completos</SelectItem>
                    <SelectItem value="incomplete">Apenas incompletos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30px]">
                      <Checkbox 
                        checked={selectedRows.length === submissions.length && submissions.length > 0}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Selecionar todos"
                      />
                    </TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Data de Início</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex justify-center items-center">
                          <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                          <span>Carregando dados...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredSubmissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <FileText className="h-12 w-12 mb-2 opacity-50" />
                          <p>Nenhuma submissão encontrada</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubmissions.map((submission) => renderSubmissionRow(submission))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          
          <CardFooter className="bg-slate-50 justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedRows.length > 0 ? (
                <span>
                  {selectedRows.length} {selectedRows.length === 1 ? 'item selecionado' : 'itens selecionados'}
                </span>
              ) : (
                <span>
                  Total: {filteredSubmissions.length} {filteredSubmissions.length === 1 ? 'submissão' : 'submissões'}
                </span>
              )}
            </div>
            
            {selectedRows.length > 0 && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedRows([])}
                >
                  Limpar seleção
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={downloadCSV}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar selecionados
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
      
      <SiteFooter />
    </div>
  );
};

export default QuizResponses;
