
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud, AlertCircle, CheckCircle2, UserPlus, FileInput } from "lucide-react";

// Tipos para dados do Asaas
type AsaasCustomer = {
  id: string;
  email: string;
  name: string;
  cpfCnpj: string;
  phone?: string;
  mobilePhone?: string;
};

// Tipo para os resultados da importação
type ImportResult = {
  success: string[];
  failure: string[];
  message: string;
};

// Componente para importação via CSV
const CsvImport = ({ onImport }: { onImport: (csvData: string) => void }) => {
  const [csvData, setCsvData] = useState<string>("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvData(event.target?.result as string || "");
      onImport(event.target?.result as string || "");
    };
    reader.readAsText(file);
  };

  return (
    <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
      <UploadCloud className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
      <p className="text-sm mb-2">
        Arraste e solte o arquivo CSV aqui ou clique para selecionar
      </p>
      
      <Input
        id="csv-upload"
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileUpload}
      />
      
      <label htmlFor="csv-upload">
        <Button
          variant="outline"
          className="mt-2"
          asChild
        >
          <span>Selecionar arquivo</span>
        </Button>
      </label>
      
      {csvData && (
        <div className="mt-4 text-left">
          <Alert className="bg-muted/40">
            <FileInput className="h-4 w-4" />
            <AlertTitle>Arquivo carregado</AlertTitle>
            <AlertDescription>
              {csvData.split('\n').length - 1} registros detectados
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

// Componente para importação manual
const ManualImport = ({ onSubmit, isLoading }: { onSubmit: (formData: any) => void, isLoading: boolean }) => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    cpfCnpj: "",
    phone: "",
    asaasId: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email*
            </label>
            <Input
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@exemplo.com"
              required
            />
          </div>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nome completo*
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nome do Usuário"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cpfCnpj" className="block text-sm font-medium mb-1">
              CPF/CNPJ*
            </label>
            <Input
              id="cpfCnpj"
              value={formData.cpfCnpj}
              onChange={handleChange}
              placeholder="Somente números"
              required
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Telefone
            </label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="asaasId" className="block text-sm font-medium mb-1">
              ID do Asaas
            </label>
            <Input
              id="asaasId"
              value={formData.asaasId}
              onChange={handleChange}
              placeholder="ID do cliente no Asaas (opcional)"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Senha (opcional)
            </label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Deixe em branco para gerar automaticamente"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Se não for fornecida, uma senha aleatória será gerada
            </p>
          </div>
        </div>
      </div>
      
      <Button 
        type="submit"
        disabled={isLoading}
        className="w-full mt-4"
      >
        <UserPlus className="mr-2 h-4 w-4" />
        {isLoading ? "Importando..." : "Importar Usuário"}
      </Button>
    </form>
  );
};

// Componente para exibir resultados da importação
const ImportResults = ({ result }: { result: ImportResult | null }) => {
  if (!result) return null;

  return (
    <div className="space-y-4">
      <Alert variant={result.failure.length > 0 ? "default" : "default"}>
        {result.failure.length > 0 ? (
          <AlertCircle className="h-4 w-4" />
        ) : (
          <CheckCircle2 className="h-4 w-4" />
        )}
        <AlertTitle>Resultado da Importação</AlertTitle>
        <AlertDescription>{result.message}</AlertDescription>
      </Alert>
      
      {result.failure.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Erros de importação</CardTitle>
            <CardDescription>
              Lista de usuários que não puderam ser importados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-40 overflow-y-auto">
              {result.failure.map((error, idx) => (
                <div key={idx} className="py-2 border-b last:border-0">
                  {error}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Componente principal ImportUsers
export function ImportUsers() {
  const { toast } = useToast();
  const [csvData, setCsvData] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const processCsvData = async () => {
    if (!csvData.trim()) {
      toast({
        variant: "destructive",
        title: "Dados inválidos",
        description: "Por favor, carregue um arquivo CSV válido."
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
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
        const customer: Partial<AsaasCustomer> = {};
        
        // Mapear valores para chaves baseado nas posições dos cabeçalhos
        headers.forEach((header, index) => {
          if (values[index] !== undefined) {
            customer[header as keyof AsaasCustomer] = values[index];
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
      
      // Mostrar resultado
      setResult({
        success: importResults.success,
        failure: importResults.failure,
        message: `Importação concluída: ${importResults.success.length} usuários importados com sucesso e ${importResults.failure.length} falhas.`
      });
      
      toast({
        title: "Importação concluída",
        description: `${importResults.success.length} usuários importados com sucesso e ${importResults.failure.length} falhas.`,
        variant: "default"
      });
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro na importação",
        description: error.message || "Ocorreu um erro ao processar o arquivo CSV."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleManualImport = async (formData: any) => {
    if (!formData.email || !formData.name || !formData.cpfCnpj) {
      toast({
        variant: "destructive",
        title: "Dados incompletos",
        description: "Email, nome e CPF/CNPJ são obrigatórios."
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
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
      
      toast({
        title: "Usuário importado",
        description: `${formData.name} (${formData.email}) foi importado com sucesso.`,
        variant: "default"
      });
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao importar usuário",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Importação de Usuários do Asaas</h1>
        <p className="text-muted-foreground mt-1">
          Importe usuários do Asaas para criar contas e vincular dados automaticamente.
        </p>
      </div>

      <Tabs defaultValue="csv" className="space-y-6">
        <TabsList>
          <TabsTrigger value="csv">Importar CSV</TabsTrigger>
          <TabsTrigger value="manual">Importação Manual</TabsTrigger>
        </TabsList>
        
        <TabsContent value="csv" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Importar dados via CSV</CardTitle>
              <CardDescription>
                Carregue um arquivo CSV exportado do Asaas para importar vários usuários de uma vez.
                O arquivo deve conter no mínimo as colunas: email, name e cpfCnpj.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CsvImport onImport={setCsvData} />
            </CardContent>
            <CardFooter>
              <Button 
                onClick={processCsvData} 
                disabled={isLoading || !csvData}
                className="w-full"
              >
                {isLoading ? "Processando..." : "Importar Usuários"}
              </Button>
            </CardFooter>
          </Card>
          
          <ImportResults result={result} />
        </TabsContent>
        
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Importação Manual</CardTitle>
              <CardDescription>
                Adicione um usuário manualmente preenchendo os campos abaixo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ManualImport onSubmit={handleManualImport} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
