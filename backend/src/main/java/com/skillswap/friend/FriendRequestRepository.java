package com.skillswap.friend;

import com.skillswap.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {

    /**
     * Проверка: уже есть заявка от from -> to
     */
    Optional<FriendRequest> findByFromUserAndToUser(User fromUser, User toUser);

    /**
     * Входящие заявки (PENDING)
     */
    List<FriendRequest> findByToUserAndStatus(User toUser, FriendRequest.Status status);

    /**
     * Исходящие заявки (PENDING)
     */
    List<FriendRequest> findByFromUserAndStatus(User fromUser, FriendRequest.Status status);

    /**
     * Все заявки между двумя пользователями (на случай принятой/отклонённой)
     */
    List<FriendRequest> findByFromUserAndToUserOrFromUserAndToUser(
            User from1, User to1,
            User from2, User to2
    );
}
