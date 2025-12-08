package com.app.skillswap.service;

import com.app.skillswap.model.User;
import com.app.skillswap.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void CreateOrUpdate(com.app.skillswap.model.User user) {
        userRepository.save(user);
    }

    public Optional<User> getById(String user_id) {
        return userRepository.findById(user_id);
    }

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public void deleteById(String user_id) {
        userRepository.deleteById(user_id);
    }
}
