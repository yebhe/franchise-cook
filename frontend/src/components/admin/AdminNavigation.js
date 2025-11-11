// AdminNavigation.jsx
import React, { useState, useEffect } from "react";
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
  FileText,
  Warehouse,
  Calendar,
  ShoppingCart,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import "./AdminNavigation.css";

const AdminNavigation = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Zustand store
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
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
          badge: "32",
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
    <>
      {/* Overlay mobile */}
      <div
        className={`admin-nav-overlay ${
          isMobileOpen ? "admin-nav-overlay--active" : ""
        }`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Bouton menu mobile */}
      <button
        className="admin-nav-mobile-button"
        onClick={toggleMobile}
        aria-label={isMobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`admin-nav-sidebar ${
          isMobileOpen ? "admin-nav-sidebar--mobile-open" : ""
        }`}
      >
        {/* Header */}
        <header className="admin-nav-header">
          <div className="admin-nav-logo">
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="admin-nav-logo-icon">
                <ChefHat size={24} />
              </div>
              <div className="admin-nav-logo-content">
                <h1 className="admin-nav-title">DRIV'N COOK</h1>
                <p className="admin-nav-subtitle">Administration</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Navigation principale */}
        <nav className="admin-nav-main">
          {navigationSections.map((section) => (
            <div key={section.title} className="admin-nav-section">
              <h3 className="admin-nav-section-title">{section.title}</h3>

              <ul className="admin-nav-list">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveLink(item.path);

                  return (
                    <li key={item.id} className="admin-nav-item">
                      <button
                        className={`admin-nav-link ${
                          isActive ? "admin-nav-link--active" : ""
                        }`}
                        onClick={() => handleNavigation(item.path)}
                      >
                        <Icon className="admin-nav-icon" size={20} />
                        <span className="admin-nav-text">{item.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Section utilisateur */}
        <footer className="admin-nav-user">
          <div className="admin-nav-user-info">
            <div className="admin-nav-user-avatar">{getInitials()}</div>
            <div className="admin-nav-user-details">
              <p className="admin-nav-user-name">{getFullName()}</p>
              <p className="admin-nav-user-role">Administrateur</p>
            </div>
          </div>

          <div className="admin-nav-logout">
            <button
              className="admin-nav-link admin-nav-link--logout"
              onClick={handleLogout}
            >
              <LogOut className="admin-nav-icon" size={20} />
              <span className="admin-nav-text">Déconnexion</span>
            </button>
          </div>
        </footer>
      </aside>
    </>
  );
};

export default AdminNavigation;
