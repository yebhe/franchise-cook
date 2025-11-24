// components/admin/stocks/GestionStocks.jsx
import React, { useEffect, useState } from 'react';
import { 
  Boxes, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './GestionStocks.css';
import useAuthStore from '../../../../store/authStore';
import apiClient from '../../../../api/axiosConfig';
import AdminNavigation from '../../AdminNavigation';


const initialForm = {
  produit: '',
  entrepot: '',
  quantite_disponible: 0
};

export default function GestionStocks() {
  const [stocks, setStocks] = useState([]);
  const [produits, setProduits] = useState([]);
  const [entrepots, setEntrepots] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [entrepotFilter, setEntrepotFilter] = useState('');
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

  // Fonctions utilitaires
  const getProduitNom = (produitId) => {
    if (!produitId) return 'N/A';
    const produit = produits.find(p => p.id === produitId);
    return produit ? produit.nom_produit : 'Produit inconnu';
  };

  const getEntrepotNom = (entrepotId) => {
    if (!entrepotId) return 'N/A';
    const entrepot = entrepots.find(e => e.id === entrepotId);
    return entrepot ? entrepot.nom_entrepot : 'Entrepôt inconnu';
  };

  // Charger les données
  const fetchStocks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('api/stocks/');
      setStocks(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Erreur lors du chargement des stocks');
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProduits = async () => {
    try {
      const response = await apiClient.get('api/produits/');
      setProduits(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erreur lors du chargement des produits');
    }
  };

  const fetchEntrepots = async () => {
    try {
      const response = await apiClient.get('api/entrepots/');
      setEntrepots(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erreur lors du chargement des entrepôts');
    }
  };

  useEffect(() => {
    fetchStocks();
    fetchProduits();
    fetchEntrepots();
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
        quantite_disponible: parseInt(form.quantite_disponible) || 0
      };

      if (editingId) {
        await apiClient.put(`api/stocks/${editingId}/`, formData);
        setMessage('Stock modifié avec succès !');
      } else {
        await apiClient.post('api/stocks/', formData);
        setMessage('Stock créé avec succès !');
      }
      
      setForm(initialForm);
      setEditingId(null);
      setShowForm(false);
      fetchStocks();
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
  const handleEdit = (stock) => {
    setForm({
      produit: stock.produit || '',
      entrepot: stock.entrepot || '',
      quantite_disponible: stock.quantite_disponible || 0
    });
    setEditingId(stock.id);
    setShowForm(true);
  };

  // Suppression
  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce stock ?')) return;
    
    try {
      await apiClient.delete(`api/stocks/${id}/`);
      setMessage('Stock supprimé avec succès');
      fetchStocks();
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  // Filtrage
  const filteredStocks = (stocks || []).filter(stock => {
    if (!stock) return false;
    
    const matchesSearch = (
      (getProduitNom(stock.produit) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (getEntrepotNom(stock.entrepot) || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesEntrepot = entrepotFilter === '' || stock.entrepot === parseInt(entrepotFilter);
    return matchesSearch && matchesEntrepot;
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
        <div className="gestion-stocks">
          <div className="gestion-stocks__container">
            
            {/* Header */}
            <div className="gestion-stocks__header">
              <div className="gestion-stocks__header-content">
                <div className="gestion-stocks__title-section">
                  <h1 className="gestion-stocks__title">
                    <Boxes className="gestion-stocks__title-icon" size={32} />
                    Gestion des Stocks
                  </h1>
                  <p className="gestion-stocks__subtitle">
                    Gérer les stocks disponibles dans les 4 entrepôts d'Île-de-France
                  </p>
                </div>
                <button 
                  className="gestion-stocks__btn gestion-stocks__btn--primary"
                  onClick={() => setShowForm(true)}
                >
                  <Plus size={20} />
                  Nouveau stock
                </button>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="gestion-stocks__alert gestion-stocks__alert--error">
                {error}
              </div>
            )}
            {message && (
              <div className="gestion-stocks__alert gestion-stocks__alert--success">
                {message}
              </div>
            )}

            {/* Filtres et recherche */}
            <div className="gestion-stocks__filters">
              <div className="gestion-stocks__search">
                <Search className="gestion-stocks__search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par produit ou entrepôt..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="gestion-stocks__search-input"
                />
              </div>
              <div className="gestion-stocks__filter">
                <Filter className="gestion-stocks__filter-icon" size={20} />
                <select
                  value={entrepotFilter}
                  onChange={(e) => setEntrepotFilter(e.target.value)}
                  className="gestion-stocks__filter-select"
                >
                  <option value="">Tous les entrepôts</option>
                  {entrepots.map(entrepot => (
                    <option key={entrepot.id} value={entrepot.id}>
                      {entrepot.nom_entrepot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Liste des stocks */}
            <div className="gestion-stocks__content">
              <div className="gestion-stocks__list-section">
                <div className="gestion-stocks__card">
                  <div className="gestion-stocks__card-header">
                    <h3 className="gestion-stocks__card-title">
                      Stocks par entrepôt ({filteredStocks.length})
                    </h3>
                  </div>
                  
                  {loading ? (
                    <div className="gestion-stocks__loading">
                      <div className="gestion-stocks__spinner"></div>
                      <p>Chargement des stocks...</p>
                    </div>
                  ) : (
                    <div className="gestion-stocks__table-container">
                      <table className="gestion-stocks__table">
                        <thead>
                          <tr>
                            <th>Produit</th>
                            <th>Entrepôt</th>
                            <th>Quantité disponible</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStocks.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="gestion-stocks__empty">
                                {(stocks || []).length === 0 ? 'Aucun stock enregistré' : 'Aucun stock trouvé'}
                              </td>
                            </tr>
                          ) : (
                            filteredStocks.map((stock, i) => (
                              <tr key={stock.id} className="gestion-stocks__table-row">
                                <td>
                                  <div className="gestion-stocks__produit">
                                    <Package size={16} className="gestion-stocks__produit-icon" />
                                    <strong>{getProduitNom(stock.produit)}</strong>
                                  </div>
                                </td>
                                <td>
                                  <div className="gestion-stocks__entrepot">
                                    {getEntrepotNom(stock.entrepot)}
                                  </div>
                                </td>
                                <td>
                                  <div className="gestion-stocks__quantite">
                                    <span className={`quantite ${stock.quantite_disponible === 0 ? 'rupture' : ''}`}>
                                      {stock.quantite_disponible}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <div className="gestion-stocks__actions">
                                    <button
                                      className="gestion-stocks__action-btn gestion-stocks__action-btn--edit"
                                      onClick={() => handleEdit(stock)}
                                      title="Modifier"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button
                                      className="gestion-stocks__action-btn gestion-stocks__action-btn--delete"
                                      onClick={() => handleDelete(stock.id)}
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
                <div className="gestion-stocks__modal-overlay" onClick={resetForm}>
                  <div className="gestion-stocks__modal" onClick={(e) => e.stopPropagation()}>
                    <div className="gestion-stocks__modal-header">
                      <h3>{editingId ? 'Modifier' : 'Créer'} un stock</h3>
                      <button 
                        className="gestion-stocks__modal-close"
                        onClick={resetForm}
                      >
                        ×
                      </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="gestion-stocks__form">
                      <div className="gestion-stocks__form-row">
                        <div className="gestion-stocks__form-group">
                          <label htmlFor="produit">Produit *</label>
                          <select
                            id="produit"
                            name="produit"
                            value={form.produit}
                            onChange={handleChange}
                            required
                            className="gestion-stocks__select"
                          >
                            <option value="">Sélectionner un produit</option>
                            {produits.map(produit => (
                              <option key={produit.id} value={produit.id}>
                                {produit.nom_produit} ({produit.prix_unitaire}€/{produit.unite})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="gestion-stocks__form-group">
                          <label htmlFor="entrepot">Entrepôt *</label>
                          <select
                            id="entrepot"
                            name="entrepot"
                            value={form.entrepot}
                            onChange={handleChange}
                            required
                            className="gestion-stocks__select"
                          >
                            <option value="">Sélectionner un entrepôt</option>
                            {entrepots.map(entrepot => (
                              <option key={entrepot.id} value={entrepot.id}>
                                {entrepot.nom_entrepot} - {entrepot.ville}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="gestion-stocks__form-group">
                        <label htmlFor="quantite_disponible">Quantité disponible *</label>
                        <input
                          type="number"
                          id="quantite_disponible"
                          name="quantite_disponible"
                          value={form.quantite_disponible}
                          onChange={handleChange}
                          required
                          min="0"
                          className="gestion-stocks__input"
                          placeholder="0"
                        />
                      </div>

                      <div className="gestion-stocks__form-actions">
                        <button 
                          type="button" 
                          onClick={resetForm}
                          className="gestion-stocks__btn gestion-stocks__btn--secondary"
                        >
                          Annuler
                        </button>
                        <button 
                          type="submit" 
                          disabled={submitLoading}
                          className="gestion-stocks__btn gestion-stocks__btn--primary"
                        >
                          {submitLoading ? (
                            <>
                              <div className="gestion-stocks__spinner gestion-stocks__spinner--small"></div>
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