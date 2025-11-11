import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Clock, 
  Eye,
  Search,
  Filter,
  Loader,
  RefreshCw,
  Euro,
  X,
  Calendar,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './MesEmplacements.css';
import useAuthStore from '../../../store/authStore';
import apiClient from '../../../api/axiosConfig';
import FranchiseNavigation from './FranchiseNavigation';

const MesEmplacements = () => {
  const [emplacements, setEmplacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmplacement, setSelectedEmplacement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState('tous');
  const [disponibiliteFilter, setDisponibiliteFilter] = useState('tous'); // 🎯 NOUVEAU

  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);




  // 🎯 MODIFIÉ : Chargement des emplacements autorisés (endpoint correspondant aux views.py)
  const fetchEmplacements = async () => {
    try {
      setLoading(true);
      setError(null);
      // 🎯 Utilise l'endpoint exact de EmplacementListView dans views.py
      const response = await apiClient.get('/api_user/emplacements/');
      setEmplacements(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Erreur lors du chargement de vos emplacements autorisés');
      console.error('Erreur API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchEmplacements();
    }
  }, [isAuthenticated]);

  // 🎯 MODIFIÉ : Filtrage des emplacements avec disponibilité
  const emplacementsFiltres = emplacements.filter(emplacement => {
    const matchSearch = emplacement.nom_emplacement.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       emplacement.adresse.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       emplacement.ville.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchZone = zoneFilter === 'tous' || emplacement.type_zone === zoneFilter;
    
    // 🎯 NOUVEAU : Filtre par disponibilité
    const matchDisponibilite = disponibiliteFilter === 'tous' || 
                               (disponibiliteFilter === 'disponible' && emplacement.est_disponible) ||
                               (disponibiliteFilter === 'occupe' && !emplacement.est_disponible);
    
    return matchSearch && matchZone && matchDisponibilite;
  });

  const getTypeZoneLabel = (type) => {
    const types = {
      'centre_ville': 'Centre-ville',
      'zone_commerciale': 'Zone commerciale',
      'parc': 'Parc',
      'entreprise': 'Entreprise',
      'marche': 'Marché'
    };
    return types[type] || type;
  };

  const getTypeZoneColor = (type) => {
    switch (type) {
      case 'centre_ville': return 'mes-emplacements__badge--centre';
      case 'zone_commerciale': return 'mes-emplacements__badge--commercial';
      case 'parc': return 'mes-emplacements__badge--parc';
      case 'entreprise': return 'mes-emplacements__badge--entreprise';
      case 'marche': return 'mes-emplacements__badge--marche';
      default: return 'mes-emplacements__badge--default';
    }
  };

  // 🎯 NOUVEAU : Composant pour afficher le statut de disponibilité
  const StatutDisponibilite = ({ emplacement }) => {
    if (emplacement.est_disponible) {
      return (
        <div className="mes-emplacements__statut mes-emplacements__statut--disponible">
          <CheckCircle size={16} />
          <span>Disponible</span>
        </div>
      );
    } else if (emplacement.affectation_actuelle) {
      const affectation = emplacement.affectation_actuelle;
      return (
        <div className="mes-emplacements__statut mes-emplacements__statut--occupe">
          <AlertCircle size={16} />
          <span>Occupé</span>
          <div className="mes-emplacements__occupation-info">
            <small>Camion {affectation.camion}</small>
            <small>Du {affectation.date_debut} {affectation.date_fin ? `au ${affectation.date_fin}` : ''}</small>
          </div>
        </div>
      );
    } else {
      return (
        <div className="mes-emplacements__statut mes-emplacements__statut--occupe">
          <AlertCircle size={16} />
          <span>Occupé</span>
        </div>
      );
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'Gratuit';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEmplacement(null);
  };

  // Auto-masquage des messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (loading) {
    return (
      <div className="franchise-layout">
        <FranchiseNavigation />
        <main className="franchise-main-content">
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
              <Loader className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Chargement de vos emplacements autorisés...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="franchise-layout">
      <FranchiseNavigation />
      
      <main className="franchise-main-content">
        <div className="mes-emplacements">
          <div className="mes-emplacements__container">
            
            {/* Header */}
            <div className="mes-emplacements__header">
              <div className="mes-emplacements__header-content">
                <div className="mes-emplacements__title-section">
                  <h1 className="mes-emplacements__title">
                    <MapPin className="mes-emplacements__title-icon" size={32} />
                    Mes Emplacements Autorisés
                  </h1>
                  <p className="mes-emplacements__subtitle">
                    Consultez les emplacements où votre franchise peut installer ses camions
                  </p>
                </div>
                <div className="mes-emplacements__header-actions">
                  <button
                    onClick={fetchEmplacements}
                    className="mes-emplacements__btn mes-emplacements__btn--secondary"
                    disabled={loading}
                  >
                    <RefreshCw size={20} className={loading ? 'mes-emplacements__icon--spinning' : ''} />
                    Actualiser
                  </button>
                  <button
                    onClick={() => navigate('/franchise/affectations')}
                    className="mes-emplacements__btn mes-emplacements__btn--primary"
                  >
                    <Calendar size={20} />
                    Gérer mes affectations
                  </button>
                </div>
              </div>
            </div>

            {/* 🎯 NOUVEAU : Stats rapides */}
            {emplacements.length > 0 && (
              <div className="mes-emplacements__stats">
                <div className="mes-emplacements__stat-card">
                  <div className="mes-emplacements__stat-number">{emplacements.length}</div>
                  <div className="mes-emplacements__stat-label">Emplacements autorisés</div>
                </div>
                <div className="mes-emplacements__stat-card">
                  <div className="mes-emplacements__stat-number">
                    {emplacements.filter(e => e.est_disponible).length}
                  </div>
                  <div className="mes-emplacements__stat-label">Disponibles</div>
                </div>
                <div className="mes-emplacements__stat-card">
                  <div className="mes-emplacements__stat-number">
                    {emplacements.filter(e => !e.est_disponible).length}
                  </div>
                  <div className="mes-emplacements__stat-label">Occupés</div>
                </div>
              </div>
            )}

            {/* Messages */}
            {error && (
              <div className="mes-emplacements__alert mes-emplacements__alert--error">
                {error}
              </div>
            )}

            {/* 🎯 MODIFIÉ : Filtres et recherche avec disponibilité */}
            <div className="mes-emplacements__filters">
              <div className="mes-emplacements__search">
                <Search className="mes-emplacements__search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par nom, adresse, ville..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mes-emplacements__search-input"
                />
              </div>
              <div className="mes-emplacements__filter">
                <Filter className="mes-emplacements__filter-icon" size={20} />
                <select
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                  className="mes-emplacements__filter-select"
                >
                  <option value="tous">Toutes les zones</option>
                  <option value="centre_ville">Centre-ville</option>
                  <option value="zone_commerciale">Zone commerciale</option>
                  <option value="parc">Parc</option>
                  <option value="entreprise">Entreprise</option>
                  <option value="marche">Marché</option>
                </select>
              </div>
              {/* 🎯 NOUVEAU : Filtre par disponibilité */}
              <div className="mes-emplacements__filter">
                <CheckCircle className="mes-emplacements__filter-icon" size={20} />
                <select
                  value={disponibiliteFilter}
                  onChange={(e) => setDisponibiliteFilter(e.target.value)}
                  className="mes-emplacements__filter-select"
                >
                  <option value="tous">Toutes disponibilités</option>
                  <option value="disponible">Disponibles uniquement</option>
                  <option value="occupe">Occupés uniquement</option>
                </select>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="mes-emplacements__content">
              {emplacementsFiltres.length === 0 ? (
                <div className="mes-emplacements__empty">
                  <MapPin size={48} className="mes-emplacements__empty-icon" />
                  <h3 className="mes-emplacements__empty-title">
                    {emplacements.length === 0 ? 'Aucun emplacement autorisé' : 'Aucun emplacement trouvé'}
                  </h3>
                  <p className="mes-emplacements__empty-text">
                    {emplacements.length === 0 
                      ? 'Votre franchise n\'a pas encore d\'emplacements autorisés. Contactez l\'administration.'
                      : 'Essayez de modifier vos critères de recherche.'
                    }
                  </p>
                </div>
              ) : (
                <div className="mes-emplacements__grid">
                  {emplacementsFiltres.map((emplacement) => (
                    <div key={emplacement.id} className="mes-emplacements__card">
                      {/* Header de la carte */}
                      <div className="mes-emplacements__card-header">
                        <div className="mes-emplacements__card-title-section">
                          <h3 className="mes-emplacements__card-title">
                            {emplacement.nom_emplacement}
                          </h3>
                          <p className="mes-emplacements__card-subtitle">
                            {emplacement.adresse}, {emplacement.ville}
                          </p>
                        </div>
                        <div className="mes-emplacements__badges">
                          <span className={`mes-emplacements__badge ${getTypeZoneColor(emplacement.type_zone)}`}>
                            {getTypeZoneLabel(emplacement.type_zone)}
                          </span>
                        </div>
                      </div>

                      {/* 🎯 NOUVEAU : Statut de disponibilité */}
                      <StatutDisponibilite emplacement={emplacement} />

                      {/* Contenu de la carte */}
                      <div className="mes-emplacements__card-content">
                        <div className="mes-emplacements__info-grid">
                          <div className="mes-emplacements__info-item">
                            <Euro size={16} className="mes-emplacements__info-icon" />
                            <span className="mes-emplacements__info-label">Tarif journalier</span>
                            <span className="mes-emplacements__info-value">
                              {formatPrice(emplacement.tarif_journalier)}
                            </span>
                          </div>
                          <div className="mes-emplacements__info-item">
                            <Clock size={16} className="mes-emplacements__info-icon" />
                            <span className="mes-emplacements__info-label">Horaires</span>
                            <span className="mes-emplacements__info-value">
                              {emplacement.horaires_autorises || 'Non spécifié'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions de la carte */}
                      <div className="mes-emplacements__card-actions">
                        <button
                          onClick={() => {
                            setSelectedEmplacement(emplacement);
                            setShowModal(true);
                          }}
                          className="mes-emplacements__btn mes-emplacements__btn--outline mes-emplacements__btn--full"
                        >
                          <Eye size={16} />
                          Voir les détails
                        </button>
                        {/* 🎯 NOUVEAU : Bouton conditionnel selon disponibilité */}
                        {emplacement.est_disponible ? (
                          <button
                            onClick={() => navigate('/franchise/affectations', { 
                              state: { selectedEmplacement: emplacement } 
                            })}
                            className="mes-emplacements__btn mes-emplacements__btn--primary mes-emplacements__btn--full"
                          >
                            <Calendar size={16} />
                            Affecter un camion
                          </button>
                        ) : (
                          <button
                            disabled
                            className="mes-emplacements__btn mes-emplacements__btn--disabled mes-emplacements__btn--full"
                          >
                            <AlertCircle size={16} />
                            Emplacement occupé
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal détails emplacement */}
            {showModal && selectedEmplacement && (
              <div className="mes-emplacements__modal-overlay" onClick={closeModal}>
                <div className="mes-emplacements__modal" onClick={(e) => e.stopPropagation()}>
                  <div className="mes-emplacements__modal-header">
                    <h3>Détails de l'emplacement</h3>
                    <button 
                      className="mes-emplacements__modal-close"
                      onClick={closeModal}
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="mes-emplacements__modal-content">
                    {/* 🎯 NOUVEAU : Statut en évidence dans la modal */}
                    <div className="mes-emplacements__modal-statut">
                      <StatutDisponibilite emplacement={selectedEmplacement} />
                    </div>

                    <div className="mes-emplacements__detail-grid">
                      <div className="mes-emplacements__detail-section">
                        <h4 className="mes-emplacements__detail-title">Informations générales</h4>
                        <div className="mes-emplacements__detail-list">
                          <div className="mes-emplacements__detail-item">
                            <span className="mes-emplacements__detail-label">Nom</span>
                            <span className="mes-emplacements__detail-value">{selectedEmplacement.nom_emplacement}</span>
                          </div>
                          <div className="mes-emplacements__detail-item">
                            <span className="mes-emplacements__detail-label">Type de zone</span>
                            <span className={`mes-emplacements__badge ${getTypeZoneColor(selectedEmplacement.type_zone)}`}>
                              {getTypeZoneLabel(selectedEmplacement.type_zone)}
                            </span>
                          </div>
                          <div className="mes-emplacements__detail-item">
                            <span className="mes-emplacements__detail-label">Adresse</span>
                            <span className="mes-emplacements__detail-value">
                              {selectedEmplacement.adresse}
                            </span>
                          </div>
                          <div className="mes-emplacements__detail-item">
                            <span className="mes-emplacements__detail-label">Ville</span>
                            <span className="mes-emplacements__detail-value">
                              {selectedEmplacement.ville} {selectedEmplacement.code_postal}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mes-emplacements__detail-section">
                        <h4 className="mes-emplacements__detail-title">Conditions d'utilisation</h4>
                        <div className="mes-emplacements__detail-list">
                          <div className="mes-emplacements__detail-item">
                            <span className="mes-emplacements__detail-label">Tarif journalier</span>
                            <span className="mes-emplacements__detail-value">
                              {formatPrice(selectedEmplacement.tarif_journalier)}
                            </span>
                          </div>
                          <div className="mes-emplacements__detail-item">
                            <span className="mes-emplacements__detail-label">Horaires autorisés</span>
                            <span className="mes-emplacements__detail-value">
                              {selectedEmplacement.horaires_autorises || 'Non spécifié'}
                            </span>
                          </div>
                        </div>
                        
                        {/* 🎯 MODIFIÉ : Actions conditionnelles dans la modal */}
                        <div className="mes-emplacements__modal-actions">
                          {selectedEmplacement.est_disponible ? (
                            <button
                              onClick={() => {
                                closeModal();
                                navigate('/franchise/affectations', { 
                                  state: { selectedEmplacement: selectedEmplacement } 
                                });
                              }}
                              className="mes-emplacements__btn mes-emplacements__btn--primary mes-emplacements__btn--full"
                            >
                              <Calendar size={16} />
                              Affecter un camion à cet emplacement
                            </button>
                          ) : (
                            <div className="mes-emplacements__modal-warning">
                              <Info size={16} />
                              <span>Cet emplacement est actuellement occupé et ne peut pas recevoir de nouvelle affectation.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MesEmplacements;