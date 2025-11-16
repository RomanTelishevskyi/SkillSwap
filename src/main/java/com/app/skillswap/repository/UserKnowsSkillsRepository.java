package com.app.skillswap.repository;

import com.app.skillswap.model.UserKnowsSkills;
import com.app.skillswap.model.UserSkillsId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserKnowsSkillsRepository extends JpaRepository<UserKnowsSkills, UserSkillsId> {
}
