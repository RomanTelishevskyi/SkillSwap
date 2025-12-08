package com.app.skillswap.service;

import com.app.skillswap.model.Message;
import com.app.skillswap.repository.MessageRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MessageService {

    private final MessageRepository messageRepository;

    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public void CreateOrUpdate(com.app.skillswap.model.Message message) {
        messageRepository.save(message);
    }

    public Optional<Message> getById(int message_id) {
        return messageRepository.findById(message_id);
    }

    public List<Message> getAll() {
        return messageRepository.findAll();
    }

    public void deleteById(int message_id) {
        messageRepository.deleteById(message_id);
    }
}
