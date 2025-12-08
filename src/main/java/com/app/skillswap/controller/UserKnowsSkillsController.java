package com.app.skillswap.controller;

import com.app.skillswap.model.UserKnowsSkills;
import com.app.skillswap.model.UserSkillsId;
import com.app.skillswap.service.UserKnowsSkillsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/userKnowsSkills")
public class UserKnowsSkillsController {

    private final UserKnowsSkillsService userKnowsSkillsService;

    public UserKnowsSkillsController(UserKnowsSkillsService userKnowsSkillsService) {
        this.userKnowsSkillsService = userKnowsSkillsService;
    }

    @GetMapping("/{id}")
    public Optional<UserKnowsSkills> getById(@PathVariable("id") UserSkillsId id) {
        return userKnowsSkillsService.getById(id);
    }

    @GetMapping("/")
    public List<UserKnowsSkills> getAll() {
        return userKnowsSkillsService.getAll();
    }

    @PostMapping("/")
    public void create(@RequestBody UserKnowsSkills userKnowsSkills) {
        userKnowsSkillsService.CreateOrUpdate(userKnowsSkills);
    }

    @PutMapping("/")
    public void update(@RequestBody UserKnowsSkills userKnowsSkills) {
        userKnowsSkillsService.CreateOrUpdate(userKnowsSkills);
    }

    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable("id") UserSkillsId id) {
        userKnowsSkillsService.deleteById(id);
    }
}
