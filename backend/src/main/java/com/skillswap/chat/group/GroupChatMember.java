package com.skillswap.chat.group;

import com.skillswap.user.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(
        name = "group_chat_members",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_group_member_room_user",
                columnNames = {"room_id", "user_id"}
        ),
        indexes = {
                @Index(name = "idx_group_member_user", columnList = "user_id"),
                @Index(name = "idx_group_member_room", columnList = "room_id")
        }
)
public class GroupChatMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private GroupChatRoom room;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Instant joinedAt = Instant.now();

    public GroupChatMember() {}

    public GroupChatMember(GroupChatRoom room, User user) {
        this.room = room;
        this.user = user;
        this.joinedAt = Instant.now();
    }

    // getters/setters
    public Long getId() { return id; }
    public GroupChatRoom getRoom() { return room; }
    public User getUser() { return user; }
    public Instant getJoinedAt() { return joinedAt; }

    public void setId(Long id) { this.id = id; }
    public void setRoom(GroupChatRoom room) { this.room = room; }
    public void setUser(User user) { this.user = user; }
    public void setJoinedAt(Instant joinedAt) { this.joinedAt = joinedAt; }
}
