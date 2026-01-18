package com.skillswap.chat.group.dto;

public class GroupChatCreateRequest {
    private String name;
    private String avatar; // data:image/... base64

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
}
