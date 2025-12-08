package com.app.skillswap.service;

import com.app.skillswap.model.UserKnowsSkills;
import com.app.skillswap.model.UserSkillsId;
import com.app.skillswap.repository.UserKnowsSkillsRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserKnowsSkillsService {

    private final UserKnowsSkillsRepository userKnowsSkillsRepository;

    public UserKnowsSkillsService(UserKnowsSkillsRepository userKnowsSkillsRepository) {
        this.userKnowsSkillsRepository = userKnowsSkillsRepository;
    }

    public void CreateOrUpdate(com.app.skillswap.model.UserKnowsSkills userKnowsSkills) {
        userKnowsSkillsRepository.save(userKnowsSkills);
    }

    public Optional<UserKnowsSkills> getById(UserSkillsId id) {
        return userKnowsSkillsRepository.findById(id);
    }

    public List<UserKnowsSkills> getAll() {
        return userKnowsSkillsRepository.findAll();
    }

    public void deleteById(UserSkillsId id) {
        userKnowsSkillsRepository.deleteById(id);
    }
}
