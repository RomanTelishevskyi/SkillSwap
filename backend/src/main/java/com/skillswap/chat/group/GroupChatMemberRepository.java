package com.skillswap.chat.group;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupChatMemberRepository extends JpaRepository<GroupChatMember, Long> {

    boolean existsByRoomIdAndUserId(Long roomId, Long userId);

    Optional<GroupChatMember> findByRoomIdAndUserId(Long roomId, Long userId);

    List<GroupChatMember> findAllByUserId(Long userId);

    List<GroupChatMember> findAllByRoomId(Long roomId);

    long countByRoomId(Long roomId);

}
