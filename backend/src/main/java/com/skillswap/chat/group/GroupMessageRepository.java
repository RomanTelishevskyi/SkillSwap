package com.skillswap.chat.group;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupMessageRepository extends JpaRepository<GroupMessage, Long> {
    List<GroupMessage> findByRoomIdOrderByCreatedAtAsc(Long roomId);
}
