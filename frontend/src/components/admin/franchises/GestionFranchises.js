// components/admin/franchises/GestionFranchises.jsx - AVEC VALIDATION
import React, { useEffect, useState, useRef } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  MapPin,
  CheckCircle,
  Check,
  CreditCard,
  AlertCircle,
  Mail,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';
import useAuthStore from '../../../store/authStore';
import './GestionFranchises.css';
import AdminNavigation from '../AdminNavigation';

const initialForm = {
  nom_franchise: '',
  adresse: '',
  ville: '',
  code_postal: '',
  date_signature: '',
  statut: 'en_attente',
  user: ''
};

export default function GestionFranchises() {
  const [franchises, setFranchises] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  // États pour la validation
  const [validationLoading, setValidationLoading] = useState({});
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [franchiseToValidate, setFranchiseToValidate] = useState(null);
  const [commentaireValidation, setCommentaireValidation] = useState('');
  
  // États pour Google Maps
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressValidated, setAddressValidated] = useState(false);
  const [validationAddressLoading, setValidationAddressLoading] = useState(false);
  
  console.log('Données franchises:', franchises);
  const autocompleteRef = useRef(null);
  const addressInputRef = useRef(null);

  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userType = useAuthStore((state) => state.getUserType());

  // Charger Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsGoogleMapsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCUyOh-xB1lhs4IUvGOL2l31v1GfxBsMIE&libraries=places&language=fr&region=FR`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsGoogleMapsLoaded(true);
      script.onerror = () => console.error('Erreur lors du chargement de Google Maps');
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialiser l'autocomplétion Google Places
  useEffect(() => {
    if (isGoogleMapsLoaded && addressInputRef.current && !autocompleteRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          componentRestrictions: { country: 'fr' },
          fields: ['formatted_address', 'address_components', 'geometry'],
          types: ['address']
        }
      );

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        if (place && place.address_components) {
          handlePlaceSelect(place);
        }
      });
    }
  }, [isGoogleMapsLoaded, showForm]);

  // Gérer la sélection d'une adresse
  const handlePlaceSelect = (place) => {
    const components = place.address_components;
    let ville = '';
    let codePostal = '';
    let adresse = place.formatted_address || '';

    components.forEach(component => {
      const types = component.types;
      if (types.includes('locality')) {
        ville = component.long_name;
      } else if (types.includes('postal_code')) {
        codePostal = component.long_name;
      }
    });

    setForm(prev => ({
      ...prev,
      adresse,
      ville,
      code_postal: codePostal
    }));

    setAddressValidated(true);
    setShowSuggestions(false);
  };

  // Validation manuelle d'adresse
  const validateAddress = async () => {
    if (!form.adresse.trim()) return;
    
    setValidationAddressLoading(true);
    try {
      const geocoder = new window.google.maps.Geocoder();
      const result = await new Promise((resolve, reject) => {
        geocoder.geocode(
          { 
            address: `${form.adresse}, ${form.ville}, ${form.code_postal}, France`,
            region: 'fr'
          },
          (results, status) => {
            if (status === 'OK' && results[0]) {
              resolve(results[0]);
            } else {
              reject(new Error('Adresse non trouvée'));
            }
          }
        );
      });

      setAddressValidated(true);
      setMessage('Adresse validée avec succès !');
    } catch (err) {
      setError('Impossible de valider cette adresse');
      setAddressValidated(false);
    } finally {
      setValidationAddressLoading(false);
    }
  };

  // Vérification des permissions
  useEffect(() => {
    if (!isAuthenticated || userType !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, userType, navigate]);

  // Charger les données
  const fetchFranchises = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('api/franchises/');
      setFranchises(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des franchises');
      setFranchises([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('api/users/');
      setUsers(response.data);
    } catch (err) {
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchFranchises();
    fetchUsers();
  }, []);

  // Validation d'une franchise
  const handleValidationClick = (franchise) => {
    setFranchiseToValidate(franchise);
    setCommentaireValidation('');
    setShowValidationModal(true);
  };

  const confirmerValidation = async () => {
    if (!franchiseToValidate) return;

    setValidationLoading(prev => ({ ...prev, [franchiseToValidate.id]: true }));
    
    try {
      const response = await apiClient.post(`api/franchises/${franchiseToValidate.id}/valider/`, {
        commentaire: commentaireValidation
      });
      
      setMessage('Franchise validée avec succès ! Email envoyé au franchisé.');
      setShowValidationModal(false);
      setFranchiseToValidate(null);
      setCommentaireValidation('');
      fetchFranchises(); // Recharger la liste
      
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Erreur lors de la validation');
      }
    } finally {
      setValidationLoading(prev => ({ ...prev, [franchiseToValidate.id]: false }));
    }
  };

  // Régénérer un lien de paiement
  const regenererLienPaiement = async (franchiseId) => {
    setValidationLoading(prev => ({ ...prev, [franchiseId]: true }));
    
    try {
      const response = await apiClient.post(`api/franchises/${franchiseId}/regenerer-lien/`);
      setMessage('Nouveau lien de paiement généré et envoyé !');
      fetchFranchises();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la génération du lien');
    } finally {
      setValidationLoading(prev => ({ ...prev, [franchiseId]: false }));
    }
  };

  // Gestion formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Reset validation si l'adresse change
    if (name === 'adresse' || name === 'ville' || name === 'code_postal') {
      setAddressValidated(false);
    }
  };

  // Soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (editingId) {
        // Modification - sans le champ user
        const submitData = {
          nom_franchise: form.nom_franchise,
          adresse: form.adresse,
          ville: form.ville,
          code_postal: form.code_postal,
          date_signature: form.date_signature,
          statut: form.statut
        };
        await apiClient.put(`api/franchises/${editingId}/`, submitData);
        setMessage('Franchise modifiée avec succès !');
      } else {
        // Création - avec le champ user
        const submitData = {
          ...form,
          user: parseInt(form.user)
        };
        await apiClient.post('api/franchises/', submitData);
        setMessage('Franchise créée avec succès !');
      }
      
      setForm(initialForm);
      setEditingId(null);
      setShowForm(false);
      setAddressValidated(false);
      fetchFranchises();
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Erreur lors de l\'opération');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // Modification
  const handleEdit = (franchise) => {
    setForm({
      nom_franchise: franchise.nom_franchise || '',
      adresse: franchise.adresse || '',
      ville: franchise.ville || '',
      code_postal: franchise.code_postal || '',
      date_signature: franchise.date_signature || '',
      statut: franchise.statut || 'en_attente',
      user: franchise.user || ''
    });
    setEditingId(franchise.id);
    setShowForm(true);
    setAddressValidated(true); // Considérer les adresses existantes comme validées
  };

  // Suppression
  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette franchise ?')) return;
    
    try {
      await apiClient.delete(`api/franchises/${id}/`);
      setMessage('Franchise supprimée avec succès');
      fetchFranchises();
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  // Filtrage
  const filteredFranchises = franchises.filter(franchise => {
    if (!franchise) return false;
    
    const matchesSearch = (
      (franchise.nom_franchise || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (franchise.ville || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (franchise.user_email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesStatus = statusFilter === '' || franchise.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Reset form
  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
    setAddressValidated(false);
    setShowSuggestions(false);
  };

  // Fonction pour obtenir le badge de statut
  const getStatusBadge = (franchise) => {
    const badgeClass = `gestion-franchises__badge gestion-franchises__badge--${franchise.statut}`;
    
    switch (franchise.statut) {
      case 'en_attente':
        return <span className={badgeClass}>⏳ En attente</span>;
      case 'valide':
        return <span className={badgeClass}>✅ Validé</span>;
      case 'paye':
        return <span className={badgeClass}>💳 Payé - Actif</span>;
      case 'suspendu':
        return <span className={badgeClass}>⏸️ Suspendu</span>;
      case 'resilie':
        return <span className={badgeClass}>❌ Résilié</span>;
      default:
        return <span className={badgeClass}>{franchise.statut}</span>;
    }
  };

  // Fonction pour obtenir les actions disponibles
  const getAvailableActions = (franchise) => {
    const actions = [];
    
    // Action de validation
    if (franchise.statut === 'en_attente') {
      actions.push(
        <button
          key="validate"
          className="gestion-franchises__action-btn gestion-franchises__action-btn--validate"
          onClick={() => handleValidationClick(franchise)}
          disabled={validationLoading[franchise.id]}
          title="Valider et envoyer lien de paiement"
        >
          {validationLoading[franchise.id] ? (
            <RefreshCw size={16} className="spinning" />
          ) : (
            <Check size={16} />
          )}
        </button>
      );
    }
    
    // Action de régénération de lien
    if (franchise.statut === 'valide' && franchise.statut_paiement !== 'paye') {
      actions.push(
        <button
          key="regenerate"
          className="gestion-franchises__action-btn gestion-franchises__action-btn--payment"
          onClick={() => regenererLienPaiement(franchise.id)}
          disabled={validationLoading[franchise.id]}
          title="Régénérer le lien de paiement"
        >
          {validationLoading[franchise.id] ? (
            <RefreshCw size={16} className="spinning" />
          ) : (
            <CreditCard size={16} />
          )}
        </button>
      );
    }
    
    // Actions standards
    actions.push(
      <button
        key="edit"
        className="gestion-franchises__action-btn gestion-franchises__action-btn--edit"
        onClick={() => handleEdit(franchise)}
        title="Modifier"
      >
        <Edit size={16} />
      </button>
    );
    
    actions.push(
      <button
        key="delete"
        className="gestion-franchises__action-btn gestion-franchises__action-btn--delete"
        onClick={() => handleDelete(franchise.id)}
        title="Supprimer"
      >
        <Trash2 size={16} />
      </button>
    );
    
    return actions;
  };

  return (
    <div className="admin-layout">
      <AdminNavigation />
      
      <main className="admin-main-content">
        <div className="gestion-franchises">
          <div className="gestion-franchises__container">
            
            {/* Header */}
            <div className="gestion-franchises__header">
              <div className="gestion-franchises__header-content">
                <div className="gestion-franchises__title-section">
                  <h1 className="gestion-franchises__title">
                    <Users className="gestion-franchises__title-icon" size={32} />
                    Gestion des Franchises
                  </h1>
                  <p className="gestion-franchises__subtitle">
                    Enregistrer, valider et gérer les franchisés du réseau DRIV'N COOK
                  </p>
                </div>
                <button 
                  className="gestion-franchises__btn gestion-franchises__btn--primary"
                  onClick={() => setShowForm(true)}
                >
                  <Plus size={20} />
                  Nouvelle franchise
                </button>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="gestion-franchises__alert gestion-franchises__alert--error">
                <AlertCircle size={20} />
                {error}
              </div>
            )}
            {message && (
              <div className="gestion-franchises__alert gestion-franchises__alert--success">
                <CheckCircle size={20} />
                {message}
              </div>
            )}

            {/* Filtres et recherche */}
            <div className="gestion-franchises__filters">
              <div className="gestion-franchises__search">
                <Search className="gestion-franchises__search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par nom, ville ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="gestion-franchises__search-input"
                />
              </div>
              <div className="gestion-franchises__filter">
                <Filter className="gestion-franchises__filter-icon" size={20} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="gestion-franchises__filter-select"
                >
                  <option value="">Tous les statuts</option>
                  <option value="en_attente">En attente</option>
                  <option value="valide">Validé</option>
                  <option value="paye">Payé - Actif</option>
                  <option value="suspendu">Suspendu</option>
                  <option value="resilie">Résilié</option>
                </select>
              </div>
            </div>

            {/* Liste des franchises */}
            <div className="gestion-franchises__content">
              <div className="gestion-franchises__list-section">
                <div className="gestion-franchises__card">
                  <div className="gestion-franchises__card-header">
                    <h3 className="gestion-franchises__card-title">
                      Liste des franchises ({filteredFranchises.length})
                    </h3>
                  </div>
                  
                  {loading ? (
                    <div className="gestion-franchises__loading">
                      <div className="gestion-franchises__spinner"></div>
                      <p>Chargement des franchises...</p>
                    </div>
                  ) : (
                    <div className="gestion-franchises__table-container">
                      <table className="gestion-franchises__table">
                        <thead>
                          <tr>
                            <th>Franchise</th>
                            <th>Gérant</th>
                            <th>Localisation</th>
                            <th>Date signature</th>
                            <th>Statut</th>
                            <th>Paiement</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredFranchises.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="gestion-franchises__empty">
                                {franchises.length === 0 ? 'Aucune franchise enregistrée' : 'Aucune franchise trouvée'}
                              </td>
                            </tr>
                          ) : (
                            filteredFranchises.map((franchise, i) => (
                              <tr key={franchise.id} className="gestion-franchises__table-row">
                                <td>
                                  <div className="gestion-franchises__franchise-info">
                                    <strong>{franchise.nom_franchise}</strong>
                                    <span className="gestion-franchises__franchise-id">
                                      #{franchise.id}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <div className="gestion-franchises__user-info">
                                    <span>{franchise.user_first_name || 'N/A'} {franchise.user_last_name || 'N/A'}</span>
                                    <span className="gestion-franchises__user-email">
                                      {franchise.user_email || 'N/A'}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <div className="gestion-franchises__location">
                                    <span>{franchise.ville || 'N/A'}</span>
                                    <span className="gestion-franchises__postal">
                                      {franchise.code_postal || 'N/A'}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  {franchise.date_signature ? 
                                    new Date(franchise.date_signature).toLocaleDateString('fr-FR') : 
                                    'N/A'
                                  }
                                </td>
                                <td>
                                  {getStatusBadge(franchise)}
                                </td>
                                <td>
                                  <div className="gestion-franchises__payment-info">
                                    {franchise.statut_paiement === 'paye' ? (
                                      <span className="gestion-franchises__payment-badge gestion-franchises__payment-badge--success">
                                        💳 Payé
                                      </span>
                                    ) : franchise.statut_paiement === 'lien_envoye' ? (
                                      <span className="gestion-franchises__payment-badge gestion-franchises__payment-badge--pending">
                                        📧 Lien envoyé
                                      </span>
                                    ) : franchise.statut_paiement === 'echec' ? (
                                      <span className="gestion-franchises__payment-badge gestion-franchises__payment-badge--error">
                                        ❌ Échec
                                      </span>
                                    ) : (
                                      <span className="gestion-franchises__payment-badge gestion-franchises__payment-badge--waiting">
                                        ⏳ En attente
                                      </span>
                                    )}
                                    {franchise.date_paiement && (
                                      <small>
                                        {new Date(franchise.date_paiement).toLocaleDateString('fr-FR')}
                                      </small>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <div className="gestion-franchises__actions">
                                    {getAvailableActions(franchise)}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal de validation */}
            {showValidationModal && franchiseToValidate && (
              <div className="gestion-franchises__modal-overlay" onClick={() => setShowValidationModal(false)}>
                <div className="gestion-franchises__modal gestion-franchises__modal--validation" onClick={(e) => e.stopPropagation()}>
                  <div className="gestion-franchises__modal-header">
                    <h3>Valider la franchise</h3>
                    <button 
                      className="gestion-franchises__modal-close"
                      onClick={() => setShowValidationModal(false)}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="gestion-franchises__validation-content">
                    <div className="gestion-franchises__franchise-summary">
                      <h4>{franchiseToValidate.nom_franchise}</h4>
                      <p><strong>Gérant :</strong> {franchiseToValidate.user_first_name} {franchiseToValidate.user_last_name}</p>
                      <p><strong>Email :</strong> {franchiseToValidate.user_email}</p>
                      <p><strong>Localisation :</strong> {franchiseToValidate.ville}, {franchiseToValidate.code_postal}</p>
                      <p><strong>Droit d'entrée :</strong> {franchiseToValidate.droit_entree}€</p>
                    </div>
                    
                    <div className="gestion-franchises__validation-warning">
                      <AlertCircle size={20} />
                      <div>
                        <strong>Action à effectuer :</strong>
                        <p>En validant cette franchise, un email sera automatiquement envoyé au franchisé avec un lien de paiement Stripe pour régler le droit d'entrée de {franchiseToValidate.droit_entree}€.</p>
                      </div>
                    </div>
                    
                    <div className="gestion-franchises__form-group">
                      <label htmlFor="commentaire">Commentaire (optionnel)</label>
                      <textarea
                        id="commentaire"
                        value={commentaireValidation}
                        onChange={(e) => setCommentaireValidation(e.target.value)}
                        className="gestion-franchises__textarea"
                        placeholder="Commentaire pour le franchisé..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="gestion-franchises__form-actions">
                      <button 
                        type="button" 
                        onClick={() => setShowValidationModal(false)}
                        className="gestion-franchises__btn gestion-franchises__btn--secondary"
                      >
                        Annuler
                      </button>
                      <button 
                        type="button" 
                        onClick={confirmerValidation}
                        disabled={validationLoading[franchiseToValidate.id]}
                        className="gestion-franchises__btn gestion-franchises__btn--success"
                      >
                        {validationLoading[franchiseToValidate.id] ? (
                          <>
                            <RefreshCw size={16} className="spinning" />
                            Validation en cours...
                          </>
                        ) : (
                          <>
                            <Check size={16} />
                            Valider et envoyer le lien
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Formulaire modal existant */}
            {showForm && (
              <div className="gestion-franchises__modal-overlay" onClick={resetForm}>
                <div className="gestion-franchises__modal" onClick={(e) => e.stopPropagation()}>
                  <div className="gestion-franchises__modal-header">
                    <h3>{editingId ? 'Modifier' : 'Créer'} une franchise</h3>
                    <button 
                      className="gestion-franchises__modal-close"
                      onClick={resetForm}
                    >
                      ×
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="gestion-franchises__form">
                    <div className="gestion-franchises__form-group">
                      <label htmlFor="nom_franchise">Nom de la franchise *</label>
                      <input
                        type="text"
                        id="nom_franchise"
                        name="nom_franchise"
                        value={form.nom_franchise}
                        onChange={handleChange}
                        required
                        className="gestion-franchises__input"
                        placeholder="Ex: DRIV'N COOK Paris 15"
                      />
                    </div>

                    {!editingId && (
                      <div className="gestion-franchises__form-group">
                        <label htmlFor="user">Utilisateur associé *</label>
                        <select
                          id="user"
                          name="user"
                          value={form.user || ''}
                          onChange={handleChange}
                          required
                          className="gestion-franchises__select"
                        >
                          <option value="">Sélectionner un utilisateur</option>
                          {users.map(user => (
                            <option key={user.id} value={user.id}>
                              {user.email} - {user.first_name} {user.last_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {!editingId && (
                      <div className="gestion-franchises__engagement-notice">
                        <div className="gestion-franchises__engagement-icon">💰</div>
                        <div className="gestion-franchises__engagement-text">
                          <strong>Engagement financier :</strong>
                          <p>L'utilisateur s'engage à payer un droit d'entrée de <strong>50 000€</strong> et une redevance de <strong>4%</strong> du chiffre d'affaires.</p>
                        </div>
                      </div>
                    )}

                            {/* Adresse avec autocomplétion Google Maps */}
                    <div className="gestion-franchises__form-group">
                      <label htmlFor="adresse">
                        Adresse complète
                        {isGoogleMapsLoaded && <span className="gestion-franchises__maps-badge">Google Maps</span>}
                      </label>
                      <div className="gestion-franchises__address-input-group">
                        <div className="gestion-franchises__address-input-wrapper">
                          <MapPin className="gestion-franchises__address-icon" size={16} />
                          <input
                            ref={addressInputRef}
                            type="text"
                            id="adresse"
                            name="adresse"
                            value={form.adresse}
                            onChange={handleChange}
                            className={`gestion-franchises__input gestion-franchises__input--with-icon ${addressValidated ? 'gestion-franchises__input--validated' : ''}`}
                            placeholder="Commencez à taper l'adresse..."
                          />
                          {addressValidated && (
                            <CheckCircle className="gestion-franchises__address-check" size={16} />
                          )}
                        </div>
                        {isGoogleMapsLoaded && form.adresse && !addressValidated && (
                          <button
                            type="button"
                            onClick={validateAddress}
                            disabled={validationAddressLoading}
                            className="gestion-franchises__btn gestion-franchises__btn--outline gestion-franchises__btn--small"
                          >
                            {validationAddressLoading ? 'Validation...' : 'Valider adresse'}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="gestion-franchises__form-row">
                      <div className="gestion-franchises__form-group">
                        <label htmlFor="ville">Ville</label>
                        <input
                          type="text"
                          id="ville"
                          name="ville"
                          value={form.ville}
                          onChange={handleChange}
                          className="gestion-franchises__input"
                          placeholder="Paris"
                        />
                      </div>
                      <div className="gestion-franchises__form-group">
                        <label htmlFor="code_postal">Code postal</label>
                        <input
                          type="text"
                          id="code_postal"
                          name="code_postal"
                          value={form.code_postal}
                          onChange={handleChange}
                          pattern="\d*"
                          maxLength={5}
                          className="gestion-franchises__input"
                          placeholder="75001"
                        />
                      </div>
                    </div>

                    <div className="gestion-franchises__form-row">
                      <div className="gestion-franchises__form-group">
                        <label htmlFor="date_signature">Date de signature *</label>
                        <input
                          type="date"
                          id="date_signature"
                          name="date_signature"
                          value={form.date_signature}
                          onChange={handleChange}
                          required
                          className="gestion-franchises__input"
                        />
                      </div>
                      <div className="gestion-franchises__form-group">
                        <label htmlFor="statut">Statut *</label>
                        <select
                          id="statut"
                          name="statut"
                          value={form.statut}
                          onChange={handleChange}
                          required
                          className="gestion-franchises__select"
                        >
                          <option value="en_attente">En attente</option>
                          <option value="valide">Validé</option>
                          <option value="paye">Payé - Actif</option>
                          <option value="suspendu">Suspendu</option>
                          <option value="resilie">Résilié</option>
                        </select>
                      </div>
                    </div>

                    <div className="gestion-franchises__form-actions">
                      <button 
                        type="button" 
                        onClick={resetForm}
                        className="gestion-franchises__btn gestion-franchises__btn--secondary"
                      >
                        Annuler
                      </button>
                      <button 
                        type="submit" 
                        disabled={submitLoading || (!addressValidated && form.adresse)}
                        className="gestion-franchises__btn gestion-franchises__btn--primary"
                      >
                        {submitLoading ? (
                          <>
                            <div className="gestion-franchises__spinner gestion-franchises__spinner--small"></div>
                            {editingId ? 'Modification...' : 'Création...'}
                          </>
                        ) : (
                          editingId ? 'Modifier' : 'Créer'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}