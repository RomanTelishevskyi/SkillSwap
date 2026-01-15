package com.skillswap.skill.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AddSkillRequest {

    @NotBlank
    @Size(min = 2, max = 100)
    private String skill;

    @NotBlank
    @Size(min = 2, max = 50)
    private String category;

    @Min(1)
    @Max(5)
    private int level;

    public AddSkillRequest() {
    }

    public String getSkill() {
        return skill;
    }

    public void setSkill(String skill) {
        this.skill = skill;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }
}
