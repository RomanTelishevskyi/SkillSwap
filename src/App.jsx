import React, { useState, useCallback, useMemo } from "react";
import { User, Send, Search, LogOut } from "lucide-react";

// --- ЛОКАЛЬНЫЕ ИЗОБРАЖЕНИЯ ---
import logoImage from "./assets/logo.png";
import backgroundImage from "./assets/3239586.jpg";

// ====================================================================
// 1. СТИЛИ ДЛЯ АВТОРИЗАЦИИ (вынесены за пределы компонентов)
// ====================================================================

const authStyles = {
  pageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    width: "100%",
    position: "relative",
    overflow: "hidden",
    fontFamily: "Inter, Arial, sans-serif",
  },
  background: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    zIndex: -1,
  },
  card: {
    width: "453px",
    minHeight: "500px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "20px",
    padding: "30px",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    transition: "height 0.3s ease-out",
    backdropFilter: "blur(5px)",
  },
  logo: {
    width: "120px",
    height: "80px",
    marginBottom: "20px",
  },
  promptText: {
    fontSize: "14px",
    color: "#333333ff",
    textAlign: "center",
    marginBottom: "30px",
  },
  formElement: {
    width: "400px",
    marginBottom: "20px",
  },
  inputField: {
    width: "100%",
    height: "50px",
    padding: "0 15px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "16px",
    boxSizing: "border-box",
    backgroundColor: "#ffffff",
    color: "#333333",
  },
  mainButton: {
    width: "100%",
    height: "50px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s, transform 0.1s",
    marginTop: "10px",
  },
  secondaryLink: {
    color: "#007bff",
    textDecoration: "none",
    cursor: "pointer",
    fontSize: "14px",
    marginTop: "15px",
  },
  messageBox: {
    padding: "10px 20px",
    borderRadius: "8px",
    marginBottom: "20px",
    width: "400px",
    textAlign: "center",
    fontWeight: "bold",
  },
  optionsContainer: {
    width: "400px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "14px",
    color: "#666",
    height: "20px",
    marginBottom: "20px",
  },
  rememberMe: {
    display: "flex",
    alignItems: "center",
  },
  checkbox: {
    marginRight: "5px",
    width: "16px",
    height: "16px",
    border: "1px solid #998f8fff",
    borderRadius: "3px",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    cursor: "pointer",
    backgroundColor: "#e5dadaff",
    display: "inline-block",
    position: "relative",
    transition: "border-color 0.2s, background-color 0.2s",
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
    cursor: "pointer",
  },
  signUpLink: {
    fontSize: "14px",
    color: "#666",
    marginTop: "10px",
  },
};

// ====================================================================
// 2. ИНЛАЙН-СТИЛИ И CSS (замена Tailwind)
// ====================================================================

const globalStyles = `
/* 1. Общие стили и шрифт Inter (замена @tailwind base) */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  font-family: 'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  background-color: #f9fafb;
}

#root, .app-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* 2. Общие классы, имитирующие Tailwind */
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); }
.shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); }
.rounded-lg { border-radius: 0.5rem; }
.rounded-2xl { border-radius: 1rem; }
.transition-150 { transition: all 150ms ease-in-out; }

/* 3. Кнопки и инпуты */
.btn-primary {
  background-color: #4f46e5;
  color: white;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
}
.btn-primary:hover {
  background-color: #4338ca;
  transform: scale(1.01);
}

.input-style {
  width: "100%",
  height: "48px",
  padding: "12px",
  border: "1px solid #d1d5db",
  borderRadius: "0.5rem",
  color: "#374151",
  outline: "none",
}
.input-style:focus {
  border-color: "#6366f1",
  box-shadow: "0 0 0 1px #6366f1",
}

/* 4. Стили секции поиска (Hero) */
.search-input-container {
  display: flex;
  width: 100%;
  max-width: 640px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  background-color: white;
  margin-bottom: 24px;
}
.search-input-field {
  flex-grow: 1;
  padding: 16px;
  color: #374151;
  border: none;
  outline: none;
}
.search-button {
  padding: 16px 24px;
  background-color: #4f46e5;
  color: white;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 150ms ease-in-out;
}
.search-button:hover {
  background-color: #4338ca;
}

/* 5. Обновленные стили для тегов - зеленый цвет */
.tag-button {
  margin-right: 8px;
  margin-bottom: 8px;
  padding: 8px 16px;
  border-radius: 9999px;
  color: #065f46;
  background-color: #d1fae5;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 150ms ease-in-out;
}
.tag-button:hover {
  background-color: #a7f3d0;
  color: #064e3b;
  transform: scale(1.05);
}

/* 6. Стили для главной страницы с фоном */
.main-page-background {
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
}

/* 7. Стили для Dashboard */
.dashboard-background {
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

.dashboard-content {
  background-color: rgba(255, 255, 255, 0.9);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  text-align: center;
  backdrop-filter: blur(10px);
  max-width: 600px;
  width: 90%;
}

/* 8. Стили для ссылок в футере */
.footer-link {
  color: #4f46e5;
  transition: color 150ms;
  text-decoration: none;
  cursor: pointer;
}
.footer-link:hover {
  color: #10b981;
}

/* 9. Стили для ховера кнопок в хедере */
.header-btn-hover:hover {
  color: #10b981;
}

/* 10. Стили для кнопки выхода и отображения nickname */
.user-info-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-nickname {
  color: #4b5563;
  font-weight: 500;
  font-size: 14px;
}

.logout-button {
  padding: 8px 16px;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease-in-out;
}
.logout-button:hover {
  background-color: #dc2626;
  transform: scale(1.05);
}
`;

// ====================================================================
// 3. УТИЛИТЫ И КОНСТАНТЫ
// ====================================================================
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ====================================================================
// 4. КОМПОНЕНТЫ
// ====================================================================

// Компонент Статистики
const StatsSection = () => {
  const stats = [
    { value: "50,000+", label: "Active users" },
    { value: "200+", label: "Skill categories" },
    { value: "100,000+", label: "Skills exchanged" },
  ];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        maxWidth: "1024px",
        paddingTop: "40px",
        borderTop: "1px solid #e5e7eb",
        flexDirection: "column",
        gap: "32px",
        textAlign: "center",
      }}
      className="md:flex-row md:space-y-0 md:gap-12"
    >
      {stats.map((stat, index) => (
        <div key={index} style={{ padding: "16px", flex: 1 }}>
          <p style={{ fontSize: "36px", fontWeight: "800", color: "#4f46e5" }}>
            {stat.value}
          </p>
          <p style={{ color: "#6b7280", marginTop: "4px", fontSize: "14px" }}>
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
};

// Компонент Поисковой Панели и Тегов
const SearchSection = ({ setMessage }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const popularSearches = [
    "Photography",
    "Web Development",
    "Cooking",
    "Language Exchange",
    "Guitar Lessons",
  ];

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setMessage({
        type: "info",
        text: `Searching for: "${searchTerm.trim()}"... (Functionality coming soon)`,
      });
      setSearchTerm("");
    } else {
      setMessage({ type: "error", text: "Please enter a skill to search." });
    }
  };

  const handleTagClick = (tag) => {
    setSearchTerm(tag);
    setMessage({
      type: "success",
      text: `Tag selected: ${tag}. Click Search Skills to proceed.`,
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: "1152px",
      }}
    >
      {/* Главный призыв к действию */}
      <h2
        style={{
          fontSize: "48px",
          fontWeight: "800",
          color: "#1f2937",
          textAlign: "center",
          marginBottom: "24px",
          lineHeight: "1.2",
        }}
      >
        Learn any skill by teaching{" "}
        <span style={{ color: "#4f46e5" }}>Yours</span>
      </h2>

      {/* Описание */}
      <p
        style={{
          fontSize: "18px",
          color: "#4b5563",
          textAlign: "center",
          maxWidth: "640px",
          marginBottom: "40px",
        }}
      >
        Connect with people around the world to exchange skills. Teach what you
        know, learn what you love.
      </p>

      {/* Поисковая панель */}
      <div className="search-input-container">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingLeft: "20px",
            paddingRight: "8px",
          }}
        >
          <Search style={{ width: "20px", height: "20px", color: "#9ca3af" }} />
        </div>
        <input
          type="text"
          placeholder="What skill would you like to learn? (e.g., Guitar, Spanish, Coding...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          className="search-input-field"
        />
        <button
          onClick={handleSearch}
          className="search-button shadow-md rounded-r-2xl"
        >
          Search Skills
        </button>
      </div>

      {/* Популярные теги */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: "8px",
          fontSize: "14px",
          color: "#6b7280",
        }}
      >
        <span
          style={{
            fontWeight: "600",
            marginRight: "12px",
            marginBottom: "8px",
            color: "#374151",
          }}
        >
          Popular searches:
        </span>
        {popularSearches.map((tag, index) => (
          <button
            key={index}
            onClick={() => handleTagClick(tag)}
            className="tag-button"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

// Компонент Главного Меню/Навигации
const Header = ({ navigate, isLoggedIn, userNickname, handleLogout }) => {
  const handleAction = (action) => {
    if (action === "Sign in") {
      navigate("login");
    } else if (action === "Get started") {
      navigate("register");
    } else if (action === "Dashboard") {
      navigate("dashboard");
    }
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        padding: "16px 24px",
        maxWidth: "1280px",
        margin: "0 auto",
      }}
    >
      {/* Логотип/Название */}
      <h1
        style={{
          fontSize: "24px",
          fontWeight: "800",
          color: "#1f2937",
          letterSpacing: "0.05em",
          cursor: "pointer",
          transition: "color 150ms ease-in-out",
        }}
        className="header-btn-hover"
        onClick={() => navigate("home")}
      >
        Skill Swap
      </h1>

      {/* Правая секция: Вход и Начало работы / Дашборд */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {isLoggedIn ? (
          <>
            <button
              onClick={() => handleAction("Dashboard")}
              className="btn-primary shadow-md"
              style={{
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                fontSize: "16px",
              }}
            >
              <User
                style={{ width: "20px", height: "20px", marginRight: "4px" }}
              />
              Dashboard
            </button>
            <div className="user-info-container">
              <span className="user-nickname">Welcome, {userNickname}!</span>
              <button
                onClick={handleLogout}
                className="logout-button shadow-md"
              >
                Log out
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => handleAction("Sign in")}
              style={{
                display: "flex",
                alignItems: "center",
                color: "#4b5563",
                fontWeight: "500",
                padding: "8px 16px",
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                transition: "color 150ms ease-in-out",
              }}
              className="header-btn-hover"
            >
              <User
                style={{ width: "20px", height: "20px", marginRight: "4px" }}
              />
              Sign in
            </button>
            <button
              onClick={() => handleAction("Get started")}
              className="btn-primary shadow-md"
              style={{ padding: "8px 16px" }}
            >
              Get started
            </button>
          </>
        )}
      </div>
    </header>
  );
};

// Компонент Подвала (Footer)
const Footer = ({ navigate }) => (
  <footer
    style={{
      width: "100%",
      backgroundColor: "#1f2937",
      color: "white",
      marginTop: "40px",
    }}
  >
    <div
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "32px 48px",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
      }}
      className="md:flex-row md:justify-between md:items-start"
    >
      <div style={{ width: "100%" }} className="md:w-1/3">
        <h3
          style={{
            fontSize: "24px",
            fontWeight: "700",
            marginBottom: "12px",
            color: "#818cf8",
          }}
        >
          Skill Swap
        </h3>
        <p style={{ color: "#9ca3af", fontSize: "14px" }}>
          Exchange your knowledge. Grow your potential.
        </p>
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-around",
          gap: "16px",
        }}
        className="md:w-2/3"
      >
        {/* Company */}
        <div style={{ minWidth: "100px" }}>
          <h4
            style={{
              fontWeight: "600",
              marginBottom: "12px",
              color: "#e5e7eb",
            }}
          >
            Company
          </h4>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              gap: "8px",
              display: "flex",
              flexDirection: "column",
              fontSize: "14px",
            }}
          >
            <li>
              <a
                href="#"
                className="footer-link"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("home");
                }}
              >
                About Us
              </a>
            </li>
            <li>
              <a
                href="#"
                className="footer-link"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("register");
                }}
              >
                Join
              </a>
            </li>
          </ul>
        </div>
        {/* Resources */}
        <div style={{ minWidth: "100px" }}>
          <h4
            style={{
              fontWeight: "600",
              marginBottom: "12px",
              color: "#e5e7eb",
            }}
          >
            Resources
          </h4>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              gap: "8px",
              display: "flex",
              flexDirection: "column",
              fontSize: "14px",
            }}
          >
            <li>
              <a href="#" className="footer-link">
                FAQ
              </a>
            </li>
            <li>
              <a href="#" className="footer-link">
                Support
              </a>
            </li>
          </ul>
        </div>
        {/* Legal */}
        <div style={{ minWidth: "100px" }}>
          <h4
            style={{
              fontWeight: "600",
              marginBottom: "12px",
              color: "#e5e7eb",
            }}
          >
            Legal
          </h4>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              gap: "8px",
              display: "flex",
              flexDirection: "column",
              fontSize: "14px",
            }}
          >
            <li>
              <a href="#" className="footer-link">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" className="footer-link">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div
      style={{
        width: "100%",
        borderTop: "1px solid #374151",
        padding: "16px 0",
        textAlign: "center",
        fontSize: "12px",
        color: "#9ca3af",
      }}
    >
      &copy; {new Date().getFullYear()} Skill Swap. All rights reserved.
    </div>
  </footer>
);

// Сообщение (успех/ошибка/инфо)
const MessageDisplay = ({ message, type, isAuthScreen = false }) => {
  if (!message) return null;

  let bgColor = "";
  let textColor = "";
  let borderColor = "";

  switch (type) {
    case "success":
      bgColor = "#d1fae5";
      borderColor = "#34d399";
      textColor = "#047857";
      break;
    case "error":
      bgColor = "#fee2e2";
      borderColor = "#f87171";
      textColor = "#b91c1c";
      break;
    case "info":
    default:
      bgColor = "#dbeafe";
      borderColor = "#60a5fa";
      textColor = "#1d4ed8";
      break;
  }

  const baseStyle = {
    padding: "12px",
    borderRadius: "8px",
    border: `1px solid ${borderColor}`,
    textAlign: "center",
    fontWeight: "500",
    backgroundColor: bgColor,
    color: textColor,
    marginBottom: isAuthScreen ? "16px" : "24px",
    width: isAuthScreen ? "100%" : "auto",
    maxWidth: isAuthScreen ? "384px" : "640px",
    margin: isAuthScreen ? "0 0 16px 0" : "0 auto 24px auto",
  };

  return <div style={baseStyle}>{message}</div>;
};

// Dashboard
const DashboardScreen = ({ navigate, userNickname, handleLogout }) => (
  <div className="dashboard-background">
    <div className="dashboard-content">
      <h1
        style={{
          fontSize: "48px",
          fontWeight: "800",
          color: "#1f2937",
          marginBottom: "20px",
        }}
      >
        Welcome to Dashboard, {userNickname}!
      </h1>
      <p style={{ fontSize: "20px", color: "#4b5563", marginBottom: "32px" }}>
        You have successfully logged in.
      </p>
      <button
        onClick={() => navigate("home")}
        style={{
          padding: "12px 32px",
          backgroundColor: "#4f46e5",
          color: "white",
          fontWeight: "600",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          transition: "all 200ms",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          marginTop: "16px",
          fontSize: "16px",
        }}
        className="hover:bg-indigo-700 hover:scale-[1.05] transition-150"
      >
        Explore Skills
      </button>
      <button
        onClick={handleLogout}
        style={{
          marginTop: "16px",
          padding: "12px 32px",
          border: "2px solid #4f46e5",
          color: "#4f46e5",
          fontWeight: "600",
          borderRadius: "8px",
          cursor: "pointer",
          backgroundColor: "transparent",
          transition: "all 200ms",
          fontSize: "16px",
        }}
        className="hover:bg-indigo-50"
      >
        Log Out
      </button>
    </div>
  </div>
);

// --- AUTH COMPONENTS ---

// Login Form
const LoginForm = ({ onLoginSuccess, navigate, message }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (email === "test@example.com" && password === "password") {
      // Извлекаем nickname из email (часть до @)
      const nickname = email.split("@")[0];
      onLoginSuccess("home", nickname);
    } else {
      setError("Invalid email or password. Use test@example.com / password.");
    }
  };

  const [isButtonHovered, setIsButtonHovered] = useState(false);

  return (
    <>
      <img
        src={logoImage}
        alt="Logo"
        style={authStyles.logo}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src =
            "https://placehold.co/120x80/007bff/white?text=LOGO";
        }}
      />

      <h2 style={{ fontSize: "24px", color: "#333", marginBottom: "10px" }}>
        Log in
      </h2>

      <p style={authStyles.promptText}>
        Enter your credentials to access your account
      </p>

      {message && (
        <div
          style={{
            ...authStyles.messageBox,
            backgroundColor: message.type === "success" ? "#d4edda" : "#f8d7da",
            color: message.type === "success" ? "#155724" : "#721c24",
          }}
        >
          {message.text}
        </div>
      )}

      {error && (
        <div
          style={{
            ...authStyles.messageBox,
            backgroundColor: "#f8d7da",
            color: "#721c24",
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleLogin}
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={authStyles.formElement}>
          <input
            type="email"
            placeholder="Email (use: test@example.com)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={authStyles.inputField}
            required
          />
        </div>

        <div style={authStyles.formElement}>
          <input
            type="password"
            placeholder="Password (use: password)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={authStyles.inputField}
            required
          />
        </div>

        <div style={authStyles.optionsContainer}>
          <div style={authStyles.rememberMe}>
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{
                ...authStyles.checkbox,
                ...(rememberMe && {
                  backgroundColor: "#007bff",
                  borderColor: "#007bff",
                  backgroundImage:
                    "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12 5.908L6.454 11.454 4 9.001l1.06-1.06 1.394 1.393L10.94 4.847l1.06 1.06z' fill='%23fff'/%3E%3C/svg%3E\")",
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                }),
              }}
            />
            <label htmlFor="remember">Remember me?</label>
          </div>
          <a
            href="#"
            style={authStyles.link}
            onClick={(e) => {
              e.preventDefault();
              navigate("forgot");
            }}
          >
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          style={
            isButtonHovered
              ? { ...authStyles.mainButton, backgroundColor: "#0056b3" }
              : authStyles.mainButton
          }
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
        >
          Log in
        </button>
      </form>

      <div style={authStyles.signUpLink}>
        Don't have an account?{" "}
        <a
          href="#"
          style={authStyles.link}
          onClick={(e) => {
            e.preventDefault();
            navigate("register");
          }}
        >
          Sign up
        </a>
      </div>

      {/* Back to Home Link */}
      <div style={{ marginTop: "20px" }}>
        <a
          href="#"
          style={authStyles.link}
          onClick={(e) => {
            e.preventDefault();
            navigate("home");
          }}
        >
          ← Back to Home
        </a>
      </div>
    </>
  );
};

// Register Form
const RegisterForm = ({ navigate }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleRegister = (e) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const successMessage = {
      text: "Account successfully created! Please log in using 'test@example.com' and 'password'.",
      type: "success",
    };
    navigate("login", successMessage);
  };

  const [isButtonHovered, setIsButtonHovered] = useState(false);

  return (
    <>
      <img
        src={logoImage}
        alt="Logo"
        style={authStyles.logo}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src =
            "https://placehold.co/120x80/007bff/white?text=LOGO";
        }}
      />

      <h2 style={{ fontSize: "24px", color: "#333", marginBottom: "10px" }}>
        Sign up
      </h2>

      <p style={authStyles.promptText}>Create your new account</p>

      {error && (
        <div
          style={{
            ...authStyles.messageBox,
            backgroundColor: "#f8d7da",
            color: "#721c24",
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleRegister}
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={authStyles.formElement}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={authStyles.inputField}
            required
          />
        </div>

        <div style={authStyles.formElement}>
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={authStyles.inputField}
            required
          />
        </div>

        <button
          type="submit"
          style={{
            ...authStyles.mainButton,
            backgroundColor: isButtonHovered ? "#0056b3" : "#007bff",
          }}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
        >
          Create Account
        </button>
      </form>

      <div style={authStyles.signUpLink}>
        Already have an account?{" "}
        <a
          href="#"
          style={authStyles.link}
          onClick={(e) => {
            e.preventDefault();
            navigate("login");
          }}
        >
          Log in
        </a>
      </div>

      {/* Back to Home Link */}
      <div style={{ marginTop: "20px" }}>
        <a
          href="#"
          style={authStyles.link}
          onClick={(e) => {
            e.preventDefault();
            navigate("home");
          }}
        >
          ← Back to Home
        </a>
      </div>
    </>
  );
};

// Forgot Password Form
const ForgotPasswordForm = ({ navigate }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleForgot = (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setMessage(
      `A password reset link has been sent to ${email}. Check your inbox. (Demo message)`
    );
  };

  const [isButtonHovered, setIsButtonHovered] = useState(false);

  return (
    <>
      <img
        src={logoImage}
        alt="Logo"
        style={authStyles.logo}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src =
            "https://placehold.co/120x80/007bff/white?text=LOGO";
        }}
      />

      <h2
        style={{ fontSize: "24px", color: "#444444ff", marginBottom: "10px" }}
      >
        Forgot Password
      </h2>

      <p style={authStyles.promptText}>
        Enter your email to receive a password reset link.
      </p>

      {message && (
        <div
          style={{
            ...authStyles.messageBox,
            backgroundColor: "#d1ecf1",
            color: "#0c5460",
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            ...authStyles.messageBox,
            backgroundColor: "#f8d7da",
            color: "#721c24",
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleForgot}
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={authStyles.formElement}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={authStyles.inputField}
            required
          />
        </div>

        <button
          type="submit"
          style={{
            ...authStyles.mainButton,
            backgroundColor: isButtonHovered ? "#0056b3" : "#007bff",
          }}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
        >
          Send Reset Link
        </button>
      </form>

      <a
        href="#"
        style={authStyles.secondaryLink}
        onClick={(e) => {
          e.preventDefault();
          navigate("login");
        }}
      >
        Back to Login
      </a>

      {/* Back to Home Link */}
      <div style={{ marginTop: "20px" }}>
        <a
          href="#"
          style={authStyles.link}
          onClick={(e) => {
            e.preventDefault();
            navigate("home");
          }}
        >
          ← Back to Home
        </a>
      </div>
    </>
  );
};

// ====================================================================
// 5. ОСНОВНОЙ КОМПОНЕНТ APP
// ====================================================================
const App = () => {
  const [currentScreen, setCurrentScreen] = useState("home");
  const [message, setMessage] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userNickname, setUserNickname] = useState("");

  const navigate = useCallback((screen, msg = null) => {
    setCurrentScreen(screen);
    setMessage(msg);
  }, []);

  const onLoginSuccess = useCallback(
    (screen = "home", nickname = "User") => {
      setIsLoggedIn(true);
      setUserNickname(nickname);
      navigate(screen, {
        type: "success",
        text: `Welcome back, ${nickname}! You have been successfully logged in.`,
      });
    },
    [navigate]
  );

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setUserNickname("");
    navigate("home", {
      type: "success",
      text: "You have been logged out successfully.",
    });
  }, [navigate]);

  const isAuthScreen = useMemo(
    () => ["login", "register", "forgot"].includes(currentScreen),
    [currentScreen]
  );

  const renderContent = () => {
    switch (currentScreen) {
      case "login":
        return (
          <LoginForm
            onLoginSuccess={onLoginSuccess}
            navigate={navigate}
            message={message}
          />
        );
      case "register":
        return <RegisterForm navigate={navigate} />;
      case "forgot":
        return <ForgotPasswordForm navigate={navigate} />;
      case "dashboard":
        return (
          <DashboardScreen
            navigate={navigate}
            userNickname={userNickname}
            handleLogout={handleLogout}
          />
        );
      case "home":
      default:
        return (
          <>
            {/* Header: sticky, full width background, centered content */}
            <div
              style={{
                width: "100%",
                borderBottom: "1px solid #f3f4f6",
                backgroundColor: "white",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
                position: "sticky",
                top: 0,
                zIndex: 20,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Header
                navigate={navigate}
                isLoggedIn={isLoggedIn}
                userNickname={userNickname}
                handleLogout={handleLogout}
              />
            </div>

            <main
              style={{
                flexGrow: 1,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "#f9fafb",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "1280px",
                  margin: "0 auto",
                  padding: "0 16px",
                }}
                className="sm:px-6 lg:px-8"
              >
                {/* Hero Section: Centered Search and CTA */}
                <div
                  style={{
                    padding: "80px 0 100px 0",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                  className="sm:py-24 lg:py-32"
                >
                  <SearchSection setMessage={setMessage} />
                  <MessageDisplay
                    message={message?.text}
                    type={message?.type}
                  />
                </div>

                {/* Statistics Section: Full width but content max-w-7xl centered */}
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    paddingBottom: "80px",
                  }}
                >
                  <StatsSection />
                </div>
              </div>
            </main>

            <Footer navigate={navigate} />
          </>
        );
    }
  };

  // Если это Auth/Forgot экран, показываем его в специальном центрированном контейнере
  if (isAuthScreen) {
    return (
      <div style={authStyles.pageContainer}>
        <div
          style={{
            ...authStyles.background,
            backgroundImage: `url(${backgroundImage})`,
          }}
        ></div>
        <div style={authStyles.card}>{renderContent()}</div>
      </div>
    );
  }

  // Если это Dashboard, возвращаем только его содержимое
  if (currentScreen === "dashboard") {
    return renderContent();
  }

  // В противном случае, это домашняя страница
  return (
    <>
      <style>{globalStyles}</style>
      <div
        className="app-container"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {renderContent()}
      </div>
    </>
  );
};

export default App;
