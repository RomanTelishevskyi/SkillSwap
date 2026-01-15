package com.skillswap.skill;

import com.skillswap.user.User;
import com.skillswap.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;

    public SearchController(UserRepository userRepository,
                            SkillRepository skillRepository,
                            UserSkillRepository userSkillRepository) {
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.userSkillRepository = userSkillRepository;
    }

    /**
     * Пример:
     * GET /api/search/users?wantSkill=Piano&offerSkill=English&minLevel=1
     *
     * wantSkill  - что я хочу найти (например Piano)
     * offerSkill - что я могу предложить (например English) (опционально)
     * minLevel   - минимальный уровень владения wantSkill у кандидата (1..5)
     */
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> searchUsers(
            Authentication auth,
            @RequestParam String wantSkill,
            @RequestParam(required = false) String offerSkill,
            @RequestParam(defaultValue = "1") int minLevel
    ) {
        String meUsername = auth.getName();
        User me = userRepository.findByUsername(meUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Skill want = skillRepository.findByNameIgnoreCase(wantSkill.trim())
                .orElseThrow(() -> new IllegalArgumentException("Skill not found: " + wantSkill));

        Skill offer = null;
        if (offerSkill != null && !offerSkill.trim().isEmpty()) {
            offer = skillRepository.findByNameIgnoreCase(offerSkill.trim()).orElse(null);
        }

        // 1) Кандидаты, у которых есть wantSkill с нужным уровнем
        List<UserSkill> haveWant = userSkillRepository.findBySkillAndLevelGreaterThanEqual(want, minLevel);

        // исключаем себя
        List<User> usersHaveWant = haveWant.stream()
                .map(UserSkill::getUser)
                .filter(u -> !Objects.equals(u.getId(), me.getId()))
                .distinct()
                .collect(Collectors.toList());

        // 2) TOP: те, кто имеет wantSkill + offerSkill (если offerSkill передан)
        Set<Long> topIds = new HashSet<>();
        if (offer != null) {
            List<UserSkill> haveOffer = userSkillRepository.findBySkill(offer);
            Set<Long> offerUserIds = haveOffer.stream()
                    .map(us -> us.getUser().getId())
                    .collect(Collectors.toSet());

            for (User u : usersHaveWant) {
                if (offerUserIds.contains(u.getId())) {
                    topIds.add(u.getId());
                }
            }
        }

        // 3) RELATED: те, кто не в списке haveWant, но имеет навыки той же категории
        List<Skill> sameCategorySkills = skillRepository.findByCategoryIgnoreCase(want.getCategory());

        Set<Long> relatedIds = new HashSet<>();
        for (Skill s : sameCategorySkills) {
            List<UserSkill> usList = userSkillRepository.findBySkill(s);
            for (UserSkill us : usList) {
                User u = us.getUser();
                if (!Objects.equals(u.getId(), me.getId())) {
                    relatedIds.add(u.getId());
                }
            }
        }

        // Сформируем ответ с сортировкой:
        // - сначала top (score 100)
        // - потом haveWant (score 60)
        // - потом related (score 30)
        // Уникальность по userId.
        LinkedHashMap<Long, Map<String, Object>> out = new LinkedHashMap<>();

        // helper
        java.util.function.BiConsumer<User, Map<String, Object>> putUser = (u, payload) -> out.putIfAbsent(u.getId(), payload);

        // TOP
        if (!topIds.isEmpty()) {
            for (User u : usersHaveWant) {
                if (topIds.contains(u.getId())) {
                    Map<String, Object> m = baseUser(u);
                    m.put("score", 100);
                    m.put("reason", offer != null
                            ? ("Has \"" + want.getName() + "\" and also \"" + offer.getName() + "\"")
                            : ("Has \"" + want.getName() + "\""));
                    putUser.accept(u, m);
                }
            }
        }

        // HAVE WANT
        for (User u : usersHaveWant) {
            if (!out.containsKey(u.getId())) {
                Map<String, Object> m = baseUser(u);
                m.put("score", 60);
                m.put("reason", "Has \"" + want.getName() + "\"");
                putUser.accept(u, m);
            }
        }

        // RELATED
        if (!relatedIds.isEmpty()) {
            // найдём пользователей по id
            List<User> relatedUsers = userRepository.findAllById(relatedIds);
            for (User u : relatedUsers) {
                if (!out.containsKey(u.getId()) && !Objects.equals(u.getId(), me.getId())) {
                    Map<String, Object> m = baseUser(u);
                    m.put("score", 30);
                    m.put("reason", "Related skills in category \"" + want.getCategory() + "\"");
                    putUser.accept(u, m);
                }
            }
        }

        return ResponseEntity.ok(new ArrayList<>(out.values()));
    }

    private Map<String, Object> baseUser(User u) {
        Map<String, Object> m = new HashMap<>();
        m.put("username", u.getUsername());
        m.put("firstName", u.getFirstName());
        m.put("lastName", u.getLastName());
        return m;
    }
}
