import { ApiConfig } from "@/contexts/ApiConfigContext";
import { PacienteData } from "@/components/pacientes/paciente-card";

export interface WhatsappChatProps {
  paciente: PacienteData | null;
  isActiveTab: boolean; // To trigger fetch only when tab is active
}

export interface WhatsappMessage {
  id?: string;
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
    participant?: string;
  };
  messageTimestamp: number; // Unix timestamp (seconds)
  message?: {
    conversation?: string;
    extendedTextMessage?: { text: string };
    imageMessage?: { caption?: string; mimetype?: string; mediaUrl?: string; };
    videoMessage?: { caption?: string; mimetype?: string; mediaUrl?: string; };
    audioMessage?: { mimetype?: string; mediaUrl?: string; ptt?: boolean; };
    documentMessage?: { title?: string; mimetype?: string; mediaUrl?: string; };
  };
  ack?: number; // 0: pending, 1: sent (server ack), 2: delivered (device ack), 3: read (read ack)
  pushName?: string;
  messageType?: string;
  instanceId?: string;
  source?: string;
  contextInfo?: any;
  MessageUpdate?: any[];
}

export interface ChatHeaderProps {
  paciente: PacienteData | null;
  isLoadingHistory: boolean;
  patientJidForHistory: string | null;
  patientJidForSending: string | null;
  fetchChatHistory: (showLoadingToast?: boolean) => Promise<void>;
}

export interface MessageAreaProps {
  isLoadingHistory: boolean;
  historyError: string | null;
  chatMessages: WhatsappMessage[];
  renderMessageContent: (msg: WhatsappMessage) => React.ReactNode;
  renderMessageTicks: (msg: WhatsappMessage) => React.ReactNode;
}

export interface InputAreaProps {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  isRecording: boolean;
  isSending: boolean;
  isSendingMedia: boolean;
  patientJidForSending: string | null;
  handleSendMessage: () => void;
  handleStartRecording: () => void;
  handleStopRecording: () => void;
  handleAttachmentClick: (type: 'image' | 'video' | 'audio' | 'document') => void;
}

export interface WhatsappHookReturn {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  isSending: boolean;
  isSendingMedia: boolean;
  isRecording: boolean;
  chatMessages: WhatsappMessage[];
  isLoadingHistory: boolean;
  historyError: string | null;
  patientJidForSending: string | null;
  patientJidForHistory: string | null;
  imageInputRef: React.RefObject<HTMLInputElement>;
  videoInputRef: React.RefObject<HTMLInputElement>;
  audioInputRef: React.RefObject<HTMLInputElement>;
  documentInputRef: React.RefObject<HTMLInputElement>;
  fetchChatHistoryHandler: (showLoadingToast?: boolean) => Promise<void>;
  handleSendMessage: () => Promise<void>;
  sendFileHandler: (file: File, type: 'image' | 'video' | 'audio' | 'document') => Promise<void>;
  handleStartRecording: () => Promise<void>;
  handleStopRecording: () => void;
  handleAttachmentClick: (type: 'image' | 'video' | 'audio' | 'document') => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'audio' | 'document') => void;
  renderMessageContent: (msg: WhatsappMessage) => React.ReactNode;
  renderMessageTicks: (msg: WhatsappMessage) => React.ReactNode;
}
