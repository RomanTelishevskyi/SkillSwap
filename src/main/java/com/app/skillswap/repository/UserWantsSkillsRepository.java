package com.app.skillswap.repository;

import com.app.skillswap.model.UserSkillsId;
import com.app.skillswap.model.UserWantsSkills;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserWantsSkillsRepository extends JpaRepository<UserWantsSkills, UserSkillsId> {
}
