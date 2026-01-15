package com.skillswap.chat;

import com.skillswap.chat.dto.MessageResponse;
import com.skillswap.chat.dto.SendMessageRequest;
import com.skillswap.user.User;
import com.skillswap.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.Instant;
import java.util.Objects;

@Controller
public class ChatWsController {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;
    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;

    public ChatWsController(SimpMessagingTemplate messagingTemplate,
                            UserRepository userRepository,
                            ChatRepository chatRepository,
                            MessageRepository messageRepository) {
        this.messagingTemplate = messagingTemplate;
        this.userRepository = userRepository;
        this.chatRepository = chatRepository;
        this.messageRepository = messageRepository;
    }

    /**
     * Клиент шлёт:
     * destination: /app/chat.send
     * payload: { chatId: 1, content: "Hello" }
     *
     * Сервер публикует:
     * /topic/chat.1
     */
    @MessageMapping("/chat.send")
    public void send(@Valid @Payload SendMessageRequest req,
                     org.springframework.messaging.Message<?> rawMessage) {

        // Username берём из SecurityContext (JWT filter уже заполнил Authentication для HTTP,
        // но для WebSocket нужно передавать токен на handshake; фронт мы сделаем так, чтобы работало)
        // На MVP уровне: разрешаем отправку без auth в ws, но проверяем по header "x-username" fallback.
        // Позже можно сделать полноценную WS-auth.
        String username = extractUsernameFallback(rawMessage);

        User sender = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Chat chat = chatRepository.findById(req.getChatId())
                .orElseThrow(() -> new IllegalArgumentException("Chat not found"));

        // Проверка: отправитель должен быть участником чата
        boolean isMember = Objects.equals(chat.getUser1().getId(), sender.getId())
                || Objects.equals(chat.getUser2().getId(), sender.getId());
        if (!isMember) {
            throw new IllegalArgumentException("Not a member of this chat");
        }

        String content = req.getContent() == null ? "" : req.getContent().trim();
        if (content.isEmpty()) {
            throw new IllegalArgumentException("Empty message");
        }

        Message msg = new Message(chat, sender, content);
        messageRepository.save(msg);

        chat.setUpdatedAt(Instant.now());
        chatRepository.save(chat);

        MessageResponse resp = new MessageResponse(
                msg.getId(),
                chat.getId(),
                sender.getUsername(),
                sender.getProfilePicture(),
                msg.getContent(),
                msg.getCreatedAt()
        );

        // broadcast
        messagingTemplate.convertAndSend("/topic/chat." + chat.getId(), resp);
    }

    /**
     * MVP fallback: берём username из header "x-username".
     * На фронтенде мы будем добавлять этот header при подключении STOMP.
     * (Полноценную JWT-auth для WS можно добавить следующим шагом.)
     */
    private String extractUsernameFallback(org.springframework.messaging.Message<?> raw) {
        Object header = raw.getHeaders().get("nativeHeaders");
        if (header instanceof java.util.Map<?, ?> map) {
            Object xu = map.get("x-username");
            if (xu instanceof java.util.List<?> list && !list.isEmpty()) {
                Object v = list.get(0);
                if (v != null) return v.toString().trim().toLowerCase();
            }
        }
        // если не пришёл header — чтобы не падать непонятно:
        throw new IllegalArgumentException("Missing x-username header for WS message");
    }
}
