package com.skillswap.chat;

import com.skillswap.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ChatRepository extends JpaRepository<Chat, Long> {

    /**
     * Найти чат между двумя пользователями (порядок user1/user2 важен)
     */
    Optional<Chat> findByUser1AndUser2(User user1, User user2);

    /**
     * Найти чат между двумя пользователями независимо от порядка
     */
    @Query("""
        select c from Chat c
        where (c.user1 = :u1 and c.user2 = :u2)
           or (c.user1 = :u2 and c.user2 = :u1)
    """)
    Optional<Chat> findBetweenUsers(User u1, User u2);

    /**
     * Все чаты пользователя (как user1 или user2)
     */
    @Query("""
        select c from Chat c
        where c.user1 = :user or c.user2 = :user
        order by c.updatedAt desc
    """)
    List<Chat> findAllByUser(User user);
}
