package com.skillswap.skill;

import com.skillswap.user.User;
import jakarta.persistence.*;

@Entity
@Table(
        name = "user_skills",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_user_skill",
                        columnNames = {"user_id", "skill_id"}
                )
        },
        indexes = {
                @Index(name = "idx_user_skill_user", columnList = "user_id"),
                @Index(name = "idx_user_skill_skill", columnList = "skill_id")
        }
)
public class UserSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Пользователь
     */
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Навык
     */
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    /**
     * Уровень владения навыком (1–5)
     * 1 = beginner, 5 = expert
     */
    @Column(nullable = false)
    private int level;

    // ===== Constructors =====

    public UserSkill() {
    }

    public UserSkill(User user, Skill skill, int level) {
        this.user = user;
        this.skill = skill;
        this.level = level;
    }

    // ===== Getters / Setters =====

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Skill getSkill() {
        return skill;
    }

    public int getLevel() {
        return level;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
    }

    public void setLevel(int level) {
        if (level < 1 || level > 5) {
            throw new IllegalArgumentException("Skill level must be between 1 and 5");
        }
        this.level = level;
    }
}
