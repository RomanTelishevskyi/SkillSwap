package com.app.skillswap.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "skill", schema = "public")
public class Skill {

    @Id
    @Column(name = "skill_name")
    private String skill_name;

    private String type;

    public String getName() {
        return skill_name;
    }

    public void setName(String name) {
        this.skill_name = skill_name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Skill(String skill_name, String type) {
        this.skill_name = skill_name;
        this.type = type;
    }

    public Skill() {
    }
}
