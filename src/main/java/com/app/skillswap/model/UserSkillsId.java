package com.app.skillswap.model;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class UserSkillsId implements Serializable {

    private String user_email;

    private String skill_name;

    public String getSkill_name() {
        return skill_name;
    }

    public void setSkill_name(String skill_name) {
        this.skill_name = skill_name;
    }

    public String getUser_email() {
        return user_email;
    }

    public void setUser_email(String user_email) {
        this.user_email = user_email;
    }

    public UserSkillsId(String user_email, String skill_name) {
        this.user_email = user_email;
        this.skill_name = skill_name;
    }

    public UserSkillsId() {
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserSkillsId that = (UserSkillsId) o;
        return Objects.equals(user_email, that.user_email) &&
                Objects.equals(skill_name, that.skill_name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(user_email, skill_name);
    }
}
