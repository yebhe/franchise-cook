// components/admin/emplacements/GestionEmplacements.jsx
import React, { useEffect, useState, useRef } from 'react';
import { 
  MapPin, Plus, Edit, Trash2, Search, Filter, Euro, Clock, 
  Building2, CheckCircle, Users, ChevronDown, ChevronUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';
import useAuthStore from '../../../store/authStore';
import './GestionEmplacements.css';
import AdminNavigation from '../AdminNavigation';

const initialForm = {
  nom_emplacement: '',
  adresse: '',
  ville: '',
  code_postal: '',
  type_zone: 'centre_ville',
  tarif_journalier: '',
  horaires_autorises: '',
  franchises_autorisees: [] // 🎯 CHANGÉ: nouveau nom de champ pour multi-emplacements
};

const TYPE_ZONE_OPTIONS = [
  { value: 'centre_ville', label: 'Centre-ville' },
  { value: 'zone_commerciale', label: 'Zone commerciale' },
  { value: 'parc', label: 'Parc' },
  { value: 'entreprise', label: 'Entreprise' },
  { value: 'marche', label: 'Marché' }
];

export default function GestionEmplacements() {
  const [emplacements, setEmplacements] = useState([]);
  const [franchises, setFranchises] = useState([]); // Liste complète des franchises
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showFranchisesPanel, setShowFranchisesPanel] = useState(false);
  
  // États pour Google Maps
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [addressValidated, setAddressValidated] = useState(false);
  const [validationLoading, setValidationLoading] = useState(false);
  
  const autocompleteRef = useRef(null);
  const addressInputRef = useRef(null);

  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userType = useAuthStore((state) => state.getUserType());

  // Vérification des permissions
  useEffect(() => {
    if (!isAuthenticated || userType !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, userType, navigate]);

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
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialiser l'autocomplétion Google Places
  useEffect(() => {
    if (isGoogleMapsLoaded && addressInputRef.current && showForm) {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }

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
  };

  // Validation manuelle d'adresse
  const validateAddress = async () => {
    if (!form.adresse.trim()) return;
    
    setValidationLoading(true);
    try {
      const geocoder = new window.google.maps.Geocoder();
      await new Promise((resolve, reject) => {
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
      setValidationLoading(false);
    }
  };

  // Charger les données
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [emplacementsRes, franchisesRes] = await Promise.all([
        apiClient.get('api/emplacements/'),
        apiClient.get('api/franchises/')
      ]);
      
      setEmplacements(Array.isArray(emplacementsRes.data) ? emplacementsRes.data : []);
      setFranchises(Array.isArray(franchisesRes.data) ? franchisesRes.data : []);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      setEmplacements([]);
      setFranchises([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Gestion formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (name === 'adresse' || name === 'ville' || name === 'code_postal') {
      setAddressValidated(false);
    }
  };

  // 🎯 MODIFIÉ: Gestion des franchises autorisées
  const handleFranchiseToggle = (franchiseId) => {
    setForm(prev => {
      const updatedFranchises = prev.franchises_autorisees.includes(franchiseId)
        ? prev.franchises_autorisees.filter(id => id !== franchiseId)
        : [...prev.franchises_autorisees, franchiseId];
      
      return { ...prev, franchises_autorisees: updatedFranchises };
    });
  };

  // 🎯 MODIFIÉ: Soumission adaptée au nouveau format
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    setMessage(null);

    try {
      const formData = {
        ...form,
        tarif_journalier: form.tarif_journalier ? parseFloat(form.tarif_journalier) : null,
        // 🎯 CHANGÉ: utiliser franchises_autorisees au lieu de franchises
        franchises_autorisees: form.franchises_autorisees
      };

      if (editingId) {
        await apiClient.put(`api/emplacements/${editingId}/`, formData);
        setMessage('Emplacement modifié avec succès !');
      } else {
        await apiClient.post('api/emplacements/', formData);
        setMessage('Emplacement créé avec succès !');
      }
      
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'opération');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 🎯 MODIFIÉ: Modification pour récupérer les bonnes données
  const handleEdit = (emplacement) => {
    setForm({
      nom_emplacement: emplacement.nom_emplacement || '',
      adresse: emplacement.adresse || '',
      ville: emplacement.ville || '',
      code_postal: emplacement.code_postal || '',
      type_zone: emplacement.type_zone || 'centre_ville',
      tarif_journalier: emplacement.tarif_journalier || '',
      horaires_autorises: emplacement.horaires_autorises || '',
      // 🎯 CHANGÉ: utiliser franchises_autorisees ou franchises_autorisees_details
      franchises_autorisees: emplacement.franchises_autorisees || 
                            emplacement.franchises_autorisees_details?.map(f => f.id) || []
    });
    setEditingId(emplacement.id);
    setShowForm(true);
    setAddressValidated(true);
  };

  // Suppression
  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`api/emplacements/${id}/`);
      setMessage('Emplacement supprimé avec succès');
      fetchData();
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.affectations_actives) {
        const affectations = err.response.data.affectations_actives;
        const message = `Impossible de supprimer : ${affectations.length} affectation(s) en cours:\n\n` +
          affectations.map(aff => 
            `• Camion ${aff.camion} (${aff.franchise}) - ${aff.date_debut}`
          ).join('\n') +
          '\n\nVoulez-vous forcer la suppression ? (Les affectations seront annulées)';
        
        if (window.confirm(message)) {
          try {
            await apiClient.delete(`api/emplacements/${id}/?force=true`);
            setMessage('Emplacement supprimé avec succès (affectations annulées)');
            fetchData();
          } catch (forceErr) {
            setError('Erreur lors de la suppression forcée');
          }
        }
      } else {
        setError(err.response?.data?.error || 'Erreur lors de la suppression');
      }
    }
  };

  // Filtrage
  const filteredEmplacements = emplacements.filter(emplacement => {
    const matchesSearch = (
      emplacement.nom_emplacement?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emplacement.ville?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emplacement.adresse?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesType = typeFilter === '' || emplacement.type_zone === typeFilter;
    return matchesSearch && matchesType;
  });

  // Reset form
  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
    setAddressValidated(false);
    setShowFranchisesPanel(false);
  };

  // Obtenir le label du type de zone
  const getTypeZoneLabel = (value) => {
    return TYPE_ZONE_OPTIONS.find(opt => opt.value === value)?.label || value;
  };

  // Obtenir le nom d'une franchise par son ID
  const getFranchiseName = (id) => {
    return franchises.find(f => f.id === id)?.nom_franchise || `Franchise #${id}`;
  };

  return (
    <div className="admin-layout">
      <AdminNavigation />
      
      <main className="admin-main-content">
        <div className="gestion-emplacements">
          <div className="gestion-emplacements__container">
            
            {/* Header */}
            <div className="gestion-emplacements__header">
              <div className="gestion-emplacements__header-content">
                <div className="gestion-emplacements__title-section">
                  <h1 className="gestion-emplacements__title">
                    <MapPin className="gestion-emplacements__title-icon" size={32} />
                    Gestion des Emplacements
                  </h1>
                  <p className="gestion-emplacements__subtitle">
                    Gérer les emplacements où les camions peuvent se positionner
                  </p>
                </div>
                <button 
                  className="gestion-emplacements__btn gestion-emplacements__btn--primary"
                  onClick={() => setShowForm(true)}
                >
                  <Plus size={20} />
                  Nouvel emplacement
                </button>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="gestion-emplacements__alert gestion-emplacements__alert--error">
                {error}
              </div>
            )}
            {message && (
              <div className="gestion-emplacements__alert gestion-emplacements__alert--success">
                {message}
              </div>
            )}

            {/* Filtres et recherche */}
            <div className="gestion-emplacements__filters">
              <div className="gestion-emplacements__search">
                <Search className="gestion-emplacements__search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par nom, ville ou adresse..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="gestion-emplacements__search-input"
                />
              </div>
              <div className="gestion-emplacements__filter">
                <Filter className="gestion-emplacements__filter-icon" size={20} />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="gestion-emplacements__filter-select"
                >
                  <option value="">Tous les types</option>
                  {TYPE_ZONE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Liste des emplacements */}
            <div className="gestion-emplacements__content">
              <div className="gestion-emplacements__list-section">
                <div className="gestion-emplacements__card">
                  <div className="gestion-emplacements__card-header">
                    <h3 className="gestion-emplacements__card-title">
                      Liste des emplacements ({filteredEmplacements.length})
                    </h3>
                  </div>
                  
                  {loading ? (
                    <div className="gestion-emplacements__loading">
                      <div className="gestion-emplacements__spinner"></div>
                      <p>Chargement des emplacements...</p>
                    </div>
                  ) : (
                    <div className="gestion-emplacements__table-container">
                      <table className="gestion-emplacements__table">
                        <thead>
                          <tr>
                            <th>Emplacement</th>
                            <th>Type de zone</th>
                            <th>Localisation</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEmplacements.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="gestion-emplacements__empty">
                                {emplacements.length === 0 ? 'Aucun emplacement enregistré' : 'Aucun emplacement trouvé'}
                              </td>
                            </tr>
                          ) : (
                            filteredEmplacements.map((emplacement) => (
                              <tr key={emplacement.id} className="gestion-emplacements__table-row">
                                <td>
                                  <div className="gestion-emplacements__emplacement-info">
                                    <strong>{emplacement.nom_emplacement}</strong>
                                    <div className="gestion-emplacements__emplacement-meta">
                                      {emplacement.tarif_journalier ? (
                                        <span className="gestion-emplacements__tarif">
                                          <Euro size={14} /> {emplacement.tarif_journalier}€/jour
                                        </span>
                                      ) : (
                                        <span className="gestion-emplacements__tarif-free">Gratuit</span>
                                      )}
                                      {emplacement.horaires_autorises && (
                                        <span className="gestion-emplacements__horaires">
                                          <Clock size={14} /> {emplacement.horaires_autorises}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <span className={`gestion-emplacements__badge gestion-emplacements__badge--${emplacement.type_zone}`}>
                                    {getTypeZoneLabel(emplacement.type_zone)}
                                  </span>
                                </td>
                                <td>
                                  <div className="gestion-emplacements__location">
                                    <div>{emplacement.adresse}</div>
                                    <div className="gestion-emplacements__city">
                                      {emplacement.code_postal} {emplacement.ville}
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="gestion-emplacements__actions">
                                    <button
                                      className="gestion-emplacements__action-btn gestion-emplacements__action-btn--edit"
                                      onClick={() => handleEdit(emplacement)}
                                      title="Modifier"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button
                                      className="gestion-emplacements__action-btn gestion-emplacements__action-btn--delete"
                                      onClick={() => handleDelete(emplacement.id)}
                                      title="Supprimer"
                                    >
                                      <Trash2 size={16} />
                                    </button>
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

              {/* Formulaire modal */}
              {showForm && (
                <div className="gestion-emplacements__modal-overlay" onClick={resetForm}>
                  <div className="gestion-emplacements__modal" onClick={(e) => e.stopPropagation()}>
                    <div className="gestion-emplacements__modal-header">
                      <h3>{editingId ? 'Modifier' : 'Créer'} un emplacement</h3>
                      <button 
                        className="gestion-emplacements__modal-close"
                        onClick={resetForm}
                      >
                        ×
                      </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="gestion-emplacements__form">
                      <div className="gestion-emplacements__form-group">
                        <label htmlFor="nom_emplacement">Nom de l'emplacement *</label>
                        <input
                          type="text"
                          id="nom_emplacement"
                          name="nom_emplacement"
                          value={form.nom_emplacement}
                          onChange={handleChange}
                          required
                          className="gestion-emplacements__input"
                          placeholder="Ex: Place de la République"
                        />
                      </div>

                      {/* Adresse avec validation Google Maps */}
                      <div className="gestion-emplacements__form-group">
                        <label htmlFor="adresse">
                          Adresse complète *
                          {isGoogleMapsLoaded && <span className="gestion-emplacements__maps-badge">Google Maps</span>}
                        </label>
                        <div className="gestion-emplacements__address-group">
                          <div className="gestion-emplacements__address-wrapper">
                            <MapPin className="gestion-emplacements__address-icon" size={16} />
                            <input
                              ref={addressInputRef}
                              type="text"
                              id="adresse"
                              name="adresse"
                              value={form.adresse}
                              onChange={handleChange}
                              required
                              className={`gestion-emplacements__input gestion-emplacements__input--with-icon ${addressValidated ? 'gestion-emplacements__input--validated' : ''}`}
                              placeholder="Commencez à taper l'adresse..."
                            />
                            {addressValidated && (
                              <CheckCircle className="gestion-emplacements__address-check" size={16} />
                            )}
                          </div>
                          {isGoogleMapsLoaded && form.adresse && !addressValidated && (
                            <button
                              type="button"
                              onClick={validateAddress}
                              disabled={validationLoading}
                              className="gestion-emplacements__btn gestion-emplacements__btn--outline gestion-emplacements__btn--small"
                            >
                              {validationLoading ? 'Validation...' : 'Valider'}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="gestion-emplacements__form-row">
                        <div className="gestion-emplacements__form-group">
                          <label htmlFor="ville">Ville *</label>
                          <input
                            type="text"
                            id="ville"
                            name="ville"
                            value={form.ville}
                            onChange={handleChange}
                            required
                            className="gestion-emplacements__input"
                            placeholder="Paris"
                          />
                        </div>
                        <div className="gestion-emplacements__form-group">
                          <label htmlFor="code_postal">Code postal</label>
                          <input
                            type="text"
                            id="code_postal"
                            name="code_postal"
                            value={form.code_postal}
                            onChange={handleChange}
                            pattern="\d{5}"
                            maxLength={5}
                            className="gestion-emplacements__input"
                            placeholder="75001"
                          />
                        </div>
                      </div>

                      <div className="gestion-emplacements__form-group">
                        <label htmlFor="type_zone">Type de zone *</label>
                        <div className="gestion-emplacements__input-wrapper">
                          <Building2 className="gestion-emplacements__input-icon" size={16} />
                          <select
                            id="type_zone"
                            name="type_zone"
                            value={form.type_zone}
                            onChange={handleChange}
                            required
                            className="gestion-emplacements__select gestion-emplacements__select--with-icon"
                          >
                            {TYPE_ZONE_OPTIONS.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="gestion-emplacements__form-row">
                        <div className="gestion-emplacements__form-group">
                          <label htmlFor="tarif_journalier">Tarif journalier (€)</label>
                          <div className="gestion-emplacements__input-wrapper">
                            <Euro className="gestion-emplacements__input-icon" size={16} />
                            <input
                              type="number"
                              id="tarif_journalier"
                              name="tarif_journalier"
                              value={form.tarif_journalier}
                              onChange={handleChange}
                              step="0.01"
                              min="0"
                              className="gestion-emplacements__input gestion-emplacements__input--with-icon"
                              placeholder="0.00"
                            />
                          </div>
                          <small className="gestion-emplacements__help-text">
                            Laisser vide si gratuit
                          </small>
                        </div>
                        <div className="gestion-emplacements__form-group">
                          <label htmlFor="horaires_autorises">Horaires autorisés</label>
                          <div className="gestion-emplacements__input-wrapper">
                            <Clock className="gestion-emplacements__input-icon" size={16} />
                            <input
                              type="text"
                              id="horaires_autorises"
                              name="horaires_autorises"
                              value={form.horaires_autorises}
                              onChange={handleChange}
                              className="gestion-emplacements__input gestion-emplacements__input--with-icon"
                              placeholder="Ex: 8h-20h ou 24h/24"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 🎯 MODIFIÉ: Section Franchises autorisées */}
                      <div className="gestion-emplacements__franchises-section">
                        <button
                          type="button"
                          className="gestion-emplacements__franchises-toggle"
                          onClick={() => setShowFranchisesPanel(!showFranchisesPanel)}
                        >
                          <Users size={18} />
                          <span>Franchises autorisées ({form.franchises_autorisees.length})</span>
                          {showFranchisesPanel ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>

                        {showFranchisesPanel && (
                          <div className="gestion-emplacements__franchises-panel">
                            {franchises.length === 0 ? (
                              <div className="gestion-emplacements__no-franchises">
                                Aucune franchise disponible
                              </div>
                            ) : (
                              <div className="gestion-emplacements__franchises-grid">
                                {franchises.map(franchise => (
                                  <div key={franchise.id} className="gestion-emplacements__franchise-item">
                                    <input
                                      type="checkbox"
                                      id={`franchise-${franchise.id}`}
                                      checked={form.franchises_autorisees.includes(franchise.id)}
                                      onChange={() => handleFranchiseToggle(franchise.id)}
                                      className="gestion-emplacements__franchise-checkbox"
                                    />
                                    <label 
                                      htmlFor={`franchise-${franchise.id}`}
                                      className="gestion-emplacements__franchise-label"
                                    >
                                      {franchise.nom_franchise}
                                      <span className="gestion-emplacements__franchise-city">
                                        {franchise.ville}
                                      </span>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="gestion-emplacements__form-actions">
                        <button 
                          type="button" 
                          onClick={resetForm}
                          className="gestion-emplacements__btn gestion-emplacements__btn--secondary"
                        >
                          Annuler
                        </button>
                        <button 
                          type="submit" 
                          disabled={submitLoading || (!addressValidated && form.adresse)}
                          className="gestion-emplacements__btn gestion-emplacements__btn--primary"
                        >
                          {submitLoading ? (
                            <>
                              <div className="gestion-emplacements__spinner gestion-emplacements__spinner--small"></div>
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
        </div>
      </main>
    </div>
  );
}