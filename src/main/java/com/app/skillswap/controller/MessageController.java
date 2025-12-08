package com.app.skillswap.controller;

import com.app.skillswap.model.Message;
import com.app.skillswap.service.MessageService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/message")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/{message_id}")
    public Optional<Message> getById(@PathVariable("message_id") int message_id) {
        return messageService.getById(message_id);
    }

    @GetMapping("/")
    public List<Message> getAll() {
        return messageService.getAll();
    }

    @PostMapping("/")
    public void create(@RequestBody Message message) {
        messageService.CreateOrUpdate(message);
    }

    @PutMapping("/")
    public void update(@RequestBody Message message) {
        messageService.CreateOrUpdate(message);
    }

    @DeleteMapping("/{message_id}")
    public void deleteById(@PathVariable("message_id") int message_id) {
        messageService.deleteById(message_id);
    }
}
