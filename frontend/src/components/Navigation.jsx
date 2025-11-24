import React, { useContext, useState } from "react";
import {
  Truck,
  Home,
  ChefHat,
  Mail,
  LogIn,
  LogOut,
  UserPlus,
  Menu,
  X,
  Settings,
  Users,
  Sun,
  Moon,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navigation.module.css";
import { ThemeContext } from "../context/ThemeProvider";

const Navigation = () => {
  const navigate = useNavigate();
  const {theme, hanldeTheme} = useContext(ThemeContext)

  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const getUserType = useAuthStore((state) => state.getUserType);
  const getHasFranchise = useAuthStore((state) => state.getHasFranchise);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const handleLogin = () => {
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const handleRegister = () => {
    navigate("/register");
    setIsMobileMenuOpen(false);
  };

  const handleHome = () => {
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const handleDashboard = () => {
    const userType = getUserType();
    const hasFranchise = getHasFranchise();

    if (userType === "admin") {
      navigate("/admin/dashboard");
    } else if (userType === "franchise" && hasFranchise) {
      navigate("/franchise/dashboard");
    }
    setIsMobileMenuOpen(false);
  };

  const navigationLinks = [
    { id: "accueil", title: "Accueil", icon: Home, path: "/" },
    { id: "services", title: "Nos Services", icon: Truck, path: "/services" },
    { id: "contact", title: "Contact", icon: Mail, path: "/contact" },
  ];

  const canShowDashboard = () => {
    const userType = getUserType();
    const hasFranchise = getHasFranchise();
    return userType === "admin" || (userType === "franchise" && hasFranchise);
  };

  const getDashboardButtonText = () => {
    const userType = getUserType();
    if (userType === "admin") return "Admin Dashboard";
    return "Franchise Dashboard";
  };

  return (
    <div className={styles.header}>
      <header className={styles.header__container}>

        <div className={styles.header__logo} onClick={handleHome}>
          <ChefHat size={34} color="white" />
          <div>
            <h1 className={styles.header__logo_text}>DRIV'N COOK</h1>
            <p className={styles.header__logo_subtitle}>Food Trucks de Qualité</p>
          </div>
        </div>

        <button
          className={styles.theme}
          onClick={()=>hanldeTheme()}
          aria-label="Toggle menu"
          disabled={isLoading}
        >
          {theme === 'light' ? <Moon /> : <Sun />}
        </button>

        <button
          className={styles.header__menu_toggle}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          disabled={isLoading}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`${styles.nav} ${isMobileMenuOpen ? styles["nav--open"] : ""}`}>
          <nav className={styles.nav__list}>
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.id}
                  to={link.path}
                  className={styles.nav__link}
                  disabled={isLoading}
                >
                  <Icon size={18} className={styles.nav__icon} />
                  <span>{link.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className={styles.auth}>
            {!isAuthenticated ? (
              <div className={styles.auth__actions}>
                <button
                  onClick={handleLogin}
                  className={styles.auth__button}
                  disabled={isLoading}
                >
                  <LogIn size={16} className={styles.auth__icon} />
                  <span>Connexion</span>
                </button>
                <button
                  onClick={handleRegister}
                  className={styles.auth__button}
                  disabled={isLoading}
                >
                  <UserPlus size={16} className={styles.auth__icon} />
                  <span>S'inscrire</span>
                </button>
              </div>
            ) : (
              <div className={styles.auth__actions}>
                {canShowDashboard() && (
                  <button
                    onClick={handleDashboard}
                    className={styles.auth__button}
                    disabled={isLoading}
                  >
                    {getUserType() === "admin" ? (
                      <Settings size={16} className={styles.auth__icon} />
                    ) : (
                      <Users size={16} />
                    )}
                    <span>{getDashboardButtonText()}</span>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className={styles.auth__button}
                  disabled={isLoading}
                >
                  <LogOut size={16} className={styles.auth__icon} />
                  <span>{isLoading ? "Déconnexion..." : "Déconnexion"}</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </header>
    </div>
  );
};

export default Navigation;
