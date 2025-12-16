package com.skillswap.user;

import com.skillswap.user.dto.ProfileResponse;
import com.skillswap.user.dto.ProfileUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserRepository userRepository;

    public ProfileController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> me(Authentication auth) {
        String username = auth.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ProfileResponse resp = new ProfileResponse(
                user.getUsername(),
                user.getFirstName(),
                user.getLastName()
        );

        return ResponseEntity.ok(resp);
    }

    @PutMapping("/me")
    public ResponseEntity<ProfileResponse> updateMe(
            Authentication auth,
            @Valid @RequestBody ProfileUpdateRequest req
    ) {
        String username = auth.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setFirstName(req.getFirstName().trim());
        user.setLastName(req.getLastName().trim());
        userRepository.save(user);

        ProfileResponse resp = new ProfileResponse(
                user.getUsername(),
                user.getFirstName(),
                user.getLastName()
        );

        return ResponseEntity.ok(resp);
    }
}
