package com.skillswap.friend.dto;

import com.skillswap.friend.FriendRequest;

import java.time.Instant;

public class FriendRequestResponse {

    private Long id;
    private String fromUsername;
    private String toUsername;
    private String status;
    private Instant createdAt;

    public FriendRequestResponse() {
    }

    public FriendRequestResponse(
            Long id,
            String fromUsername,
            String toUsername,
            FriendRequest.Status status,
            Instant createdAt
    ) {
        this.id = id;
        this.fromUsername = fromUsername;
        this.toUsername = toUsername;
        this.status = status.name();
        this.createdAt = createdAt;
    }

    // ===== Getters / Setters =====

    public Long getId() {
        return id;
    }

    public String getFromUsername() {
        return fromUsername;
    }

    public String getToUsername() {
        return toUsername;
    }

    public String getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setFromUsername(String fromUsername) {
        this.fromUsername = fromUsername;
    }

    public void setToUsername(String toUsername) {
        this.toUsername = toUsername;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
