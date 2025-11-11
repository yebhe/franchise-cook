import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Warehouse,
  Search,
  Filter,
  Loader,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Eye,
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './MesStocks.css';
import useAuthStore from '../../../store/authStore';
import apiClient from '../../../api/axiosConfig';
import FranchiseNavigation from './FranchiseNavigation';

const MesStocks = () => {
  const [stocks, setStocks] = useState([]);
  const [entrepots, setEntrepots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [entrepotFilter, setEntrepotFilter] = useState('');
  const [alerteFilter, setAlerteFilter] = useState('tous');

  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // ===== FONCTIONS UTILITAIRES =====
  const getStockStatus = (stock) => {
    if (stock.quantite_disponible === 0) {
      return { status: 'rupture', color: 'mes-stocks__status--rupture', text: 'Rupture de stock' };
    }
    if (stock.quantite_disponible <= stock.alerte_stock) {
      return { status: 'alerte', color: 'mes-stocks__status--alerte', text: 'Stock faible' };
    }
    return { status: 'normal', color: 'mes-stocks__status--normal', text: 'Stock normal' };
  };

  const getStockIcon = (status) => {
    switch (status) {
      case 'rupture': return <XCircle size={16} />;
      case 'alerte': return <AlertTriangle size={16} />;
      case 'normal': return <CheckCircle size={16} />;
      default: return <Package size={16} />;
    }
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('fr-FR').format(number || 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // ===== FONCTIONS DE CHARGEMENT DES DONNÉES =====
  const fetchStocks = async (entrepotId = null) => {
    try {
      const params = entrepotId ? `?entrepot=${entrepotId}` : '';
      const response = await apiClient.get(`/api_user/stocks/${params}`);
      setStocks(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erreur lors du chargement des stocks:', err);
      setStocks([]);
    }
  };

  const fetchEntrepots = async () => {
    try {
      const response = await apiClient.get('/api_user/entrepots/');
      setEntrepots(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erreur lors du chargement des entrepôts:', err);
      setEntrepots([]);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchStocks(),
        fetchEntrepots()
      ]);
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
    }
  }, [isAuthenticated]);

  // ===== GESTION DES FILTRES =====
  const handleEntrepotFilter = (e) => {
    const entrepotId = e.target.value;
    setEntrepotFilter(entrepotId);
    fetchStocks(entrepotId || null);
  };

  // ===== FILTRAGE DES STOCKS =====
  const stocksFiltres = stocks.filter(stock => {
    const stockStatus = getStockStatus(stock);
    
    const matchSearch = 
      stock.produit_detail?.nom_produit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.entrepot_detail?.nom_entrepot.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.entrepot_detail?.ville.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchAlerte = alerteFilter === 'tous' || 
      (alerteFilter === 'alerte' && stockStatus.status === 'alerte') ||
      (alerteFilter === 'rupture' && stockStatus.status === 'rupture') ||
      (alerteFilter === 'normal' && stockStatus.status === 'normal');
    
    return matchSearch && matchAlerte;
  });

  // ===== STATISTIQUES =====
  const stats = {
    total_produits: stocks.length,
    stock_normal: stocks.filter(s => getStockStatus(s).status === 'normal').length,
    stock_alerte: stocks.filter(s => getStockStatus(s).status === 'alerte').length,
    stock_rupture: stocks.filter(s => getStockStatus(s).status === 'rupture').length
  };

  // ===== NAVIGATION VERS COMMANDE =====
  const commanderProduit = (stock) => {
    navigate('/commandes', {
      state: { 
        selectedEntrepot: stock.entrepot_detail,
        selectedProduit: stock.produit_detail
      }
    });
  };

  // ===== RENDU CONDITIONNEL - LOADING =====
  if (loading) {
    return (
      <div className="franchise-layout">
        <FranchiseNavigation />
        <main className="franchise-main-content">
          <div className="mes-stocks__loading">
            <Loader className="mes-stocks__spinner" size={32} />
            <p>Chargement des stocks...</p>
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
        <div className="mes-stocks">
          <div className="mes-stocks__container">
            
            {/* Header */}
            <div className="mes-stocks__header">
              <div className="mes-stocks__header-content">
                <div className="mes-stocks__title-section">
                  <h1 className="mes-stocks__title">
                    <Package className="mes-stocks__title-icon" size={32} />
                    Consultation des Stocks
                  </h1>
                  <p className="mes-stocks__subtitle">
                    Consultez la disponibilité des produits dans les entrepôts
                  </p>
                </div>
                <div className="mes-stocks__header-actions">
                  <button
                    onClick={fetchAllData}
                    className="mes-stocks__btn mes-stocks__btn--secondary"
                    disabled={loading}
                  >
                    <RefreshCw size={20} className={loading ? 'mes-stocks__icon--spinning' : ''} />
                    Actualiser
                  </button>
                  <button
                    onClick={() => navigate('/franchise/commandes')}
                    className="mes-stocks__btn mes-stocks__btn--primary"
                  >
                    <ShoppingCart size={20} />
                    Passer commande
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="mes-stocks__alert mes-stocks__alert--error">
                {error}
              </div>
            )}

            {/* Statistiques */}
            <div className="mes-stocks__stats">
              <div className="mes-stocks__stat-card">
                <div className="mes-stocks__stat-icon mes-stocks__stat-icon--primary">
                  <Package size={24} />
                </div>
                <div className="mes-stocks__stat-content">
                  <h3 className="mes-stocks__stat-value">{formatNumber(stats.total_produits)}</h3>
                  <p className="mes-stocks__stat-label">Produits disponibles</p>
                </div>
              </div>
              
              <div className="mes-stocks__stat-card">
                <div className="mes-stocks__stat-icon mes-stocks__stat-icon--success">
                  <CheckCircle size={24} />
                </div>
                <div className="mes-stocks__stat-content">
                  <h3 className="mes-stocks__stat-value">{formatNumber(stats.stock_normal)}</h3>
                  <p className="mes-stocks__stat-label">Stock normal</p>
                </div>
              </div>
              
              <div className="mes-stocks__stat-card">
                <div className="mes-stocks__stat-icon mes-stocks__stat-icon--warning">
                  <AlertTriangle size={24} />
                </div>
                <div className="mes-stocks__stat-content">
                  <h3 className="mes-stocks__stat-value">{formatNumber(stats.stock_alerte)}</h3>
                  <p className="mes-stocks__stat-label">Stock faible</p>
                </div>
              </div>
              
              <div className="mes-stocks__stat-card">
                <div className="mes-stocks__stat-icon mes-stocks__stat-icon--error">
                  <XCircle size={24} />
                </div>
                <div className="mes-stocks__stat-content">
                  <h3 className="mes-stocks__stat-value">{formatNumber(stats.stock_rupture)}</h3>
                  <p className="mes-stocks__stat-label">Rupture de stock</p>
                </div>
              </div>
            </div>

            {/* Filtres et recherche */}
            <div className="mes-stocks__filters">
              <div className="mes-stocks__search">
                <Search className="mes-stocks__search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par produit, entrepôt..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mes-stocks__search-input"
                />
              </div>
              
              <div className="mes-stocks__filter">
                <Warehouse className="mes-stocks__filter-icon" size={20} />
                <select
                  value={entrepotFilter}
                  onChange={handleEntrepotFilter}
                  className="mes-stocks__filter-select"
                >
                  <option value="">Tous les entrepôts</option>
                  {entrepots.map(entrepot => (
                    <option key={entrepot.id} value={entrepot.id}>
                      {entrepot.nom_entrepot} - {entrepot.ville}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mes-stocks__filter">
                <Filter className="mes-stocks__filter-icon" size={20} />
                <select
                  value={alerteFilter}
                  onChange={(e) => setAlerteFilter(e.target.value)}
                  className="mes-stocks__filter-select"
                >
                  <option value="tous">Tous les stocks</option>
                  <option value="normal">Stock normal</option>
                  <option value="alerte">Stock faible</option>
                  <option value="rupture">Rupture de stock</option>
                </select>
              </div>
            </div>

            {/* Liste des stocks */}
            <div className="mes-stocks__content">
              {stocksFiltres.length === 0 ? (
                <div className="mes-stocks__empty">
                  <Package size={48} className="mes-stocks__empty-icon" />
                  <h3 className="mes-stocks__empty-title">
                    {stocks.length === 0 ? 'Aucun stock disponible' : 'Aucun stock trouvé'}
                  </h3>
                  <p className="mes-stocks__empty-text">
                    {stocks.length === 0 
                      ? 'Aucun produit n\'est actuellement disponible dans les entrepôts.'
                      : 'Essayez de modifier vos critères de recherche.'
                    }
                  </p>
                </div>
              ) : (
                <div className="mes-stocks__list">
                  {stocksFiltres.map((stock) => {
                    const stockStatus = getStockStatus(stock);
                    return (
                      <div key={`${stock.produit}-${stock.entrepot}`} className="mes-stocks__card">
                        {/* Header de la carte */}
                        <div className="mes-stocks__card-header">
                          <div className="mes-stocks__card-info">
                            <div className="mes-stocks__card-title">
                              <Package size={18} className="mes-stocks__card-icon" />
                              {stock.produit_detail?.nom_produit || `Produit ${stock.produit}`}
                            </div>
                            <div className="mes-stocks__card-subtitle">
                              <MapPin size={16} className="mes-stocks__card-icon" />
                              {stock.entrepot_detail?.nom_entrepot} - {stock.entrepot_detail?.ville}
                            </div>
                          </div>
                          <span className={`mes-stocks__status ${stockStatus.color}`}>
                            {getStockIcon(stockStatus.status)}
                            {stockStatus.text}
                          </span>
                        </div>

                        {/* Contenu de la carte */}
                        <div className="mes-stocks__card-content">
                          <div className="mes-stocks__info-grid">
                            <div className="mes-stocks__info-item">
                              <span className="mes-stocks__info-label">Quantité disponible</span>
                              <span className={`mes-stocks__info-value ${stockStatus.status === 'rupture' ? 'mes-stocks__info-value--error' : ''}`}>
                                {formatNumber(stock.quantite_disponible)} {stock.produit_detail?.unite}
                              </span>
                            </div>
                            
                            <div className="mes-stocks__info-item">
                              <span className="mes-stocks__info-label">Prix unitaire</span>
                              <span className="mes-stocks__info-value mes-stocks__info-value--price">
                                {formatCurrency(stock.produit_detail?.prix_unitaire)}
                              </span>
                            </div>
                            
                            <div className="mes-stocks__info-item">
                              <span className="mes-stocks__info-label">Type d'entrepôt</span>
                              <span className="mes-stocks__info-value">
                                {stock.entrepot_detail?.type_entrepot === 'drivn_cook' ? 'DRIV\'N COOK' : 'Fournisseur libre'}
                              </span>
                            </div>
                          </div>

                          {/* Barre de progression du stock */}
                          <div className="mes-stocks__stock-bar">
                            <div className="mes-stocks__stock-bar-label">
                              Niveau de stock
                            </div>
                            <div className="mes-stocks__stock-bar-container">
                              <div 
                                className={`mes-stocks__stock-bar-fill ${stockStatus.color}`}
                                style={{
                                  width: `${Math.min((stock.quantite_disponible / (stock.alerte_stock * 2)) * 100, 100)}%`
                                }}
                              ></div>
                            </div>
                            <div className="mes-stocks__stock-bar-text">
                              {stock.quantite_disponible > 0 
                                ? `${Math.round((stock.quantite_disponible / (stock.alerte_stock * 2)) * 100)}%`
                                : '0%'
                              }
                            </div>
                          </div>
                        </div>

                        {/* Actions de la carte */}
                        <div className="mes-stocks__card-actions">
                          <button
                            onClick={() => commanderProduit(stock)}
                            className="mes-stocks__action-btn mes-stocks__action-btn--primary"
                            disabled={stock.quantite_disponible === 0}
                            title="Commander ce produit"
                          >
                            <ShoppingCart size={16} />
                            Commander
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MesStocks;