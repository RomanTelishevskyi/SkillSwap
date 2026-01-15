package com.skillswap.friend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class FriendRequestCreate {

    /**
     * Username пользователя, которому отправляем заявку
     */
    @NotBlank
    @Size(min = 3, max = 30)
    private String toUsername;

    public FriendRequestCreate() {
    }

    public String getToUsername() {
        return toUsername;
    }

    public void setToUsername(String toUsername) {
        this.toUsername = toUsername;
    }
}
