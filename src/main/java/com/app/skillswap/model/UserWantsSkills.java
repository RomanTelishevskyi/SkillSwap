package com.app.skillswap.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_wants_skills", schema = "public")
public class UserWantsSkills {

    @EmbeddedId
    private UserSkillsId id;

    @ManyToOne
    @MapsId("user_email")
    private User user;

    @ManyToOne
    @MapsId("skill_name")
    private Skill skill;

    public UserSkillsId getId() {
        return id;
    }

    public void setId(UserSkillsId id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Skill getSkill() {
        return skill;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
    }

    public UserWantsSkills(UserSkillsId id, User user, Skill skill) {
        this.id = id;
        this.user = user;
        this.skill = skill;
    }

    public UserWantsSkills() {
    }
}
