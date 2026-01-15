package com.skillswap.skill;

import jakarta.persistence.*;

@Entity
@Table(
        name = "skills",
        indexes = {
                @Index(name = "idx_skill_name", columnList = "name", unique = true),
                @Index(name = "idx_skill_category", columnList = "category")
        }
)
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Название навыка, например:
     * "English", "Piano", "Guitar", "Java"
     */
    @Column(nullable = false, unique = true, length = 100)
    private String name;

    /**
     * Категория / тематика:
     * "Languages", "Music", "Programming", etc.
     */
    @Column(nullable = false, length = 50)
    private String category;

    // ===== Constructors =====

    public Skill() {
    }

    public Skill(String name, String category) {
        this.name = name;
        this.category = category;
    }

    // ===== Getters / Setters =====

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name.trim();
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category.trim();
    }
}
