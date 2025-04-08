import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatHeaderProps } from "./types";

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  paciente,
  isLoadingHistory,
  patientJidForHistory,
  patientJidForSending,
  fetchChatHistory
}) => {
  return (
    <div className="px-1 pb-2 border-b mb-3 flex justify-between items-center shrink-0">
      <div>
        <h3 className="text-lg font-medium">Chat WhatsApp</h3>
        <p className="text-sm text-muted-foreground">{paciente?.nome || "Nenhum paciente selecionado"}</p>
        <p className="text-xs text-muted-foreground">
          Número: {paciente?.telefone || "Não informado"} {patientJidForSending ? `(${patientJidForSending.split('@')[0]})` : '(Inválido)'}
        </p>
      </div>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => fetchChatHistory(true)} 
        disabled={isLoadingHistory || !patientJidForHistory} 
        title="Atualizar Histórico"
      >
        <RefreshCw className={cn("h-4 w-4", isLoadingHistory && "animate-spin")} />
      </Button>
    </div>
  );
};
