package com.app.skillswap.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chat", schema = "public")
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chat_id")
    private int chat_id;

    private String title;

    @OneToMany(mappedBy = "chat_id")
    private List<ChatParticipants> participants = new ArrayList<>();

    public int get_id() {
        return chat_id;
    }

    public void set_id(int chat_id) {
        this.chat_id = chat_id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<ChatParticipants> getParticipants() {
        return participants;
    }

    public void setParticipants(List<ChatParticipants> participants) {
        this.participants = participants;
    }

    public Chat(int chat_id, String title) {
        this.chat_id = chat_id;
        this.title = title;
    }

    public Chat() {
    }
}
