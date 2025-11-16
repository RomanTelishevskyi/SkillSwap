package com.app.skillswap.model;

import jakarta.persistence.*;

@Entity
@Table(name = "chat_participants", schema = "public")
public class ChatParticipants {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @MapsId("user_emails")
    @JoinColumn(name = "user_emails", referencedColumnName = "email")
    private User user_emails;

    @ManyToOne
    @MapsId("chat_id")
    @JoinColumn(name = "chat_id", referencedColumnName = "id")
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
