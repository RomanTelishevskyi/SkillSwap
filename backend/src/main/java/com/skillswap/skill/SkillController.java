package com.skillswap.skill;

import com.skillswap.skill.dto.AddSkillRequest;
import com.skillswap.user.User;
import com.skillswap.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;

    public SkillController(UserRepository userRepository,
                           SkillRepository skillRepository,
                           UserSkillRepository userSkillRepository) {
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.userSkillRepository = userSkillRepository;
    }

    /**
     * Мои навыки
     */
    @GetMapping("/me")
    public ResponseEntity<List<Map<String, Object>>> mySkills(Authentication auth) {
        User me = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<UserSkill> list = userSkillRepository.findByUser(me);

        List<Map<String, Object>> result = list.stream().map(us -> {
            Map<String, Object> m = new HashMap<>();
            m.put("skill", us.getSkill().getName());
            m.put("category", us.getSkill().getCategory());
            m.put("level", us.getLevel());
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Добавить или обновить навык (upsert)
     * Если Skill отсутствует — создаём (name + category).
     * Если UserSkill уже есть — обновляем level.
     */
    @PostMapping("/me")
    public ResponseEntity<Map<String, Object>> addOrUpdate(Authentication auth,
                                                          @Valid @RequestBody AddSkillRequest req) {

        User me = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String skillName = req.getSkill().trim();
        String category = req.getCategory().trim();
        int level = req.getLevel();

        Skill skill = skillRepository.findByNameIgnoreCase(skillName)
                .orElseGet(() -> {
                    Skill s = new Skill(skillName, category);
                    return skillRepository.save(s);
                });

        // если skill существует, но category пустая/другая — можно оставить как есть
        // (или обновлять category при желании)

        UserSkill userSkill = userSkillRepository.findByUserAndSkill(me, skill)
                .orElseGet(() -> new UserSkill(me, skill, level));

        userSkill.setLevel(level);
        userSkillRepository.save(userSkill);

        Map<String, Object> resp = new HashMap<>();
        resp.put("skill", skill.getName());
        resp.put("category", skill.getCategory());
        resp.put("level", userSkill.getLevel());

        return ResponseEntity.ok(resp);
    }

    /**
     * Удалить навык у себя по имени
     */
    @DeleteMapping("/me/{skillName}")
    public ResponseEntity<?> deleteMySkill(Authentication auth,
                                          @PathVariable String skillName) {
        User me = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Skill skill = skillRepository.findByNameIgnoreCase(skillName.trim())
                .orElseThrow(() -> new IllegalArgumentException("Skill not found"));

        UserSkill userSkill = userSkillRepository.findByUserAndSkill(me, skill)
                .orElseThrow(() -> new IllegalArgumentException("You don't have this skill"));

        userSkillRepository.delete(userSkill);
        return ResponseEntity.ok(Map.of("deleted", true, "skill", skill.getName()));
    }
}
