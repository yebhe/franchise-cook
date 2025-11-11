import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Truck,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Loader,
  RefreshCw,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MesAffectations.css';
import useAuthStore from '../../../store/authStore';
import apiClient from '../../../api/axiosConfig';
import FranchiseNavigation from './FranchiseNavigation';

const MesAffectations = () => {
  const [affectations, setAffectations] = useState([]);
  const [emplacements, setEmplacements] = useState([]);
  const [camions, setCamions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous');
  const [validationErrors, setValidationErrors] = useState({});

  const [form, setForm] = useState({
    camion: '',
    emplacement: '',
    statut: '',
    date_debut: '',
    date_fin: '',
    horaire_debut: '',
    horaire_fin: ''
  });


  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);


  // ===== FONCTIONS UTILITAIRES (déclarées en premier) =====
  const getCamionInfo = (camionId) => {
    const camion = camions.find(c => c.id === camionId);
    return camion ? `${camion.numero_camion} - ${camion.marque} ${camion.modele}` : `Camion ${camionId}`;
  };

  const getEmplacementInfo = (emplacementId) => {
    const emplacement = emplacements.find(e => e.id === emplacementId);
    return emplacement ? `${emplacement.nom_emplacement} (${emplacement.ville})` : `Emplacement ${emplacementId}`;
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'programme': return 'mes-affectations__badge--programme';
      case 'en_cours': return 'mes-affectations__badge--en_cours';
      case 'termine': return 'mes-affectations__badge--termine';
      case 'annule': return 'mes-affectations__badge--annule';
      default: return 'mes-affectations__badge--default';
    }
  };

  const getStatusText = (statut) => {
    switch (statut) {
      case 'programme': return 'Programmé';
      case 'en_cours': return 'En cours';
      case 'termine': return 'Terminé';
      case 'annule': return 'Annulé';
      default: return statut;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString.slice(0, 5); // HH:MM
  };

  // Options de statut disponibles
  const statutOptions = [
    { value: 'programme', label: 'Programmé' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'termine', label: 'Terminé' },
    { value: 'annule', label: 'Annulé' }
  ];


  useEffect(() => {
    if (location.state?.selectedEmplacement) {
      setForm(prev => ({
        ...prev,
        emplacement: location.state.selectedEmplacement.id
      }));
      setShowForm(true);
    }
  }, [location.state]);

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

  // ===== FONCTIONS DE CHARGEMENT DES DONNÉES =====
  const fetchAffectations = async () => {
    try {
      const response = await apiClient.get('/api_user/affectations/');
      setAffectations(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erreur lors du chargement des affectations:', err);
    }
  };

  const fetchEmplacements = async () => {
    try {
      const response = await apiClient.get('/api_user/emplacements/');
      setEmplacements(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erreur lors du chargement des emplacements:', err);
    }
  };

  const fetchCamions = async () => {
    try {
      const response = await apiClient.get('/api_user/camions/');
      setCamions(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erreur lors du chargement des camions:', err);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchAffectations(),
        fetchEmplacements(),
        fetchCamions()
      ]);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error('Erreur API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  // ===== VALIDATION DU FORMULAIRE =====
  const validateForm = () => {
    const errors = {};

    // Validation camion
    if (!form.camion) {
      errors.camion = 'Le camion est obligatoire';
    }

    // Validation emplacement
    if (!form.emplacement) {
      errors.emplacement = 'L\'emplacement est obligatoire';
    }

    // Validation statut
    if (!form.statut) {
      errors.statut = 'Le statut est obligatoire';
    }

    // Validation date de début
    if (!form.date_debut) {
      errors.date_debut = 'La date de début est obligatoire';
    } else {
      const dateDebut = new Date(form.date_debut);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dateDebut < today) {
        errors.date_debut = 'La date de début ne peut pas être dans le passé';
      }
    }

    // Validation date de fin (si renseignée)
    if (form.date_fin) {
      const dateDebut = new Date(form.date_debut);
      const dateFin = new Date(form.date_fin);
      
      if (dateFin < dateDebut) {
        errors.date_fin = 'La date de fin doit être postérieure à la date de début';
      }
    }

    // Validation horaires
    if (form.horaire_debut && form.horaire_fin) {
      if (form.horaire_fin <= form.horaire_debut) {
        errors.horaire_fin = 'L\'heure de fin doit être postérieure à l\'heure de début';
      }
    }

    // Vérification des conflits d'affectation
    if (form.camion && form.date_debut) {
      const conflit = affectations.find(affectation => {
        if (editingId && affectation.id === editingId) return false;
        
        const memeDate = form.date_debut === affectation.date_debut ||
                        (form.date_fin && form.date_debut <= affectation.date_debut && form.date_fin >= affectation.date_debut);
        
        return affectation.camion === parseInt(form.camion) && 
               memeDate && 
               affectation.statut !== 'annule';
      });

      if (conflit) {
        errors.date_debut = 'Ce camion est déjà affecté sur cette période';
      }
    }

    // Vérification disponibilité emplacement
    if (form.emplacement && form.date_debut) {
      const emplacementOccupe = affectations.find(affectation => {
        if (editingId && affectation.id === editingId) return false;
        
        const memeDate = form.date_debut === affectation.date_debut ||
                        (form.date_fin && form.date_debut <= affectation.date_debut && form.date_fin >= affectation.date_debut);
        
        return affectation.emplacement === parseInt(form.emplacement) && 
               memeDate && 
               affectation.statut !== 'annule';
      });

      if (emplacementOccupe) {
        errors.emplacement = 'Cet emplacement est déjà occupé sur cette période';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ===== GESTION DU FORMULAIRE =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Nettoyer l'erreur du champ modifié
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setSubmitLoading(true);
    setError(null);

    try {
      if (editingId) {
        await apiClient.put(`/api_user/affectations/${editingId}/`, form);
        setMessage('Affectation modifiée avec succès !');
      } else {
        await apiClient.post('/api_user/affectations/', form);
        setMessage('Affectation créée avec succès !');
      }
      
      resetForm();
      fetchAffectations();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'opération');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (affectation) => {
    setForm({
      camion: affectation.camion || '',
      emplacement: affectation.emplacement || '',
      statut: affectation.statut || '',
      date_debut: affectation.date_debut || '',
      date_fin: affectation.date_fin || '',
      horaire_debut: affectation.horaire_debut || '',
      horaire_fin: affectation.horaire_fin || ''
    });
    setEditingId(affectation.id);
    setValidationErrors({});
    setShowForm(true);
  };

  const handleDelete = async (affectationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette affectation ?')) return;
    
    try {
      await apiClient.delete(`/api_user/affectations/${affectationId}/`);
      setMessage('Affectation supprimée avec succès');
      fetchAffectations();
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setForm({
      camion: '',
      emplacement: '',
      statut: '',
      date_debut: '',
      date_fin: '',
      horaire_debut: '',
      horaire_fin: ''
    });
    setEditingId(null);
    setValidationErrors({});
    setShowForm(false);
  };

  // ===== FILTRAGE DES AFFECTATIONS =====
  const affectationsFiltrees = affectations.filter(affectation => {
    const camionInfo = getCamionInfo(affectation.camion);
    const emplacementInfo = getEmplacementInfo(affectation.emplacement);
    
    const matchSearch = 
      camionInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emplacementInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affectation.date_debut.includes(searchTerm);
    
    const matchStatus = statusFilter === 'tous' || affectation.statut === statusFilter;
    
    return matchSearch && matchStatus;
  });

  // ===== RENDU CONDITIONNEL - LOADING =====
  if (loading) {
    return (
      <div className="franchise-layout">
        <FranchiseNavigation />
        <main className="franchise-main-content">
          <div className="mes-affectations__loading">
            <Loader className="mes-affectations__spinner" size={32} />
            <p>Chargement des affectations...</p>
          </div>
        </main>
      </div>
    );
  }

  // ===== RENDU PRINCIPAL =====
  return (
    <div className="franchise-layout">
      <FranchiseNavigation />
      
      <main className="franchise-main-content">
        <div className="mes-affectations">
          <div className="mes-affectations__container">
            
            {/* Header */}
            <div className="mes-affectations__header">
              <div className="mes-affectations__header-content">
                <div className="mes-affectations__title-section">
                  <h1 className="mes-affectations__title">
                    <Calendar className="mes-affectations__title-icon" size={32} />
                    Mes Affectations
                  </h1>
                  <p className="mes-affectations__subtitle">
                    Gérez l'affectation de vos camions aux emplacements
                  </p>
                </div>
                <div className="mes-affectations__header-actions">
                  <button
                    onClick={fetchAllData}
                    className="mes-affectations__btn mes-affectations__btn--secondary"
                    disabled={loading}
                  >
                    <RefreshCw size={20} className={loading ? 'mes-affectations__icon--spinning' : ''} />
                    Actualiser
                  </button>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mes-affectations__btn mes-affectations__btn--primary"
                  >
                    <Plus size={20} />
                    Nouvelle affectation
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="mes-affectations__alert mes-affectations__alert--error">
                {error}
              </div>
            )}
            {message && (
              <div className="mes-affectations__alert mes-affectations__alert--success">
                {message}
              </div>
            )}

            {/* Filtres et recherche */}
            <div className="mes-affectations__filters">
              <div className="mes-affectations__search">
                <Search className="mes-affectations__search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par camion, emplacement, date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mes-affectations__search-input"
                />
              </div>
              <div className="mes-affectations__filter">
                <Filter className="mes-affectations__filter-icon" size={20} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mes-affectations__filter-select"
                >
                  <option value="tous">Tous les statuts</option>
                  <option value="programme">Programmé</option>
                  <option value="en_cours">En cours</option>
                  <option value="termine">Terminé</option>
                  <option value="annule">Annulé</option>
                </select>
              </div>
            </div>

            {/* Liste des affectations */}
            <div className="mes-affectations__content">
              {affectationsFiltrees.length === 0 ? (
                <div className="mes-affectations__empty">
                  <Calendar size={48} className="mes-affectations__empty-icon" />
                  <h3 className="mes-affectations__empty-title">
                    {affectations.length === 0 ? 'Aucune affectation' : 'Aucune affectation trouvée'}
                  </h3>
                  <p className="mes-affectations__empty-text">
                    {affectations.length === 0 
                      ? 'Vous n\'avez pas encore d\'affectation programmée.'
                      : 'Essayez de modifier vos critères de recherche.'
                    }
                  </p>
                  {affectations.length === 0 && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="mes-affectations__btn mes-affectations__btn--primary"
                    >
                      <Plus size={20} />
                      Créer ma première affectation
                    </button>
                  )}
                </div>
              ) : (
                <div className="mes-affectations__list">
                  {affectationsFiltrees.map((affectation) => (
                    <div key={affectation.id} className="mes-affectations__card">
                      {/* Header de la carte */}
                      <div className="mes-affectations__card-header">
                        <div className="mes-affectations__card-info">
                          <div className="mes-affectations__card-title">
                            <Truck size={18} className="mes-affectations__card-icon" />
                            {getCamionInfo(affectation.camion)}
                          </div>
                          <div className="mes-affectations__card-subtitle">
                            <MapPin size={16} className="mes-affectations__card-icon" />
                            {getEmplacementInfo(affectation.emplacement)}
                          </div>
                        </div>
                        <span className={`mes-affectations__badge ${getStatusColor(affectation.statut)}`}>
                          {getStatusText(affectation.statut)}
                        </span>
                      </div>

                      {/* Contenu de la carte */}
                      <div className="mes-affectations__card-content">
                        <div className="mes-affectations__info-grid">
                          <div className="mes-affectations__info-item">
                            <span className="mes-affectations__info-label">Date de début</span>
                            <span className="mes-affectations__info-value">
                              {formatDate(affectation.date_debut)}
                            </span>
                          </div>
                          {affectation.date_fin && (
                            <div className="mes-affectations__info-item">
                              <span className="mes-affectations__info-label">Date de fin</span>
                              <span className="mes-affectations__info-value">
                                {formatDate(affectation.date_fin)}
                              </span>
                            </div>
                          )}
                          {affectation.horaire_debut && (
                            <div className="mes-affectations__info-item">
                              <span className="mes-affectations__info-label">Horaires</span>
                              <span className="mes-affectations__info-value">
                                {formatTime(affectation.horaire_debut)} - {formatTime(affectation.horaire_fin)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions de la carte */}
                      <div className="mes-affectations__card-actions">
                        <button
                          onClick={() => handleEdit(affectation)}
                          className="mes-affectations__action-btn mes-affectations__action-btn--edit"
                          disabled={affectation.statut === 'termine'}
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(affectation.id)}
                          className="mes-affectations__action-btn mes-affectations__action-btn--delete"
                          disabled={affectation.statut === 'en_cours'}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal formulaire */}
            {showForm && (
              <div className="mes-affectations__modal-overlay" onClick={resetForm}>
                <div className="mes-affectations__modal" onClick={(e) => e.stopPropagation()}>
                  <div className="mes-affectations__modal-header">
                    <h3>{editingId ? 'Modifier l\'affectation' : 'Nouvelle affectation'}</h3>
                    <button 
                      className="mes-affectations__modal-close"
                      onClick={resetForm}
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="mes-affectations__form">
                    <div className="mes-affectations__form-row">
                      <div className="mes-affectations__form-group">
                        <label htmlFor="camion" className={validationErrors.camion ? 'mes-affectations__label--error' : ''}>
                          Camion * 
                          {validationErrors.camion && (
                            <AlertTriangle size={14} className="mes-affectations__error-icon" />
                          )}
                        </label>
                        <select
                          id="camion"
                          name="camion"
                          value={form.camion}
                          onChange={handleChange}
                          required
                          className={`mes-affectations__select ${validationErrors.camion ? 'mes-affectations__select--error' : ''}`}
                        >
                          <option value="">Sélectionner un camion</option>
                          {camions.filter(c => c.statut === 'disponible' || c.statut === 'attribue').map(camion => (
                            <option key={camion.id} value={camion.id}>
                              {camion.numero_camion} - {camion.marque} {camion.modele}
                            </option>
                          ))}
                        </select>
                        {validationErrors.camion && (
                          <span className="mes-affectations__error-text">{validationErrors.camion}</span>
                        )}
                      </div>
                      
                      <div className="mes-affectations__form-group">
                        <label htmlFor="emplacement" className={validationErrors.emplacement ? 'mes-affectations__label--error' : ''}>
                          Emplacement *
                          {validationErrors.emplacement && (
                            <AlertTriangle size={14} className="mes-affectations__error-icon" />
                          )}
                        </label>
                        <select
                          id="emplacement"
                          name="emplacement"
                          value={form.emplacement}
                          onChange={handleChange}
                          required
                          className={`mes-affectations__select ${validationErrors.emplacement ? 'mes-affectations__select--error' : ''}`}
                        >
                          <option value="">Sélectionner un emplacement</option>
                          {emplacements.map(emplacement => (
                            <option key={emplacement.id} value={emplacement.id}>
                              {emplacement.nom_emplacement} - {emplacement.ville}
                            </option>
                          ))}
                        </select>
                        {validationErrors.emplacement && (
                          <span className="mes-affectations__error-text">{validationErrors.emplacement}</span>
                        )}
                      </div>
                    </div>

                    <div className="mes-affectations__form-row">
                      <div className="mes-affectations__form-group">
                        <label htmlFor="statut" className={validationErrors.statut ? 'mes-affectations__label--error' : ''}>
                          Statut *
                          {validationErrors.statut && (
                            <AlertTriangle size={14} className="mes-affectations__error-icon" />
                          )}
                        </label>
                        <select
                          id="statut"
                          name="statut"
                          value={form.statut}
                          onChange={handleChange}
                          required
                          className={`mes-affectations__select ${validationErrors.statut ? 'mes-affectations__select--error' : ''}`}
                        >
                          <option value="">Sélectionner un statut</option>
                          {statutOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {validationErrors.statut && (
                          <span className="mes-affectations__error-text">{validationErrors.statut}</span>
                        )}
                      </div>

                      <div className="mes-affectations__form-group">
                        <label htmlFor="date_debut" className={validationErrors.date_debut ? 'mes-affectations__label--error' : ''}>
                          Date de début *
                          {validationErrors.date_debut && (
                            <AlertTriangle size={14} className="mes-affectations__error-icon" />
                          )}
                        </label>
                        <input
                          type="date"
                          id="date_debut"
                          name="date_debut"
                          value={form.date_debut}
                          onChange={handleChange}
                          required
                          min={new Date().toISOString().split('T')[0]}
                          className={`mes-affectations__input ${validationErrors.date_debut ? 'mes-affectations__input--error' : ''}`}
                        />
                        {validationErrors.date_debut && (
                          <span className="mes-affectations__error-text">{validationErrors.date_debut}</span>
                        )}
                      </div>
                    </div>

                    <div className="mes-affectations__form-row">
                      <div className="mes-affectations__form-group">
                        <label htmlFor="date_fin" className={validationErrors.date_fin ? 'mes-affectations__label--error' : ''}>
                          Date de fin
                          {validationErrors.date_fin && (
                            <AlertTriangle size={14} className="mes-affectations__error-icon" />
                          )}
                        </label>
                        <input
                          type="date"
                          id="date_fin"
                          name="date_fin"
                          value={form.date_fin}
                          onChange={handleChange}
                          min={form.date_debut || new Date().toISOString().split('T')[0]}
                          className={`mes-affectations__input ${validationErrors.date_fin ? 'mes-affectations__input--error' : ''}`}
                        />
                        {validationErrors.date_fin && (
                          <span className="mes-affectations__error-text">{validationErrors.date_fin}</span>
                        )}
                      </div>
                      
                      <div className="mes-affectations__form-group">
                        <label htmlFor="horaire_debut">Heure de début</label>
                        <input
                          type="time"
                          id="horaire_debut"
                          name="horaire_debut"
                          value={form.horaire_debut}
                          onChange={handleChange}
                          className="mes-affectations__input"
                        />
                      </div>
                    </div>

                    <div className="mes-affectations__form-row">
                      <div className="mes-affectations__form-group">
                        <label htmlFor="horaire_fin" className={validationErrors.horaire_fin ? 'mes-affectations__label--error' : ''}>
                          Heure de fin
                          {validationErrors.horaire_fin && (
                            <AlertTriangle size={14} className="mes-affectations__error-icon" />
                          )}
                        </label>
                        <input
                          type="time"
                          id="horaire_fin"
                          name="horaire_fin"
                          value={form.horaire_fin}
                          onChange={handleChange}
                          className={`mes-affectations__input ${validationErrors.horaire_fin ? 'mes-affectations__input--error' : ''}`}
                        />
                        {validationErrors.horaire_fin && (
                          <span className="mes-affectations__error-text">{validationErrors.horaire_fin}</span>
                        )}
                      </div>
                      
                      <div className="mes-affectations__form-group">
                        {/* Espace vide pour équilibrer la grille */}
                      </div>
                    </div>

                    <div className="mes-affectations__form-actions">
                      <button 
                        type="button" 
                        onClick={resetForm}
                        className="mes-affectations__btn mes-affectations__btn--secondary"
                      >
                        Annuler
                      </button>
                      <button 
                        type="submit" 
                        disabled={submitLoading}
                        className="mes-affectations__btn mes-affectations__btn--primary"
                        onClick={handleSubmit}
                      >
                        {submitLoading ? (
                          <>
                            <Loader size={16} className="mes-affectations__icon--spinning" />
                            {editingId ? 'Modification...' : 'Création...'}
                          </>
                        ) : (
                          <>
                            {editingId ? <Edit size={16} /> : <Plus size={16} />}
                            {editingId ? 'Modifier' : 'Créer l\'affectation'}
                          </>
                        )}
                      </button>
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

export default MesAffectations;