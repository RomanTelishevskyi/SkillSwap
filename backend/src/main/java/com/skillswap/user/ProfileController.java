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
                user.getLastName(),
                user.getProfilePicture()
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
        
        // Handle profile picture: always update if provided in request
        if (req.getProfilePicture() != null) {
            String pictureData = req.getProfilePicture().trim();
            if (pictureData.isEmpty() || pictureData.equals("null")) {
                // Empty string means user wants to remove the picture
                user.setProfilePicture(null);
            } else {
                // Validate and save the picture
                // Limit base64 string length to prevent issues
                if (pictureData.length() > 10_000_000) { // 10MB limit for base64
                    throw new IllegalArgumentException("Profile picture is too large");
                }
                // Save the picture data (should be base64 data URL from frontend)
                user.setProfilePicture(pictureData);
            }
        }
        // If profilePicture is null in request, don't change existing value
        
        userRepository.save(user);

        ProfileResponse resp = new ProfileResponse(
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getProfilePicture()
        );

        return ResponseEntity.ok(resp);
    }
}
