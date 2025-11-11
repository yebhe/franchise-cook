// components/admin/affectations/GestionAffectations.jsx
import React, { useEffect, useState } from 'react';
import { 
  Navigation, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Calendar,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';
import useAuthStore from '../../../store/authStore';
import './GestionAffectations.css';
import AdminNavigation from '../AdminNavigation';

const initialForm = {
  camion: '',
  emplacement: '',
  date_debut: '',
  date_fin: '',
  horaire_debut: '',
  horaire_fin: '',
  statut: 'programme'
};

const STATUT_OPTIONS = [
  { value: 'programme', label: 'Programmé' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'termine', label: 'Terminé' },
  { value: 'annule', label: 'Annulé' }
];

export default function GestionAffectations() {
  const [affectations, setAffectations] = useState([]);
  const [camions, setCamions] = useState([]);
  const [emplacements, setEmplacements] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [showForm, setShowForm] = useState(false);

  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userType = useAuthStore((state) => state.getUserType());

  // Vérification des permissions
  useEffect(() => {
    if (!isAuthenticated || userType !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, userType, navigate]);

  // Charger les données
  const fetchAffectations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('api/affectations/');
      setAffectations(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Erreur lors du chargement des affectations');
      setAffectations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCamions = async () => {
    try {
      const response = await apiClient.get('api/camions/');
      setCamions(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erreur lors du chargement des camions');
    }
  };

  const fetchEmplacements = async () => {
    try {
      const response = await apiClient.get('api/emplacements/');
      setEmplacements(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erreur lors du chargement des emplacements');
    }
  };

  useEffect(() => {
    fetchAffectations();
    fetchCamions();
    fetchEmplacements();
  }, []);

  // Fonctions utilitaires (avant leur utilisation)
  const getCamionNumero = (camionId) => {
    if (!camionId) return 'N/A';
    const camion = camions.find(c => c.id === camionId);
    return camion ? camion.numero_camion : 'Camion inconnu';
  };

  const getEmplacementNom = (emplacementId) => {
    if (!emplacementId) return 'N/A';
    const emplacement = emplacements.find(e => e.id === emplacementId);
    return emplacement ? emplacement.nom_emplacement : 'Emplacement inconnu';
  };

  const getStatutLabel = (value) => {
    const option = STATUT_OPTIONS.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  // Gestion formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    setMessage(null);

    try {
      const formData = {
        ...form,
        date_fin: form.date_fin || null,
        horaire_debut: form.horaire_debut || null,
        horaire_fin: form.horaire_fin || null
      };

      if (editingId) {
        await apiClient.put(`api/affectations/${editingId}/`, formData);
        setMessage('Affectation modifiée avec succès !');
      } else {
        await apiClient.post('api/affectations/', formData);
        setMessage('Affectation créée avec succès !');
      }
      
      setForm(initialForm);
      setEditingId(null);
      setShowForm(false);
      fetchAffectations();
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
  const handleEdit = (affectation) => {
    setForm({
      camion: affectation.camion || '',
      emplacement: affectation.emplacement || '',
      date_debut: affectation.date_debut || '',
      date_fin: affectation.date_fin || '',
      horaire_debut: affectation.horaire_debut || '',
      horaire_fin: affectation.horaire_fin || '',
      statut: affectation.statut || 'programme'
    });
    setEditingId(affectation.id);
    setShowForm(true);
  };

  // Suppression
  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette affectation ?')) return;
    
    try {
      await apiClient.delete(`api/affectations/${id}/`);
      setMessage('Affectation supprimée avec succès');
      fetchAffectations();
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  // Filtrage
  const filteredAffectations = (affectations || []).filter(affectation => {
    if (!affectation) return false;
    
    const matchesSearch = (
      (getCamionNumero(affectation.camion) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (getEmplacementNom(affectation.emplacement) || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesStatut = statutFilter === '' || affectation.statut === statutFilter;
    return matchesSearch && matchesStatut;
  });

  // Reset form
  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="admin-layout">
      <AdminNavigation />
      
      <main className="admin-main-content">
        <div className="gestion-affectations">
          <div className="gestion-affectations__container">
            
            {/* Header */}
            <div className="gestion-affectations__header">
              <div className="gestion-affectations__header-content">
                <div className="gestion-affectations__title-section">
                  <h1 className="gestion-affectations__title">
                    <Navigation className="gestion-affectations__title-icon" size={32} />
                    Envoi de Camions
                  </h1>
                  <p className="gestion-affectations__subtitle">
                    Affecter les camions dans des emplacements
                  </p>
                </div>
                <button 
                  className="gestion-affectations__btn gestion-affectations__btn--primary"
                  onClick={() => setShowForm(true)}
                >
                  <Plus size={20} />
                  Nouvelle affectation
                </button>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="gestion-affectations__alert gestion-affectations__alert--error">
                {error}
              </div>
            )}
            {message && (
              <div className="gestion-affectations__alert gestion-affectations__alert--success">
                {message}
              </div>
            )}

            {/* Filtres et recherche */}
            <div className="gestion-affectations__filters">
              <div className="gestion-affectations__search">
                <Search className="gestion-affectations__search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par camion ou emplacement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="gestion-affectations__search-input"
                />
              </div>
              <div className="gestion-affectations__filter">
                <Filter className="gestion-affectations__filter-icon" size={20} />
                <select
                  value={statutFilter}
                  onChange={(e) => setStatutFilter(e.target.value)}
                  className="gestion-affectations__filter-select"
                >
                  <option value="">Tous les statuts</option>
                  {STATUT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Liste des affectations */}
            <div className="gestion-affectations__content">
              <div className="gestion-affectations__list-section">
                <div className="gestion-affectations__card">
                  <div className="gestion-affectations__card-header">
                    <h3 className="gestion-affectations__card-title">
                      Affectations d'emplacements ({filteredAffectations.length})
                    </h3>
                  </div>
                  
                  {loading ? (
                    <div className="gestion-affectations__loading">
                      <div className="gestion-affectations__spinner"></div>
                      <p>Chargement des affectations...</p>
                    </div>
                  ) : (
                    <div className="gestion-affectations__table-container">
                      <table className="gestion-affectations__table">
                        <thead>
                          <tr>
                            <th>Camion</th>
                            <th>Emplacement</th>
                            <th>Date début</th>
                            <th>Date fin</th>
                            <th>Horaires</th>
                            <th>Statut</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAffectations.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="gestion-affectations__empty">
                                {(affectations || []).length === 0 ? 'Aucune affectation enregistrée' : 'Aucune affectation trouvée'}
                              </td>
                            </tr>
                          ) : (
                            filteredAffectations.map((affectation, i) => (
                              <tr key={affectation.id} className="gestion-affectations__table-row">
                                <td>
                                  <div className="gestion-affectations__camion">
                                    <strong>{getCamionNumero(affectation.camion)}</strong>
                                  </div>
                                </td>
                                <td>
                                  <div className="gestion-affectations__emplacement">
                                    {getEmplacementNom(affectation.emplacement)}
                                  </div>
                                </td>
                                <td>
                                  <div className="gestion-affectations__date">
                                    {affectation.date_debut ? 
                                      new Date(affectation.date_debut).toLocaleDateString('fr-FR') : 
                                      'N/A'
                                    }
                                  </div>
                                </td>
                                <td>
                                  <div className="gestion-affectations__date">
                                    {affectation.date_fin ? 
                                      new Date(affectation.date_fin).toLocaleDateString('fr-FR') : 
                                      'Non définie'
                                    }
                                  </div>
                                </td>
                                <td>
                                  <div className="gestion-affectations__horaires">
                                    {affectation.horaire_debut && affectation.horaire_fin ? 
                                      `${affectation.horaire_debut} - ${affectation.horaire_fin}` : 
                                      'Non définis'
                                    }
                                  </div>
                                </td>
                                <td>
                                  <span className={`gestion-affectations__badge gestion-affectations__badge--${affectation.statut}`}>
                                    {getStatutLabel(affectation.statut)}
                                  </span>
                                </td>
                                <td>
                                  <div className="gestion-affectations__actions">
                                    <button
                                      className="gestion-affectations__action-btn gestion-affectations__action-btn--edit"
                                      onClick={() => handleEdit(affectation)}
                                      title="Modifier"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button
                                      className="gestion-affectations__action-btn gestion-affectations__action-btn--delete"
                                      onClick={() => handleDelete(affectation.id)}
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
                <div className="gestion-affectations__modal-overlay" onClick={resetForm}>
                  <div className="gestion-affectations__modal" onClick={(e) => e.stopPropagation()}>
                    <div className="gestion-affectations__modal-header">
                      <h3>{editingId ? 'Modifier' : 'Créer'} une affectation</h3>
                      <button 
                        className="gestion-affectations__modal-close"
                        onClick={resetForm}
                      >
                        ×
                      </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="gestion-affectations__form">
                      <div className="gestion-affectations__form-row">
                        <div className="gestion-affectations__form-group">
                          <label htmlFor="camion">Camion *</label>
                          <select
                            id="camion"
                            name="camion"
                            value={form.camion}
                            onChange={handleChange}
                            required
                            className="gestion-affectations__select"
                          >
                            <option value="">Sélectionner un camion</option>
                            {camions.map(camion => (
                              <option key={camion.id} value={camion.id}>
                                {camion.numero_camion} - {camion.immatriculation}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="gestion-affectations__form-group">
                          <label htmlFor="emplacement">Emplacement *</label>
                          <select
                            id="emplacement"
                            name="emplacement"
                            value={form.emplacement}
                            onChange={handleChange}
                            required
                            className="gestion-affectations__select"
                          >
                            <option value="">Sélectionner un emplacement</option>
                            {emplacements.map(emplacement => (
                              <option key={emplacement.id} value={emplacement.id}>
                                {emplacement.nom_emplacement} - {emplacement.ville}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="gestion-affectations__form-row">
                        <div className="gestion-affectations__form-group">
                          <label htmlFor="date_debut">Date début *</label>
                          <input
                            type="date"
                            id="date_debut"
                            name="date_debut"
                            value={form.date_debut}
                            onChange={handleChange}
                            required
                            className="gestion-affectations__input"
                          />
                        </div>
                        <div className="gestion-affectations__form-group">
                          <label htmlFor="date_fin">Date fin</label>
                          <input
                            type="date"
                            id="date_fin"
                            name="date_fin"
                            value={form.date_fin}
                            onChange={handleChange}
                            className="gestion-affectations__input"
                          />
                        </div>
                      </div>

                      <div className="gestion-affectations__form-row">
                        <div className="gestion-affectations__form-group">
                          <label htmlFor="horaire_debut">Horaire début</label>
                          <input
                            type="time"
                            id="horaire_debut"
                            name="horaire_debut"
                            value={form.horaire_debut}
                            onChange={handleChange}
                            className="gestion-affectations__input"
                          />
                        </div>
                        <div className="gestion-affectations__form-group">
                          <label htmlFor="horaire_fin">Horaire fin</label>
                          <input
                            type="time"
                            id="horaire_fin"
                            name="horaire_fin"
                            value={form.horaire_fin}
                            onChange={handleChange}
                            className="gestion-affectations__input"
                          />
                        </div>
                      </div>

                      <div className="gestion-affectations__form-group">
                        <label htmlFor="statut">Statut *</label>
                        <select
                          id="statut"
                          name="statut"
                          value={form.statut}
                          onChange={handleChange}
                          required
                          className="gestion-affectations__select"
                        >
                          {STATUT_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="gestion-affectations__form-actions">
                        <button 
                          type="button" 
                          onClick={resetForm}
                          className="gestion-affectations__btn gestion-affectations__btn--secondary"
                        >
                          Annuler
                        </button>
                        <button 
                          type="submit" 
                          disabled={submitLoading}
                          className="gestion-affectations__btn gestion-affectations__btn--primary"
                        >
                          {submitLoading ? (
                            <>
                              <div className="gestion-affectations__spinner gestion-affectations__spinner--small"></div>
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