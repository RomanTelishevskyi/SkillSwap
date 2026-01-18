package com.skillswap.chat.group;

import com.skillswap.user.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(
        name = "group_messages",
        indexes = {
                @Index(name = "idx_group_msg_room", columnList = "room_id"),
                @Index(name = "idx_group_msg_sender", columnList = "sender_id"),
                @Index(name = "idx_group_msg_created", columnList = "createdAt")
        }
)
public class GroupMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private GroupChatRoom room;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(nullable = false, length = 2000)
    private String content;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public GroupMessage() {}

    public GroupMessage(GroupChatRoom room, User sender, String content) {
        this.room = room;
        this.sender = sender;
        this.content = content;
        this.createdAt = Instant.now();
    }

    // getters/setters
    public Long getId() { return id; }
    public GroupChatRoom getRoom() { return room; }
    public User getSender() { return sender; }
    public String getContent() { return content; }
    public Instant getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setRoom(GroupChatRoom room) { this.room = room; }
    public void setSender(User sender) { this.sender = sender; }
    public void setContent(String content) { this.content = content; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
