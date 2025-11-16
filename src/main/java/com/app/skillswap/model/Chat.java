package com.app.skillswap.model;

import jakarta.persistence.*;

@Entity
@Table(name = "chat", schema = "public")
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private int id;

    private String title;

    @OneToOne
    @MapsId(value = "user_emails")
    @JoinColumn(name = "user_emails", referencedColumnName = "user_emails")
    private ChatParticipants user_emails;

    public int get_id() {
        return id;
    }

    public void set_id(int id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public ChatParticipants getUser_emails() {
        return user_emails;
    }

    public void setUser_emails(ChatParticipants user_emails) {
        this.user_emails = user_emails;
    }

    public Chat(int id, String title, ChatParticipants user_emails) {
        this.id = id;
        this.title = title;
        this.user_emails = user_emails;
    }

    public Chat() {
    }
}
