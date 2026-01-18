package com.skillswap.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Возвращается в GET /api/group-chat/list
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupChatListItem {
    private Long roomId;
    private String name;
    private String avatar;

    private String lastMessage;
    private String lastTime;

    // ✅ ДОБАВЛЕНО: количество участников
    private Long memberCount;
}
