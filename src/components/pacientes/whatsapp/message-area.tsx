import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MessageAreaProps } from "./types";
import { safeFormatDate } from "./utils";

export const MessageArea: React.FC<MessageAreaProps> = ({
  isLoadingHistory,
  historyError,
  chatMessages,
  renderMessageContent,
  renderMessageTicks
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change or when loading completes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isLoadingHistory]);

  return (
    <div className="flex-grow overflow-hidden relative">
      <ScrollArea className="h-full pr-4">
        <div className="space-y-4 p-4 pb-8">
          {isLoadingHistory && (
            <div className="text-center text-muted-foreground py-10">
              <Loader2 className="h-5 w-5 animate-spin inline mr-2" /> Carregando histórico...
            </div>
          )}
          
          {historyError && !isLoadingHistory && (
            <div className="text-center text-destructive py-10 px-2 break-words">
              Erro ao carregar histórico: {historyError}
            </div>
          )}
          
          {!isLoadingHistory && !historyError && chatMessages.length === 0 && (
            <div className="text-center text-muted-foreground py-10">
              Nenhuma mensagem encontrada.
            </div>
          )}
          
          {!isLoadingHistory && !historyError && chatMessages.map((msg) => (
            <div 
              key={msg.key.id + msg.messageTimestamp} 
              className={cn("flex", msg.key.fromMe ? "justify-end" : "justify-start")}
            >
              <div 
                className={cn(
                  "rounded-lg py-2 px-3 max-w-[75%] shadow-sm text-left",
                  msg.key.fromMe ? "bg-primary/90 text-primary-foreground" : "bg-background border"
                )}
              >
                {renderMessageContent(msg)}
                <div 
                  className={cn(
                    "text-xs mt-1 flex items-center gap-1", 
                    msg.key.fromMe ? "text-primary-foreground/80 justify-end" : "text-muted-foreground justify-end"
                  )}
                >
                  <span>{safeFormatDate(msg.messageTimestamp, "HH:mm")}</span>
                  {renderMessageTicks(msg)}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
};
