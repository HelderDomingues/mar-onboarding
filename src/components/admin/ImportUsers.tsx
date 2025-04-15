
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CsvImport } from "./import/CsvImport";
import { ManualImport } from "./import/ManualImport";
import { ImportResults } from "./import/ImportResults";
import { ImportResult, ManualImportFormData } from "./import/AsaasTypes";
import { processCsvImport, processManualImport } from "./import/importService";

// Componente principal ImportUsers
export function ImportUsers() {
  const { toast } = useToast();
  const [csvData, setCsvData] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleProcessCsvData = async () => {
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
      const importResult = await processCsvImport(csvData);
      setResult(importResult);
      
      toast({
        title: "Importação concluída",
        description: importResult.message,
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
  
  const handleManualImport = async (formData: ManualImportFormData) => {
    setIsLoading(true);
    
    try {
      const result = await processManualImport(formData);
      
      toast({
        title: "Usuário importado",
        description: result.message,
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
                onClick={handleProcessCsvData} 
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
