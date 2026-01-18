package com.skillswap.chat.group;

import com.skillswap.chat.group.dto.GroupChatAvatarRequest;
import com.skillswap.chat.group.dto.GroupChatCreateRequest;
import com.skillswap.chat.dto.GroupChatListItem;
import com.skillswap.chat.group.dto.GroupMessageResponse;
import com.skillswap.user.User;
import com.skillswap.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/group-chat")
public class GroupChatController {

    private final UserRepository userRepository;
    private final GroupChatRoomRepository roomRepo;
    private final GroupChatMemberRepository memberRepo;
    private final GroupMessageRepository msgRepo;

    public GroupChatController(UserRepository userRepository,
                               GroupChatRoomRepository roomRepo,
                               GroupChatMemberRepository memberRepo,
                               GroupMessageRepository msgRepo) {
        this.userRepository = userRepository;
        this.roomRepo = roomRepo;
        this.memberRepo = memberRepo;
        this.msgRepo = msgRepo;
    }

    // ---------- helpers: resolve current user ----------
    private User resolveMe(Authentication auth) {
        if (auth == null || auth.getName() == null) throw new IllegalArgumentException("Unauthorized");
        String key = auth.getName().trim();

        User u = tryFindUser("findByUsername", key).orElse(null);
        if (u == null) u = tryFindUser("findByLogin", key).orElse(null);
        if (u == null) u = tryFindUser("findByEmail", key).orElse(null);

        if (u == null) throw new IllegalArgumentException("User not found for auth name: " + key);
        return u;
    }

    @SuppressWarnings("unchecked")
    private Optional<User> tryFindUser(String methodName, String value) {
        try {
            var m = userRepository.getClass().getMethod(methodName, String.class);
            Object r = m.invoke(userRepository, value);
            if (r instanceof Optional<?> opt) return (Optional<User>) opt;
        } catch (Exception ignored) {}
        return Optional.empty();
    }

    // ---------- avatar validator ----------
    private String normalizeAvatar(String raw) {
        if (raw == null) return null;
        String avatar = raw.trim();
        if (avatar.isEmpty() || avatar.equals("null")) return null;

        // защита от огромных строк
        if (avatar.length() > 10_000_000) {
            throw new IllegalArgumentException("Group avatar is too large");
        }

        // ✅ только data URL картинки (включая SVG)
        if (!avatar.startsWith("data:image/")) {
            throw new IllegalArgumentException("Avatar must be a data URL (data:image/...)");
        }

        return avatar;
    }

    // ---------- create room (with avatar upload dataURL) ----------
    @PostMapping("/create")
    public ResponseEntity<?> create(Authentication auth, @RequestBody GroupChatCreateRequest req) {
        User me = resolveMe(auth);

        String name = req.getName() == null ? "" : req.getName().trim();
        if (name.isEmpty()) name = "Group chat";

        GroupChatRoom room = new GroupChatRoom();
        room.setName(name);
        room.setCreator(me);
        room.setCreatedAt(Instant.now());
        room.setUpdatedAt(Instant.now());
        room.setAvatar(normalizeAvatar(req.getAvatar()));

        room = roomRepo.save(room);

        // creator becomes member
        memberRepo.save(new GroupChatMember(room, me));

        return ResponseEntity.ok(Map.of("roomId", room.getId()));
    }

    // ---------- update avatar (upload) ----------
    @PutMapping("/{roomId}/avatar")
    public ResponseEntity<?> updateAvatar(Authentication auth,
                                          @PathVariable Long roomId,
                                          @RequestBody GroupChatAvatarRequest req) {
        User me = resolveMe(auth);

        GroupChatRoom room = roomRepo.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        if (!memberRepo.existsByRoomIdAndUserId(roomId, me.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Not a member of this room"));
        }

        room.setAvatar(normalizeAvatar(req.getAvatar()));
        room.setUpdatedAt(Instant.now());
        roomRepo.save(room);

        return ResponseEntity.ok(Map.of("ok", true));
    }

    // ---------- invite user ----------
    @PostMapping("/{roomId}/invite/{userKey}")
    public ResponseEntity<?> invite(Authentication auth,
                                    @PathVariable Long roomId,
                                    @PathVariable String userKey) {
        User me = resolveMe(auth);

        GroupChatRoom room = roomRepo.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        if (!memberRepo.existsByRoomIdAndUserId(roomId, me.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Not a member of this room"));
        }

        String key = userKey.trim();

        User other = tryFindUser("findByUsername", key).orElse(null);
        if (other == null) other = tryFindUser("findByLogin", key).orElse(null);
        if (other == null) other = tryFindUser("findByEmail", key).orElse(null);
        if (other == null) throw new IllegalArgumentException("User not found: " + key);

        if (!memberRepo.existsByRoomIdAndUserId(roomId, other.getId())) {
            memberRepo.save(new GroupChatMember(room, other));
        }

        return ResponseEntity.ok(Map.of("ok", true));
    }

    // ---------- list my rooms (with avatar) ----------
    @GetMapping("/list")
    public ResponseEntity<List<GroupChatListItem>> list(Authentication auth) {
    User me = resolveMe(auth);

    List<GroupChatMember> memberships = memberRepo.findAllByUserId(me.getId());

    List<GroupChatListItem> out = new ArrayList<>();

    for (GroupChatMember m : memberships) {
        GroupChatRoom room = m.getRoom();

        Long memberCount = memberRepo.countByRoomId(room.getId());

        List<GroupMessage> msgs = msgRepo.findByRoomIdOrderByCreatedAtAsc(room.getId());
        GroupMessage last = msgs.isEmpty() ? null : msgs.get(msgs.size() - 1);

        out.add(new GroupChatListItem(
                room.getId(),
                room.getName(),
                room.getAvatar(),
                last != null ? last.getContent() : "",
                last != null ? last.getCreatedAt().toString() : room.getUpdatedAt().toString(),
                memberCount
        ));
    }

    return ResponseEntity.ok(out);
}



    // ---------- messages ----------
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<GroupMessageResponse>> messages(Authentication auth, @PathVariable Long roomId) {
        User me = resolveMe(auth);

        if (!memberRepo.existsByRoomIdAndUserId(roomId, me.getId())) {
            return ResponseEntity.status(403).build();
        }

        List<GroupMessage> list = msgRepo.findByRoomIdOrderByCreatedAtAsc(roomId);

        List<GroupMessageResponse> resp = list.stream().map(x ->
                new GroupMessageResponse(
                        x.getId(),
                        x.getRoom().getId(),
                        safeUsername(x.getSender()),
                        safeProfilePicture(x.getSender()),
                        x.getContent(),
                        x.getCreatedAt()
                )
        ).toList();

        return ResponseEntity.ok(resp);
    }

    private String safeUsername(User u) {
        try {
            var m = u.getClass().getMethod("getUsername");
            Object v = m.invoke(u);
            if (v != null) return v.toString();
        } catch (Exception ignored) {}
        try {
            var m = u.getClass().getMethod("getLogin");
            Object v = m.invoke(u);
            if (v != null) return v.toString();
        } catch (Exception ignored) {}
        return "unknown";
    }

    private String safeProfilePicture(User u) {
        try {
            var m = u.getClass().getMethod("getProfilePicture");
            Object v = m.invoke(u);
            return v != null ? v.toString() : null;
        } catch (Exception ignored) {}
        return null;
    }
}
