import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Calendar, 
  Wrench, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Gauge,
  X
} from 'lucide-react';
import './MesCamions.css';
import useAuthStore from '../../../store/authStore';
import apiClient from '../../../api/axiosConfig';
import FranchiseNavigation from './FranchiseNavigation';

const MesCamions = () => {
  const [camions, setCamions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [selectedCamion, setSelectedCamion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous');


  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);




  // Chargement des camions
  const fetchCamions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/api_user/camions/');
      setCamions(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Erreur lors du chargement des camions');
      console.error('Erreur API:', err);
      setCamions([]);
    } finally {
      setLoading(false);
    }
  };

  // Chargement des détails d'un camion
  const fetchCamionDetail = async (camionId) => {
    try {
      const response = await apiClient.get(`/api_user/camions/${camionId}/`);
      setSelectedCamion(response.data);
      setShowModal(true);
    } catch (err) {
      setError('Erreur lors du chargement des détails du camion');
      console.error('Erreur API:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCamions();
    }
  }, [isAuthenticated]);

  // Filtrage des camions
  const camionsFiltres = (camions || []).filter(camion => {
    if (!camion) return false;
    
    const matchSearch = (
      (camion.numero_camion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (camion.immatriculation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${camion.marque || ''} ${camion.modele || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchStatus = statusFilter === 'tous' || camion.statut === statusFilter;
    
    return matchSearch && matchStatus;
  });

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'attribue': return 'mes-camions__badge--attribue';
      case 'disponible': return 'mes-camions__badge--disponible';
      case 'maintenance': return 'mes-camions__badge--maintenance';
      case 'hors_service': return 'mes-camions__badge--hors_service';
      default: return 'mes-camions__badge--default';
    }
  };

  const getStatusText = (statut) => {
    switch (statut) {
      case 'attribue': return 'En service';
      case 'disponible': return 'Disponible';
      case 'maintenance': return 'Maintenance';
      case 'hors_service': return 'Hors service';
      default: return statut;
    }
  };

  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'attribue': return <CheckCircle size={16} />;
      case 'disponible': return <Clock size={16} />;
      case 'maintenance': return <Wrench size={16} />;
      case 'hors_service': return <AlertTriangle size={16} />;
      default: return <Truck size={16} />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatKilometrage = (km) => {
    if (!km) return '0 km';
    return new Intl.NumberFormat('fr-FR').format(km) + ' km';
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCamion(null);
  };

  // Auto-masquage des messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="mes-camions">
      <FranchiseNavigation />
      <div className="mes-camions__container">
        
        {/* Header */}
        <div className="mes-camions__header">
          <div className="mes-camions__header-content">
            <div className="mes-camions__title-section">
              <h1 className="mes-camions__title">
                <Truck className="mes-camions__title-icon" size={32} />
                Mes Camions
              </h1>
              <p className="mes-camions__subtitle">
                Gestion de votre parc de véhicules
              </p>
            </div>
            <button
              onClick={fetchCamions}
              className="mes-camions__btn mes-camions__btn--primary"
              disabled={loading}
            >
              <RefreshCw size={20} className={loading ? 'mes-camions__icon--spinning' : ''} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mes-camions__alert mes-camions__alert--error">
            {error}
          </div>
        )}
        {message && (
          <div className="mes-camions__alert mes-camions__alert--success">
            {message}
          </div>
        )}

        {/* Filtres et recherche */}
        <div className="mes-camions__filters">
          <div className="mes-camions__search">
            <Search className="mes-camions__search-icon" size={20} />
            <input
              type="text"
              placeholder="Rechercher par numéro, immatriculation, marque..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mes-camions__search-input"
            />
          </div>
          <div className="mes-camions__filter">
            <Filter className="mes-camions__filter-icon" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mes-camions__filter-select"
            >
              <option value="tous">Tous les statuts</option>
              <option value="attribue">En service</option>
              <option value="disponible">Disponible</option>
              <option value="maintenance">Maintenance</option>
              <option value="hors_service">Hors service</option>
            </select>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="mes-camions__content">
          {loading ? (
            <div className="mes-camions__loading">
              <div className="mes-camions__spinner"></div>
              <p>Chargement de vos camions...</p>
            </div>
          ) : camionsFiltres.length === 0 ? (
            <div className="mes-camions__empty">
              <Truck size={48} className="mes-camions__empty-icon" />
              <h3 className="mes-camions__empty-title">
                {camions.length === 0 ? 'Aucun camion attribué' : 'Aucun camion trouvé'}
              </h3>
              <p className="mes-camions__empty-text">
                {camions.length === 0 
                  ? 'Vous n\'avez pas encore de camion attribué à votre franchise.'
                  : 'Essayez de modifier vos critères de recherche.'
                }
              </p>
            </div>
          ) : (
            <div className="mes-camions__grid">
              {camionsFiltres.map((camion) => (
                <div key={camion.id} className="mes-camions__card">
                  {/* Header de la carte */}
                  <div className="mes-camions__card-header">
                    <div className="mes-camions__card-title-section">
                      <h3 className="mes-camions__card-title">
                        {camion.numero_camion}
                      </h3>
                      <p className="mes-camions__card-subtitle">
                        {camion.marque} {camion.modele}
                      </p>
                    </div>
                    <span className={`mes-camions__badge ${getStatusColor(camion.statut)}`}>
                      {getStatusIcon(camion.statut)}
                      {getStatusText(camion.statut)}
                    </span>
                  </div>

                  {/* Contenu de la carte */}
                  <div className="mes-camions__card-content">
                    <div className="mes-camions__info-grid">
                      <div className="mes-camions__info-item">
                        <span className="mes-camions__info-label">Immatriculation</span>
                        <span className="mes-camions__info-value mes-camions__info-value--mono">
                          {camion.immatriculation}
                        </span>
                      </div>
                      <div className="mes-camions__info-item">
                        <Gauge size={16} className="mes-camions__info-icon" />
                        <span className="mes-camions__info-label">Kilométrage</span>
                        <span className="mes-camions__info-value">
                          {formatKilometrage(camion.kilometrage)}
                        </span>
                      </div>
                      <div className="mes-camions__info-item">
                        <Calendar size={16} className="mes-camions__info-icon" />
                        <span className="mes-camions__info-label">Attribution</span>
                        <span className="mes-camions__info-value">
                          {formatDate(camion.date_attribution)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions de la carte */}
                  <div className="mes-camions__card-actions">
                    <button
                      onClick={() => fetchCamionDetail(camion.id)}
                      className="mes-camions__btn mes-camions__btn--secondary mes-camions__btn--full"
                    >
                      <Eye size={16} />
                      Voir détails
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal détails */}
        {showModal && selectedCamion && (
          <div className="mes-camions__modal-overlay" onClick={closeModal}>
            <div className="mes-camions__modal" onClick={(e) => e.stopPropagation()}>
              <div className="mes-camions__modal-header">
                <h3>Détails du camion {selectedCamion.numero_camion}</h3>
                <button 
                  className="mes-camions__modal-close"
                  onClick={closeModal}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mes-camions__modal-content">
                <div className="mes-camions__detail-grid">
                  <div className="mes-camions__detail-section">
                    <h4 className="mes-camions__detail-title">Informations générales</h4>
                    <div className="mes-camions__detail-list">
                      <div className="mes-camions__detail-item">
                        <span className="mes-camions__detail-label">Numéro camion</span>
                        <span className="mes-camions__detail-value">{selectedCamion.numero_camion}</span>
                      </div>
                      <div className="mes-camions__detail-item">
                        <span className="mes-camions__detail-label">Immatriculation</span>
                        <span className="mes-camions__detail-value mes-camions__detail-value--mono">
                          {selectedCamion.immatriculation}
                        </span>
                      </div>
                      <div className="mes-camions__detail-item">
                        <span className="mes-camions__detail-label">Marque</span>
                        <span className="mes-camions__detail-value">{selectedCamion.marque || 'N/A'}</span>
                      </div>
                      <div className="mes-camions__detail-item">
                        <span className="mes-camions__detail-label">Modèle</span>
                        <span className="mes-camions__detail-value">{selectedCamion.modele || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mes-camions__detail-section">
                    <h4 className="mes-camions__detail-title">Statut et utilisation</h4>
                    <div className="mes-camions__detail-list">
                      <div className="mes-camions__detail-item">
                        <span className="mes-camions__detail-label">Statut</span>
                        <span className={`mes-camions__badge ${getStatusColor(selectedCamion.statut)}`}>
                          {getStatusIcon(selectedCamion.statut)}
                          {getStatusText(selectedCamion.statut)}
                        </span>
                      </div>
                      <div className="mes-camions__detail-item">
                        <span className="mes-camions__detail-label">Date d'attribution</span>
                        <span className="mes-camions__detail-value">
                          {formatDate(selectedCamion.date_attribution)}
                        </span>
                      </div>
                      <div className="mes-camions__detail-item">
                        <span className="mes-camions__detail-label">Kilométrage</span>
                        <span className="mes-camions__detail-value">
                          {formatKilometrage(selectedCamion.kilometrage)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MesCamions;