package com.app.skillswap.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_knows_skills", schema = "public")
public class UserKnowsSkills {

    @EmbeddedId
    private UserSkillsId id;

    @ManyToOne
    @MapsId("user_email")
    @JoinColumn(name = "email", referencedColumnName = "email")
    private User user_email;

    @ManyToOne
    @MapsId("skill_name")
    @JoinColumn(name = "skill_name", referencedColumnName = "name")
    private Skill skill_name;

    public Skill getSkill_name() {
        return skill_name;
    }

    public void setSkill_name(Skill skill_name) {
        this.skill_name = skill_name;
    }

    public User getUser_email() {
        return user_email;
    }

    public void setUser_email(User user_email) {
        this.user_email = user_email;
    }

    public UserSkillsId getId() {
        return id;
    }

    public void setId(UserSkillsId id) {
        this.id = id;
    }

    public UserKnowsSkills(UserSkillsId id, User user_email, Skill skill_name) {
        this.id = id;
        this.user_email = user_email;
        this.skill_name = skill_name;
    }

    public UserKnowsSkills() {
    }
}
