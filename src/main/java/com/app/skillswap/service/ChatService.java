package com.app.skillswap.service;

import com.app.skillswap.model.Chat;
import com.app.skillswap.repository.ChatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ChatService {

    private final ChatRepository chatRepository;

    @Autowired
    public ChatService(ChatRepository chatRepository) {
        this.chatRepository = chatRepository;
    }

    public void CreateOrUpdate(Chat chat) {
        chatRepository.save(chat);
    }

    public Optional<Chat> getById(int chat_id) {
        return chatRepository.findById(chat_id);
    }

    public List<Chat> getAll() {
        return chatRepository.findAll();
    }

    public void deleteById(int chat_id) {
        chatRepository.deleteById(chat_id);
    }
}
