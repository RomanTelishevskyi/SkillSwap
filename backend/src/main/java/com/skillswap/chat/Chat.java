package com.skillswap.chat;

import com.skillswap.user.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(
        name = "chats",
        uniqueConstraints = {
                // один уникальный чат на пару пользователей (user1_id, user2_id)
                @UniqueConstraint(name = "uk_chat_pair", columnNames = {"user1_id", "user2_id"})
        },
        indexes = {
                @Index(name = "idx_chat_user1", columnList = "user1_id"),
                @Index(name = "idx_chat_user2", columnList = "user2_id")
        }
)
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Важно: чтобы уникальность работала правильно,
     * мы будем сохранять пару пользователей в порядке:
     * user1 = min(id), user2 = max(id)
     */
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user1_id", nullable = false)
    private User user1;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user2_id", nullable = false)
    private User user2;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    public Chat() {
    }

    public Chat(User user1, User user2) {
        this.user1 = user1;
        this.user2 = user2;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    // ===== Getters / Setters =====

    public Long getId() {
        return id;
    }

    public User getUser1() {
        return user1;
    }

    public User getUser2() {
        return user2;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUser1(User user1) {
        this.user1 = user1;
    }

    public void setUser2(User user2) {
        this.user2 = user2;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
