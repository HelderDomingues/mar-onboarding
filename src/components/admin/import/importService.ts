
import { supabase } from "@/integrations/supabase/client";
import { ImportResult, ManualImportFormData } from "./AsaasTypes";
import { useToast } from "@/components/ui/use-toast";

export const processCsvImport = async (csvData: string): Promise<ImportResult> => {
  if (!csvData.trim()) {
    throw new Error("Por favor, carregue um arquivo CSV válido.");
  }

  const rows = csvData.split('\n');
  const headers = rows[0].split(',').map(h => h.trim());
  
  // Validar colunas necessárias
  const requiredColumns = ['email', 'name', 'cpfCnpj'];
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  if (missingColumns.length > 0) {
    throw new Error(`Colunas obrigatórias ausentes: ${missingColumns.join(', ')}`);
  }
  
  // Processar cada linha do CSV
  const importResults: { success: string[], failure: string[] } = {
    success: [],
    failure: []
  };
  
  // Pular a linha de cabeçalho
  for (let i = 1; i < rows.length; i++) {
    if (!rows[i].trim()) continue; // Pular linhas vazias
    
    const values = rows[i].split(',').map(v => v.trim());
    const customer: Record<string, string> = {};
    
    // Mapear valores para chaves baseado nas posições dos cabeçalhos
    headers.forEach((header, index) => {
      if (values[index] !== undefined) {
        customer[header] = values[index];
      }
    });
    
    // Verificar se temos os campos obrigatórios
    if (!customer.email || !customer.name || !customer.cpfCnpj) {
      importResults.failure.push(`Linha ${i+1}: dados incompletos`);
      continue;
    }
    
    // Chamar a função para criar ou atualizar o usuário
    try {
      const { data, error } = await supabase.rpc('import_user_from_asaas', {
        p_email: customer.email,
        p_nome: customer.name,
        p_cpf_cnpj: customer.cpfCnpj,
        p_telefone: customer.phone || customer.mobilePhone || '',
        p_asaas_id: customer.id || ''
      });
      
      if (error) {
        importResults.failure.push(`${customer.email}: ${error.message}`);
      } else {
        importResults.success.push(customer.email);
      }
    } catch (error: any) {
      importResults.failure.push(`${customer.email}: ${error.message}`);
    }
  }
  
  return {
    success: importResults.success,
    failure: importResults.failure,
    message: `Importação concluída: ${importResults.success.length} usuários importados com sucesso e ${importResults.failure.length} falhas.`
  };
};

export const processManualImport = async (formData: ManualImportFormData) => {
  if (!formData.email || !formData.name || !formData.cpfCnpj) {
    throw new Error("Email, nome e CPF/CNPJ são obrigatórios.");
  }
  
  const { data, error } = await supabase.rpc('import_user_from_asaas', {
    p_email: formData.email,
    p_nome: formData.name,
    p_cpf_cnpj: formData.cpfCnpj,
    p_telefone: formData.phone || '',
    p_asaas_id: formData.asaasId || '',
    p_password: formData.password || null
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return {
    success: true,
    message: `${formData.name} (${formData.email}) foi importado com sucesso.`
  };
};
