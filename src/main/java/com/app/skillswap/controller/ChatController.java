package com.app.skillswap.controller;

import com.app.skillswap.model.Chat;
import com.app.skillswap.service.ChatService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/{chat_id}")
    public Optional<Chat> getById(@PathVariable("chat_id") int chat_id) {
        return chatService.getById(chat_id);
    }

    @PostMapping("/")
    public void create(@RequestBody Chat chat) {
        chatService.CreateOrUpdate(chat);
    }

    @PutMapping("/")
    public void update(@RequestBody Chat chat) {
        chatService.CreateOrUpdate(chat);
    }

    @DeleteMapping("/{chat_id}")
    public void deleteById(@PathVariable("chat_id") int chat_id) {
        chatService.deleteById(chat_id);
    }

    @GetMapping("/")
    public List<Chat> getAll() {
        return chatService.getAll();
    }
}
