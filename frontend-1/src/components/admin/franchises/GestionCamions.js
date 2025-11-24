// components/admin/camions/GestionCamions.jsx
import React, { useEffect, useState } from 'react';
import { 
  Truck, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';
import useAuthStore from '../../../store/authStore';
import './GestionCamions.css';
import AdminNavigation from '../AdminNavigation';

const initialForm = {
  numero_camion: '',
  marque: '',
  modele: '',
  immatriculation: '',
  franchise: '',
  statut: 'disponible',
  date_attribution: '',
  kilometrage: 0
};

const STATUT_OPTIONS = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'attribue', label: 'Attribué' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'hors_service', label: 'Hors service' }
];

export default function GestionCamions() {
  const [camions, setCamions] = useState([]);
  const [franchises, setFranchises] = useState([]);
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
  const fetchCamions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('api/camions/');
      setCamions(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Erreur lors du chargement des camions');
      setCamions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFranchises = async () => {
    try {
      const response = await apiClient.get('api/franchises/');
      setFranchises(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erreur lors du chargement des franchises');
    }
  };

  useEffect(() => {
    fetchCamions();
    fetchFranchises();
  }, []);

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
        franchise: form.franchise || null,
        date_attribution: form.date_attribution || null,
        kilometrage: parseInt(form.kilometrage) || 0
      };

      if (editingId) {
        await apiClient.put(`api/camions/${editingId}/`, formData);
        setMessage('Camion modifié avec succès !');
      } else {
        await apiClient.post('api/camions/', formData);
        setMessage('Camion créé avec succès !');
      }
      
      setForm(initialForm);
      setEditingId(null);
      setShowForm(false);
      fetchCamions();
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
  const handleEdit = (camion) => {
    setForm({
      numero_camion: camion.numero_camion || '',
      marque: camion.marque || '',
      modele: camion.modele || '',
      immatriculation: camion.immatriculation || '',
      franchise: camion.franchise || '',
      statut: camion.statut || 'disponible',
      date_attribution: camion.date_attribution || '',
      kilometrage: camion.kilometrage || 0
    });
    setEditingId(camion.id);
    setShowForm(true);
  };

  // Suppression
  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce camion ?')) return;
    
    try {
      await apiClient.delete(`api/camions/${id}/`);
      setMessage('Camion supprimé avec succès');
      fetchCamions();
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  // Filtrage
  const filteredCamions = (camions || []).filter(camion => {
    if (!camion) return false;
    
    const matchesSearch = (
      (camion.numero_camion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (camion.immatriculation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (camion.marque || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (camion.modele || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesStatut = statutFilter === '' || camion.statut === statutFilter;
    return matchesSearch && matchesStatut;
  });

  // Reset form
  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  // Obtenir le nom du franchisé
  const getFranchiseName = (franchiseId) => {
    if (!franchiseId) return 'Non attribué';
    const franchise = franchises.find(f => f.id === franchiseId);
    return franchise ? franchise.nom_franchise : 'Franchisé inconnu';
  };

  // Obtenir le label du statut
  const getStatutLabel = (value) => {
    const option = STATUT_OPTIONS.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  return (
    <div className="admin-layout">
      <AdminNavigation />
      
      <main className="admin-main-content">
        <div className="gestion-camions">
          <div className="gestion-camions__container">
            
            {/* Header */}
            <div className="gestion-camions__header">
              <div className="gestion-camions__header-content">
                <div className="gestion-camions__title-section">
                  <h1 className="gestion-camions__title">
                    <Truck className="gestion-camions__title-icon" size={32} />
                    Gestion du Parc de Camions
                  </h1>
                  <p className="gestion-camions__subtitle">
                    Gérer les camions food truck attribués aux franchisés
                  </p>
                </div>
                <button 
                  className="gestion-camions__btn gestion-camions__btn--primary"
                  onClick={() => setShowForm(true)}
                >
                  <Plus size={20} />
                  Nouveau camion
                </button>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="gestion-camions__alert gestion-camions__alert--error">
                {error}
              </div>
            )}
            {message && (
              <div className="gestion-camions__alert gestion-camions__alert--success">
                {message}
              </div>
            )}

            {/* Filtres et recherche */}
            <div className="gestion-camions__filters">
              <div className="gestion-camions__search">
                <Search className="gestion-camions__search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par numéro, immatriculation, marque..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="gestion-camions__search-input"
                />
              </div>
              <div className="gestion-camions__filter">
                <Filter className="gestion-camions__filter-icon" size={20} />
                <select
                  value={statutFilter}
                  onChange={(e) => setStatutFilter(e.target.value)}
                  className="gestion-camions__filter-select"
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

            {/* Liste des camions */}
            <div className="gestion-camions__content">
              <div className="gestion-camions__list-section">
                <div className="gestion-camions__card">
                  <div className="gestion-camions__card-header">
                    <h3 className="gestion-camions__card-title">
                      Parc de camions ({filteredCamions.length})
                    </h3>
                  </div>
                  
                  {loading ? (
                    <div className="gestion-camions__loading">
                      <div className="gestion-camions__spinner"></div>
                      <p>Chargement des camions...</p>
                    </div>
                  ) : (
                    <div className="gestion-camions__table-container">
                      <table className="gestion-camions__table">
                        <thead>
                          <tr>
                            <th>N° Camion</th>
                            <th>Véhicule</th>
                            <th>Immatriculation</th>
                            <th>Franchisé</th>
                            <th>Statut</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCamions.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="gestion-camions__empty">
                                {(camions || []).length === 0 ? 'Aucun camion enregistré' : 'Aucun camion trouvé'}
                              </td>
                            </tr>
                          ) : (
                            filteredCamions.map((camion, i) => (
                              <tr key={camion.id} className="gestion-camions__table-row">
                                <td>
                                  <div className="gestion-camions__numero">
                                    <strong>{camion.numero_camion}</strong>
                                  </div>
                                </td>
                                <td>
                                  <div className="gestion-camions__vehicule">
                                    <span>{camion.marque || 'N/A'}</span>
                                    <span className="gestion-camions__modele">
                                      {camion.modele || 'N/A'}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <div className="gestion-camions__immat">
                                    {camion.immatriculation}
                                  </div>
                                </td>
                                <td>
                                  <div className="gestion-camions__franchise">
                                    {getFranchiseName(camion.franchise)}
                                  </div>
                                </td>
                                <td>
                                  <span className={`gestion-camions__badge gestion-camions__badge--${camion.statut}`}>
                                    {getStatutLabel(camion.statut)}
                                  </span>
                                </td>
                                <td>
                                  <div className="gestion-camions__actions">
                                    <button
                                      className="gestion-camions__action-btn gestion-camions__action-btn--edit"
                                      onClick={() => handleEdit(camion)}
                                      title="Modifier"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button
                                      className="gestion-camions__action-btn gestion-camions__action-btn--delete"
                                      onClick={() => handleDelete(camion.id)}
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
                <div className="gestion-camions__modal-overlay" onClick={resetForm}>
                  <div className="gestion-camions__modal" onClick={(e) => e.stopPropagation()}>
                    <div className="gestion-camions__modal-header">
                      <h3>{editingId ? 'Modifier' : 'Créer'} un camion</h3>
                      <button 
                        className="gestion-camions__modal-close"
                        onClick={resetForm}
                      >
                        ×
                      </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="gestion-camions__form">
                      <div className="gestion-camions__form-row">
                        <div className="gestion-camions__form-group">
                          <label htmlFor="numero_camion">N° Camion *</label>
                          <input
                            type="text"
                            id="numero_camion"
                            name="numero_camion"
                            value={form.numero_camion}
                            onChange={handleChange}
                            required
                            className="gestion-camions__input"
                            placeholder="Ex: DC-001"
                          />
                        </div>
                        <div className="gestion-camions__form-group">
                          <label htmlFor="immatriculation">Immatriculation *</label>
                          <input
                            type="text"
                            id="immatriculation"
                            name="immatriculation"
                            value={form.immatriculation}
                            onChange={handleChange}
                            required
                            className="gestion-camions__input"
                            placeholder="Ex: AA-123-BB"
                          />
                        </div>
                      </div>

                      <div className="gestion-camions__form-row">
                        <div className="gestion-camions__form-group">
                          <label htmlFor="marque">Marque</label>
                          <input
                            type="text"
                            id="marque"
                            name="marque"
                            value={form.marque}
                            onChange={handleChange}
                            className="gestion-camions__input"
                            placeholder="Ex: Renault"
                          />
                        </div>
                        <div className="gestion-camions__form-group">
                          <label htmlFor="modele">Modèle</label>
                          <input
                            type="text"
                            id="modele"
                            name="modele"
                            value={form.modele}
                            onChange={handleChange}
                            className="gestion-camions__input"
                            placeholder="Ex: Master"
                          />
                        </div>
                      </div>

                      <div className="gestion-camions__form-row">
                        <div className="gestion-camions__form-group">
                          <label htmlFor="statut">Statut *</label>
                          <select
                            id="statut"
                            name="statut"
                            value={form.statut}
                            onChange={handleChange}
                            required
                            className="gestion-camions__select"
                          >
                            {STATUT_OPTIONS.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="gestion-camions__form-group">
                          <label htmlFor="kilometrage">Kilométrage</label>
                          <input
                            type="number"
                            id="kilometrage"
                            name="kilometrage"
                            value={form.kilometrage}
                            onChange={handleChange}
                            min="0"
                            className="gestion-camions__input"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="gestion-camions__form-group">
                        <label htmlFor="franchise">Franchisé</label>
                        <select
                          id="franchise"
                          name="franchise"
                          value={form.franchise}
                          onChange={handleChange}
                          className="gestion-camions__select"
                        >
                          <option value="">Non attribué</option>
                          {franchises.map(franchise => (
                            <option key={franchise.id} value={franchise.id}>
                              {franchise.nom_franchise}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="gestion-camions__form-group">
                        <label htmlFor="date_attribution">Date d'attribution</label>
                        <input
                          type="date"
                          id="date_attribution"
                          name="date_attribution"
                          value={form.date_attribution}
                          onChange={handleChange}
                          className="gestion-camions__input"
                        />
                      </div>

                      <div className="gestion-camions__form-actions">
                        <button 
                          type="button" 
                          onClick={resetForm}
                          className="gestion-camions__btn gestion-camions__btn--secondary"
                        >
                          Annuler
                        </button>
                        <button 
                          type="submit" 
                          disabled={submitLoading}
                          className="gestion-camions__btn gestion-camions__btn--primary"
                        >
                          {submitLoading ? (
                            <>
                              <div className="gestion-camions__spinner gestion-camions__spinner--small"></div>
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