import React, { useState, useEffect } from "react";
import {
  Wrench,
  Truck,
  Calendar,
  Euro,
  Search,
  Filter,
  Loader,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Info,
} from "lucide-react";
import "./MesMaintenances.css";
import useAuthStore from "../../../store/authStore";
import apiClient from "../../../api/axiosConfig";

const MesMaintenances = () => {
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("tous");
  const [statutFilter, setStatutFilter] = useState("tous");

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // ===== FONCTIONS UTILITAIRES =====
  const getTypeMaintenanceLabel = (type) => {
    const types = {
      revision: "Révision",
      reparation: "Réparation",
      panne: "Panne",
      controle_technique: "Contrôle technique",
    };
    return types[type] || type;
  };

  const getTypeMaintenanceColor = (type) => {
    switch (type) {
      case "revision":
        return "mes-maintenances__badge--revision";
      case "reparation":
        return "mes-maintenances__badge--reparation";
      case "panne":
        return "mes-maintenances__badge--panne";
      case "controle_technique":
        return "mes-maintenances__badge--controle";
      default:
        return "mes-maintenances__badge--default";
    }
  };

  const getStatutLabel = (statut) => {
    const statuts = {
      programme: "Programmé",
      en_cours: "En cours",
      termine: "Terminé",
    };
    return statuts[statut] || statut;
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case "programme":
        return "mes-maintenances__badge--programme";
      case "en_cours":
        return "mes-maintenances__badge--en_cours";
      case "termine":
        return "mes-maintenances__badge--termine";
      default:
        return "mes-maintenances__badge--default";
    }
  };

  const getStatutIcon = (statut) => {
    switch (statut) {
      case "programme":
        return <Clock size={14} />;
      case "en_cours":
        return <Wrench size={14} />;
      case "termine":
        return <CheckCircle size={14} />;
      default:
        return <AlertTriangle size={14} />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const formatPrice = (price) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const getCamionInfo = (maintenance) => {
    // 1. Essayez d'abord avec camion_detail
    if (maintenance.camion_detail) {
      return `Camion ${
        maintenance.camion_detail.numero_camion || maintenance.camion
      }`;
    }

    // 2. Fallback avec l'ID du camion
    return maintenance.camion
      ? `Camion ${maintenance.camion}`
      : "Camion inconnu";
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // ===== CHARGEMENT DES DONNÉES =====
  const fetchMaintenances = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get("/api_user/maintenances/");
      console.log("Données maintenances reçues:", response.data);
      setMaintenances(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError("Erreur lors du chargement des maintenances");
      console.error("Erreur API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMaintenances();
    }
  }, [isAuthenticated]);

  // ===== FILTRAGE DES MAINTENANCES =====
  const maintenancesFiltrees = maintenances.filter((maintenance) => {
    const camionInfo = getCamionInfo(maintenance);

    const matchSearch =
      camionInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      maintenance.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (maintenance.garage &&
        maintenance.garage.toLowerCase().includes(searchTerm.toLowerCase())) ||
      maintenance.date_maintenance.includes(searchTerm);

    const matchType =
      typeFilter === "tous" || maintenance.type_maintenance === typeFilter;
    const matchStatut =
      statutFilter === "tous" || maintenance.statut === statutFilter;

    return matchSearch && matchType && matchStatut;
  });

  // Statistiques pour le tableau de bord
  const stats = {
    total: maintenances.length,
    enCours: maintenances.filter((m) => m.statut === "en_cours").length,
    programmes: maintenances.filter((m) => m.statut === "programme").length,
    terminees: maintenances.filter((m) => m.statut === "termine").length,
    coutTotal: maintenances.reduce(
      (sum, m) => sum + (parseFloat(m.cout) || 0),
      0
    ),
  };

  // ===== RENDU CONDITIONNEL - LOADING =====
  if (loading) {
    return (
      <div className="mes-maintenances__loading">
        <Loader className="mes-maintenances__spinner" size={32} />
        <p>Chargement des maintenances...</p>
      </div>
    );
  }

  // ===== RENDU PRINCIPAL =====
  return (
    <div className="mes-maintenances__container">
      {/* Header */}
      <div className="mes-maintenances__header">
        <div className="mes-maintenances__header-content">
          <div className="mes-maintenances__title-section">
            <h1 className="mes-maintenances__title">
              <Wrench className="mes-maintenances__title-icon" size={32} />
              Historique des Maintenances
            </h1>
            <p className="mes-maintenances__subtitle">
              Consultez l'historique des maintenances et réparations de vos
              camions
            </p>
          </div>
          <div className="mes-maintenances__header-actions">
            <button
              onClick={fetchMaintenances}
              className="mes-maintenances__btn mes-maintenances__btn--secondary"
              disabled={loading}
            >
              <RefreshCw
                size={20}
                className={loading ? "mes-maintenances__icon--spinning" : ""}
              />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Message d'information */}
      <div className="mes-maintenances__info-banner">
        <Info size={20} className="mes-maintenances__info-icon" />
        <span>
          <strong>Information :</strong> Cet espace vous permet de consulter
          l'historique des maintenances de vos camions. Pour planifier de
          nouvelles maintenances, contactez votre responsable DRIV'N COOK.
        </span>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mes-maintenances__alert mes-maintenances__alert--error">
          {error}
        </div>
      )}

      {/* Statistiques */}
      <div className="mes-maintenances__stats">
        <div className="mes-maintenances__stat-card">
          <div className="mes-maintenances__stat-icon mes-maintenances__stat-icon--total">
            <Wrench size={24} />
          </div>
          <div className="mes-maintenances__stat-content">
            <div className="mes-maintenances__stat-value">{stats.total}</div>
            <div className="mes-maintenances__stat-label">
              Total maintenances
            </div>
          </div>
        </div>

        <div className="mes-maintenances__stat-card">
          <div className="mes-maintenances__stat-icon mes-maintenances__stat-icon--en-cours">
            <Clock size={24} />
          </div>
          <div className="mes-maintenances__stat-content">
            <div className="mes-maintenances__stat-value">{stats.enCours}</div>
            <div className="mes-maintenances__stat-label">En cours</div>
          </div>
        </div>

        <div className="mes-maintenances__stat-card">
          <div className="mes-maintenances__stat-icon mes-maintenances__stat-icon--programmes">
            <Calendar size={24} />
          </div>
          <div className="mes-maintenances__stat-content">
            <div className="mes-maintenances__stat-value">
              {stats.programmes}
            </div>
            <div className="mes-maintenances__stat-label">Programmées</div>
          </div>
        </div>

        <div className="mes-maintenances__stat-card">
          <div className="mes-maintenances__stat-icon mes-maintenances__stat-icon--cout">
            <Euro size={24} />
          </div>
          <div className="mes-maintenances__stat-content">
            <div className="mes-maintenances__stat-value">
              {formatPrice(stats.coutTotal)}
            </div>
            <div className="mes-maintenances__stat-label">Coût total</div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="mes-maintenances__filters">
        <div className="mes-maintenances__search">
          <Search className="mes-maintenances__search-icon" size={20} />
          <input
            type="text"
            placeholder="Rechercher par camion, description, garage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mes-maintenances__search-input"
          />
        </div>

        <div className="mes-maintenances__filter">
          <Filter className="mes-maintenances__filter-icon" size={20} />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="mes-maintenances__filter-select"
          >
            <option value="tous">Tous les types</option>
            <option value="revision">Révision</option>
            <option value="reparation">Réparation</option>
            <option value="panne">Panne</option>
            <option value="controle_technique">Contrôle technique</option>
          </select>
        </div>

        <div className="mes-maintenances__filter">
          <select
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value)}
            className="mes-maintenances__filter-select"
          >
            <option value="tous">Tous les statuts</option>
            <option value="programme">Programmé</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminé</option>
          </select>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="mes-maintenances__content">
        {maintenancesFiltrees.length === 0 ? (
          <div className="mes-maintenances__empty">
            <Wrench size={48} className="mes-maintenances__empty-icon" />
            <h3 className="mes-maintenances__empty-title">
              {maintenances.length === 0
                ? "Aucune maintenance"
                : "Aucune maintenance trouvée"}
            </h3>
            <p className="mes-maintenances__empty-text">
              {maintenances.length === 0
                ? "Aucune maintenance n'a été enregistrée pour vos camions."
                : "Essayez de modifier vos critères de recherche."}
            </p>
          </div>
        ) : (
          <div className="mes-maintenances__list">
            {maintenancesFiltrees.map((maintenance) => (
              <div key={maintenance.id} className="mes-maintenances__card">
                {/* Header de la carte */}
                <div className="mes-maintenances__card-header">
                  <div className="mes-maintenances__card-info">
                    <div className="mes-maintenances__card-title">
                      <Truck
                        size={18}
                        className="mes-maintenances__card-icon"
                      />
                      {getCamionInfo(maintenance)}
                    </div>
                    <div className="mes-maintenances__card-subtitle">
                      <Calendar
                        size={16}
                        className="mes-maintenances__card-icon"
                      />
                      {formatDate(maintenance.date_maintenance)}
                    </div>
                  </div>
                  <div className="mes-maintenances__card-badges">
                    <span
                      className={`mes-maintenances__badge ${getTypeMaintenanceColor(
                        maintenance.type_maintenance
                      )}`}
                    >
                      {getTypeMaintenanceLabel(maintenance.type_maintenance)}
                    </span>
                    <span
                      className={`mes-maintenances__badge ${getStatutColor(
                        maintenance.statut
                      )}`}
                    >
                      {getStatutIcon(maintenance.statut)}
                      {getStatutLabel(maintenance.statut)}
                    </span>
                  </div>
                </div>

                {/* Contenu de la carte */}
                <div className="mes-maintenances__card-content">
                  <div className="mes-maintenances__description">
                    <h4 className="mes-maintenances__description-title">
                      Description
                    </h4>
                    <p className="mes-maintenances__description-text">
                      {maintenance.description}
                    </p>
                  </div>

                  <div className="mes-maintenances__info-grid">
                    {maintenance.cout && (
                      <div className="mes-maintenances__info-item">
                        <Euro
                          size={16}
                          className="mes-maintenances__info-icon"
                        />
                        <span className="mes-maintenances__info-label">
                          Coût
                        </span>
                        <span className="mes-maintenances__info-value">
                          {formatPrice(maintenance.cout)}
                        </span>
                      </div>
                    )}

                    {maintenance.garage && (
                      <div className="mes-maintenances__info-item">
                        <MapPin
                          size={16}
                          className="mes-maintenances__info-icon"
                        />
                        <span className="mes-maintenances__info-label">
                          Garage
                        </span>
                        <span className="mes-maintenances__info-value">
                          {maintenance.garage}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MesMaintenances;
