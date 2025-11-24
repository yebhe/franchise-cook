
import React, { useState, useEffect } from "react";
import {
  Users,
  Truck,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import useAuthStore from "../../store/authStore";
import apiClient from "../../api/axiosConfig";
import StatsCard from "../common/StatsCard";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userType = useAuthStore((state) => state.getUserType());
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || userType !== "admin") {
      navigate("/");
    }
    fetchStats();
  }, [isAuthenticated, userType, navigate]);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get("api/dashboard/stats/");
      setStats(response.data);
    } catch (error) {
      console.error("Erreur récupération stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (path) => {
    navigate(path);
  };

  const quickActions = [
    {
      title: "Gérer les franchisés",
      icon: Users,
      color: "blue",
      path: "/admin/franchises",
    },
    {
      title: "Attribuer un camion",
      icon: Truck,
      color: "green",
      path: "/admin/camions",
    },
    {
      title: "Valider des commandes",
      icon: CheckCircle,
      color: "yellow",
      path: "/admin/commandes",
    },
  ];

  return (
    <div className="admin-dashboard__container">
      {/* Header */}
      <div className="admin-dashboard__header">
        <h1 className="admin-dashboard__title">
          Tableau de bord administrateur
        </h1>
        <p className="admin-dashboard__subtitle">
          Vue d'ensemble de l'activité DRIV'N COOK
        </p>
      </div>

      {/* Stats Cards */}
      <div className="admin-dashboard__stats-grid">
        <StatsCard
          title="Franchises actives"
          value={stats?.franchises_actives || "0"}
          icon={Users}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Camions disponibles"
          value={stats?.camions_disponibles || "0"}
          icon={Truck}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Commandes en attente"
          value={stats?.commandes_en_attente || "0"}
          icon={ShoppingCart}
          color="yellow"
          isLoading={isLoading}
        />
        <StatsCard
          title="Alertes stock"
          value={stats?.alertes_stock || "0"}
          icon={AlertTriangle}
          color="red"
          isLoading={isLoading}
        />
      </div>

      {/* Content Grid */}
      <div className="admin-dashboard__content-grid">
        {/* Actions rapides */}
        <div className="admin-dashboard__card">
          <h3 className="admin-dashboard__card-title">Actions rapides</h3>
          <div className="admin-dashboard__actions">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  className={`admin-dashboard__action admin-dashboard__action--${action.color}`}
                  onClick={() => handleQuickAction(action.path)}
                >
                  <span className="admin-dashboard__action-text">
                    {action.title}
                  </span>
                  <Icon className="admin-dashboard__action-icon" size={20} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Alertes système */}
        <div className="admin-dashboard__card">
          <h3 className="admin-dashboard__card-title">Alertes système</h3>
          <div className="admin-dashboard__alerts">
            {isLoading ? (
              <div className="admin-dashboard__loading">
                <div className="admin-dashboard__skeleton"></div>
                <div className="admin-dashboard__skeleton admin-dashboard__skeleton--small"></div>
                <div className="admin-dashboard__skeleton admin-dashboard__skeleton--tiny"></div>
              </div>
            ) : (
              <>
                <div className="admin-dashboard__alert">
                  <AlertTriangle
                    className="admin-dashboard__alert-icon admin-dashboard__alert-icon--warning"
                    size={20}
                  />
                  <div className="admin-dashboard__alert-content">
                    <p className="admin-dashboard__alert-title">
                      Stock faible détecté
                    </p>
                    <p className="admin-dashboard__alert-description">
                      {stats?.alertes_stock || 0} produits concernés
                    </p>
                  </div>
                </div>
                <div className="admin-dashboard__alert">
                  <CheckCircle
                    className="admin-dashboard__alert-icon admin-dashboard__alert-icon--success"
                    size={20}
                  />
                  <div className="admin-dashboard__alert-content">
                    <p className="admin-dashboard__alert-title">
                      Système opérationnel
                    </p>
                    <p className="admin-dashboard__alert-description">
                      Tous les services fonctionnent
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
