package com.app.skillswap.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_wants_skills", schema = "public")
public class UserWantsSkills {

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
}
