package com.app.skillswap.service;

import com.app.skillswap.model.ChatParticipants;
import com.app.skillswap.repository.ChatParticipantsRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ChatParticipantsService {

    private final ChatParticipantsRepository chatParticipantsRepository;

    public ChatParticipantsService(ChatParticipantsRepository chatParticipantsRepository) {
        this.chatParticipantsRepository = chatParticipantsRepository;
    }

    public void CreateOrUpdate(ChatParticipants chatParticipants) {
        chatParticipantsRepository.save(chatParticipants);
    }

    public Optional<ChatParticipants> getById(int id) {
        return chatParticipantsRepository.findById(id);
    }

    public List<ChatParticipants> getAll() {
        return chatParticipantsRepository.findAll();
    }

    public void deleteById(int id) {
        chatParticipantsRepository.deleteById(id);
    }
}
