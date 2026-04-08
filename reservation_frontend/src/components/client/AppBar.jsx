import React, { useState } from "react";
import { Menu, X, Globe, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/authSlice";
import toast from "react-hot-toast";

const AppBarClient = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [language, setLanguage] = useState("en");
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setShowLanguageDropdown(false);
    toast.success(`Language changed to ${lang.toUpperCase()}`);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const toggleLanguageDropdown = () => {
    setShowLanguageDropdown(!showLanguageDropdown);
  };

  const handleProfileAction = (action) => {
    setShowProfileDropdown(false);
    setIsMenuOpen(false);

    switch (action) {
      case "profile":
        navigate("/client/profile");
        break;
      case "bookings":
        navigate("/client/bookings");
        break;
      case "favorites":
        navigate("/client/favorites");
        break;
      case "settings":
        navigate("/client/settings");
        break;
      case "logout":
        dispatch(logout());
        toast.success("Logged out successfully");
        navigate("/login");
        break;
    }
  };

  const menuItems = [
    { key: "home", label: "Home", icon: "🏠" },
    { key: "search", label: "Search", icon: "🔍" },
    { key: "bookings", label: "My Bookings", icon: "📅" },
    { key: "favorites", label: "Favorites", icon: "❤️" },
  ];

  return (
    <header className="cli-appbar-header">
      <div className="cli-appbar-container">
        <div className="cli-appbar-flex">
          <div className="cli-appbar-logo-section">
            <div className="cli-appbar-logo">
              <span className="cli-appbar-logo-text">AIMO</span>
            </div>
            <h1 className="cli-appbar-title">AIMO</h1>
          </div>

          <nav className="cli-appbar-menu-desktop">
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleProfileAction(item.key)}
                className="cli-appbar-menu-item"
              >
                <span className="cli-appbar-menu-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="cli-appbar-actions-desktop">
            <div className="cli-appbar-language-section">
              <Globe
                className="cli-appbar-globe-icon"
                onClick={toggleLanguageDropdown}
              />
              {showLanguageDropdown && (
                <div className="cli-appbar-language-dropdown">
                  <button
                    onClick={() => handleLanguageChange("en")}
                    className="cli-appbar-language-option"
                  >
                    EN
                  </button>
                  <button
                    onClick={() => handleLanguageChange("ar")}
                    className="cli-appbar-language-option"
                  >
                    AR
                  </button>
                  <button
                    onClick={() => handleLanguageChange("fr")}
                    className="cli-appbar-language-option"
                  >
                    FR
                  </button>
                </div>
              )}
            </div>

            <div className="cli-appbar-profile-section">
              <div
                className="cli-appbar-profile"
                onClick={toggleProfileDropdown}
              >
                <User className="cli-appbar-profile-icon" />
                <span className="cli-appbar-profile-name">
                  {user?.username || "Guest"}
                </span>
              </div>

              {showProfileDropdown && (
                <div className="cli-appbar-profile-dropdown">
                  <button
                    onClick={() => handleProfileAction("profile")}
                    className="cli-appbar-profile-option"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => handleProfileAction("bookings")}
                    className="cli-appbar-profile-option"
                  >
                    My Bookings
                  </button>
                  <button
                    onClick={() => handleProfileAction("favorites")}
                    className="cli-appbar-profile-option"
                  >
                    My Favorites
                  </button>
                  <button
                    onClick={() => handleProfileAction("settings")}
                    className="cli-appbar-profile-option"
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => handleProfileAction("logout")}
                    className="cli-appbar-profile-option cli-appbar-signout"
                  >
                    <LogOut className="cli-appbar-logout-icon" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="cli-appbar-mobile-menu-button">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="cli-appbar-mobile-btn"
            >
              {isMenuOpen ? (
                <X className="cli-icon" />
              ) : (
                <Menu className="cli-icon" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="cli-appbar-mobile-menu">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                handleProfileAction(item.key);
                setIsMenuOpen(false);
              }}
              className="cli-appbar-mobile-menu-item"
            >
              <span className="cli-appbar-menu-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div className="cli-appbar-profile-section-mobile">
            <div className="cli-appbar-profile-info-mobile">
              <User className="cli-appbar-profile-icon-mobile" />
              <span className="cli-appbar-profile-name-mobile">
                {user?.username || "Guest"}
              </span>
            </div>

            <div className="cli-appbar-profile-options-mobile">
              <button
                onClick={() => {
                  handleProfileAction("profile");
                  setIsMenuOpen(false);
                }}
                className="cli-appbar-profile-option-mobile"
              >
                My Profile
              </button>
              <button
                onClick={() => {
                  handleProfileAction("bookings");
                  setIsMenuOpen(false);
                }}
                className="cli-appbar-profile-option-mobile"
              >
                My Bookings
              </button>
              <button
                onClick={() => {
                  handleProfileAction("favorites");
                  setIsMenuOpen(false);
                }}
                className="cli-appbar-profile-option-mobile"
              >
                My Favorites
              </button>
              <button
                onClick={() => {
                  handleProfileAction("settings");
                  setIsMenuOpen(false);
                }}
                className="cli-appbar-profile-option-mobile"
              >
                Settings
              </button>
              <button
                onClick={() => {
                  handleProfileAction("logout");
                  setIsMenuOpen(false);
                }}
                className="cli-appbar-profile-option-mobile cli-appbar-signout-mobile"
              >
                <LogOut className="cli-appbar-logout-icon-mobile" />
                Sign Out
              </button>
            </div>
          </div>

          <div className="cli-appbar-language-mobile">
            <Globe className="cli-appbar-globe-icon-mobile" />
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="cli-appbar-language-select"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>
      )}
    </header>
  );
};

export default AppBarClient;
