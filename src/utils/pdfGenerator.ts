import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { formatJsonAnswer } from '@/utils/formatUtils';

// Declaração para o TypeScript reconhecer a extensão autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface QuizAnswer {
  id: string;
  user_id: string;
  question_id: string;
  answer: string;
  created_at: string;
  updated_at: string;
  question_text?: string; // Optional compatibility field
}

interface QuizQuestion {
  id: string;
  module_id: string;
  text: string;
  question_text?: string; // Adicionada como opcional para compatibilidade
  type: string;
  required: boolean;
  order_number: number;
  module_title?: string;
  module_number?: number;
}

interface QuizModule {
  id: string;
  title: string;
  description: string | null;
  order_number: number;
}

/**
 * Gera um arquivo PDF com as respostas do questionário para um usuário específico
 * @param userId ID do usuário
 * @param userName Nome do usuário (opcional)
 * @param format O formato de saída: 'pdf' (padrão) ou 'csv'
 * @param adminMode Se está sendo gerado por um administrador (para mostrar mais detalhes)
 * @returns Objeto jsPDF que pode ser usado para download ou visualização
 */
export const generateQuizPDF = async (
  userId: string,
  userName?: string,
  format: 'pdf' | 'csv' = 'pdf',
  adminMode: boolean = false
): Promise<jsPDF | null> => {
  try {
    logger.info('Iniciando geração de PDF para questionário', {
      tag: 'PDF',
      data: { userId, userName, adminMode, format }
    });
    
    // Buscar as perguntas primeiro
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .order('order_number');
    
    if (questionsError) {
      throw questionsError;
    }
    
    // Buscar as respostas do usuário - Simplified query to avoid type recursion
    const { data: rawAnswers, error: answersError } = await supabase
      .from('quiz_answers')
      .select('id, question_id, answer, created_at, updated_at')
      .not('answer', 'is', null);
    
    const answers = rawAnswers?.map(answer => ({
      ...answer,
      user_id: userId, // Add required user_id field
      question_text: '' // Will be populated later
    }));
    
    if (answersError) {
      throw answersError;
    }
    
    if (!answers || answers.length === 0) {
      logger.warn('Nenhuma resposta encontrada para o usuário', {
        tag: 'PDF',
        data: { userId }
      });
      return null;
    }
    
    // Buscar módulos para organizar as perguntas
    const { data: modules, error: modulesError } = await supabase
      .from('quiz_modules')
      .select('*')
      .order('order_number');
    
    if (modulesError) {
      throw modulesError;
    }
    
    // Buscar informações do usuário diretamente da auth.users
    const { data: userData, error: userError } = await supabase.auth.getUser(userId);
    
    if (userError) {
      throw userError;
    }
    
    const userEmail = userData?.user?.email || '';
    
    // Buscar perfil para o nome completo
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle();
    
    const fullName = profileData?.full_name || userName || userEmail;
    
    // Combinar dados iniciais para o PDF
    const initialAnswers = answers.map(answer => {
      const question = questions.find(q => q.id === answer.question_id);
      return {
        ...answer,
        question_text: question?.text || 'Pergunta não encontrada',
        user_email: userEmail,
        module_id: question?.module_id,
        module_title: modules.find(m => m.id === question?.module_id)?.title,
        user_id: userId // Add required user_id field
      };
    });
    
    // Inicializar o PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Garantir que o jsPDF-autotable esteja carregado
    // @ts-ignore - Importação dinâmica para garantir que o autotable esteja disponível
    if (typeof window !== 'undefined' && !doc.autoTable) {
      await import('jspdf-autotable');
    }
    
    // Configurar fonte e tamanho
    doc.setFont('helvetica');
    doc.setFontSize(16);
    
    // Adicionar título
    doc.text('Questionário MAR - Crie Valor', 105, 20, { align: 'center' });
    
    // Adicionar informações do usuário
    doc.setFontSize(12);
    doc.text(`Usuário: ${fullName || userEmail || 'Não identificado'}`, 20, 30);
    
    if (adminMode && userEmail) {
      doc.text(`Email: ${userEmail}`, 20, 36);
    }
    
    // Data de geração
    const now = new Date();
    doc.text(`Data: ${now.toLocaleDateString('pt-BR')}`, 20, adminMode ? 42 : 36);
    
    // Linha separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(20, adminMode ? 46 : 40, 190, adminMode ? 46 : 40);
    
    // Organizar respostas por módulo
    const answersMap = new Map<string, QuizAnswer[]>();
    const questionsMap = new Map<string, QuizQuestion>();
    const moduleMap = new Map<string, QuizModule>();
    
    // Mapear módulos para facilitar busca
    modules.forEach(module => {
      moduleMap.set(module.id, module);
    });
    
    // Mapear perguntas para facilitar busca
    questions.forEach(question => {
      const module = moduleMap.get(question.module_id);
      questionsMap.set(question.id, {
        ...question,
        // Using text as the primary field (database schema uses 'text', not 'question_text')
        question_text: question.text,
        module_title: module?.title || 'Sem módulo',
        module_number: module?.order_number || 0
      });
    });
    
    // Organizar respostas por módulo
    modules.forEach(module => {
      answersMap.set(module.id, []);
    });
    
    // Use the initial answers with required fields already mapped
    initialAnswers.forEach(answer => {
      const question = questionsMap.get(answer.question_id);
      if (question) {
        const moduleAnswers = answersMap.get(question.module_id) || [];
        moduleAnswers.push(answer as QuizAnswer);
        answersMap.set(question.module_id, moduleAnswers);
      }
    });
    
    // Y position tracker
    let yPos = adminMode ? 50 : 44;
    
    // Iterar sobre os módulos em ordem
    modules.sort((a, b) => a.order_number - b.order_number).forEach(module => {
      const moduleAnswers = answersMap.get(module.id) || [];
      
      // Título do módulo
      if (format === 'pdf') {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(`${module.order_number}. ${module.title}`, 20, yPos);
        yPos += 10;
      }
      
      // Verificar se precisamos de uma nova página
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Preparar dados para a tabela
      const tableBody: any[] = [];
      
      // Organizar respostas por ordem da pergunta
      moduleAnswers.sort((a, b) => {
        const qA = questionsMap.get(a.question_id);
        const qB = questionsMap.get(b.question_id);
        return (qA?.order_number || 0) - (qB?.order_number || 0);
      }).forEach(answer => {
        const question = questionsMap.get(answer.question_id);
        if (!question) return;
        
        // Formatar resposta para melhor visualização usando a função normalizada
        let formattedAnswer = formatJsonAnswer(answer.answer);
        
        // Adicionar à tabela - Usar text ou question_text conforme disponível
        const questionText = answer.question_text || question.text || question.question_text || 'Sem texto';
        tableBody.push([
          `${question.order_number || '-'}. ${questionText}`,
          formattedAnswer
        ]);
      });
      
      // Adicionar tabela se houver conteúdo
      if (tableBody.length > 0 && doc.autoTable) {
        doc.autoTable({
          startY: yPos,
          head: [['Pergunta', 'Resposta']],
          body: tableBody,
          headStyles: {
            fillColor: [0, 123, 255],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          styles: {
            fontSize: 10,
            cellPadding: 3,
            overflow: 'linebreak'
          },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 'auto' }
          },
          margin: { left: 20, right: 20 }
        });
        
        // Atualizar a posição Y após a tabela
        yPos = (doc as any).lastAutoTable.finalY + 15;
      } else if (tableBody.length === 0) {
        // Se não houver respostas para este módulo, adicionar uma mensagem
        yPos += 5;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("Nenhuma resposta registrada neste módulo.", 20, yPos);
        yPos += 10;
      }
    });
    
    logger.info('PDF gerado com sucesso', {
      tag: 'PDF',
      data: { userId, pageCount: doc.getNumberOfPages() }
    });
    
    return doc;
  } catch (error: any) {
    logger.error('Erro ao gerar PDF do questionário', {
      tag: 'PDF',
      data: { userId, error }
    });
    return null;
  }
};

/**
 * Gera e faz o download de um PDF com as respostas do questionário
 * @param userId ID do usuário
 * @param userName Nome do usuário (opcional)
 * @param filename Nome do arquivo (sem extensão)
 * @param adminMode Se está sendo gerado por um administrador
 */
export const downloadQuizPDF = async (
  userId: string,
  userName?: string,
  filename?: string,
  adminMode: boolean = false
): Promise<boolean> => {
  try {
    const doc = await generateQuizPDF(userId, userName, 'pdf', adminMode);
    
    if (!doc) {
      throw new Error('Não foi possível gerar o PDF');
    }
    
    // Nome do arquivo
    const pdfFilename = filename || `questionario-mar-${new Date().toISOString().split('T')[0]}`;
    
    // Fazer download
    doc.save(`${pdfFilename}.pdf`);
    
    return true;
  } catch (error: any) {
    logger.error('Erro ao fazer download do PDF', {
      tag: 'PDF',
      data: { userId, error }
    });
    return false;
  }
};

/**
 * Gera e faz o download de um CSV com as respostas do questionário
 * @param userId ID do usuário
 * @param userName Nome do usuário (opcional)
 * @param filename Nome do arquivo (sem extensão)
 * @param adminMode Se está sendo gerado por um administrador
 */
export const downloadQuizCSV = async (
  userId: string,
  userName?: string,
  filename?: string,
  adminMode: boolean = false
): Promise<boolean> => {
  try {
    // Buscar as respostas do usuário
    const answersResult = await supabase
      .from('quiz_answers')
      .select('*');
    
    const userAnswers = answersResult.data?.filter((answer: any) => 
      answer.submission_id && answer.question_id
    );
    
    // Buscar as perguntas
    const { data: questions } = await supabase
      .from('quiz_questions')
      .select('*')
      .order('order_number');
    
    if (!userAnswers || userAnswers.length === 0 || !questions) {
      throw new Error('Nenhuma resposta encontrada');
    }
    
    // Combinar respostas com perguntas
    const answers = userAnswers.map((answer: any) => ({
      ...answer,
      quiz_questions: questions.find((q: any) => q.id === answer.question_id)
    }));
    
    // Preparar o conteúdo CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Pergunta,Resposta\n";
    
    // Adicionar as respostas ao CSV
    answers.forEach(answer => {
      // Usar a função normalizada de formatação
      let formattedAnswer = formatJsonAnswer(answer.answer);
      
      // Formatar para CSV: escapar aspas, adicionar aspas ao redor do texto
      const formatCSV = (text: string) => {
        return `"${(text || '').toString().replace(/"/g, '""')}"`;
      };
      
      csvContent += `${formatCSV(answer.quiz_questions?.text || 'Pergunta não encontrada')},${formatCSV(formattedAnswer)}\n`;
    });
    
    // Codificar para URI
    const encodedUri = encodeURI(csvContent);
    
    // Criar link temporário para download
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename || 'questionario-mar-csv'}.csv`);
    document.body.appendChild(link);
    
    // Clicar no link para iniciar download
    link.click();
    
    // Remover o link
    document.body.removeChild(link);
    
    logger.info('CSV gerado com sucesso', {
      tag: 'CSV',
      data: { userId }
    });
    
    return true;
  } catch (error: any) {
    logger.error('Erro ao gerar CSV', {
      tag: 'CSV',
      data: { error }
    });
    return false;
  }
};
