
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { ImportResult } from "./AsaasTypes";

interface ImportResultsProps {
  result: ImportResult | null;
}

export const ImportResults = ({ result }: ImportResultsProps) => {
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
