package com.skillswap.friend;

import com.skillswap.friend.dto.FriendRequestCreate;
import com.skillswap.friend.dto.FriendRequestResponse;
import com.skillswap.user.User;
import com.skillswap.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    private final UserRepository userRepository;
    private final FriendRequestRepository friendRequestRepository;

    public FriendController(UserRepository userRepository,
                            FriendRequestRepository friendRequestRepository) {
        this.userRepository = userRepository;
        this.friendRequestRepository = friendRequestRepository;
    }

    @PostMapping("/request")
    public ResponseEntity<?> sendRequest(Authentication auth,
                                         @Valid @RequestBody FriendRequestCreate req) {

        User me = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String toUsername = req.getToUsername().trim().toLowerCase();
        if (toUsername.equals(me.getUsername())) {
            throw new IllegalArgumentException("You cannot send friend request to yourself");
        }

        User toUser = userRepository.findByUsername(toUsername)
                .orElseThrow(() -> new IllegalArgumentException("Target user not found"));

        // Уже друзья?
        if (me.getFriends().stream().anyMatch(f -> Objects.equals(f.getId(), toUser.getId()))) {
            return ResponseEntity.ok(Map.of("message", "Already friends"));
        }

        // Уже есть заявка?
        var existing = friendRequestRepository.findByFromUserAndToUser(me, toUser);
        if (existing.isPresent() && existing.get().getStatus() == FriendRequest.Status.PENDING) {
            return ResponseEntity.ok(Map.of("message", "Request already sent", "requestId", existing.get().getId()));
        }

        // Проверка на "встречную" pending заявку: если она есть, можно сразу принять автоматически
        List<FriendRequest> between = friendRequestRepository
                .findByFromUserAndToUserOrFromUserAndToUser(me, toUser, toUser, me);

        for (FriendRequest fr : between) {
            if (fr.getStatus() == FriendRequest.Status.PENDING
                    && Objects.equals(fr.getFromUser().getId(), toUser.getId())
                    && Objects.equals(fr.getToUser().getId(), me.getId())) {

                // Авто-accept
                addFriends(me, toUser);
                fr.setStatus(FriendRequest.Status.ACCEPTED);
                friendRequestRepository.save(fr);

                return ResponseEntity.ok(Map.of(
                        "message", "Mutual request found. Accepted automatically.",
                        "requestId", fr.getId()
                ));
            }
        }

        FriendRequest request = new FriendRequest(me, toUser);
        friendRequestRepository.save(request);

        return ResponseEntity.ok(Map.of(
                "message", "Friend request sent",
                "requestId", request.getId()
        ));
    }

    @GetMapping("/requests/incoming")
    public ResponseEntity<List<FriendRequestResponse>> incoming(Authentication auth) {
        User me = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<FriendRequest> list = friendRequestRepository
                .findByToUserAndStatus(me, FriendRequest.Status.PENDING);

        List<FriendRequestResponse> resp = list.stream()
                .map(fr -> new FriendRequestResponse(
                        fr.getId(),
                        fr.getFromUser().getUsername(),
                        fr.getToUser().getUsername(),
                        fr.getStatus(),
                        fr.getCreatedAt()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/requests/outgoing")
    public ResponseEntity<List<FriendRequestResponse>> outgoing(Authentication auth) {
        User me = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<FriendRequest> list = friendRequestRepository
                .findByFromUserAndStatus(me, FriendRequest.Status.PENDING);

        List<FriendRequestResponse> resp = list.stream()
                .map(fr -> new FriendRequestResponse(
                        fr.getId(),
                        fr.getFromUser().getUsername(),
                        fr.getToUser().getUsername(),
                        fr.getStatus(),
                        fr.getCreatedAt()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(resp);
    }

    @PostMapping("/requests/{id}/accept")
    public ResponseEntity<?> accept(Authentication auth, @PathVariable Long id) {
        User me = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        FriendRequest fr = friendRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (!Objects.equals(fr.getToUser().getId(), me.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Not allowed"));
        }

        if (fr.getStatus() != FriendRequest.Status.PENDING) {
            return ResponseEntity.ok(Map.of("message", "Request already processed", "status", fr.getStatus().name()));
        }

        User from = fr.getFromUser();
        addFriends(me, from);

        fr.setStatus(FriendRequest.Status.ACCEPTED);
        friendRequestRepository.save(fr);

        return ResponseEntity.ok(Map.of("message", "Accepted", "friend", from.getUsername()));
    }

    @PostMapping("/requests/{id}/reject")
    public ResponseEntity<?> reject(Authentication auth, @PathVariable Long id) {
        User me = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        FriendRequest fr = friendRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (!Objects.equals(fr.getToUser().getId(), me.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Not allowed"));
        }

        if (fr.getStatus() != FriendRequest.Status.PENDING) {
            return ResponseEntity.ok(Map.of("message", "Request already processed", "status", fr.getStatus().name()));
        }

        fr.setStatus(FriendRequest.Status.REJECTED);
        friendRequestRepository.save(fr);

        return ResponseEntity.ok(Map.of("message", "Rejected"));
    }

    @GetMapping("/list")
    public ResponseEntity<List<Map<String, Object>>> friends(Authentication auth) {
        User me = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Map<String, Object>> result = me.getFriends().stream()
                .map(u -> Map.<String, Object>of(
                        "username", u.getUsername(),
                        "firstName", u.getFirstName(),
                        "lastName", u.getLastName(),
                        "profilePicture", u.getProfilePicture() != null ? u.getProfilePicture() : ""
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    private void addFriends(User a, User b) {
        // двусторонняя дружба
        a.getFriends().add(b);
        b.getFriends().add(a);
        userRepository.save(a);
        userRepository.save(b);
    }
}
