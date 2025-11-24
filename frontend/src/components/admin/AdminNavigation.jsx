// AdminNavigation.jsx
import React, { useContext, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Truck,
  Users,
  Package,
  Tag,
  Settings,
  Home,
  ChefHat,
  MapPin,
  Boxes,
  Wrench,
  Warehouse,
  Calendar,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import styles from "./AdminNavigation.module.css";
import { ThemeContext } from "../../context/ThemeProvider";

const AdminNavigation = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, hanldeTheme } = useContext(ThemeContext);
  // Zustand store
  const logout = useAuthStore((state) => state.logout);
  const getFullName = useAuthStore((state) => state.getFullName);
  const getInitials = useAuthStore((state) => state.getInitials);

  // Navigation items
  const navigationSections = [
    {
      title: "Tableau de bord",
      items: [
        {
          id: "dashboard",
          title: "Vue d'ensemble",
          icon: Home,
          path: "/admin/dashboard",
          badge: null,
        },
      ],
    },
    {
      title: "Gestion",
      items: [
        {
          id: "franchises",
          title: "Franchisés",
          icon: Users,
          path: "/admin/franchises",
          badge: null,
        },
        {
          id: "camions",
          title: "Camions",
          icon: Truck,
          path: "/admin/camions",
          badge: null,
        },
        {
          id: "Entrepots",
          title: "Entrepots",
          icon: Warehouse,
          path: "/admin/entrepots",
          badge: null,
        },
        {
          id: "emplacements",
          title: "Emplacements",
          icon: MapPin,
          path: "/admin/emplacements",
          badge: null,
        },
        {
          id: "maintenances",
          title: "Maintenances",
          icon: Wrench,
          path: "/admin/maintenances",
          badge: null,
        },
        {
          id: "affectations",
          title: "Affectations",
          icon: Calendar,
          path: "/admin/affectations",
          badge: null,
        },
      ],
    },
    {
      title: "Gestions Produits",
      items: [
        {
          id: "categories",
          title: "Catégories",
          icon: Tag,
          path: "/admin/categories",
          badge: null,
        },
        {
          id: "produits",
          title: "Produits",
          icon: Package,
          path: "/admin/produits",
          badge: null,
        },
        {
          id: "stocks",
          title: "Stocks",
          icon: Boxes,
          path: "/admin/stocks",
          badge: null,
        },
      ],
    },
    {
      title: "Finances",
      items: [
        {
          id: "commandes",
          title: "Commandes",
          icon: ShoppingCart,
          path: "/admin/commandes",
          badge: null,
        },
        {
          id: "Profile",
          title: "Profile",
          icon: Settings,
          path: "/admin/Profile",
          badge: null,
        },
      ],
    },
  ];

  // Gestion du toggle mobile
  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Navigation
  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  // Déconnexion
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Vérifier si un lien est actif
  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <main className={styles.main__content}>
        {/* Overlay mobile */}
        <div
          className={`${styles.nav__overlay} ${
            isMobileOpen ? styles["nav__overlay--active"] : ""
          }`}
          onClick={() => setIsMobileOpen(false)}
        />

        {/* Bouton menu mobile */}
        <button
          className={styles.nav__mobile_toggle}
          onClick={toggleMobile}
          aria-label={isMobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Sidebar */}
        <aside
          className={`${styles.nav__sidebar} ${
            isMobileOpen ? styles["nav__sidebar--open"] : ""
          }`}
        >
          {/* Header */}
          <header className={styles.nav__header}>
            <button
              className={styles.theme}
              onClick={() => hanldeTheme()}
              aria-label="Toggle menu"
            >
              {theme === "light" ? <Moon /> : <Sun />}
            </button>
            <Link to="/" className={styles.nav__logo}>
              <div className={styles.nav__logo_icon}>
                <ChefHat size={24} />
              </div>
              <div className={styles.nav__logo_content}>
                <h1 className={styles.nav__logo_text}>DRIV'N COOK</h1>
                <p className={styles.nav__logo_subtitle}>Administration</p>
              </div>
            </Link>
          </header>

          {/* Navigation principale */}
          <nav className={styles.nav}>
            {navigationSections.map((section) => (
              <div key={section.title} className={styles.nav__section}>
                <h3 className={styles.nav__section_title}>{section.title}</h3>

                <ul className={styles.nav__list}>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActiveLink(item.path);

                    return (
                      <li key={item.id} className={styles.nav__item}>
                        <button
                          className={`${styles.nav__link} ${
                            isActive ? styles["nav__link--active"] : ""
                          }`}
                          onClick={() => handleNavigation(item.path)}
                        >
                          <Icon className={styles.nav__icon} size={20} />
                          <span className={styles.nav__text}>{item.title}</span>
                          {item.badge && (
                            <span className={styles.nav__badge}>
                              {item.badge}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Section utilisateur */}
          <footer className={styles.nav__user}>
            <div className={styles.nav__user_info}>
              <div className={styles.nav__user_avatar}>{getInitials()}</div>
              <div className={styles.nav__user_details}>
                <p className={styles.nav__user_name}>{getFullName()}</p>
                <p className={styles.nav__user_role}>Administrateur</p>
              </div>
            </div>

            <div className={styles.nav__logout}>
              <button
                className={`${styles.nav__link} ${styles["nav__link--logout"]}`}
                onClick={handleLogout}
              >
                <LogOut className={styles.nav__icon} size={20} />
                <span className={styles.nav__text}>Déconnexion</span>
              </button>
            </div>
          </footer>
        </aside>
    </main>
  );
};

export default AdminNavigation;
