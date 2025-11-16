package com.app.skillswap.repository;

import com.app.skillswap.model.ChatParticipants;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatParticipantsRepository extends JpaRepository<ChatParticipants, Integer> {
}
