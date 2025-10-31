package com.app.skillswap.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "skill", schema = "public")
public class Skill {

    @Id
    @Column(name = "name")
    private String name;

    private String type;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Skill(String name, String type) {
        this.name = name;
        this.type = type;
    }

    public Skill() {
    }
}
