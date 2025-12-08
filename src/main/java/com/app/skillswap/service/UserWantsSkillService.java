package com.app.skillswap.service;

import com.app.skillswap.model.UserSkillsId;
import com.app.skillswap.model.UserWantsSkills;
import com.app.skillswap.repository.UserWantsSkillsRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserWantsSkillService {

    private final UserWantsSkillsRepository userWantsSkillsRepository;

    public UserWantsSkillService(UserWantsSkillsRepository userWantsSkillsRepository) {
        this.userWantsSkillsRepository = userWantsSkillsRepository;
    }

    public void CreateOrUpdate(UserWantsSkills userWantsSkills) {
        userWantsSkillsRepository.save(userWantsSkills);
    }

    public Optional<UserWantsSkills> getById(UserSkillsId id){
        return userWantsSkillsRepository.findById(id);
    }

    public List<UserWantsSkills> getAll(){
        return userWantsSkillsRepository.findAll();
    }

    public void deleteById(UserSkillsId id){
        userWantsSkillsRepository.deleteById(id);
    }
}
