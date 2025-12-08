package com.app.skillswap.service;

import com.app.skillswap.model.Skill;
import com.app.skillswap.repository.SkillRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SkillService {

    private final SkillRepository skillRepository;

    public SkillService(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    public void CreateOrUpdate(com.app.skillswap.model.Skill skill) {
        skillRepository.save(skill);
    }

    public Optional<Skill> getById(String skill_id){
        return skillRepository.findById(skill_id);
    }

    public List<Skill> getAll(){
        return skillRepository.findAll();
    }

    public void deleteById(String skill_id){
        skillRepository.deleteById(skill_id);
    }
}
