package com.skillswap.skill;

import com.skillswap.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {

    /**
     * Все навыки конкретного пользователя
     */
    List<UserSkill> findByUser(User user);

    /**
     * Конкретный навык пользователя
     */
    Optional<UserSkill> findByUserAndSkill(User user, Skill skill);

    /**
     * Все пользователи, у которых есть данный навык
     */
    List<UserSkill> findBySkill(Skill skill);

    /**
     * Поиск по навыкам + минимальный уровень
     */
    List<UserSkill> findBySkillAndLevelGreaterThanEqual(Skill skill, int level);
}
