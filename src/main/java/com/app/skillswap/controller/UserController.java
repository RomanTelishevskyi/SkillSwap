package com.app.skillswap.controller;

import com.app.skillswap.model.User;
import com.app.skillswap.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{user_id}")
    public Optional<User> getById(@PathVariable("user_id") String user_id) {
        return userService.getById(user_id);
    }

    @GetMapping("/")
    public List<User> getAll() {
        return userService.getAll();
    }

    @PostMapping("/")
    public void create(@RequestBody User user) {
        userService.CreateOrUpdate(user);
    }

    @PutMapping("/")
    public void update(@RequestBody User user) {
        userService.CreateOrUpdate(user);
    }

    @DeleteMapping("/{user_id}")
    public void deleteById(@PathVariable("user_id") String user_id) {
        userService.deleteById(user_id);
    }
}
