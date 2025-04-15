
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UploadCloud, FileInput } from "lucide-react";

interface CsvImportProps {
  onImport: (csvData: string) => void;
}

export const CsvImport = ({ onImport }: CsvImportProps) => {
  const [csvData, setCsvData] = useState<string>("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result as string || "";
      setCsvData(data);
      onImport(data);
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
