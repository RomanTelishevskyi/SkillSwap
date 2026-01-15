package com.skillswap.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class SendMessageRequest {

    /**
     * ID чата, в который отправляется сообщение
     */
    @NotNull
    private Long chatId;

    /**
     * Текст сообщения
     */
    @NotBlank
    @Size(max = 2000)
    private String content;

    public SendMessageRequest() {
    }

    public Long getChatId() {
        return chatId;
    }

    public void setChatId(Long chatId) {
        this.chatId = chatId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
