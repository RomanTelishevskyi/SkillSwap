package com.app.skillswap.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "chat_participants", schema = "public")
public class ChatParticipants {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "user_email")
    private User user_emails;

    @ManyToOne
    @JoinColumn(name = "chat_id")
    @JsonIgnore
    private Chat chat_id;

    public User getUser_emails() {
        return user_emails;
    }

    public void setUser_emails(User user_emails) {
        this.user_emails = user_emails;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Chat getChat_id() {
        return chat_id;
    }

    public void setChat_id(Chat chat_id) {
        this.chat_id = chat_id;
    }

    public ChatParticipants(int id, User user_emails, Chat chat_id) {
        this.id = id;
        this.user_emails = user_emails;
        this.chat_id = chat_id;
    }

    public ChatParticipants() {
    }
}
