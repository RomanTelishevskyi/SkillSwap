package com.app.skillswap.controller;

import com.app.skillswap.model.UserSkillsId;
import com.app.skillswap.model.UserWantsSkills;
import com.app.skillswap.service.UserWantsSkillService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/userWantsSkills")
public class UserWantsSkillController {

    private final UserWantsSkillService userWantsSkillService;

    public UserWantsSkillController(UserWantsSkillService userWantsSkillService) {
        this.userWantsSkillService = userWantsSkillService;
    }

    @GetMapping("/{id}")
    public Optional<UserWantsSkills> getById(@PathVariable("id") UserSkillsId id) {
        return userWantsSkillService.getById(id);
    }

    @GetMapping("/")
    public List<UserWantsSkills> getAll() {
        return userWantsSkillService.getAll();
    }

    @PostMapping("/")
    public void create(@RequestBody UserWantsSkills userWantsSkills) {
        userWantsSkillService.CreateOrUpdate(userWantsSkills);
    }

    @PutMapping("/")
    public void update(@RequestBody UserWantsSkills userWantsSkills) {
        userWantsSkillService.CreateOrUpdate(userWantsSkills);
    }

    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable("id") UserSkillsId id) {
    }
}
