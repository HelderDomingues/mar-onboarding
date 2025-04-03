
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

type AsaasCustomer = {
  id: string;
  email: string;
  name: string;
  cpfCnpj: string;
  phone?: string;
  mobilePhone?: string;
};

type ImportResult = {
  success: string[];
  failure: string[];
  message: string;
};

export function ImportUsers() {
  const { toast } = useToast();
  const [csvData, setCsvData] = useState<string>("");
  const [manualData, setManualData] = useState({
    email: "",
    name: "",
    cpfCnpj: "",
    phone: "",
    asaasId: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvData(event.target?.result as string || "");
    };
    reader.readAsText(file);
  };

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
      
      // Skip header row
      for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue; // Skip empty rows
        
        const values = rows[i].split(',').map(v => v.trim());
        const customer: Partial<AsaasCustomer> = {};
        
        // Map values to keys based on header positions
        headers.forEach((header, index) => {
          if (values[index] !== undefined) {
            customer[header as keyof AsaasCustomer] = values[index];
          }
        });
        
        // Check if we have required fields
        if (!customer.email || !customer.name || !customer.cpfCnpj) {
          importResults.failure.push(`Linha ${i+1}: dados incompletos`);
          continue;
        }
        
        // Call the function to create or update the user
        try {
          const { data, error } = await supabase.rpc('import_user_from_asaas', {
            p_email: customer.email,
            p_nome: customer.name,
            p_cpf_cnpj: customer.cpfCnpj,
            p_telefone: customer.phone || customer.mobilePhone || "",
            p_asaas_id: customer.id || ""
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
        variant: importResults.failure.length > 0 ? "default" : "success"
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
  
  const handleManualImport = async () => {
    if (!manualData.email || !manualData.name || !manualData.cpfCnpj) {
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
        p_email: manualData.email,
        p_nome: manualData.name,
        p_cpf_cnpj: manualData.cpfCnpj,
        p_telefone: manualData.phone,
        p_asaas_id: manualData.asaasId,
        p_password: manualData.password || undefined
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "Usuário importado",
        description: `${manualData.name} (${manualData.email}) foi importado com sucesso.`,
        variant: "success"
      });
      
      // Limpar o formulário
      setManualData({
        email: "",
        name: "",
        cpfCnpj: "",
        phone: "",
        asaasId: "",
        password: ""
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
                    component="span"
                  >
                    Selecionar arquivo
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
          
          {result && (
            <div className="space-y-4">
              <Alert variant={result.failure.length > 0 ? "default" : "success"}>
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
          )}
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
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email*
                    </label>
                    <Input
                      id="email"
                      value={manualData.email}
                      onChange={(e) => setManualData({...manualData, email: e.target.value})}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Nome completo*
                    </label>
                    <Input
                      id="name"
                      value={manualData.name}
                      onChange={(e) => setManualData({...manualData, name: e.target.value})}
                      placeholder="Nome do Usuário"
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
                      value={manualData.cpfCnpj}
                      onChange={(e) => setManualData({...manualData, cpfCnpj: e.target.value})}
                      placeholder="Somente números"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">
                      Telefone
                    </label>
                    <Input
                      id="phone"
                      value={manualData.phone}
                      onChange={(e) => setManualData({...manualData, phone: e.target.value})}
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
                      value={manualData.asaasId}
                      onChange={(e) => setManualData({...manualData, asaasId: e.target.value})}
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
                      value={manualData.password}
                      onChange={(e) => setManualData({...manualData, password: e.target.value})}
                      placeholder="Deixe em branco para gerar automaticamente"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Se não for fornecida, uma senha aleatória será gerada
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleManualImport} 
                disabled={isLoading}
                className="w-full"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {isLoading ? "Importando..." : "Importar Usuário"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
