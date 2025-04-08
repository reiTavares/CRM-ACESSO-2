import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { ApiConfig, useApiConfig } from "@/contexts/ApiConfigContext";
import { PacienteData } from "@/components/pacientes/paciente-card";
import { WhatsappMessage, WhatsappHookReturn } from "./types";
import { formatPhoneNumberToJid, formatJidForHistory, safeFormatDate } from "./utils";
import {
  fetchChatHistory,
  sendMessage,
  sendMedia,
  sendDocument,
  EvolutionApiError
} from "@/lib/evolution-api";
import { Check } from "lucide-react";

export const useWhatsappChat = (
  paciente: PacienteData | null,
  isActiveTab: boolean
): WhatsappHookReturn => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSendingMedia, setIsSendingMedia] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [chatMessages, setChatMessages] = useState<WhatsappMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const { toast } = useToast();
  const { apiConfig } = useApiConfig();

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const patientJidForSending = paciente ? formatPhoneNumberToJid(paciente.telefone) : null;
  const patientJidForHistory = formatJidForHistory(patientJidForSending);

  const fetchChatHistoryHandler = useCallback(async (showLoadingToast = false) => {
    if (!patientJidForHistory) {
      setHistoryError("Número de telefone do paciente inválido ou não formatado corretamente para buscar histórico.");
      setChatMessages([]);
      setIsLoadingHistory(false);
      return;
    }
    if (!apiConfig?.apiUrl || !apiConfig?.apiKey || !apiConfig?.apiInstance) {
      setHistoryError("Configuração da API (URL, Chave, Instância) não encontrada ou inválida.");
      setChatMessages([]);
      setIsLoadingHistory(false);
      return;
    }

    setIsLoadingHistory(true);
    setHistoryError(null);
    if (showLoadingToast) {
      toast({ title: "Buscando histórico..." });
    }

    try {
      console.log(`[WhatsappChat] Fetching history via service for formatted JID: ${patientJidForHistory}`);
      const messages = await fetchChatHistory(apiConfig, patientJidForHistory);
      setChatMessages(messages);

      if (messages.length === 0) {
        toast({ title: "Histórico Vazio", description: "Nenhuma mensagem encontrada para este contato." });
      } else {
        toast({ title: "Histórico carregado." });
      }

    } catch (error: any) {
      console.error("[WhatsappChat] Error fetching chat history via service:", error);
      const errorMessage = error instanceof EvolutionApiError ? error.message : "Não foi possível buscar o histórico.";
      setHistoryError(errorMessage);
      toast({ variant: "destructive", title: "Erro ao Buscar Histórico", description: errorMessage });
    } finally {
      setIsLoadingHistory(false);
    }
  }, [patientJidForHistory, apiConfig, toast]);

  useEffect(() => {
    if (isActiveTab && paciente?.id && apiConfig?.apiInstance && patientJidForHistory) {
      console.log(`[WhatsappChat] Tab active for ${paciente.id}. Fetching history with config:`, apiConfig);
      fetchChatHistoryHandler(true);
    } else {
      setChatMessages([]);
      setHistoryError(null);
      setIsLoadingHistory(false);
    }
  }, [isActiveTab, paciente?.id, apiConfig?.apiInstance, patientJidForHistory, fetchChatHistoryHandler]);

  const handleSendMessage = async () => {
    if (!message.trim() || isSending || !patientJidForSending || isRecording) return;
    if (!apiConfig?.apiUrl || !apiConfig?.apiKey || !apiConfig?.apiInstance) {
      toast({ variant: "destructive", title: "Erro de Configuração", description: "Configuração da API inválida." });
      return;
    }

    setIsSending(true);
    toast({ title: "Enviando Mensagem..." });

    try {
      console.log(`[WhatsappChat] Sending message via service to JID: ${patientJidForSending}`);
      await sendMessage(apiConfig, patientJidForSending, message);
      toast({ title: "Mensagem Enviada!", description: `Para: ${paciente?.telefone}` });
      setMessage("");
      setTimeout(() => fetchChatHistoryHandler(), 1500);
    } catch (error: any) {
      console.error("[WhatsappChat] Error sending message via service:", error);
      const errorMessage = error instanceof EvolutionApiError ? error.message : "Não foi possível enviar a mensagem.";
      toast({ variant: "destructive", title: "Erro ao Enviar", description: errorMessage });
    } finally {
      setIsSending(false);
    }
  };

  const sendFileHandler = async (file: File, type: 'image' | 'video' | 'audio' | 'document') => {
    if (!patientJidForSending || isSendingMedia || isRecording || !apiConfig?.apiUrl || !apiConfig?.apiKey || !apiConfig?.apiInstance) return;

    setIsSendingMedia(true);
    toast({ title: `Enviando ${type}...` });

    try {
      console.log(`[WhatsappChat] Sending ${type} via service to JID: ${patientJidForSending}`);
      if (type === 'image' || type === 'video' || type === 'audio') {
        await sendMedia(apiConfig, patientJidForSending, file);
      } else {
        await sendDocument(apiConfig, patientJidForSending, file);
      }
      toast({ title: `${capitalize(type)} Enviado!`, description: `Para: ${paciente?.telefone}` });
      setTimeout(() => fetchChatHistoryHandler(), 1500);
    } catch (error: any) {
      console.error(`[WhatsappChat] Error sending ${type} via service:`, error);
      const errorMessage = error instanceof EvolutionApiError ? error.message : `Não foi possível enviar o ${type}.`;
      toast({ variant: "destructive", title: `Erro ao Enviar ${capitalize(type)}`, description: errorMessage });
    } finally {
      setIsSendingMedia(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
      if (audioInputRef.current) audioInputRef.current.value = "";
      if (documentInputRef.current) documentInputRef.current.value = "";
    }
  };

  const handleStartRecording = async () => {
    if (isRecording || !patientJidForSending) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({ variant: "destructive", title: "Erro", description: "Gravação de áudio não suportada." });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/ogg; codecs=opus') ? 'audio/ogg; codecs=opus' : 'audio/webm';
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const fileExtension = mimeType.includes('ogg') ? 'ogg' : 'webm';
        const audioFile = new File([audioBlob], `audio_gravado_${Date.now()}.${fileExtension}`, { type: mimeType });
        sendFileHandler(audioFile, 'audio');
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      };
      mediaRecorderRef.current.onerror = (event) => { console.error("[WhatsappChat] MediaRecorder error:", event); toast({ variant: "destructive", title: "Erro na Gravação" }); setIsRecording(false); stream.getTracks().forEach(track => track.stop()); };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast({ title: "Gravando áudio..." });
    } catch (err: any) {
      console.error("[WhatsappChat] Error accessing microphone:", err);
      let description = "Não foi possível acessar o microfone.";
      if (err.name === 'NotAllowedError') description = "Permissão negada.";
      else if (err.name === 'NotFoundError') description = "Microfone não encontrado.";
      toast({ variant: "destructive", title: "Erro de Microfone", description });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleAttachmentClick = (type: 'image' | 'video' | 'audio' | 'document') => {
    if (isRecording || isSendingMedia) return;
    switch (type) {
      case 'image': imageInputRef.current?.click(); break;
      case 'video': videoInputRef.current?.click(); break;
      case 'audio': audioInputRef.current?.click(); break;
      case 'document': documentInputRef.current?.click(); break;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'audio' | 'document') => {
    const file = event.target.files?.[0];
    if (file) {
      sendFileHandler(file, type);
    }
  };

  const renderMessageContent = (msg: WhatsappMessage) => {
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    if (text) {
      const parts = text.split(/(\s+)/);
      return (
        <p className="text-sm whitespace-pre-wrap break-words">
          {parts.map((part, index) => {
            if (part.startsWith('http://') || part.startsWith('https://')) {
              return <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{part}</a>;
            }
            return part;
          })}
        </p>
      );
    }
    if (msg.message?.imageMessage) { 
      return <p className="text-sm italic text-gray-400">[Imagem]{msg.message.imageMessage.caption ? `: ${msg.message.imageMessage.caption}` : ''}</p>; 
    }
    if (msg.message?.videoMessage) { 
      return <p className="text-sm italic text-gray-400">[Vídeo]{msg.message.videoMessage.caption ? `: ${msg.message.videoMessage.caption}` : ''}</p>; 
    }
    if (msg.message?.audioMessage) { 
      return <p className="text-sm italic text-gray-400">[Áudio]{msg.message.audioMessage.ptt ? ' (PTT)' : ''}</p>; 
    }
    if (msg.message?.documentMessage) { 
      return <p className="text-sm italic text-gray-400">[Documento: {msg.message.documentMessage.title || 'arquivo'}]</p>; 
    }
    console.log("[WhatsappChat] Unsupported message type:", msg.message ? Object.keys(msg.message) : 'No message content');
    return <p className="text-sm italic text-gray-500">[Tipo de mensagem não suportado]</p>;
  };

  const renderMessageTicks = (msg: WhatsappMessage) => {
    if (!msg.key.fromMe || msg.ack === undefined || msg.ack < 1) return null;
    const tickColor = msg.ack === 3 ? "text-blue-400" : "text-primary-foreground/80";
    return (
      <>
        <Check className={`h-3.5 w-3.5 ${tickColor} ${msg.ack < 2 ? "opacity-60" : ""}`} />
        {msg.ack >= 2 && (<Check className={`h-3.5 w-3.5 -ml-2.5 ${tickColor}`} />)}
      </>
    );
  };

  return {
    message,
    setMessage,
    isSending,
    isSendingMedia,
    isRecording,
    chatMessages,
    isLoadingHistory,
    historyError,
    patientJidForSending,
    patientJidForHistory,
    imageInputRef,
    videoInputRef,
    audioInputRef,
    documentInputRef,
    fetchChatHistoryHandler,
    handleSendMessage,
    sendFileHandler,
    handleStartRecording,
    handleStopRecording,
    handleAttachmentClick,
    handleFileChange,
    renderMessageContent,
    renderMessageTicks
  };
};
