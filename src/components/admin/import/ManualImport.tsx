
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserPlus } from "lucide-react";
import { ManualImportFormData } from "./AsaasTypes";

interface ManualImportProps {
  onSubmit: (formData: ManualImportFormData) => void;
  isLoading: boolean;
}

export const ManualImport = ({ onSubmit, isLoading }: ManualImportProps) => {
  const [formData, setFormData] = useState<ManualImportFormData>({
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
