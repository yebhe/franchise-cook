// components/admin/maintenance/GestionMaintenance.jsx
import React, { useEffect, useState } from 'react';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Euro,
  Calendar,
  Wrench
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';
import useAuthStore from '../../../store/authStore';
import './GestionMaintenance.css';
import AdminNavigation from '../AdminNavigation';

const initialForm = {
  camion: '',
  type_maintenance: 'revision',
  description: '',
  date_maintenance: '',
  cout: '',
  garage: '',
  statut: 'programme'
};

const TYPE_MAINTENANCE_OPTIONS = [
  { value: 'revision', label: 'Révision' },
  { value: 'reparation', label: 'Réparation' },
  { value: 'panne', label: 'Panne' },
  { value: 'controle_technique', label: 'Contrôle technique' }
];

const STATUT_OPTIONS = [
  { value: 'programme', label: 'Programmé' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'termine', label: 'Terminé' }
];

export default function GestionMaintenance() {
  const [maintenances, setMaintenances] = useState([]);
  const [camions, setCamions] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
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
  const fetchMaintenances = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('api/maintenances/');
      setMaintenances(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Erreur lors du chargement des maintenances');
      setMaintenances([]);
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

  useEffect(() => {
    fetchMaintenances();
    fetchCamions();
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
        cout: form.cout ? parseFloat(form.cout) : null
      };

      if (editingId) {
        await apiClient.put(`api/maintenances/${editingId}/`, formData);
        setMessage('Maintenance modifiée avec succès !');
      } else {
        await apiClient.post('api/maintenances/', formData);
        setMessage('Maintenance créée avec succès !');
      }
      
      setForm(initialForm);
      setEditingId(null);
      setShowForm(false);
      fetchMaintenances();
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
  const handleEdit = (maintenance) => {
    setForm({
      camion: maintenance.camion || '',
      type_maintenance: maintenance.type_maintenance || 'revision',
      description: maintenance.description || '',
      date_maintenance: maintenance.date_maintenance || '',
      cout: maintenance.cout || '',
      garage: maintenance.garage || '',
      statut: maintenance.statut || 'programme'
    });
    setEditingId(maintenance.id);
    setShowForm(true);
  };

  // Suppression
  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette maintenance ?')) return;
    
    try {
      await apiClient.delete(`api/maintenances/${id}/`);
      setMessage('Maintenance supprimée avec succès');
      fetchMaintenances();
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  // Filtrage
  const filteredMaintenances = (maintenances || []).filter(maintenance => {
    if (!maintenance) return false;
    
    const matchesSearch = (
      (maintenance.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (maintenance.garage || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (getCamionNumero(maintenance.camion) || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesType = typeFilter === '' || maintenance.type_maintenance === typeFilter;
    return matchesSearch && matchesType;
  });

  // Reset form
  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  // Obtenir le numéro du camion
  const getCamionNumero = (camionId) => {
    if (!camionId) return 'N/A';
    const camion = camions.find(c => c.id === camionId);
    return camion ? camion.numero_camion : 'Camion inconnu';
  };

  // Obtenir le label du type
  const getTypeLabel = (value) => {
    const option = TYPE_MAINTENANCE_OPTIONS.find(opt => opt.value === value);
    return option ? option.label : value;
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
        <div className="gestion-maintenance">
          <div className="gestion-maintenance__container">
            
            {/* Header */}
            <div className="gestion-maintenance__header">
              <div className="gestion-maintenance__header-content">
                <div className="gestion-maintenance__title-section">
                  <h1 className="gestion-maintenance__title">
                    <Settings className="gestion-maintenance__title-icon" size={32} />
                    Carnet d'Entretien
                  </h1>
                  <p className="gestion-maintenance__subtitle">
                    Gestion des pannes et du carnet d'entretien des camions
                  </p>
                </div>
                <button 
                  className="gestion-maintenance__btn gestion-maintenance__btn--primary"
                  onClick={() => setShowForm(true)}
                >
                  <Plus size={20} />
                  Nouvelle maintenance
                </button>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="gestion-maintenance__alert gestion-maintenance__alert--error">
                {error}
              </div>
            )}
            {message && (
              <div className="gestion-maintenance__alert gestion-maintenance__alert--success">
                {message}
              </div>
            )}

            {/* Filtres et recherche */}
            <div className="gestion-maintenance__filters">
              <div className="gestion-maintenance__search">
                <Search className="gestion-maintenance__search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par description, garage ou camion..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="gestion-maintenance__search-input"
                />
              </div>
              <div className="gestion-maintenance__filter">
                <Filter className="gestion-maintenance__filter-icon" size={20} />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="gestion-maintenance__filter-select"
                >
                  <option value="">Tous les types</option>
                  {TYPE_MAINTENANCE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Liste des maintenances */}
            <div className="gestion-maintenance__content">
              <div className="gestion-maintenance__list-section">
                <div className="gestion-maintenance__card">
                  <div className="gestion-maintenance__card-header">
                    <h3 className="gestion-maintenance__card-title">
                      Historique des maintenances ({filteredMaintenances.length})
                    </h3>
                  </div>
                  
                  {loading ? (
                    <div className="gestion-maintenance__loading">
                      <div className="gestion-maintenance__spinner"></div>
                      <p>Chargement des maintenances...</p>
                    </div>
                  ) : (
                    <div className="gestion-maintenance__table-container">
                      <table className="gestion-maintenance__table">
                        <thead>
                          <tr>
                            <th>Camion</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Date</th>
                            <th>Coût</th>
                            <th>Garage</th>
                            <th>Statut</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMaintenances.length === 0 ? (
                            <tr>
                              <td colSpan="8" className="gestion-maintenance__empty">
                                {(maintenances || []).length === 0 ? 'Aucune maintenance enregistrée' : 'Aucune maintenance trouvée'}
                              </td>
                            </tr>
                          ) : (
                            filteredMaintenances.map((maintenance, i) => (
                              <tr key={maintenance.id} className="gestion-maintenance__table-row">
                                <td>
                                  <div className="gestion-maintenance__camion">
                                    <strong>{getCamionNumero(maintenance.camion)}</strong>
                                  </div>
                                </td>
                                <td>
                                  <span className={`gestion-maintenance__badge gestion-maintenance__badge--${maintenance.type_maintenance}`}>
                                    {getTypeLabel(maintenance.type_maintenance)}
                                  </span>
                                </td>
                                <td>
                                  <div className="gestion-maintenance__description">
                                    {maintenance.description || 'N/A'}
                                  </div>
                                </td>
                                <td>
                                  <div className="gestion-maintenance__date">
                                    {maintenance.date_maintenance ? 
                                      new Date(maintenance.date_maintenance).toLocaleDateString('fr-FR') : 
                                      'N/A'
                                    }
                                  </div>
                                </td>
                                <td>
                                  <div className="gestion-maintenance__cout">
                                    {maintenance.cout ? 
                                      `${maintenance.cout}€` : 
                                      'N/A'
                                    }
                                  </div>
                                </td>
                                <td>
                                  <div className="gestion-maintenance__garage">
                                    {maintenance.garage || 'N/A'}
                                  </div>
                                </td>
                                <td>
                                  <span className={`gestion-maintenance__badge gestion-maintenance__badge--${maintenance.statut}`}>
                                    {getStatutLabel(maintenance.statut)}
                                  </span>
                                </td>
                                <td>
                                  <div className="gestion-maintenance__actions">
                                    <button
                                      className="gestion-maintenance__action-btn gestion-maintenance__action-btn--edit"
                                      onClick={() => handleEdit(maintenance)}
                                      title="Modifier"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button
                                      className="gestion-maintenance__action-btn gestion-maintenance__action-btn--delete"
                                      onClick={() => handleDelete(maintenance.id)}
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
                <div className="gestion-maintenance__modal-overlay" onClick={resetForm}>
                  <div className="gestion-maintenance__modal" onClick={(e) => e.stopPropagation()}>
                    <div className="gestion-maintenance__modal-header">
                      <h3>{editingId ? 'Modifier' : 'Créer'} une maintenance</h3>
                      <button 
                        className="gestion-maintenance__modal-close"
                        onClick={resetForm}
                      >
                        ×
                      </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="gestion-maintenance__form">
                      <div className="gestion-maintenance__form-row">
                        <div className="gestion-maintenance__form-group">
                          <label htmlFor="camion">Camion *</label>
                          <select
                            id="camion"
                            name="camion"
                            value={form.camion}
                            onChange={handleChange}
                            required
                            className="gestion-maintenance__select"
                          >
                            <option value="">Sélectionner un camion</option>
                            {camions.map(camion => (
                              <option key={camion.id} value={camion.id}>
                                {camion.numero_camion} - {camion.immatriculation}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="gestion-maintenance__form-group">
                          <label htmlFor="type_maintenance">Type *</label>
                          <select
                            id="type_maintenance"
                            name="type_maintenance"
                            value={form.type_maintenance}
                            onChange={handleChange}
                            required
                            className="gestion-maintenance__select"
                          >
                            {TYPE_MAINTENANCE_OPTIONS.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="gestion-maintenance__form-group">
                        <label htmlFor="description">Description *</label>
                        <textarea
                          id="description"
                          name="description"
                          value={form.description}
                          onChange={handleChange}
                          required
                          rows="3"
                          className="gestion-maintenance__textarea"
                          placeholder="Décrire l'intervention..."
                        />
                      </div>

                      <div className="gestion-maintenance__form-row">
                        <div className="gestion-maintenance__form-group">
                          <label htmlFor="date_maintenance">Date *</label>
                          <input
                            type="date"
                            id="date_maintenance"
                            name="date_maintenance"
                            value={form.date_maintenance}
                            onChange={handleChange}
                            required
                            className="gestion-maintenance__input"
                          />
                        </div>
                        <div className="gestion-maintenance__form-group">
                          <label htmlFor="statut">Statut *</label>
                          <select
                            id="statut"
                            name="statut"
                            value={form.statut}
                            onChange={handleChange}
                            required
                            className="gestion-maintenance__select"
                          >
                            {STATUT_OPTIONS.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="gestion-maintenance__form-row">
                        <div className="gestion-maintenance__form-group">
                          <label htmlFor="cout">Coût (€)</label>
                          <input
                            type="number"
                            id="cout"
                            name="cout"
                            value={form.cout}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className="gestion-maintenance__input"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="gestion-maintenance__form-group">
                          <label htmlFor="garage">Garage</label>
                          <input
                            type="text"
                            id="garage"
                            name="garage"
                            value={form.garage}
                            onChange={handleChange}
                            className="gestion-maintenance__input"
                            placeholder="Nom du garage"
                          />
                        </div>
                      </div>

                      <div className="gestion-maintenance__form-actions">
                        <button 
                          type="button" 
                          onClick={resetForm}
                          className="gestion-maintenance__btn gestion-maintenance__btn--secondary"
                        >
                          Annuler
                        </button>
                        <button 
                          type="submit" 
                          disabled={submitLoading}
                          className="gestion-maintenance__btn gestion-maintenance__btn--primary"
                        >
                          {submitLoading ? (
                            <>
                              <div className="gestion-maintenance__spinner gestion-maintenance__spinner--small"></div>
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