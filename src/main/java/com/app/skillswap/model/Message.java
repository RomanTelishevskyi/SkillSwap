package com.app.skillswap.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "message", schema = "public")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private int id;

    @OneToOne
    @MapsId(value = "sender_email")
    @JoinColumn(name = "sender_email", referencedColumnName = "email")
    private User sender_email;

    private String text;

    @CreationTimestamp
    private Instant send_time;

    @OneToOne
    @MapsId(value = "chat_id")
    @JoinColumn(name = "chat_id", referencedColumnName = "id")
    private Chat chat_id;

    private boolean is_read;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public User getSender_email() {
        return sender_email;
    }

    public void setSender_email(User sender_email) {
        this.sender_email = sender_email;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Instant getSend_time() {
        return send_time;
    }

    public void setSend_time(Instant send_time) {
        this.send_time = send_time;
    }

    public Chat getChat_id() {
        return chat_id;
    }

    public void setChat_id(Chat chat_id) {
        this.chat_id = chat_id;
    }

    public boolean isIs_read() {
        return is_read;
    }

    public void setIs_read(boolean is_read) {
        this.is_read = is_read;
    }

    public Message(int id, User sender_email, String text, Chat chat_id, Instant send_time, boolean is_read) {
        this.id = id;
        this.sender_email = sender_email;
        this.text = text;
        this.chat_id = chat_id;
        this.send_time = send_time;
        this.is_read = is_read;
    }

    public Message() {
    }
}
