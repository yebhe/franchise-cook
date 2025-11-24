import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Truck,
  Home,
  ChefHat,
  MapPin,
  Boxes,
  Wrench,
  Calendar,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  DollarSign,
  User,
} from "lucide-react";
import styles from "./FranchiseNavigation.module.css"
import useAuthStore from "../../../store/authStore";

const FranchiseNavigation = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Store Zustand
  const logout = useAuthStore((state) => state.logout);
  const getFullName = useAuthStore((state) => state.getFullName);
  const getInitials = useAuthStore((state) => state.getInitials);

  // Navigation sections pour franchisé
  const navigationSections = [
    {
      title: "Tableau de bord",
      items: [
        {
          id: "dashboard",
          title: "Vue d'ensemble",
          icon: Home,
          path: "/franchise/dashboard",
          badge: null,
        },
      ],
    },
    {
      title: "Mon Parc",
      items: [
        {
          id: "camions",
          title: "Mes Camions",
          icon: Truck,
          path: "/franchise/camions",
          badge: null,
        },
        {
          id: "emplacements",
          title: "Emplacements",
          icon: MapPin,
          path: "/franchise/emplacements",
          badge: null,
        },
        {
          id: "affectations",
          title: "Affectations",
          icon: Calendar,
          path: "/franchise/affectations",
          badge: null,
        },
        {
          id: "maintenances",
          title: "Maintenances",
          icon: Wrench,
          path: "/franchise/maintenances",
          badge: null,
        },
      ],
    },
    {
      title: "Approvisionnement",
      items: [
        {
          id: "stocks",
          title: "Stocks Disponibles",
          icon: Boxes,
          path: "/franchise/stocks",
          badge: null,
        },
        {
          id: "commandes",
          title: "Mes Commandes",
          icon: ShoppingCart,
          path: "/franchise/commandes",
          badge: null,
        },
      ],
    },
    {
      title: "Ventes & Finance",
      items: [
        {
          id: "ventes",
          title: "Saisie Ventes",
          icon: DollarSign,
          path: "/franchise/ventes",
          badge: null,
        },
      ],
    },
    {
      title: "Mon Compte",
      items: [
        {
          id: "profile",
          title: "Mon Profile",
          icon: User,
          path: "/franchise/profile",
          badge: null,
        },
      ],
    },
  ];

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Gestion du toggle mobile
  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Navigation
  const handleNavigation = (path) => {
    navigate(path);
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
    <div className={styles.main__content}>
      <div className={`${styles.nav__overlay} ${isMobileOpen ? styles["nav__overlay--active"] : ""}`} onClick={() => setIsMobileOpen(false)} />
      <button className={styles.nav__mobile_toggle} onClick={toggleMobile}>{isMobileOpen ? <X size={20}/> : <Menu size={20}/>}</button>

      <aside className={`${styles.nav__sidebar} ${isMobileOpen ? styles["nav__sidebar--open"] : ""}`}>
        <header className={styles.nav__header}>
          <Link to="/" className={styles.nav__logo}>
            <div className={styles.nav__logo_icon}><ChefHat size={24}/></div>
            <div className={styles.nav__logo_content}>
              <h1 className={styles.nav__logo_text}>DRIV'N COOK</h1>
              <p className={styles.nav__logo_subtitle}>Espace Franchisé</p>
            </div>
          </Link>
        </header>

        <nav className={styles.nav}>
          {navigationSections.map(section => (
            <div key={section.title} className={styles.nav__section}>
              <h3 className={styles.nav__section_title}>{section.title}</h3>
              <ul className={styles.nav__list}>
                {section.items.map(item => {
                  const Icon = item.icon;
                  const active = isActiveLink(item.path);
                  return (
                    <li key={item.id} className={styles.nav__item}>
                      <button className={`${styles.nav__link} ${active ? styles["nav__link--active"] : ""}`} onClick={() => handleNavigation(item.path)}>
                        <Icon className={styles.nav__icon} size={20} />
                        <span className={styles.nav__text}>{item.title}</span>
                        {item.badge && <span className={styles.nav__badge}>{item.badge}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <footer className={styles.nav__user}>
          <div className={styles.nav__user_info}>
            <div className={styles.nav__user_avatar}>{getInitials()}</div>
            <div className={styles.nav__user_details}>
              <p className={styles.nav__user_name}>{getFullName()}</p>
              <p className={styles.nav__user_role}>Franchisé</p>
            </div>
          </div>
          <div className={styles.nav__logout}>
            <button className={`${styles.nav__link} ${styles["nav__link--logout"]}`} onClick={handleLogout}>
              <LogOut className={styles.nav__icon} size={20}/>
              <span className={styles.nav__text}>Déconnexion</span>
            </button>
          </div>
        </footer>
      </aside>
    </div>
  );
};


export default FranchiseNavigation;
