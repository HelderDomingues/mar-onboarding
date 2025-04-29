
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, AlertTriangle, Info } from "lucide-react";
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type ConfigResult = {
  success?: boolean;
  message?: string;
  detalhes?: string;
  codigo?: string;
};

export interface ServiceRoleConfigProps {
  onConfigure?: (key: string) => Promise<void>;
  onCancel?: () => void;
  isConfiguring?: boolean;
  serviceRoleKey?: string;
  setServiceRoleKey?: (key: string) => void;
  configResult?: ConfigResult | null;
}

export const ServiceRoleConfig = ({
  onConfigure = async () => {},
  onCancel = () => {},
  isConfiguring = false,
  serviceRoleKey = '',
  setServiceRoleKey = () => {},
  configResult = null
}: ServiceRoleConfigProps) => {
  return (
    <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
      <h3 className="font-medium mb-2">Configurar chave service_role do Supabase</h3>
      <p className="text-sm mb-4">
        Para acessar os emails dos usuários, insira a chave service_role do seu projeto Supabase.
        Esta chave pode ser encontrada no painel do Supabase em Configurações do Projeto &gt; API.
      </p>
      
      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="service-role-key">Chave service_role</Label>
          <Input 
            id="service-role-key"
            value={serviceRoleKey}
            onChange={(e) => setServiceRoleKey(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground mt-1">
            A chave deve começar com "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" e ter 3 seções separadas por pontos.
          </p>
        </div>
        
        {configResult && (
          <Alert 
            variant={configResult.success ? "default" : "destructive"}
            className={configResult.success ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"}
          >
            {configResult.success ? (
              <Info className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertTitle>{configResult.success ? "Sucesso" : "Erro"}</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{configResult.message}</p>
              {configResult.detalhes && (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="details">
                    <AccordionTrigger className="text-sm py-2">
                      Ver detalhes técnicos
                    </AccordionTrigger>
                    <AccordionContent className="text-sm bg-gray-50 p-3 rounded border">
                      <div className="space-y-2">
                        <p><strong>Detalhes:</strong> {configResult.detalhes}</p>
                        {configResult.codigo && (
                          <p><strong>Código de erro:</strong> {configResult.codigo}</p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={isConfiguring}>
            Cancelar
          </Button>
          <Button 
            onClick={() => onConfigure(serviceRoleKey)}
            disabled={isConfiguring || !serviceRoleKey.trim()}
          >
            {isConfiguring ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Configurando...
              </>
            ) : (
              "Salvar configuração"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceRoleConfig;
