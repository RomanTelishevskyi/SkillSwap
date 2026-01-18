package com.skillswap.chat.group.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class SendGroupMessageRequest {

    @NotNull
    private Long roomId;

    @NotNull
    @Size(min = 1, max = 2000)
    private String content;

    public Long getRoomId() { return roomId; }
    public String getContent() { return content; }

    public void setRoomId(Long roomId) { this.roomId = roomId; }
    public void setContent(String content) { this.content = content; }
}
