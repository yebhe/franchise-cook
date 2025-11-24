import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building,
  Edit,
  Save,
  X,
  Loader,
  RefreshCw,
  AlertTriangle,
  Calendar,
  CreditCard,
  Shield
} from 'lucide-react';
import './MonProfile.css';
import useAuthStore from '../../../store/authStore';
import apiClient from '../../../api/axiosConfig';
import FranchiseNavigation from './FranchiseNavigation';


const MonProfile = () => {
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [editing, setEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    nom_franchise: '',
    adresse: '',
    ville: '',
    code_postal: ''
  });

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // ===== FONCTIONS UTILITAIRES =====
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'actif': return 'mon-profil__status--active';
      case 'inactif': return 'mon-profil__status--inactive';
      case 'suspendu': return 'mon-profil__status--suspended';
      default: return 'mon-profil__status--default';
    }
  };

  const getStatutText = (statut) => {
    switch (statut) {
      case 'actif': return 'Actif';
      case 'inactif': return 'Inactif';
      case 'suspendu': return 'Suspendu';
      default: return statut;
    }
  };


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
  const fetchProfil = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/api_user/profile/');
      setProfil(response.data);
      
      // Initialiser le formulaire avec les données du profil
      setForm({
        first_name: response.data?.first_name || '',
        last_name: response.data?.last_name || '',
        nom_franchise: response.data.nom_franchise || '',
        adresse: response.data.adresse || '',
        ville: response.data.ville || '',
        code_postal: response.data.code_postal || ''
      });
    } catch (err) {
      setError('Erreur lors du chargement du profil');
      console.error('Erreur API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfil();
    }
  }, [isAuthenticated]);

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

  const validateForm = () => {
    const errors = {};

    if (!form.first_name.trim()) {
      errors.first_name = 'Le prénom est obligatoire';
    }

    if (!form.last_name.trim()) {
      errors.last_name = 'Le nom est obligatoire';
    }

    if (!form.nom_franchise.trim()) {
      errors.nom_franchise = 'Le nom de la franchise est obligatoire';
    }

    if (!form.adresse.trim()) {
      errors.adresse = 'L\'adresse est obligatoire';
    }

    if (!form.ville.trim()) {
      errors.ville = 'La ville est obligatoire';
    }

    if (!form.code_postal.trim()) {
      errors.code_postal = 'Le code postal est obligatoire';
    } else if (!/^\d{5}$/.test(form.code_postal)) {
      errors.code_postal = 'Le code postal doit contenir 5 chiffres';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Séparer les données utilisateur des données franchise
      const userData = {
        first_name: form.first_name,
        last_name: form.last_name,
      };

      const franchiseData = {
        nom_franchise: form.nom_franchise,
        adresse: form.adresse,
        ville: form.ville,
        code_postal: form.code_postal
      };

      // Mettre à jour le profil (qui inclut les données utilisateur et franchise)
      const response = await apiClient.put('/api_user/profile/', {
        user: userData,
        ...franchiseData
      });

      setProfil(response.data);
      setMessage('Profil mis à jour avec succès !');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setValidationErrors({});
  };

  const handleCancel = () => {
    // Remettre les valeurs originales
    if (profil) {
      setForm({
        first_name: profil.user?.first_name || '',
        last_name: profil.user?.last_name || '',
        nom_franchise: profil.nom_franchise || '',
        adresse: profil.adresse || '',
        ville: profil.ville || '',
        code_postal: profil.code_postal || ''
      });
    }
    setEditing(false);
    setValidationErrors({});
  };

  // ===== RENDU CONDITIONNEL - LOADING =====
  if (loading) {
    return (
      <div className="franchise-layout">
        <FranchiseNavigation />
        <main className="franchise-main-content">
          <div className="mon-profil__loading">
            <Loader className="mon-profil__spinner" size={32} />
            <p>Chargement du profil...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!profil) {
    return (
      <div className="franchise-layout">
        <FranchiseNavigation />
        <main className="franchise-main-content">
          <div className="mon-profil__error">
            <AlertTriangle size={48} />
            <h3>Impossible de charger le profil</h3>
            <button onClick={fetchProfil} className="mon-profil__btn mon-profil__btn--primary">
              <RefreshCw size={20} />
              Réessayer
            </button>
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
        <div className="mon-profil">
          <div className="mon-profil__container">
            
            {/* Header */}
            <div className="mon-profil__header">
              <div className="mon-profil__header-content">
                <div className="mon-profil__title-section">
                  <h1 className="mon-profil__title">
                    <User className="mon-profil__title-icon" size={32} />
                    Mon Profil
                  </h1>
                  <p className="mon-profil__subtitle">
                    Gérez les informations de votre compte et de votre franchise
                  </p>
                </div>
                <div className="mon-profil__header-actions">
                  <button
                    onClick={fetchProfil}
                    className="mon-profil__btn mon-profil__btn--secondary"
                    disabled={loading}
                  >
                    <RefreshCw size={20} className={loading ? 'mon-profil__icon--spinning' : ''} />
                    Actualiser
                  </button>
                  {!editing && (
                    <button
                      onClick={handleEdit}
                      className="mon-profil__btn mon-profil__btn--primary"
                    >
                      <Edit size={20} />
                      Modifier
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="mon-profil__alert mon-profil__alert--error">
                {error}
              </div>
            )}
            {message && (
              <div className="mon-profil__alert mon-profil__alert--success">
                {message}
              </div>
            )}

            {/* Contenu principal */}
            <div className="mon-profil__content">
              <div className="mon-profil__grid">
                
                {/* Section Informations personnelles */}
                <div className="mon-profil__section">
                  <div className="mon-profil__section-header">
                    <h2 className="mon-profil__section-title">
                      <User size={20} />
                      Informations personnelles
                    </h2>
                  </div>
                  
                  <div className="mon-profil__section-content">
                    {editing ? (
                      <form onSubmit={handleSubmit} className="mon-profil__form">
                        <div className="mon-profil__form-row">
                          <div className="mon-profil__form-group">
                            <label htmlFor="first_name" className={validationErrors.first_name ? 'mon-profil__label--error' : ''}>
                              Prénom *
                              {validationErrors.first_name && (
                                <AlertTriangle size={14} className="mon-profil__error-icon" />
                              )}
                            </label>
                            <input
                              type="text"
                              id="first_name"
                              name="first_name"
                              value={form.first_name}
                              onChange={handleChange}
                              className={`mon-profil__input ${validationErrors.first_name ? 'mon-profil__input--error' : ''}`}
                            />
                            {validationErrors.first_name && (
                              <span className="mon-profil__error-text">{validationErrors.first_name}</span>
                            )}
                          </div>
                          
                          <div className="mon-profil__form-group">
                            <label htmlFor="last_name" className={validationErrors.last_name ? 'mon-profil__label--error' : ''}>
                              Nom *
                              {validationErrors.last_name && (
                                <AlertTriangle size={14} className="mon-profil__error-icon" />
                              )}
                            </label>
                            <input
                              type="text"
                              id="last_name"
                              name="last_name"
                              value={form.last_name}
                              onChange={handleChange}
                              className={`mon-profil__input ${validationErrors.last_name ? 'mon-profil__input--error' : ''}`}
                            />
                            {validationErrors.last_name && (
                              <span className="mon-profil__error-text">{validationErrors.last_name}</span>
                            )}
                          </div>
                        </div>
                      </form>
                    ) : (
                      <div className="mon-profil__info-grid">
                        <div className="mon-profil__info-item">
                          <span className="mon-profil__info-label">Prénom</span>
                          <span className="mon-profil__info-value">{profil?.first_name || 'Non renseigné'}</span>
                        </div>
                        <div className="mon-profil__info-item">
                          <span className="mon-profil__info-label">Nom</span>
                          <span className="mon-profil__info-value">{profil?.last_name || 'Non renseigné'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section Informations franchise */}
                <div className="mon-profil__section">
                  <div className="mon-profil__section-header">
                    <h2 className="mon-profil__section-title">
                      <Building size={20} />
                      Informations franchise
                    </h2>
                  </div>
                  
                  <div className="mon-profil__section-content">
                    {editing ? (
                      <div className="mon-profil__form">
                        <div className="mon-profil__form-group">
                          <label htmlFor="nom_franchise" className={validationErrors.nom_franchise ? 'mon-profil__label--error' : ''}>
                            Nom de la franchise *
                            {validationErrors.nom_franchise && (
                              <AlertTriangle size={14} className="mon-profil__error-icon" />
                            )}
                          </label>
                          <input
                            type="text"
                            id="nom_franchise"
                            name="nom_franchise"
                            value={form.nom_franchise}
                            onChange={handleChange}
                            className={`mon-profil__input ${validationErrors.nom_franchise ? 'mon-profil__input--error' : ''}`}
                          />
                          {validationErrors.nom_franchise && (
                            <span className="mon-profil__error-text">{validationErrors.nom_franchise}</span>
                          )}
                        </div>
                        
                        <div className="mon-profil__form-group">
                          <label htmlFor="adresse" className={validationErrors.adresse ? 'mon-profil__label--error' : ''}>
                            Adresse *
                            {validationErrors.adresse && (
                              <AlertTriangle size={14} className="mon-profil__error-icon" />
                            )}
                          </label>
                          <input
                            type="text"
                            id="adresse"
                            name="adresse"
                            value={form.adresse}
                            onChange={handleChange}
                            className={`mon-profil__input ${validationErrors.adresse ? 'mon-profil__input--error' : ''}`}
                          />
                          {validationErrors.adresse && (
                            <span className="mon-profil__error-text">{validationErrors.adresse}</span>
                          )}
                        </div>
                        
                        <div className="mon-profil__form-row">
                          <div className="mon-profil__form-group">
                            <label htmlFor="ville" className={validationErrors.ville ? 'mon-profil__label--error' : ''}>
                              Ville *
                              {validationErrors.ville && (
                                <AlertTriangle size={14} className="mon-profil__error-icon" />
                              )}
                            </label>
                            <input
                              type="text"
                              id="ville"
                              name="ville"
                              value={form.ville}
                              onChange={handleChange}
                              className={`mon-profil__input ${validationErrors.ville ? 'mon-profil__input--error' : ''}`}
                            />
                            {validationErrors.ville && (
                              <span className="mon-profil__error-text">{validationErrors.ville}</span>
                            )}
                          </div>
                          
                          <div className="mon-profil__form-group">
                            <label htmlFor="code_postal" className={validationErrors.code_postal ? 'mon-profil__label--error' : ''}>
                              Code postal *
                              {validationErrors.code_postal && (
                                <AlertTriangle size={14} className="mon-profil__error-icon" />
                              )}
                            </label>
                            <input
                              type="text"
                              id="code_postal"
                              name="code_postal"
                              value={form.code_postal}
                              onChange={handleChange}
                              className={`mon-profil__input ${validationErrors.code_postal ? 'mon-profil__input--error' : ''}`}
                            />
                            {validationErrors.code_postal && (
                              <span className="mon-profil__error-text">{validationErrors.code_postal}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mon-profil__info-grid">
                        <div className="mon-profil__info-item">
                          <span className="mon-profil__info-label">Nom de la franchise</span>
                          <span className="mon-profil__info-value">{profil.nom_franchise || 'Non renseigné'}</span>
                        </div>
                        <div className="mon-profil__info-item">
                          <span className="mon-profil__info-label">Adresse</span>
                          <span className="mon-profil__info-value">{profil.adresse || 'Non renseignée'}</span>
                        </div>
                        <div className="mon-profil__info-item">
                          <span className="mon-profil__info-label">Ville</span>
                          <span className="mon-profil__info-value">{profil.ville || 'Non renseignée'}</span>
                        </div>
                        <div className="mon-profil__info-item">
                          <span className="mon-profil__info-label">Code postal</span>
                          <span className="mon-profil__info-value">{profil.code_postal || 'Non renseigné'}</span>
                        </div>
                        <div className="mon-profil__info-item">
                          <span className="mon-profil__info-label">Statut</span>
                          <span className={`mon-profil__status ${getStatutColor(profil.statut)}`}>
                            <Shield size={14} />
                            {getStatutText(profil.statut)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section Informations contractuelles */}
                <div className="mon-profil__section">
                  <div className="mon-profil__section-header">
                    <h2 className="mon-profil__section-title">
                      <CreditCard size={20} />
                      Informations contractuelles
                    </h2>
                  </div>
                  
                  <div className="mon-profil__section-content">
                    <div className="mon-profil__info-grid">
                      <div className="mon-profil__info-item">
                        <span className="mon-profil__info-label">Date de signature</span>
                        <span className="mon-profil__info-value">
                          <Calendar size={14} className="mon-profil__info-icon" />
                          {formatDate(profil.date_signature)}
                        </span>
                      </div>
                      <div className="mon-profil__info-item">
                        <span className="mon-profil__info-label">Droit d'entrée</span>
                        <span className="mon-profil__info-value mon-profil__info-value--amount">
                          <CreditCard size={14} className="mon-profil__info-icon" />
                          {formatCurrency(profil.droit_entree)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mon-profil__contract-note">
                      <AlertTriangle size={16} />
                      <span>
                        Ces informations contractuelles ne peuvent pas être modifiées. 
                        Contactez l'administration pour toute modification.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions du formulaire */}
              {editing && (
                <div className="mon-profil__form-actions">
                  <button 
                    type="button" 
                    onClick={handleCancel}
                    className="mon-profil__btn mon-profil__btn--secondary"
                  >
                    <X size={20} />
                    Annuler
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={saving}
                    className="mon-profil__btn mon-profil__btn--primary"
                  >
                    {saving ? (
                      <>
                        <Loader size={20} className="mon-profil__icon--spinning" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Enregistrer les modifications
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MonProfile;