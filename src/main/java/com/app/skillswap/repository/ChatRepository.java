package com.app.skillswap.repository;

import com.app.skillswap.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatRepository extends JpaRepository <Chat, Integer>{
}
