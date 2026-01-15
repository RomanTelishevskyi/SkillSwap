package com.skillswap.chat.dto;

import java.time.Instant;

public class ChatListItem {

    private Long chatId;
    private String withUsername;
    private String withFirstName;
    private String withLastName;
    private String withProfilePicture;
    private String lastMessage;
    private Instant lastMessageAt;

    public ChatListItem() {
    }

    public ChatListItem(Long chatId,
                        String withUsername,
                        String withFirstName,
                        String withLastName,
                        String withProfilePicture,
                        String lastMessage,
                        Instant lastMessageAt) {
        this.chatId = chatId;
        this.withUsername = withUsername;
        this.withFirstName = withFirstName;
        this.withLastName = withLastName;
        this.withProfilePicture = withProfilePicture;
        this.lastMessage = lastMessage;
        this.lastMessageAt = lastMessageAt;
    }

    // ===== Getters / Setters =====

    public Long getChatId() {
        return chatId;
    }

    public String getWithUsername() {
        return withUsername;
    }

    public String getWithFirstName() {
        return withFirstName;
    }

    public String getWithLastName() {
        return withLastName;
    }

    public String getLastMessage() {
        return lastMessage;
    }
    public String getWithProfilePicture() {
        return withProfilePicture;
    }

    public void setWithProfilePicture(String withProfilePicture) {
        this.withProfilePicture = withProfilePicture;
    }

    public Instant getLastMessageAt() {
        return lastMessageAt;
    }

    public void setChatId(Long chatId) {
        this.chatId = chatId;
    }

    public void setWithUsername(String withUsername) {
        this.withUsername = withUsername;
    }

    public void setWithFirstName(String withFirstName) {
        this.withFirstName = withFirstName;
    }

    public void setWithLastName(String withLastName) {
        this.withLastName = withLastName;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public void setLastMessageAt(Instant lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }
}
