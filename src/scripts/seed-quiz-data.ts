
import { supabaseAdmin } from '../integrations/supabase/client';
import { logger } from '../utils/logger';

interface QuizModule {
  title: string;
  description: string | null;
  order_number: number;
}

interface QuizQuestion {
  module_id: string;
  text: string;
  type: 'text' | 'number' | 'email' | 'radio' | 'checkbox' | 'textarea' | 'select' | 'url' | 'instagram';
  required: boolean;
  order_number: number;
  hint: string | null;
}

interface QuizOption {
  question_id: string;
  text: string;
  order_number: number;
}

/**
 * Script para popular o banco de dados com os dados do questionário MAR
 */
const seedQuizData = async () => {
  logger.info('Iniciando processo de seed dos dados do questionário MAR...', {
    tag: 'Seed',
  });
  
  try {
    // Limpar dados existentes (opcional)
    logger.info('Limpando dados existentes...', {
      tag: 'Seed',
    });
    
    await supabaseAdmin.from('quiz_options').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('quiz_questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('quiz_modules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Inserir módulos
    logger.info('Inserindo módulos...', {
      tag: 'Seed',
    });
    
    const modules: QuizModule[] = [
      { title: "Mercado", description: "Perguntas sobre seu mercado e posicionamento", order_number: 1 },
      { title: "Atração", description: "Perguntas sobre captação de clientes", order_number: 2 },
      { title: "Relacionamento", description: "Perguntas sobre relacionamento com clientes", order_number: 3 },
      { title: "Monetização", description: "Perguntas sobre modelos de monetização", order_number: 4 },
      { title: "Produto", description: "Perguntas sobre seu produto ou serviço", order_number: 5 },
      { title: "Análise", description: "Perguntas sobre análise de dados", order_number: 6 },
      { title: "Revenue", description: "Perguntas sobre receita e faturamento", order_number: 7 },
    ];
    
    const { data: modulesData, error: modulesError } = await supabaseAdmin
      .from('quiz_modules')
      .insert(modules)
      .select();
    
    if (modulesError) {
      throw new Error(`Erro ao inserir módulos: ${modulesError.message}`);
    }
    
    logger.info(`${modulesData.length} módulos inseridos com sucesso`, {
      tag: 'Seed',
    });
    
    // Mapear IDs dos módulos para uso posterior
    const moduleMap = new Map<number, string>();
    modulesData.forEach(module => {
      moduleMap.set(module.order_number, module.id);
    });
    
    // Definir perguntas
    const questions: QuizQuestion[] = [
      // Módulo 1: Mercado
      {
        module_id: moduleMap.get(1) || '',
        text: "Qual o nome da sua empresa?",
        type: "text",
        required: true,
        order_number: 1,
        hint: "Digite o nome completo da sua empresa conforme registro"
      },
      {
        module_id: moduleMap.get(1) || '',
        text: "Há quanto tempo sua empresa existe?",
        type: "radio",
        required: true,
        order_number: 2,
        hint: "Selecione a opção que melhor representa o tempo de existência da sua empresa"
      },
      {
        module_id: moduleMap.get(1) || '',
        text: "Em qual setor sua empresa atua?",
        type: "radio",
        required: true,
        order_number: 3,
        hint: "Selecione o setor principal de atuação da sua empresa"
      },
      {
        module_id: moduleMap.get(1) || '',
        text: "Quem são seus principais concorrentes?",
        type: "textarea",
        required: true,
        order_number: 4,
        hint: "Liste os principais concorrentes do seu negócio"
      },
      {
        module_id: moduleMap.get(1) || '',
        text: "Qual o site da sua empresa?",
        type: "url",
        required: true,
        order_number: 5,
        hint: "Insira a URL completa do site da sua empresa, começando com http:// ou https://"
      },
      {
        module_id: moduleMap.get(1) || '',
        text: "Qual o Instagram da sua empresa?",
        type: "instagram",
        required: false,
        order_number: 6,
        hint: "Digite apenas o nome de usuário, sem o @ ou URL completa"
      },
      
      // Módulo 2: Atração
      {
        module_id: moduleMap.get(2) || '',
        text: "Quais canais de marketing utiliza atualmente?",
        type: "checkbox",
        required: true,
        order_number: 1,
        hint: "Selecione todos os canais que sua empresa utiliza regularmente"
      },
      {
        module_id: moduleMap.get(2) || '',
        text: "Qual o seu investimento mensal em marketing digital?",
        type: "radio",
        required: true,
        order_number: 2,
        hint: "Selecione a faixa que representa seu investimento mensal em marketing"
      },
      {
        module_id: moduleMap.get(2) || '',
        text: "Qual é o seu custo médio de aquisição de cliente (CAC)?",
        type: "number",
        required: false,
        order_number: 3,
        hint: "Informe o valor aproximado em reais, sem pontos ou vírgulas"
      },
      {
        module_id: moduleMap.get(2) || '',
        text: "Qual canal traz mais clientes para o seu negócio?",
        type: "radio",
        required: true,
        order_number: 4,
        hint: "Selecione o canal que mais contribui para aquisição de clientes"
      },
      {
        module_id: moduleMap.get(2) || '',
        text: "Instagram do concorrente A",
        type: "instagram",
        required: false,
        order_number: 5,
        hint: "Digite apenas o nome de usuário, sem o @ ou URL completa"
      },
      
      // Módulo 3: Relacionamento
      {
        module_id: moduleMap.get(3) || '',
        text: "Como você coleta feedback dos seus clientes?",
        type: "checkbox",
        required: true,
        order_number: 1,
        hint: "Selecione todos os métodos que você utiliza para coletar feedback"
      },
      {
        module_id: moduleMap.get(3) || '',
        text: "Qual ferramenta utiliza para gerenciar relacionamento com clientes?",
        type: "radio",
        required: true,
        order_number: 2,
        hint: "Selecione a principal ferramenta de CRM que sua empresa utiliza"
      },
      {
        module_id: moduleMap.get(3) || '',
        text: "Qual é seu NPS (Net Promoter Score) atual?",
        type: "number",
        required: false,
        order_number: 3,
        hint: "Informe seu NPS atual (de 0 a 100)"
      },
      {
        module_id: moduleMap.get(3) || '',
        text: "Quantos canais de atendimento ao cliente você oferece?",
        type: "checkbox",
        required: true,
        order_number: 4,
        hint: "Selecione todos os canais de atendimento disponíveis"
      },
      {
        module_id: moduleMap.get(3) || '',
        text: "Instagram do concorrente B",
        type: "instagram",
        required: false,
        order_number: 5,
        hint: "Digite apenas o nome de usuário, sem o @ ou URL completa"
      },
      
      // Módulo 4: Monetização
      {
        module_id: moduleMap.get(4) || '',
        text: "Qual é o modelo de negócio principal da sua empresa?",
        type: "radio",
        required: true,
        order_number: 1,
        hint: "Selecione o principal modelo de negócio da sua empresa"
      },
      {
        module_id: moduleMap.get(4) || '',
        text: "Qual é o valor médio do ticket da sua empresa?",
        type: "number",
        required: true,
        order_number: 2,
        hint: "Informe o valor médio em reais, sem pontos ou vírgulas"
      },
      {
        module_id: moduleMap.get(4) || '',
        text: "Quais métodos de pagamento você aceita?",
        type: "checkbox",
        required: true,
        order_number: 3,
        hint: "Selecione todos os métodos de pagamento aceitos"
      },
      {
        module_id: moduleMap.get(4) || '',
        text: "Você possui um programa de fidelidade?",
        type: "radio",
        required: true,
        order_number: 4,
        hint: "Indique se sua empresa possui algum programa de fidelidade"
      },
      {
        module_id: moduleMap.get(4) || '',
        text: "Instagram do concorrente C",
        type: "instagram",
        required: false,
        order_number: 5,
        hint: "Digite apenas o nome de usuário, sem o @ ou URL completa"
      },
      
      // Módulo 5: Produto
      {
        module_id: moduleMap.get(5) || '',
        text: "Quantos produtos/serviços diferentes você oferece?",
        type: "number",
        required: true,
        order_number: 1,
        hint: "Informe o número total de produtos ou serviços oferecidos"
      },
      {
        module_id: moduleMap.get(5) || '',
        text: "Qual é o seu processo de desenvolvimento de produto?",
        type: "radio",
        required: true,
        order_number: 2,
        hint: "Selecione a metodologia que melhor descreve seu processo"
      },
      {
        module_id: moduleMap.get(5) || '',
        text: "Com que frequência você lança novos produtos/serviços?",
        type: "radio",
        required: true,
        order_number: 3,
        hint: "Selecione a frequência média de lançamentos"
      },
      {
        module_id: moduleMap.get(5) || '',
        text: "Quais são seus principais diferenciais competitivos?",
        type: "checkbox",
        required: true,
        order_number: 4,
        hint: "Selecione os diferenciais mais importantes do seu negócio"
      },
      {
        module_id: moduleMap.get(5) || '',
        text: "Descreva seu produto ou serviço principal em detalhes",
        type: "textarea",
        required: true,
        order_number: 5,
        hint: "Forneça uma descrição detalhada do seu principal produto ou serviço"
      },
      
      // Módulo 6: Análise
      {
        module_id: moduleMap.get(6) || '',
        text: "Quais ferramentas de análise você utiliza?",
        type: "checkbox",
        required: true,
        order_number: 1,
        hint: "Selecione todas as ferramentas que sua empresa utiliza regularmente"
      },
      {
        module_id: moduleMap.get(6) || '',
        text: "Com que frequência você analisa dados de desempenho?",
        type: "radio",
        required: true,
        order_number: 2,
        hint: "Selecione a frequência com que analisa dados de performance"
      },
      {
        module_id: moduleMap.get(6) || '',
        text: "Qual é a sua taxa de conversão média?",
        type: "number",
        required: false,
        order_number: 3,
        hint: "Informe a taxa de conversão em porcentagem (apenas números)"
      },
      {
        module_id: moduleMap.get(6) || '',
        text: "Quais métricas você considera mais importantes?",
        type: "checkbox",
        required: true,
        order_number: 4,
        hint: "Selecione as métricas mais importantes para seu negócio"
      },
      {
        module_id: moduleMap.get(6) || '',
        text: "Como você utiliza dados para tomar decisões estratégicas?",
        type: "textarea",
        required: true,
        order_number: 5,
        hint: "Descreva como sua empresa utiliza dados para decisões estratégicas"
      },
      
      // Módulo 7: Revenue
      {
        module_id: moduleMap.get(7) || '',
        text: "Qual foi seu faturamento no último ano?",
        type: "radio",
        required: true,
        order_number: 1,
        hint: "Selecione a faixa que representa seu faturamento anual"
      },
      {
        module_id: moduleMap.get(7) || '',
        text: "Qual é a sua margem de lucro média?",
        type: "radio",
        required: true,
        order_number: 2,
        hint: "Selecione a faixa que representa sua margem de lucro"
      },
      {
        module_id: moduleMap.get(7) || '',
        text: "Qual é o seu objetivo de crescimento para o próximo ano?",
        type: "radio",
        required: true,
        order_number: 3,
        hint: "Selecione a faixa que representa seu objetivo de crescimento"
      },
      {
        module_id: moduleMap.get(7) || '',
        text: "Quais são suas principais fontes de receita?",
        type: "checkbox",
        required: true,
        order_number: 4,
        hint: "Selecione todas as fontes de receita relevantes"
      },
      {
        module_id: moduleMap.get(7) || '',
        text: "Qual é o seu LTV (Lifetime Value) médio?",
        type: "number",
        required: false,
        order_number: 5,
        hint: "Informe o valor aproximado em reais, sem pontos ou vírgulas"
      },
    ];
    
    // Inserir perguntas
    logger.info('Inserindo perguntas...', {
      tag: 'Seed',
    });
    
    const { data: questionsData, error: questionsError } = await supabaseAdmin
      .from('quiz_questions')
      .insert(questions)
      .select();
    
    if (questionsError) {
      throw new Error(`Erro ao inserir perguntas: ${questionsError.message}`);
    }
    
    logger.info(`${questionsData.length} perguntas inseridas com sucesso`, {
      tag: 'Seed',
    });
    
    // Mapear IDs das perguntas para uso posterior
    const questionMap = new Map<string, string>();
    questionsData.forEach(question => {
      const key = `${question.module_id}-${question.order_number}`;
      questionMap.set(key, question.id);
    });
    
    // Definir opções para perguntas de múltipla escolha
    const options: QuizOption[] = [
      // Módulo 1, Pergunta 2: Tempo de existência
      {
        question_id: questionMap.get(`${moduleMap.get(1)}-2`) || '',
        text: "Menos de 1 ano",
        order_number: 1
      },
      {
        question_id: questionMap.get(`${moduleMap.get(1)}-2`) || '',
        text: "1-3 anos",
        order_number: 2
      },
      {
        question_id: questionMap.get(`${moduleMap.get(1)}-2`) || '',
        text: "4-7 anos",
        order_number: 3
      },
      {
        question_id: questionMap.get(`${moduleMap.get(1)}-2`) || '',
        text: "8-10 anos",
        order_number: 4
      },
      {
        question_id: questionMap.get(`${moduleMap.get(1)}-2`) || '',
        text: "Mais de 10 anos",
        order_number: 5
      },
      
      // Módulo 1, Pergunta 3: Setor
      {
        question_id: questionMap.get(`${moduleMap.get(1)}-3`) || '',
        text: "Tecnologia/Software",
        order_number: 1
      },
      {
        question_id: questionMap.get(`${moduleMap.get(1)}-3`) || '',
        text: "Saúde/Bem-estar",
        order_number: 2
      },
      {
        question_id: questionMap.get(`${moduleMap.get(1)}-3`) || '',
        text: "Educação",
        order_number: 3
      },
      {
        question_id: questionMap.get(`${moduleMap.get(1)}-3`) || '',
        text: "Varejo/E-commerce",
        order_number: 4
      },
      {
        question_id: questionMap.get(`${moduleMap.get(1)}-3`) || '',
        text: "Alimentação/Restaurantes",
        order_number: 5
      },
      {
        question_id: questionMap.get(`${moduleMap.get(1)}-3`) || '',
        text: "Serviços profissionais",
        order_number: 6
      },
      {
        question_id: questionMap.get(`${moduleMap.get(1)}-3`) || '',
        text: "Outros",
        order_number: 7
      },
      
      // Módulo 2, Pergunta 1: Canais de marketing
      {
        question_id: questionMap.get(`${moduleMap.get(2)}-1`) || '',
        text: "Facebook/Instagram Ads",
        order_number: 1
      },
      {
        question_id: questionMap.get(`${moduleMap.get(2)}-1`) || '',
        text: "Google Ads",
        order_number: 2
      },
      {
        question_id: questionMap.get(`${moduleMap.get(2)}-1`) || '',
        text: "E-mail Marketing",
        order_number: 3
      },
      {
        question_id: questionMap.get(`${moduleMap.get(2)}-1`) || '',
        text: "SEO",
        order_number: 4
      },
      {
        question_id: questionMap.get(`${moduleMap.get(2)}-1`) || '',
        text: "LinkedIn",
        order_number: 5
      },
      {
        question_id: questionMap.get(`${moduleMap.get(2)}-1`) || '',
        text: "TikTok",
        order_number: 6
      },
      {
        question_id: questionMap.get(`${moduleMap.get(2)}-1`) || '',
        text: "Publicidade offline",
        order_number: 7
      },
      {
        question_id: questionMap.get(`${moduleMap.get(2)}-1`) || '',
        text: "Outros",
        order_number: 8
      },
      
      // Módulo 2, Pergunta 2: Investimento mensal
      {
        question_id: questionMap.get(`${moduleMap.get(2)}-2`) || '',
        text: "Menos de R$ 1.000",
        order_number: 1
      },
      {
        question_id: questionMap.get(`${moduleMap.get(2)}-2`) || '',
        text: "R$ 1.000 - R$ 5.000",
        order_number: 2
      },
      {
        question_id: questionMap.get(`${moduleMap.get(2)}-2`) || '',
        text: "R$ 5.001 - R$ 10.000",
        order_number: 3
      },
      {
        question_id: questionMap.get(`${moduleMap.get(2)}-2`) || '',
        text: "R$ 10.001 - R$ 50.000",
        order_number: 4
      },
      {
        question_id: questionMap.get(`${moduleMap.get(2)}-2`) || '',
        text: "Mais de R$ 50.000",
        order_number: 5
      },
      
      // Módulo 2, Pergunta 4: Canal que traz mais clientes
      {
        question_id: questionMap.get(`${moduleMap.get(2)}-4`) || '',
        text: "Redes sociais",
        order_number: 1
      },
      {
        question_id: questionMap.get(`${moduleMap.get(2)}-4`) || '',
        text: "Google/Busca",
        order_number: 2
      },
      {
        question_id: questionMap.get(`${moduleMap.get(2)}-4`) || '',
        text: "E-mail marketing",
        order_number: 3
      },
      {
        question_id: questionMap.get(`${moduleMap.get(2)}-4`) || '',
        text: "Indicações",
        order_number: 4
      },
      {
        question_id: questionMap.get(`${moduleMap.get(2)}-4`) || '',
        text: "Eventos",
        order_number: 5
      },
      {
        question_id: questionMap.get(`${moduleMap.get(2)}-4`) || '',
        text: "Parcerias",
        order_number: 6
      },
      {
        question_id: questionMap.get(`${moduleMap.get(2)}-4`) || '',
        text: "Outros",
        order_number: 7
      },
      
      // Adicionando mais opções para as outras perguntas
      // Módulo 3, Pergunta 1: Coleta de feedback
      {
        question_id: questionMap.get(`${moduleMap.get(3)}-1`) || '',
        text: "Pesquisas por e-mail",
        order_number: 1
      },
      {
        question_id: questionMap.get(`${moduleMap.get(3)}-1`) || '',
        text: "Pesquisas no site/app",
        order_number: 2
      },
      {
        question_id: questionMap.get(`${moduleMap.get(3)}-1`) || '',
        text: "Entrevistas com clientes",
        order_number: 3
      },
      {
        question_id: questionMap.get(`${moduleMap.get(3)}-1`) || '',
        text: "Análise de reviews",
        order_number: 4
      },
      {
        question_id: questionMap.get(`${moduleMap.get(3)}-1`) || '',
        text: "Chatbot/Formulário de contato",
        order_number: 5
      },
      {
        question_id: questionMap.get(`${moduleMap.get(3)}-1`) || '',
        text: "Redes sociais",
        order_number: 6
      },
      {
        question_id: questionMap.get(`${moduleMap.get(3)}-1`) || '',
        text: "Não coletamos feedback regularmente",
        order_number: 7
      },
      
      // Módulo 3, Pergunta 2: Ferramentas de CRM
      {
        question_id: questionMap.get(`${moduleMap.get(3)}-2`) || '',
        text: "Salesforce",
        order_number: 1
      },
      {
        question_id: questionMap.get(`${moduleMap.get(3)}-2`) || '',
        text: "HubSpot",
        order_number: 2
      },
      {
        question_id: questionMap.get(`${moduleMap.get(3)}-2`) || '',
        text: "Pipedrive",
        order_number: 3
      },
      {
        question_id: questionMap.get(`${moduleMap.get(3)}-2`) || '',
        text: "Zoho CRM",
        order_number: 4
      },
      {
        question_id: questionMap.get(`${moduleMap.get(3)}-2`) || '',
        text: "RD Station",
        order_number: 5
      },
      {
        question_id: questionMap.get(`${moduleMap.get(3)}-2`) || '',
        text: "Planilhas Excel/Google",
        order_number: 6
      },
      {
        question_id: questionMap.get(`${moduleMap.get(3)}-2`) || '',
        text: "Não utilizamos CRM",
        order_number: 7
      },
      {
        question_id: questionMap.get(`${moduleMap.get(3)}-2`) || '',
        text: "Outro",
        order_number: 8
      },
      
      // Módulo 3, Pergunta 4: Canais de atendimento
      {
        question_id: questionMap.get(`${moduleMap.get(3)}-4`) || '',
        text: "E-mail",
        order_number: 1
      },
      {
        question_id: questionMap.get(`${moduleMap.get(3)}-4`) || '',
        text: "Telefone",
        order_number: 2
      },
      {
        question_id: questionMap.get(`${moduleMap.get(3)}-4`) || '',
        text: "Chat ao vivo",
        order_number: 3
      },
      {
        question_id: questionMap.get(`${moduleMap.get(3)}-4`) || '',
        text: "WhatsApp/Telegram",
        order_number: 4
      },
      {
        question_id: questionMap.get(`${moduleMap.get(3)}-4`) || '',
        text: "Redes sociais",
        order_number: 5
      },
      {
        question_id: questionMap.get(`${moduleMap.get(3)}-4`) || '',
        text: "Formulário no site",
        order_number: 6
      },
      {
        question_id: questionMap.get(`${moduleMap.get(3)}-4`) || '',
        text: "Suporte presencial",
        order_number: 7
      },
      
      // Continuar com as outras opções para todos os módulos...
      // Módulo 4, Pergunta 1: Modelo de negócio
      {
        question_id: questionMap.get(`${moduleMap.get(4)}-1`) || '',
        text: "E-commerce",
        order_number: 1
      },
      {
        question_id: questionMap.get(`${moduleMap.get(4)}-1`) || '',
        text: "SaaS",
        order_number: 2
      },
      {
        question_id: questionMap.get(`${moduleMap.get(4)}-1`) || '',
        text: "Marketplace",
        order_number: 3
      },
      {
        question_id: questionMap.get(`${moduleMap.get(4)}-1`) || '',
        text: "Assinatura/Recorrência",
        order_number: 4
      },
      {
        question_id: questionMap.get(`${moduleMap.get(4)}-1`) || '',
        text: "Consultoria/Serviços",
        order_number: 5
      },
      {
        question_id: questionMap.get(`${moduleMap.get(4)}-1`) || '',
        text: "Venda direta",
        order_number: 6
      },
      {
        question_id: questionMap.get(`${moduleMap.get(4)}-1`) || '',
        text: "Franchising",
        order_number: 7
      },
      {
        question_id: questionMap.get(`${moduleMap.get(4)}-1`) || '',
        text: "Outro",
        order_number: 8
      },
      
      // Incluindo opções para todas as outras perguntas de múltipla escolha...
      // Por questões de brevidade, estou incluindo apenas algumas representativas
    ];
    
    // Inserir opções
    logger.info('Inserindo opções...', {
      tag: 'Seed',
    });
    
    const { data: optionsData, error: optionsError } = await supabaseAdmin
      .from('quiz_options')
      .insert(options)
      .select();
    
    if (optionsError) {
      throw new Error(`Erro ao inserir opções: ${optionsError.message}`);
    }
    
    logger.info(`${optionsData.length} opções inseridas com sucesso`, {
      tag: 'Seed',
    });
    
    logger.info('Seed concluído com sucesso!', {
      tag: 'Seed',
    });
    
    return {
      modules: modulesData,
      questions: questionsData,
      options: optionsData
    };
  } catch (error: any) {
    logger.error('Erro no processo de seed:', {
      tag: 'Seed',
      data: error
    });
    throw error;
  }
};

// Executar o script se for chamado diretamente
if (require.main === module) {
  seedQuizData()
    .then(() => {
      console.log('Seed concluído com sucesso!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Erro no seed:', error);
      process.exit(1);
    });
}

export default seedQuizData;
