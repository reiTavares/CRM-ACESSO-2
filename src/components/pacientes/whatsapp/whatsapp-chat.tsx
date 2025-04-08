import React from "react";
import { WhatsappChatProps } from "./types";
import { useWhatsappChat } from "./use-whatsapp-chat";
import { ChatHeader } from "./chat-header";
import { MessageArea } from "./message-area";
import { InputArea } from "./input-area";

export const WhatsappChat: React.FC<WhatsappChatProps> = ({ paciente, isActiveTab }) => {
  const {
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
    handleStartRecording,
    handleStopRecording,
    handleAttachmentClick,
    handleFileChange,
    renderMessageContent,
    renderMessageTicks
  } = useWhatsappChat(paciente, isActiveTab);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Hidden File Inputs */}
      <input type="file" ref={imageInputRef} onChange={(e) => handleFileChange(e, 'image')} accept="image/*" style={{ display: 'none' }} />
      <input type="file" ref={videoInputRef} onChange={(e) => handleFileChange(e, 'video')} accept="video/*" style={{ display: 'none' }} />
      <input type="file" ref={audioInputRef} onChange={(e) => handleFileChange(e, 'audio')} accept="audio/*" style={{ display: 'none' }} />
      <input type="file" ref={documentInputRef} onChange={(e) => handleFileChange(e, 'document')} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain" style={{ display: 'none' }} />

      {/* Chat Header */}
      <ChatHeader
        paciente={paciente}
        isLoadingHistory={isLoadingHistory}
        patientJidForHistory={patientJidForHistory}
        patientJidForSending={patientJidForSending}
        fetchChatHistory={fetchChatHistoryHandler}
      />

      {/* Message Area */}
      <MessageArea
        isLoadingHistory={isLoadingHistory}
        historyError={historyError}
        chatMessages={chatMessages}
        renderMessageContent={renderMessageContent}
        renderMessageTicks={renderMessageTicks}
      />

      {/* Input Area - fixed at bottom */}
      <InputArea
        message={message}
        setMessage={setMessage}
        isRecording={isRecording}
        isSending={isSending}
        isSendingMedia={isSendingMedia}
        patientJidForSending={patientJidForSending}
        handleSendMessage={handleSendMessage}
        handleStartRecording={handleStartRecording}
        handleStopRecording={handleStopRecording}
        handleAttachmentClick={handleAttachmentClick}
      />
    </div>
  );
};
