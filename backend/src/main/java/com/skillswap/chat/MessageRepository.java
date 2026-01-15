package com.skillswap.chat;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Все сообщения конкретного чата (по времени)
     */
    List<Message> findByChatOrderByCreatedAtAsc(Chat chat);

    /**
     * Последние N сообщений чата (используется для превью)
     */
    List<Message> findTop50ByChatOrderByCreatedAtDesc(Chat chat);
}
