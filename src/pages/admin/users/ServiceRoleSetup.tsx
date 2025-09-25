
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ServiceRoleConfig } from "@/components/admin/ServiceRoleConfig";
import { AlertTriangle } from "lucide-react";
import { ConfigResult } from "@/types/admin";

interface ServiceRoleSetupProps {
  error: string | null;
  setupEmailAccess: () => void;
  handleConfigureEmailAccess: () => Promise<void>;
  handleCancelConfig: () => void;
  isConfiguring: boolean;
  serviceRoleKey: string;
  setServiceRoleKey: (key: string) => void;
  configResult: ConfigResult | null;
  showConfigForm: boolean;
}

export const ServiceRoleSetup = ({
  error,
  setupEmailAccess,
  handleConfigureEmailAccess,
  handleCancelConfig,
  isConfiguring,
  serviceRoleKey,
  setServiceRoleKey,
  configResult,
  showConfigForm
}: ServiceRoleSetupProps) => {
  if (!error && !showConfigForm) return null;

  return (
    <>
      {error && (
        <Alert variant="warning" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atenção</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={setupEmailAccess} className="text-amber-800 hover:bg-amber-100">
              Configurar acesso aos emails
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {showConfigForm && (
        <ServiceRoleConfig
          onConfigure={handleConfigureEmailAccess}
          onCancel={handleCancelConfig}
          isConfiguring={isConfiguring}
          serviceRoleKey={serviceRoleKey}
          setServiceRoleKey={setServiceRoleKey}
          configResult={configResult}
        />
      )}
    </>
  );
};
