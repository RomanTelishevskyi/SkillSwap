package com.skillswap.chat.dto;

import java.time.Instant;

public class MessageResponse {

    private Long id;
    private Long chatId;
    private String sender;
    private String senderProfilePicture;
    private String content;
    private Instant createdAt;

    public MessageResponse() {
    }

    public MessageResponse(Long id, Long chatId, String sender, String senderProfilePicture, String content, Instant createdAt) {
        this.id = id;
        this.chatId = chatId;
        this.sender = sender;
        this.senderProfilePicture = senderProfilePicture;

        this.content = content;
        this.createdAt = createdAt;
    }

    // ===== Getters / Setters =====

    public Long getId() {
        return id;
    }

    public Long getChatId() {
        return chatId;
    }

    public String getSender() {
        return sender;
    }
    public String getSenderProfilePicture() {
        return senderProfilePicture;
    }

    public void setSenderProfilePicture(String senderProfilePicture) {
        this.senderProfilePicture = senderProfilePicture;
    }

    public String getContent() {
        return content;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setChatId(Long chatId) {
        this.chatId = chatId;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
