
// Tipos para dados do Asaas
export type AsaasCustomer = {
  id: string;
  email: string;
  name: string;
  cpfCnpj: string;
  phone?: string;
  mobilePhone?: string;
};

// Tipo para os resultados da importação
export type ImportResult = {
  success: string[];
  failure: string[];
  message: string;
};

export type ManualImportFormData = {
  email: string;
  name: string;
  cpfCnpj: string;
  phone: string;
  asaasId: string;
  password: string;
};
