import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, X } from "lucide-react";
import { useViewAsUser } from "@/contexts/ViewAsUserContext";

export const ViewAsUserBanner: React.FC = () => {
  const { isViewingAsUser, disableViewAsUser } = useViewAsUser();

  if (!isViewingAsUser) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-center gap-3 shadow-md">
      <Eye className="h-4 w-4 flex-shrink-0" />
      <span className="text-sm font-medium">
        Modo Visualização como Usuário ativo
      </span>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 px-2 text-amber-950 hover:bg-amber-600 hover:text-amber-950"
        onClick={disableViewAsUser}
      >
        <X className="h-4 w-4 mr-1" />
        Sair
      </Button>
    </div>
  );
};
