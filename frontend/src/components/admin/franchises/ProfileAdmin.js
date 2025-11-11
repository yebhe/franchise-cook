import React, { useState, useEffect } from 'react';
import { 
  User, 
  Edit,
  Save,
  X,
  Loader,
  RefreshCw,
  AlertTriangle,
  Mail,
  Phone
} from 'lucide-react';
import './ProfileAdmin.css';
import useAuthStore from '../../../store/authStore';
import apiClient from '../../../api/axiosConfig';
import AdminNavigation from '../AdminNavigation';

const ProfileAdmin = () => {
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
    username: '',
    phone_number: ''
  });

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

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
      const response = await apiClient.get('/user/info/');
      setProfil(response.data);
      
      // Initialiser le formulaire avec les données du profil
      setForm({
        first_name: response.data?.first_name || '',
        last_name: response.data?.last_name || '',
        username: response.data?.username || '',
        phone_number: response.data?.phone_number || ''
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

    if (!form.username.trim()) {
      errors.username = 'Le nom d\'utilisateur est obligatoire';
    }

    if (form.phone_number && !/^[0-9+\-\s()]{10,}$/.test(form.phone_number)) {
      errors.phone_number = 'Format de téléphone invalide';
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
      const response = await apiClient.put('/user/update/', form);
      setProfil(response.data);
      setMessage('Profil mis à jour avec succès !');
      setEditing(false);
    } catch (err) {
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
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
        first_name: profil.first_name || '',
        last_name: profil.last_name || '',
        username: profil.username || '',
        phone_number: profil.phone_number || ''
      });
    }
    setEditing(false);
    setValidationErrors({});
  };

  // ===== RENDU CONDITIONNEL - LOADING =====
  if (loading) {
    return (
      <div className="admin-layout">
        <AdminNavigation />
        <main className="admin-main-content">
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
      <div className="admin-layout">
        <AdminNavigation />
        <main className="admin-main-content">
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
    <div className="admin-layout">
      <AdminNavigation />
      
      <main className="admin-main-content">
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
                    Gérez les informations de votre compte
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
                      <div className="mon-profil__form">
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

                        <div className="mon-profil__form-group">
                          <label htmlFor="username" className={validationErrors.username ? 'mon-profil__label--error' : ''}>
                            Nom d'utilisateur *
                            {validationErrors.username && (
                              <AlertTriangle size={14} className="mon-profil__error-icon" />
                            )}
                          </label>
                          <input
                            type="text"
                            id="username"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            className={`mon-profil__input ${validationErrors.username ? 'mon-profil__input--error' : ''}`}
                          />
                          {validationErrors.username && (
                            <span className="mon-profil__error-text">{validationErrors.username}</span>
                          )}
                        </div>

                        <div className="mon-profil__form-group">
                          <label htmlFor="phone_number" className={validationErrors.phone_number ? 'mon-profil__label--error' : ''}>
                            Téléphone
                            {validationErrors.phone_number && (
                              <AlertTriangle size={14} className="mon-profil__error-icon" />
                            )}
                          </label>
                          <input
                            type="tel"
                            id="phone_number"
                            name="phone_number"
                            value={form.phone_number}
                            onChange={handleChange}
                            className={`mon-profil__input ${validationErrors.phone_number ? 'mon-profil__input--error' : ''}`}
                            placeholder="Optionnel"
                          />
                          {validationErrors.phone_number && (
                            <span className="mon-profil__error-text">{validationErrors.phone_number}</span>
                          )}
                        </div>
                      </div>
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
                        <div className="mon-profil__info-item">
                          <span className="mon-profil__info-label">Nom d'utilisateur</span>
                          <span className="mon-profil__info-value">{profil?.username || 'Non renseigné'}</span>
                        </div>
                        <div className="mon-profil__info-item">
                          <span className="mon-profil__info-label">Téléphone</span>
                          <span className="mon-profil__info-value">
                            <Phone size={14} className="mon-profil__info-icon" />
                            {profil?.phone_number || 'Non renseigné'}
                          </span>
                        </div>
                      </div>
                    )}
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

export default ProfileAdmin;