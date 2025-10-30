export const mockApi = {
  getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
  },
  addUser(user) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
  },
  addMessage(chatId, message) {
    const chats = JSON.parse(localStorage.getItem("chats")) || {};
    if (!chats[chatId]) chats[chatId] = [];
    chats[chatId].push(message);
    localStorage.setItem("chats", JSON.stringify(chats));
  },
  getMessages(chatId) {
    const chats = JSON.parse(localStorage.getItem("chats")) || {};
    return chats[chatId] || [];
  },
};
