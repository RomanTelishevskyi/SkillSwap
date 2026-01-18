package com.skillswap.chat.group.dto;

import java.time.Instant;

public record GroupMessageResponse(
        Long id,
        Long roomId,
        String senderUsername,
        String senderProfilePicture,
        String content,
        Instant createdAt
) {}
