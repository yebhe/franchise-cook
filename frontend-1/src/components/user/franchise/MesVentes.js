import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader,
  RefreshCw,
  X,
  AlertTriangle,
  Calendar,
  BarChart3,
  Download,

} from 'lucide-react';
import './MesVentes.css';
import useAuthStore from '../../../store/authStore';
import apiClient from '../../../api/axiosConfig';
import FranchiseNavigation from './FranchiseNavigation';

const MesVentes = () => {
  const [ventes, setVentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [statsData, setStatsData] = useState([]);
  const [stats, setStats] = useState({
    total_ca: 0,
    total_redevance: 0,
    moyenne_quotidienne: 0,
    jours_activite: 0
  });
 

  const [form, setForm] = useState({
    date_vente: '',
    chiffre_affaires_jour: '',
    nombre_transactions: ''
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

  const formatNumber = (number) => {
    return new Intl.NumberFormat('fr-FR').format(number || 0);
  };

  const calculerStats = (ventesData) => {
    if (!ventesData || ventesData.length === 0) {
      return {
        total_ca: 0,
        total_redevance: 0,
        moyenne_quotidienne: 0,
        jours_activite: 0
      };
    }

    const total_ca = ventesData.reduce((sum, vente) => sum + (vente.chiffre_affaires_jour || 0), 0);
    const total_redevance = ventesData.reduce((sum, vente) => sum + (vente.redevance_due || 0), 0);
    const jours_activite = ventesData.length;
    const moyenne_quotidienne = jours_activite > 0 ? total_ca / jours_activite : 0;

    return {
      total_ca,
      total_redevance,
      moyenne_quotidienne,
      jours_activite
    };
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

  const fetchStatsData = async () => {
    try {
      setError(null);
      const response = await apiClient.get('/api_user/dashboard/stats/');
      setStatsData(response.data);
      console.log('Stats:', stats);
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
      console.error('Erreur API:', err);
    } finally {
      setLoading(false);
    }
  };
  // ===== FONCTIONS DE CHARGEMENT DES DONNÉES =====
  const fetchVentes = async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.date_debut) queryParams.append('date_debut', params.date_debut);
      if (params.date_fin) queryParams.append('date_fin', params.date_fin);
      
      const url = `/api_user/ventes/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiClient.get(url);
      const ventesData = Array.isArray(response.data) ? response.data : [];
      
      setVentes(ventesData);
      setStats(calculerStats(ventesData));
    } catch (err) {
      console.error('Erreur lors du chargement des ventes:', err);
      setVentes([]);
      setStats(calculerStats([]));
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger les ventes des 30 derniers jours par défaut
      const date30jours = new Date();
      date30jours.setDate(date30jours.getDate() - 30);
      
      await fetchVentes({
        date_debut: date30jours.toISOString().split('T')[0]
      });
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
      fetchStatsData();
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

    if (!form.date_vente) {
      errors.date_vente = 'La date de vente est obligatoire';
    } else {
      const dateVente = new Date(form.date_vente);
      const today = new Date();
      
      if (dateVente > today) {
        errors.date_vente = 'La date de vente ne peut pas être dans le futur';
      }
    }

    if (!form.chiffre_affaires_jour) {
      errors.chiffre_affaires_jour = 'Le chiffre d\'affaires est obligatoire';
    } else if (parseFloat(form.chiffre_affaires_jour) < 0) {
      errors.chiffre_affaires_jour = 'Le chiffre d\'affaires doit être positif';
    }

    if (!form.nombre_transactions) {
      errors.nombre_transactions = 'Le nombre de transactions est obligatoire';
    } else if (parseInt(form.nombre_transactions) < 0) {
      errors.nombre_transactions = 'Le nombre de transactions doit être positif';
    }

    // Vérifier si une vente existe déjà pour cette date (sauf en modification)
    const venteExistante = ventes.find(vente => {
      if (editingId && vente.id === editingId) return false;
      return vente.date_vente === form.date_vente;
    });

    if (venteExistante) {
      errors.date_vente = 'Une vente existe déjà pour cette date';
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

    setSubmitLoading(true);
    setError(null);

    try {
      const venteData = {
        ...form,
        chiffre_affaires_jour: parseFloat(form.chiffre_affaires_jour),
        nombre_transactions: parseInt(form.nombre_transactions)
      };

      if (editingId) {
        await apiClient.put(`/api_user/ventes/${editingId}/`, venteData);
        setMessage('Vente modifiée avec succès !');
      } else {
        await apiClient.post('/api_user/ventes/', venteData);
        setMessage('Vente enregistrée avec succès !');
      }
      
      resetForm();
      fetchVentes();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'opération');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (vente) => {
    setForm({
      date_vente: vente.date_vente || '',
      chiffre_affaires_jour: vente.chiffre_affaires_jour?.toString() || '',
      nombre_transactions: vente.nombre_transactions?.toString() || ''
    });
    setEditingId(vente.id);
    setValidationErrors({});
    setShowForm(true);
  };

  const handleDelete = async (venteId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette vente ?')) return;
    
    try {
      await apiClient.delete(`/api_user/ventes/${venteId}/`);
      setMessage('Vente supprimée avec succès');
      fetchVentes();
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setForm({
      date_vente: '',
      chiffre_affaires_jour: '',
      nombre_transactions: ''
    });
    setEditingId(null);
    setValidationErrors({});
    setShowForm(false);
  };

  // ===== GESTION DES FILTRES =====
  const handleDateFilter = (e) => {
    const selectedDate = e.target.value;
    setDateFilter(selectedDate);
    
    if (selectedDate) {
      // Filtrer par mois
      const [year, month] = selectedDate.split('-');
      const dateDebut = new Date(year, month - 1, 1);
      const dateFin = new Date(year, month, 0);
      
      fetchVentes({
        date_debut: dateDebut.toISOString().split('T')[0],
        date_fin: dateFin.toISOString().split('T')[0]
      });
    } else {
      fetchVentes();
    }
  };

  // ===== FILTRAGE DES VENTES =====
  const ventesFiltrees = ventes.filter(vente => {
    const matchSearch = 
      vente.date_vente.includes(searchTerm) ||
      vente.chiffre_affaires_jour.toString().includes(searchTerm) ||
      vente.nombre_transactions.toString().includes(searchTerm);
    
    return matchSearch;
  });

  // ===== GÉNÉRATION DE RAPPORT =====
  const genererRapport = async () => {
    try {
      if (!dateFilter) {
        setError('Veuillez sélectionner un mois pour générer le rapport');
        return;
      }

      // Demander le PDF au serveur
      const response = await apiClient.get(`/api_user/rapports/ventes/?mois=${dateFilter}`, {
        responseType: 'blob', // Important pour recevoir le PDF
      });
      
      // Créer un blob à partir de la réponse
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Créer une URL pour le blob
      const url = window.URL.createObjectURL(blob);
      
      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-ventes-${dateFilter}.pdf`;
      
      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setMessage('Rapport PDF généré avec succès !');
    } catch (err) {
      console.error('Erreur lors de la génération du rapport:', err);
      setError('Erreur lors de la génération du rapport PDF');
    }
  };

  // ===== RENDU CONDITIONNEL - LOADING =====
  if (loading) {
    return (
      <div className="franchise-layout">
        <FranchiseNavigation />
        <main className="franchise-main-content">
          <div className="mes-ventes__loading">
            <Loader className="mes-ventes__spinner" size={32} />
            <p>Chargement des ventes...</p>
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
        <div className="mes-ventes">
          <div className="mes-ventes__container">
            
            {/* Header */}
            <div className="mes-ventes__header">
              <div className="mes-ventes__header-content">
                <div className="mes-ventes__title-section">
                  <h1 className="mes-ventes__title">
                    <DollarSign className="mes-ventes__title-icon" size={32} />
                    Mes Ventes
                  </h1>
                  <p className="mes-ventes__subtitle">
                    Suivez et gérez vos performances commerciales
                  </p>
                </div>
                <div className="mes-ventes__header-actions">
                  <button
                    onClick={fetchAllData}
                    className="mes-ventes__btn mes-ventes__btn--secondary"
                    disabled={loading}
                  >
                    <RefreshCw size={20} className={loading ? 'mes-ventes__icon--spinning' : ''} />
                    Actualiser
                  </button>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mes-ventes__btn mes-ventes__btn--primary"
                  >
                    <Plus size={20} />
                    Nouvelle vente
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="mes-ventes__alert mes-ventes__alert--error">
                {error}
              </div>
            )}
            {message && (
              <div className="mes-ventes__alert mes-ventes__alert--success">
                {message}
              </div>
            )}

            {/* Statistiques */}
            <div className="mes-ventes__stats">
              <div className="mes-ventes__stat-card">
                <div className="mes-ventes__stat-icon mes-ventes__stat-icon--primary">
                  <DollarSign size={24} />
                </div>
                <div className="mes-ventes__stat-content">
                  <h3 className="mes-ventes__stat-value">{formatCurrency(statsData.ventes_30j?.chiffre_affaires)}</h3>
                  <p className="mes-ventes__stat-label">Chiffre d'affaires total</p>
                </div>
              </div>
              
              <div className="mes-ventes__stat-card">
                <div className="mes-ventes__stat-icon mes-ventes__stat-icon--success">
                  <TrendingUp size={24} />
                </div>
                <div className="mes-ventes__stat-content">
                  <h3 className="mes-ventes__stat-value">{formatCurrency(statsData.commandes_en_cours)}</h3>
                  <p className="mes-ventes__stat-label">Commande en cours</p>
                </div>
              </div>
              
              <div className="mes-ventes__stat-card">
                <div className="mes-ventes__stat-icon mes-ventes__stat-icon--warning">
                  <BarChart3 size={24} />
                </div>
                <div className="mes-ventes__stat-content">
                  <h3 className="mes-ventes__stat-value">{formatCurrency(statsData.ventes_30j?.redevance_due)}</h3>
                  <p className="mes-ventes__stat-label">Redevances dues (4%)</p>
                </div>
              </div>
              
              <div className="mes-ventes__stat-card">
                <div className="mes-ventes__stat-icon mes-ventes__stat-icon--info">
                  <Calendar size={24} />
                </div>
                <div className="mes-ventes__stat-content">
                  <h3 className="mes-ventes__stat-value">{formatNumber(stats.jours_activite)}</h3>
                  <p className="mes-ventes__stat-label">Jours d'activité</p>
                </div>
              </div>
            </div>

            {/* Filtres et recherche */}
            <div className="mes-ventes__filters">
              <div className="mes-ventes__search">
                <Search className="mes-ventes__search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par date, montant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mes-ventes__search-input"
                />
              </div>
              <div className="mes-ventes__date-filter">
                <Calendar className="mes-ventes__filter-icon" size={20} />
                <input
                  type="month"
                  value={dateFilter}
                  onChange={handleDateFilter}
                  className="mes-ventes__filter-input"
                />
              </div>
              <button
                onClick={genererRapport}
                className="mes-ventes__btn mes-ventes__btn--secondary"
                disabled={!dateFilter}
              >
                <Download size={20} />
                Rapport mensuel
              </button>
            </div>

            {/* Liste des ventes */}
            <div className="mes-ventes__content">
              {ventesFiltrees.length === 0 ? (
                <div className="mes-ventes__empty">
                  <DollarSign size={48} className="mes-ventes__empty-icon" />
                  <h3 className="mes-ventes__empty-title">
                    {ventes.length === 0 ? 'Aucune vente enregistrée' : 'Aucune vente trouvée'}
                  </h3>
                  <p className="mes-ventes__empty-text">
                    {ventes.length === 0 
                      ? 'Commencez par enregistrer vos premières ventes.'
                      : 'Essayez de modifier vos critères de recherche.'
                    }
                  </p>
                  {ventes.length === 0 && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="mes-ventes__btn mes-ventes__btn--primary"
                    >
                      <Plus size={20} />
                      Enregistrer ma première vente
                    </button>
                  )}
                </div>
              ) : (
                <div className="mes-ventes__list">
                  {ventesFiltrees.map((vente) => (
                    <div key={vente.id} className="mes-ventes__card">
                      {/* Header de la carte */}
                      <div className="mes-ventes__card-header">
                        <div className="mes-ventes__card-info">
                          <div className="mes-ventes__card-title">
                            <Calendar size={18} className="mes-ventes__card-icon" />
                            {formatDate(vente.date_vente)}
                          </div>
                          <div className="mes-ventes__card-subtitle">
                            {vente.nombre_transactions} transaction(s)
                          </div>
                        </div>
                        <div className="mes-ventes__card-amount">
                          {formatCurrency(vente.chiffre_affaires_jour)}
                        </div>
                      </div>

                      {/* Contenu de la carte */}
                      <div className="mes-ventes__card-content">
                        <div className="mes-ventes__info-grid">
                          <div className="mes-ventes__info-item">
                            <span className="mes-ventes__info-label">Chiffre d'affaires</span>
                            <span className="mes-ventes__info-value mes-ventes__info-value--amount">
                              {formatCurrency(vente.chiffre_affaires_jour)}
                            </span>
                          </div>
                          <div className="mes-ventes__info-item">
                            <span className="mes-ventes__info-label">Redevance due (4%)</span>
                            <span className="mes-ventes__info-value mes-ventes__info-value--redevance">
                              {formatCurrency(vente.redevance_due)}
                            </span>
                          </div>
                          <div className="mes-ventes__info-item">
                            <span className="mes-ventes__info-label">Transactions</span>
                            <span className="mes-ventes__info-value">
                              {formatNumber(vente.nombre_transactions)}
                            </span>
                          </div>
                          <div className="mes-ventes__info-item">
                            <span className="mes-ventes__info-label">Panier moyen</span>
                            <span className="mes-ventes__info-value">
                              {vente.nombre_transactions > 0 
                                ? formatCurrency(vente.chiffre_affaires_jour / vente.nombre_transactions)
                                : formatCurrency(0)
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions de la carte */}
                      <div className="mes-ventes__card-actions">
                        <button
                          onClick={() => handleEdit(vente)}
                          className="mes-ventes__action-btn mes-ventes__action-btn--edit"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(vente.id)}
                          className="mes-ventes__action-btn mes-ventes__action-btn--delete"
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
              <div className="mes-ventes__modal-overlay" onClick={resetForm}>
                <div className="mes-ventes__modal" onClick={(e) => e.stopPropagation()}>
                  <div className="mes-ventes__modal-header">
                    <h3>{editingId ? 'Modifier la vente' : 'Nouvelle vente'}</h3>
                    <button 
                      className="mes-ventes__modal-close"
                      onClick={resetForm}
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <form className="mes-ventes__form" onSubmit={handleSubmit}>
                    <div className="mes-ventes__form-row">
                      <div className="mes-ventes__form-group">
                        <label htmlFor="date_vente" className={validationErrors.date_vente ? 'mes-ventes__label--error' : ''}>
                          Date de vente * 
                          {validationErrors.date_vente && (
                            <AlertTriangle size={14} className="mes-ventes__error-icon" />
                          )}
                        </label>
                        <input
                          type="date"
                          id="date_vente"
                          name="date_vente"
                          value={form.date_vente}
                          onChange={handleChange}
                          required
                          max={new Date().toISOString().split('T')[0]}
                          className={`mes-ventes__input ${validationErrors.date_vente ? 'mes-ventes__input--error' : ''}`}
                        />
                        {validationErrors.date_vente && (
                          <span className="mes-ventes__error-text">{validationErrors.date_vente}</span>
                        )}
                      </div>
                      
                      <div className="mes-ventes__form-group">
                        <label htmlFor="chiffre_affaires_jour" className={validationErrors.chiffre_affaires_jour ? 'mes-ventes__label--error' : ''}>
                          Chiffre d'affaires (€) *
                          {validationErrors.chiffre_affaires_jour && (
                            <AlertTriangle size={14} className="mes-ventes__error-icon" />
                          )}
                        </label>
                        <input
                          type="number"
                          id="chiffre_affaires_jour"
                          name="chiffre_affaires_jour"
                          value={form.chiffre_affaires_jour}
                          onChange={handleChange}
                          required
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className={`mes-ventes__input ${validationErrors.chiffre_affaires_jour ? 'mes-ventes__input--error' : ''}`}
                        />
                        {validationErrors.chiffre_affaires_jour && (
                          <span className="mes-ventes__error-text">{validationErrors.chiffre_affaires_jour}</span>
                        )}
                      </div>
                    </div>

                    <div className="mes-ventes__form-row">
                      <div className="mes-ventes__form-group">
                        <label htmlFor="nombre_transactions" className={validationErrors.nombre_transactions ? 'mes-ventes__label--error' : ''}>
                          Nombre de transactions *
                          {validationErrors.nombre_transactions && (
                            <AlertTriangle size={14} className="mes-ventes__error-icon" />
                          )}
                        </label>
                        <input
                          type="number"
                          id="nombre_transactions"
                          name="nombre_transactions"
                          value={form.nombre_transactions}
                          onChange={handleChange}
                          required
                          min="0"
                          placeholder="0"
                          className={`mes-ventes__input ${validationErrors.nombre_transactions ? 'mes-ventes__input--error' : ''}`}
                        />
                        {validationErrors.nombre_transactions && (
                          <span className="mes-ventes__error-text">{validationErrors.nombre_transactions}</span>
                        )}
                      </div>
                      
                      <div className="mes-ventes__form-group">
                        <label>Redevance calculée (4%)</label>
                        <div className="mes-ventes__calculated-field">
                          {form.chiffre_affaires_jour 
                            ? formatCurrency(parseFloat(form.chiffre_affaires_jour) * 0.04)
                            : formatCurrency(0)
                          }
                        </div>
                      </div>
                    </div>

                    {form.chiffre_affaires_jour && form.nombre_transactions && (
                      <div className="mes-ventes__form-summary">
                        <div className="mes-ventes__summary-item">
                          <span>Panier moyen :</span>
                          <span>{formatCurrency(parseFloat(form.chiffre_affaires_jour) / parseInt(form.nombre_transactions))}</span>
                        </div>
                      </div>
                    )}

                    <div className="mes-ventes__form-actions">
                      <button 
                        type="button" 
                        onClick={resetForm}
                        className="mes-ventes__btn mes-ventes__btn--secondary"
                      >
                        Annuler
                      </button>
                      <button 
                        type="submit" 
                        disabled={submitLoading}
                        className="mes-ventes__btn mes-ventes__btn--primary"
                      >
                        {submitLoading ? (
                          <>
                            <Loader size={16} className="mes-ventes__icon--spinning" />
                            {editingId ? 'Modification...' : 'Enregistrement...'}
                          </>
                        ) : (
                          <>
                            {editingId ? <Edit size={16} /> : <Plus size={16} />}
                            {editingId ? 'Modifier' : 'Enregistrer la vente'}
                          </>
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
};

export default MesVentes;