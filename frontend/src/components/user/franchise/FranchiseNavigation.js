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
          path: "/stocks",
          badge: null,
        },
        {
          id: "commandes",
          title: "Mes Commandes",
          icon: ShoppingCart,
          path: "/commandes",
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
          path: "/ventes",
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
          path: "/profile",
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
      {/* Styles CSS intégrés */}
      <style>{`
        :root {
          --franchise-nav-width: 280px;
          --franchise-nav-bg: #1e293b;
          --franchise-nav-bg-light: #334155;
          --franchise-nav-text: #e2e8f0;
          --franchise-nav-text-muted: #94a3b8;
          --franchise-nav-accent: #3b82f6;
          --franchise-nav-accent-hover: #2563eb;
          --franchise-nav-border: #475569;
          --franchise-nav-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --franchise-nav-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          --franchise-nav-z-index: 1000;
          --franchise-nav-success: #10b981;
          --franchise-nav-warning: #f59e0b;
          --franchise-nav-danger: #ef4444;
        }

        /* Overlay mobile */
        .franchise-nav-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: calc(var(--franchise-nav-z-index) - 1);
          opacity: 0;
          visibility: hidden;
          transition: var(--franchise-nav-transition);
        }

        .franchise-nav-overlay--active {
          opacity: 1;
          visibility: visible;
        }

        /* Bouton menu mobile */
        .franchise-nav-mobile-button {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: calc(var(--franchise-nav-z-index) + 1);
          display: none;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 0.5rem;
          box-shadow: var(--franchise-nav-shadow);
          cursor: pointer;
          transition: var(--franchise-nav-transition);
        }

        .franchise-nav-mobile-button:hover {
          background-color: #f9fafb;
          transform: translateY(-1px);
        }

        /* Sidebar principale */
        .franchise-nav-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: var(--franchise-nav-width);
          height: 100vh;
          background: linear-gradient(180deg, var(--franchise-nav-bg) 0%, #0f172a 100%);
          border-right: 1px solid var(--franchise-nav-border);
          z-index: var(--franchise-nav-z-index);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: var(--franchise-nav-transition);
          transform: translateX(0);
        }

        /* Header de la sidebar */
        .franchise-nav-header {
          padding: 1.5rem 1rem;
          border-bottom: 1px solid var(--franchise-nav-border);
          background: rgba(255, 255, 255, 0.05);
        }

        .franchise-nav-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .franchise-nav-logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          background: var(--franchise-nav-accent);
          border-radius: 0.5rem;
          color: white;
          flex-shrink: 0;
        }

        .franchise-nav-logo-content {
          flex: 1;
          min-width: 0;
        }

        .franchise-nav-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--franchise-nav-text);
          margin: 0;
          line-height: 1.2;
        }

        .franchise-nav-subtitle {
          font-size: 0.75rem;
          color: var(--franchise-nav-text-muted);
          margin: 0;
          margin-top: 0.125rem;
        }

        /* Navigation principale */
        .franchise-nav-main {
          flex: 1;
          padding: 1rem 0;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .franchise-nav-main::-webkit-scrollbar {
          width: 4px;
        }

        .franchise-nav-main::-webkit-scrollbar-track {
          background: transparent;
        }

        .franchise-nav-main::-webkit-scrollbar-thumb {
          background: var(--franchise-nav-border);
          border-radius: 2px;
        }

        /* Sections de navigation */
        .franchise-nav-section {
          margin-bottom: 1.5rem;
        }

        .franchise-nav-section:last-child {
          margin-bottom: 0;
        }

        .franchise-nav-section-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--franchise-nav-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 0.5rem 0;
          padding: 0 1rem;
        }

        /* Liste de navigation */
        .franchise-nav-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .franchise-nav-item {
          margin: 0;
        }

        /* Liens de navigation */
        .franchise-nav-link {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 0.75rem 1rem;
          background: transparent;
          border: none;
          color: var(--franchise-nav-text);
          text-decoration: none;
          cursor: pointer;
          transition: var(--franchise-nav-transition);
          position: relative;
          gap: 0.75rem;
          font-size: 0.875rem;
          text-align: left;
        }

        .franchise-nav-link:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .franchise-nav-link--active {
          background: var(--franchise-nav-accent);
          color: white;
        }

        .franchise-nav-link--active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: white;
        }

        .franchise-nav-link--logout {
          color: var(--franchise-nav-danger);
        }

        .franchise-nav-link--logout:hover {
          background: rgba(239, 68, 68, 0.1);
          color: var(--franchise-nav-danger);
        }

        /* Icônes de navigation */
        .franchise-nav-icon {
          flex-shrink: 0;
          transition: var(--franchise-nav-transition);
        }

        /* Texte de navigation */
        .franchise-nav-text {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: var(--franchise-nav-transition);
        }

        /* Badges */
        .franchise-nav-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 1.25rem;
          height: 1.25rem;
          padding: 0 0.25rem;
          background: var(--franchise-nav-warning);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 0.625rem;
          flex-shrink: 0;
        }

        /* Section utilisateur */
        .franchise-nav-user {
          border-top: 1px solid var(--franchise-nav-border);
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
        }

        .franchise-nav-user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .franchise-nav-user-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          background: var(--franchise-nav-accent);
          color: white;
          border-radius: 50%;
          font-size: 0.875rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .franchise-nav-user-details {
          flex: 1;
          min-width: 0;
        }

        .franchise-nav-user-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--franchise-nav-text);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .franchise-nav-user-role {
          font-size: 0.75rem;
          color: var(--franchise-nav-text-muted);
          margin: 0;
          margin-top: 0.125rem;
        }

        .franchise-nav-logout {
          margin-top: 0.5rem;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .franchise-nav-mobile-button {
            display: block;
          }

          .franchise-nav-sidebar {
            transform: translateX(-100%);
            width: var(--franchise-nav-width);
          }

          .franchise-nav-sidebar--mobile-open {
            transform: translateX(0);
          }
        }

        @media (max-width: 640px) {
          .franchise-nav-sidebar {
            width: 100vw;
            max-width: var(--franchise-nav-width);
          }
        }

        /* Contenu principal avec marge pour la sidebar */
        .franchise-main-content {
          margin-left: var(--franchise-nav-width);
          min-height: 100vh;
          transition: var(--franchise-nav-transition);
        }

        @media (max-width: 1024px) {
          .franchise-main-content {
            margin-left: 0;
          }
        }
      `}</style>

      {/* Overlay mobile */}
      <div
        className={`franchise-nav-overlay ${
          isMobileOpen ? "franchise-nav-overlay--active" : ""
        }`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Bouton menu mobile */}
      <button
        className="franchise-nav-mobile-button"
        onClick={toggleMobile}
        aria-label={isMobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`franchise-nav-sidebar ${
          isMobileOpen ? "franchise-nav-sidebar--mobile-open" : ""
        }`}
      >
        {/* Header */}
        <header className="franchise-nav-header">
          <div className="franchise-nav-logo">
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="franchise-nav-logo-icon">
                <ChefHat size={24} />
              </div>
              <div className="franchise-nav-logo-content">
                <h1 className="franchise-nav-title">DRIV'N COOK</h1>
                <p className="franchise-nav-subtitle">Espace Franchisé</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Navigation principale */}
        <nav className="franchise-nav-main">
          {navigationSections.map((section) => (
            <div key={section.title} className="franchise-nav-section">
              <h3 className="franchise-nav-section-title">{section.title}</h3>

              <ul className="franchise-nav-list">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveLink(item.path);

                  return (
                    <li key={item.id} className="franchise-nav-item">
                      <button
                        className={`franchise-nav-link ${
                          isActive ? "franchise-nav-link--active" : ""
                        }`}
                        onClick={() => handleNavigation(item.path)}
                      >
                        <Icon className="franchise-nav-icon" size={20} />
                        <span className="franchise-nav-text">{item.title}</span>
                        {item.badge && (
                          <span className="franchise-nav-badge">
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
        <footer className="franchise-nav-user">
          <div className="franchise-nav-user-info">
            <div className="franchise-nav-user-avatar">{getInitials()}</div>
            <div className="franchise-nav-user-details">
              <p className="franchise-nav-user-name">{getFullName()}</p>
              <p className="franchise-nav-user-role">Franchisé</p>
            </div>
          </div>

          <div className="franchise-nav-logout">
            <button
              className="franchise-nav-link franchise-nav-link--logout"
              onClick={handleLogout}
            >
              <LogOut className="franchise-nav-icon" size={20} />
              <span className="franchise-nav-text">Déconnexion</span>
            </button>
          </div>
        </footer>
      </aside>
    </>
  );
};

export default FranchiseNavigation;
