package com.app.skillswap.controller;

import com.app.skillswap.model.Skill;
import com.app.skillswap.service.SkillService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/skill")
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    @GetMapping("/{skill_id}")
    public Optional<Skill> getById(@PathVariable("skill_id") String skill_id) {
        return skillService.getById(skill_id);
    }

    @GetMapping("/")
    public List<Skill> getAll() {
        return skillService.getAll();
    }

    @PostMapping("/")
    public void create(@RequestBody Skill skill) {
        skillService.CreateOrUpdate(skill);
    }

    @PutMapping("/")
    public void update(@RequestBody Skill skill) {
        skillService.CreateOrUpdate(skill);
    }

    @DeleteMapping("/{skill_id}")
    public void deleteById(@PathVariable("skill_id") String skill_id) {
        skillService.deleteById(skill_id);
    }


}
