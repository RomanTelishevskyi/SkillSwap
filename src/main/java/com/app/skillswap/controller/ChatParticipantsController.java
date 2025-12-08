package com.app.skillswap.controller;

import com.app.skillswap.model.ChatParticipants;
import com.app.skillswap.service.ChatParticipantsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/chatParticipants")
public class ChatParticipantsController {

    private final ChatParticipantsService chatParticipantsService;

    public ChatParticipantsController(ChatParticipantsService chatParticipantsService) {
        this.chatParticipantsService = chatParticipantsService;
    }

    @GetMapping("/{id}")
    public Optional<ChatParticipants> getById(@PathVariable("id") int id) {
        return chatParticipantsService.getById(id);
    }

    @GetMapping("/")
    public List<ChatParticipants> getAll() {
        return chatParticipantsService.getAll();
    }

    @PostMapping("/")
    public void create(@RequestBody ChatParticipants chatParticipants) {
        chatParticipantsService.CreateOrUpdate(chatParticipants);
    }

    @PutMapping("/")
    public void update(@RequestBody ChatParticipants chatParticipants) {
        chatParticipantsService.CreateOrUpdate(chatParticipants);
    }

    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable("id") int id) {
        chatParticipantsService.deleteById(id);
    }
}
