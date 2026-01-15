package com.skillswap.chat;

import com.skillswap.chat.dto.ChatListItem;
import com.skillswap.chat.dto.MessageResponse;
import com.skillswap.chat.dto.SendMessageRequest;
import com.skillswap.user.User;
import com.skillswap.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final UserRepository userRepository;
    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;

    public ChatController(UserRepository userRepository,
                          ChatRepository chatRepository,
                          MessageRepository messageRepository) {
        this.userRepository = userRepository;
        this.chatRepository = chatRepository;
        this.messageRepository = messageRepository;
    }

    /**
     * Создать (или получить) чат с другом по username
     */
    @PostMapping("/with/{username}")
    public ResponseEntity<Map<String, Object>> getOrCreateChat(
            Authentication auth,
            @PathVariable String username
    ) {
        User me = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String otherUsername = username.trim().toLowerCase();
        if (otherUsername.equals(me.getUsername())) {
            throw new IllegalArgumentException("Cannot chat with yourself");
        }

        User other = userRepository.findByUsername(otherUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Только если друзья
        boolean isFriend = me.getFriends().stream().anyMatch(f -> Objects.equals(f.getId(), other.getId()));
        if (!isFriend) {
            return ResponseEntity.status(403).body(Map.of("error", "You can chat only with friends"));
        }

        Chat chat = chatRepository.findBetweenUsers(me, other)
                .orElseGet(() -> {
                    // сохраняем пару в порядке min/max id чтобы выполнялась уникальность
                    User u1 = me.getId() < other.getId() ? me : other;
                    User u2 = me.getId() < other.getId() ? other : me;

                    Chat c = new Chat(u1, u2);
                    c.setUpdatedAt(Instant.now());
                    return chatRepository.save(c);
                });

        return ResponseEntity.ok(Map.of(
                "chatId", chat.getId(),
                "with", other.getUsername()
        ));
    }

    /**
     * Список чатов (как Telegram: собеседник + последнее сообщение)
     */
    @GetMapping("/list")
    public ResponseEntity<List<ChatListItem>> list(Authentication auth) {
        User me = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Chat> chats = chatRepository.findAllByUser(me);

        List<ChatListItem> result = new ArrayList<>();

        for (Chat c : chats) {
            User other = Objects.equals(c.getUser1().getId(), me.getId()) ? c.getUser2() : c.getUser1();

            // последнее сообщение
            List<Message> last = messageRepository.findTop50ByChatOrderByCreatedAtDesc(c);
            Message lastMsg = last.isEmpty() ? null : last.get(0);

            result.add(new ChatListItem(
                    c.getId(),
                    other.getUsername(),
                    other.getFirstName(),
                    other.getLastName(),
                    other.getProfilePicture(),
                    lastMsg != null ? lastMsg.getContent() : "",
                    lastMsg != null ? lastMsg.getCreatedAt() : c.getUpdatedAt()
            ));
        }

        return ResponseEntity.ok(result);
    }

    /**
     * История сообщений (по возрастанию времени)
     */
    @GetMapping("/{chatId}/messages")
    public ResponseEntity<List<MessageResponse>> messages(Authentication auth, @PathVariable Long chatId) {
        User me = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new IllegalArgumentException("Chat not found"));

        if (!isMember(me, chat)) {
            return ResponseEntity.status(403).build();
        }

        List<Message> list = messageRepository.findByChatOrderByCreatedAtAsc(chat);

        List<MessageResponse> resp = list.stream()
                .map(m -> new MessageResponse(
                        m.getId(),
                        chat.getId(),
                        m.getSender().getUsername(),
                        m.getSender().getProfilePicture(),
                        m.getContent(),
                        m.getCreatedAt()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(resp);
    }

    /**
     * Отправить сообщение через REST (fallback)
     * (основной live-путь будет через WebSocket, но REST полезен тоже)
     */
    @PostMapping("/message")
    public ResponseEntity<MessageResponse> sendMessage(Authentication auth,
                                                       @Valid @RequestBody SendMessageRequest req) {
        User me = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Chat chat = chatRepository.findById(req.getChatId())
                .orElseThrow(() -> new IllegalArgumentException("Chat not found"));

        if (!isMember(me, chat)) {
            return ResponseEntity.status(403).build();
        }

        String content = req.getContent().trim();
        if (content.isEmpty()) {
            throw new IllegalArgumentException("Message content is empty");
        }

        Message msg = new Message(chat, me, content);
        messageRepository.save(msg);

        chat.setUpdatedAt(Instant.now());
        chatRepository.save(chat);

        MessageResponse resp = new MessageResponse(
                msg.getId(),
                chat.getId(),
                me.getUsername(),
                me.getProfilePicture(),
                msg.getContent(),
                msg.getCreatedAt()
        );

        return ResponseEntity.ok(resp);
    }

    private boolean isMember(User user, Chat chat) {
        return Objects.equals(chat.getUser1().getId(), user.getId())
                || Objects.equals(chat.getUser2().getId(), user.getId());
    }
}
