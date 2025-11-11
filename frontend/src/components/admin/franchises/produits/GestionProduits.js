// components/admin/produits/GestionProduits.jsx - VERSION FINALE 80/20
import React, { useEffect, useState } from 'react';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Warehouse,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './GestionProduits.css';
import useAuthStore from '../../../../store/authStore';
import apiClient from '../../../../api/axiosConfig';
import AdminNavigation from '../../AdminNavigation';

const initialForm = {
  nom_produit: '',
  categorie: '',
  prix_unitaire: '',
  unite: 'kg'
};

const UNITE_OPTIONS = [
  { value: 'kg', label: 'Kilogramme' },
  { value: 'litre', label: 'Litre' },
  { value: 'piece', label: 'Pièce' },
  { value: 'portion', label: 'Portion' }
];

export default function GestionProduits() {
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [entrepots, setEntrepots] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categorieFilter, setCategorieFilter] = useState('');
  const [entrepotFilter, setEntrepotFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduitId, setSelectedProduitId] = useState(null);

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
  const getCategorieNom = (categorieId) => {
    if (!categorieId) return 'N/A';
    const categorie = categories.find(c => c.id === categorieId);
    return categorie ? categorie.nom_categorie : 'Catégorie inconnue';
  };

  const getUniteLabel = (value) => {
    const option = UNITE_OPTIONS.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const getStocksProduit = (produitId) => {
    return stocks.filter(stock => stock.produit === produitId);
  };

  const getTotalStock = (produitId) => {
    const stocksProduit = getStocksProduit(produitId);
    return stocksProduit.reduce((total, stock) => total + stock.quantite_disponible, 0);
  };

  // Charger les données
  const fetchProduits = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('api/produits/');
      setProduits(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Erreur lors du chargement des produits');
      setProduits([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('api/categories/');
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erreur lors du chargement des catégories');
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

  const fetchStocks = async () => {
    try {
      const response = await apiClient.get('api/stocks/');
      setStocks(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erreur lors du chargement des stocks');
    }
  };

  useEffect(() => {
    fetchProduits();
    fetchCategories();
    fetchEntrepots();
    fetchStocks();
  }, []);

  // Gestion formulaire
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
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
        prix_unitaire: parseFloat(form.prix_unitaire)
      };

      if (editingId) {
        await apiClient.put(`api/produits/${editingId}/`, formData);
        setMessage('Produit modifié avec succès !');
      } else {
        await apiClient.post('api/produits/', formData);
        setMessage('Produit créé avec succès !');
      }
      
      setForm(initialForm);
      setEditingId(null);
      setShowForm(false);
      fetchProduits();
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
  const handleEdit = (produit) => {
    setForm({
      nom_produit: produit.nom_produit || '',
      categorie: produit.categorie || '',
      prix_unitaire: produit.prix_unitaire || '',
      unite: produit.unite || 'kg'
    });
    setEditingId(produit.id);
    setShowForm(true);
  };

  // Suppression
  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    
    try {
      await apiClient.delete(`api/produits/${id}/`);
      setMessage('Produit supprimé avec succès');
      fetchProduits();
      fetchStocks(); // Recharger les stocks aussi
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  // Voir les stocks d'un produit
  const handleViewStock = (produitId) => {
    setSelectedProduitId(produitId);
    setShowStockModal(true);
  };

  // Filtrage
  const filteredProduits = (produits || []).filter(produit => {
    if (!produit) return false;
    
    const matchesSearch = (
      (produit.nom_produit || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesCategorie = categorieFilter === '' || produit.categorie === parseInt(categorieFilter);
    
    // Filtrage par entrepôt (si un produit est disponible dans cet entrepôt)
    const matchesEntrepot = entrepotFilter === '' || 
      stocks.some(stock => 
        stock.produit === produit.id && 
        stock.entrepot === parseInt(entrepotFilter) && 
        stock.quantite_disponible > 0
      );
    
    return matchesSearch && matchesCategorie && matchesEntrepot;
  });

  // Reset form
  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  // Obtenir les entrepôts où un produit est disponible
  const getEntrepotsDisponibles = (produitId) => {
    const stocksProduit = getStocksProduit(produitId);
    return stocksProduit
      .filter(stock => stock.quantite_disponible > 0)
      .map(stock => {
        const entrepot = entrepots.find(e => e.id === stock.entrepot);
        return entrepot;
      })
      .filter(Boolean);
  };

  return (
    <div className="admin-layout">
      <AdminNavigation />
      
      <main className="admin-main-content">
        <div className="gestion-produits">
          <div className="gestion-produits__container">
            
            {/* Header */}
            <div className="gestion-produits__header">
              <div className="gestion-produits__header-content">
                <div className="gestion-produits__title-section">
                  <h1 className="gestion-produits__title">
                    <Package className="gestion-produits__title-icon" size={32} />
                    Gestion des Produits
                  </h1>
                  <p className="gestion-produits__subtitle">
                    Gérer les ingrédients, plats préparés et boissons disponibles dans tous les entrepôts
                  </p>
                </div>
                <button 
                  className="gestion-produits__btn gestion-produits__btn--primary"
                  onClick={() => setShowForm(true)}
                >
                  <Plus size={20} />
                  Nouveau produit
                </button>
              </div>
            </div>

            {/* Explication de la règle 80/20 */}
            <div className="gestion-produits__info-banner">
              <Info size={20} />
              <div>
                <strong>Règle 80/20 :</strong> Les franchisés doivent commander 80% minimum de leur montant total 
                dans les entrepôts Driv'n Cook, et maximum 20% chez les fournisseurs libres.
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="gestion-produits__alert gestion-produits__alert--error">
                {error}
              </div>
            )}
            {message && (
              <div className="gestion-produits__alert gestion-produits__alert--success">
                {message}
              </div>
            )}

            {/* Filtres et recherche */}
            <div className="gestion-produits__filters">
              <div className="gestion-produits__search">
                <Search className="gestion-produits__search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par nom de produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="gestion-produits__search-input"
                />
              </div>
              
              <div className="gestion-produits__filter">
                <Filter className="gestion-produits__filter-icon" size={20} />
                <select
                  value={categorieFilter}
                  onChange={(e) => setCategorieFilter(e.target.value)}
                  className="gestion-produits__filter-select"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map(categorie => (
                    <option key={categorie.id} value={categorie.id}>
                      {categorie.nom_categorie}
                    </option>
                  ))}
                </select>
              </div>

              <div className="gestion-produits__filter">
                <Warehouse className="gestion-produits__filter-icon" size={20} />
                <select
                  value={entrepotFilter}
                  onChange={(e) => setEntrepotFilter(e.target.value)}
                  className="gestion-produits__filter-select"
                >
                  <option value="">Tous les entrepôts</option>
                  {entrepots.map(entrepot => (
                    <option key={entrepot.id} value={entrepot.id}>
                      {entrepot.nom_entrepot} ({entrepot.type_entrepot === 'drivn_cook' ? 'Driv\'n Cook' : 'Fournisseur libre'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Liste des produits */}
            <div className="gestion-produits__content">
              <div className="gestion-produits__list-section">
                <div className="gestion-produits__card">
                  <div className="gestion-produits__card-header">
                    <h3 className="gestion-produits__card-title">
                      Catalogue produits ({filteredProduits.length})
                    </h3>
                  </div>
                  
                  {loading ? (
                    <div className="gestion-produits__loading">
                      <div className="gestion-produits__spinner"></div>
                      <p>Chargement des produits...</p>
                    </div>
                  ) : (
                    <div className="gestion-produits__table-container">
                      <table className="gestion-produits__table">
                        <thead>
                          <tr>
                            <th>Produit</th>
                            <th>Catégorie</th>
                            <th>Prix unitaire</th>
                            <th>Unité</th>
                            <th>Stock total</th>
                            <th>Entrepôts</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProduits.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="gestion-produits__empty">
                                {(produits || []).length === 0 ? 'Aucun produit enregistré' : 'Aucun produit trouvé'}
                              </td>
                            </tr>
                          ) : (
                            filteredProduits.map((produit) => {
                              const totalStock = getTotalStock(produit.id);
                              const entrepotsDisponibles = getEntrepotsDisponibles(produit.id);
                              
                              return (
                                <tr key={produit.id} className="gestion-produits__table-row">
                                  <td>
                                    <div className="gestion-produits__nom">
                                      <strong>{produit.nom_produit}</strong>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="gestion-produits__categorie">
                                      {getCategorieNom(produit.categorie)}
                                    </div>
                                  </td>
                                  <td>
                                    <div className="gestion-produits__prix">
                                      {produit.prix_unitaire}€
                                    </div>
                                  </td>
                                  <td>
                                    <div className="gestion-produits__unite">
                                      {getUniteLabel(produit.unite)}
                                    </div>
                                  </td>
                                  <td>
                                    <div className="gestion-produits__stock">
                                      <span className={`gestion-produits__stock-badge ${totalStock > 0 ? 'gestion-produits__stock-badge--available' : 'gestion-produits__stock-badge--empty'}`}>
                                        {totalStock}
                                      </span>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="gestion-produits__entrepots">
                                      {entrepotsDisponibles.length > 0 ? (
                                        <button
                                          className="gestion-produits__entrepots-btn"
                                          onClick={() => handleViewStock(produit.id)}
                                        >
                                          {entrepotsDisponibles.length} entrepôt{entrepotsDisponibles.length > 1 ? 's' : ''}
                                        </button>
                                      ) : (
                                        <span className="gestion-produits__no-stock">Aucun stock</span>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    <div className="gestion-produits__actions">
                                      <button
                                        className="gestion-produits__action-btn gestion-produits__action-btn--edit"
                                        onClick={() => handleEdit(produit)}
                                        title="Modifier"
                                      >
                                        <Edit size={16} />
                                      </button>
                                      <button
                                        className="gestion-produits__action-btn gestion-produits__action-btn--delete"
                                        onClick={() => handleDelete(produit.id)}
                                        title="Supprimer"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Formulaire modal */}
              {showForm && (
                <div className="gestion-produits__modal-overlay" onClick={resetForm}>
                  <div className="gestion-produits__modal" onClick={(e) => e.stopPropagation()}>
                    <div className="gestion-produits__modal-header">
                      <h3>{editingId ? 'Modifier' : 'Créer'} un produit</h3>
                      <button 
                        className="gestion-produits__modal-close"
                        onClick={resetForm}
                      >
                        ×
                      </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="gestion-produits__form">
                      <div className="gestion-produits__form-group">
                        <label htmlFor="nom_produit">Nom du produit *</label>
                        <input
                          type="text"
                          id="nom_produit"
                          name="nom_produit"
                          value={form.nom_produit}
                          onChange={handleChange}
                          required
                          className="gestion-produits__input"
                          placeholder="Ex: Tomates fraîches, Burger végétarien..."
                        />
                      </div>

                      <div className="gestion-produits__form-row">
                        <div className="gestion-produits__form-group">
                          <label htmlFor="categorie">Catégorie *</label>
                          <select
                            id="categorie"
                            name="categorie"
                            value={form.categorie}
                            onChange={handleChange}
                            required
                            className="gestion-produits__select"
                          >
                            <option value="">Sélectionner une catégorie</option>
                            {categories.map(categorie => (
                              <option key={categorie.id} value={categorie.id}>
                                {categorie.nom_categorie}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="gestion-produits__form-group">
                          <label htmlFor="unite">Unité *</label>
                          <select
                            id="unite"
                            name="unite"
                            value={form.unite}
                            onChange={handleChange}
                            required
                            className="gestion-produits__select"
                          >
                            {UNITE_OPTIONS.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="gestion-produits__form-group">
                        <label htmlFor="prix_unitaire">Prix unitaire (€) *</label>
                        <input
                          type="number"
                          id="prix_unitaire"
                          name="prix_unitaire"
                          value={form.prix_unitaire}
                          onChange={handleChange}
                          required
                          step="0.01"
                          min="0"
                          className="gestion-produits__input"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="gestion-produits__form-info">
                        <Info size={16} />
                        <small>
                          Ce produit sera disponible dans les entrepôts via la gestion des stocks. 
                          La règle 80/20 s'applique selon le type d'entrepôt où il est stocké.
                        </small>
                      </div>

                      <div className="gestion-produits__form-actions">
                        <button 
                          type="button" 
                          onClick={resetForm}
                          className="gestion-produits__btn gestion-produits__btn--secondary"
                        >
                          Annuler
                        </button>
                        <button 
                          type="submit" 
                          disabled={submitLoading}
                          className="gestion-produits__btn gestion-produits__btn--primary"
                        >
                          {submitLoading ? (
                            <>
                              <div className="gestion-produits__spinner gestion-produits__spinner--small"></div>
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

              {/* Modal des stocks */}
              {showStockModal && selectedProduitId && (
                <div className="gestion-produits__modal-overlay" onClick={() => setShowStockModal(false)}>
                  <div className="gestion-produits__modal" onClick={(e) => e.stopPropagation()}>
                    <div className="gestion-produits__modal-header">
                      <h3>Stocks du produit</h3>
                      <button 
                        className="gestion-produits__modal-close"
                        onClick={() => setShowStockModal(false)}
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="gestion-produits__stock-details">
                      {getStocksProduit(selectedProduitId).map(stock => {
                        const entrepot = entrepots.find(e => e.id === stock.entrepot);
                        return (
                          <div key={stock.id} className="gestion-produits__stock-item">
                            <div className="gestion-produits__stock-item-header">
                              <strong>{entrepot?.nom_entrepot}</strong>
                              <span className={`gestion-produits__entrepot-type ${entrepot?.type_entrepot === 'drivn_cook' ? 'gestion-produits__entrepot-type--drivn' : 'gestion-produits__entrepot-type--libre'}`}>
                                {entrepot?.type_entrepot === 'drivn_cook' ? 'Driv\'n Cook (80%)' : 'Fournisseur libre (20%)'}
                              </span>
                            </div>
                            <div className="gestion-produits__stock-quantities">
                              <span>Disponible: {stock.quantite_disponible}</span>
                              <span>Réservé: {stock.quantite_reservee}</span>
                              <span>Total: {stock.quantite_disponible + stock.quantite_reservee}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
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