package com.skillswap.chat.group;

import com.skillswap.chat.group.dto.GroupMessageResponse;
import com.skillswap.chat.group.dto.SendGroupMessageRequest;
import com.skillswap.user.User;
import com.skillswap.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.Instant;

@Controller
public class GroupChatWsController {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;
    private final GroupChatRoomRepository roomRepo;
    private final GroupChatMemberRepository memberRepo;
    private final GroupMessageRepository msgRepo;

    public GroupChatWsController(SimpMessagingTemplate messagingTemplate,
                                 UserRepository userRepository,
                                 GroupChatRoomRepository roomRepo,
                                 GroupChatMemberRepository memberRepo,
                                 GroupMessageRepository msgRepo) {
        this.messagingTemplate = messagingTemplate;
        this.userRepository = userRepository;
        this.roomRepo = roomRepo;
        this.memberRepo = memberRepo;
        this.msgRepo = msgRepo;
    }

    /**
     * Клиент шлёт:
     * destination: /app/group.send
     * payload: { roomId: 10, content: "hi" }
     *
     * Сервер публикует:
     * /topic/group.10
     */
    @MessageMapping("/group.send")
    public void send(@Valid @Payload SendGroupMessageRequest req,
                     org.springframework.messaging.Message<?> rawMessage) {

        String username = extractUsernameFallback(rawMessage);

        User sender = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Long roomId = req.getRoomId();

        if (!memberRepo.existsByRoomIdAndUserId(roomId, sender.getId())) {
            throw new IllegalArgumentException("Not a member of this room");
        }

        GroupChatRoom room = roomRepo.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        String content = req.getContent() == null ? "" : req.getContent().trim();
        if (content.isEmpty()) throw new IllegalArgumentException("Empty message");

        GroupMessage msg = new GroupMessage(room, sender, content);
        msgRepo.save(msg);

        room.setUpdatedAt(Instant.now());
        roomRepo.save(room);

        GroupMessageResponse resp = new GroupMessageResponse(
                msg.getId(),
                room.getId(),
                sender.getUsername(),
                sender.getProfilePicture(),
                msg.getContent(),
                msg.getCreatedAt()
        );

        messagingTemplate.convertAndSend("/topic/group." + room.getId(), resp);
    }

    private String extractUsernameFallback(org.springframework.messaging.Message<?> raw) {
        Object header = raw.getHeaders().get("nativeHeaders");
        if (header instanceof java.util.Map<?, ?> map) {
            Object xu = map.get("x-username");
            if (xu instanceof java.util.List<?> list && !list.isEmpty()) {
                Object v = list.get(0);
                if (v != null) return v.toString().trim().toLowerCase();
            }
        }
        throw new IllegalArgumentException("Missing x-username header for WS message");
    }
}
