
/**
 * Interface para o formulário de importação manual
 */
export interface ManualImportFormData {
  email: string;
  name: string;
  cpfCnpj: string;
  phone: string;
  asaasId: string;
  password: string;
}

/**
 * Interface para resultado de importação
 */
export interface ImportResult {
  success: boolean;
  inserted: number;
  errors: {
    email: string;
    error: string;
  }[];
  message: string;
}
