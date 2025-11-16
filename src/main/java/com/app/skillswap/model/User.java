package com.app.skillswap.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "user", schema = "public")
public class User {

    @Id
    @Column(name = "user_email")
    private String user_email;

    private String password_hash;

    private String picture;

    private String username;

    public String getEmail() {
        return user_email;
    }

    public void setEmail(String user_email) {
        this.user_email = user_email;
    }

    public String getPassword_hash() {
        return password_hash;
    }

    public void setPassword_hash(String password_hash) {
        this.password_hash = password_hash;
    }

    public String getPicture() {
        return picture;
    }

    public void setPicture(String picture) {
        this.picture = picture;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public User(String user_email, String password_hash, String picture, String username) {
        this.user_email = user_email;
        this.password_hash = password_hash;
        this.picture = picture;
        this.username = username;
    }

    public User() {
    }
}
