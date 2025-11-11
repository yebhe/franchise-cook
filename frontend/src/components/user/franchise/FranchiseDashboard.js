import React, { useState, useEffect } from 'react';
import { 
  BarChart3,
  TrendingUp,
  Truck,
  MapPin,
  Package,
  Euro,
  Calendar,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Building2,
  Target,
  Activity,
  Loader
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './FranchiseDashboard.css';
import useAuthStore from '../../../store/authStore';
import apiClient from '../../../api/axiosConfig';
import FranchiseNavigation from './FranchiseNavigation';

const DashboardFranchise = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
 
  const user = useAuthStore((state) => state.user);
 

  // Chargement des statistiques
  const fetchStats = async () => {
    try {
      setError(null);
      const response = await apiClient.get('/api_user/dashboard/stats/');
      setStats(response.data);
      console.log('Stats:', stats);
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
      console.error('Erreur API:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  // Auto-masquage des messages d'erreur
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Formatage des montants
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  // Calcul du pourcentage de CA mensuel vs objectif
  const calculatePerformance = () => {
    if (!stats?.ventes_30j?.chiffre_affaires) return 0;
    const objectifMensuel = 15000; // Objectif fixe pour exemple
    return Math.min((stats.ventes_30j.chiffre_affaires / objectifMensuel) * 100, 100);
  };

  // Calcul du taux d'occupation des emplacements
  const calculateOccupationRate = () => {
    if (!stats?.emplacements) return 0;
    const { autorises = 0, affectations_actives = 0 } = stats.emplacements;
    if (autorises === 0) return 0;
    return Math.round((affectations_actives / autorises) * 100);
  };

  if (loading) {
    return (
      <div className="franchise-layout">
        <FranchiseNavigation />
        <main className="franchise-main-content">
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
              <Loader className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Chargement du tableau de bord...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="franchise-layout">
      <FranchiseNavigation />
      
      <main className="franchise-main-content">
        <div className="dashboard-franchise">
          <div className="dashboard-franchise__container">
            
            {/* Header avec infos franchise */}
            <div className="dashboard-franchise__header">
              <div className="dashboard-franchise__header-content">
                <div className="dashboard-franchise__welcome">
                  <h1 className="dashboard-franchise__title">
                    <BarChart3 className="dashboard-franchise__title-icon" size={32} />
                    Tableau de Bord
                  </h1>
                  <p className="dashboard-franchise__subtitle">
                    Bienvenue {user?.first_name} ! Voici un aperçu de votre activité.
                  </p>
                </div>
                <div className="dashboard-franchise__header-actions">
                  <button
                    onClick={handleRefresh}
                    className="dashboard-franchise__btn dashboard-franchise__btn--secondary"
                    disabled={refreshing}
                  >
                    <RefreshCw size={20} className={refreshing ? 'dashboard-franchise__icon--spinning' : ''} />
                    Actualiser
                  </button>
                </div>
              </div>
            </div>

            {/* Messages d'erreur */}
            {error && (
              <div className="dashboard-franchise__alert dashboard-franchise__alert--error">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {stats && (
              <>
                {/* KPIs principaux */}
                <div className="dashboard-franchise__kpis">
                  <div className="dashboard-franchise__kpi-card dashboard-franchise__kpi-card--primary">
                    <div className="dashboard-franchise__kpi-header">
                      <div className="dashboard-franchise__kpi-icon">
                        <Euro size={24} />
                      </div>
                      <div className="dashboard-franchise__kpi-trend">
                        <TrendingUp size={16} className="dashboard-franchise__trend-up" />
                      </div>
                    </div>
                    <div className="dashboard-franchise__kpi-content">
                      <div className="dashboard-franchise__kpi-value">
                        {formatCurrency(stats.ventes_30j?.chiffre_affaires)}
                      </div>
                      <div className="dashboard-franchise__kpi-label">
                        Chiffre d'affaires (30j)
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-franchise__kpi-card dashboard-franchise__kpi-card--success">
                    <div className="dashboard-franchise__kpi-header">
                      <div className="dashboard-franchise__kpi-icon">
                        <Target size={24} />
                      </div>
                      <div className="dashboard-franchise__kpi-trend">
                        <span className="dashboard-franchise__percentage">
                          {calculatePerformance().toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="dashboard-franchise__kpi-content">
                      <div className="dashboard-franchise__kpi-value">
                        {formatCurrency(stats.ventes_30j?.redevance_due)}
                      </div>
                      <div className="dashboard-franchise__kpi-label">
                        Redevances dues (4%)
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-franchise__kpi-card dashboard-franchise__kpi-card--info">
                    <div className="dashboard-franchise__kpi-header">
                      <div className="dashboard-franchise__kpi-icon">
                        <Package size={24} />
                      </div>
                      <div className="dashboard-franchise__kpi-trend">
                        {stats.commandes_en_cours > 0 ? (
                          <AlertCircle size={16} className="dashboard-franchise__trend-warning" />
                        ) : (
                          <CheckCircle size={16} className="dashboard-franchise__trend-success" />
                        )}
                      </div>
                    </div>
                    <div className="dashboard-franchise__kpi-content">
                      <div className="dashboard-franchise__kpi-value">
                        {stats.commandes_en_cours}
                      </div>
                      <div className="dashboard-franchise__kpi-label">
                        Commandes en cours
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-franchise__kpi-card dashboard-franchise__kpi-card--warning">
                    <div className="dashboard-franchise__kpi-header">
                      <div className="dashboard-franchise__kpi-icon">
                        <Activity size={24} />
                      </div>
                      <div className="dashboard-franchise__kpi-trend">
                        <span className="dashboard-franchise__ratio">
                          {stats.emplacements?.affectations_actives || 0}/{stats.emplacements?.autorises || 0}
                        </span>
                      </div>
                    </div>
                    <div className="dashboard-franchise__kpi-content">
                      <div className="dashboard-franchise__kpi-value">
                        {calculateOccupationRate()}%
                      </div>
                      <div className="dashboard-franchise__kpi-label">
                        Taux d'occupation
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sections détaillées */}
                <div className="dashboard-franchise__sections">
                  
                  {/* Section Flotte */}
                  <div className="dashboard-franchise__section">
                    <div className="dashboard-franchise__section-header">
                      <h3 className="dashboard-franchise__section-title">
                        <Truck size={20} />
                        Ma Flotte de Camions
                      </h3>
                      <button
                        onClick={() => navigate('/franchise/camions')}
                        className="dashboard-franchise__btn dashboard-franchise__btn--outline"
                      >
                        Voir tout
                      </button>
                    </div>
                    <div className="dashboard-franchise__section-content">
                      <div className="dashboard-franchise__stats-grid">
                        <div className="dashboard-franchise__stat-item">
                          <div className="dashboard-franchise__stat-icon dashboard-franchise__stat-icon--blue">
                            <Truck size={20} />
                          </div>
                          <div className="dashboard-franchise__stat-content">
                            <div className="dashboard-franchise__stat-number">
                              {stats.camions?.total || 0}
                            </div>
                            <div className="dashboard-franchise__stat-label">
                              Camions total
                            </div>
                          </div>
                        </div>
                        <div className="dashboard-franchise__stat-item">
                          <div className="dashboard-franchise__stat-icon dashboard-franchise__stat-icon--green">
                            <CheckCircle size={20} />
                          </div>
                          <div className="dashboard-franchise__stat-content">
                            <div className="dashboard-franchise__stat-number">
                              {stats.camions?.actifs || 0}
                            </div>
                            <div className="dashboard-franchise__stat-label">
                              Camions actifs
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section Emplacements */}
                  <div className="dashboard-franchise__section">
                    <div className="dashboard-franchise__section-header">
                      <h3 className="dashboard-franchise__section-title">
                        <MapPin size={20} />
                        Mes Emplacements
                      </h3>
                      <button
                        onClick={() => navigate('/franchise/emplacements')}
                        className="dashboard-franchise__btn dashboard-franchise__btn--outline"
                      >
                        Voir tout
                      </button>
                    </div>
                    <div className="dashboard-franchise__section-content">
                      <div className="dashboard-franchise__stats-grid">
                        <div className="dashboard-franchise__stat-item">
                          <div className="dashboard-franchise__stat-icon dashboard-franchise__stat-icon--purple">
                            <Building2 size={20} />
                          </div>
                          <div className="dashboard-franchise__stat-content">
                            <div className="dashboard-franchise__stat-number">
                              {stats.emplacements?.autorises || 0}
                            </div>
                            <div className="dashboard-franchise__stat-label">
                              Emplacements autorisés
                            </div>
                          </div>
                        </div>
                        <div className="dashboard-franchise__stat-item">
                          <div className="dashboard-franchise__stat-icon dashboard-franchise__stat-icon--orange">
                            <Activity size={20} />
                          </div>
                          <div className="dashboard-franchise__stat-content">
                            <div className="dashboard-franchise__stat-number">
                              {stats.emplacements?.affectations_actives || 0}
                            </div>
                            <div className="dashboard-franchise__stat-label">
                              Affectations actives
                            </div>
                          </div>
                        </div>
                        <div className="dashboard-franchise__stat-item">
                          <div className="dashboard-franchise__stat-icon dashboard-franchise__stat-icon--gray">
                            <Calendar size={20} />
                          </div>
                          <div className="dashboard-franchise__stat-content">
                            <div className="dashboard-franchise__stat-number">
                              {stats.emplacements?.affectations_programmees || 0}
                            </div>
                            <div className="dashboard-franchise__stat-label">
                              Affectations programmées
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section Actions rapides */}
                  <div className="dashboard-franchise__section dashboard-franchise__section--full">
                    <div className="dashboard-franchise__section-header">
                      <h3 className="dashboard-franchise__section-title">
                        <Clock size={20} />
                        Actions Rapides
                      </h3>
                    </div>
                    <div className="dashboard-franchise__section-content">
                      <div className="dashboard-franchise__quick-actions">
                        <button
                          onClick={() => navigate('/commandes')}
                          className="dashboard-franchise__quick-action"
                        >
                          <Package size={24} />
                          <span>Nouvelle commande</span>
                        </button>
                        <button
                          onClick={() => navigate('/franchise/affectations')}
                          className="dashboard-franchise__quick-action"
                        >
                          <MapPin size={24} />
                          <span>Affecter un camion</span>
                        </button>
                        <button
                          onClick={() => navigate('/ventes')}
                          className="dashboard-franchise__quick-action"
                        >
                          <Euro size={24} />
                          <span>Saisir ventes</span>
                        </button>
                        <button
                          onClick={() => navigate('/stocks')}
                          className="dashboard-franchise__quick-action"
                        >
                          <Building2 size={24} />
                          <span>Consulter stocks</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Résumé financier */}
                <div className="dashboard-franchise__financial-summary">
                  <div className="dashboard-franchise__financial-card">
                    <div className="dashboard-franchise__financial-header">
                      <h4>Résumé Financier (30 derniers jours)</h4>
                    </div>
                    <div className="dashboard-franchise__financial-content">
                      <div className="dashboard-franchise__financial-row">
                        <span>Chiffre d'affaires brut</span>
                        <span className="dashboard-franchise__financial-amount dashboard-franchise__financial-amount--positive">
                          {formatCurrency(stats.ventes_30j?.chiffre_affaires)}
                        </span>
                      </div>
                      <div className="dashboard-franchise__financial-row">
                        <span>Redevances Driv'n Cook (4%)</span>
                        <span className="dashboard-franchise__financial-amount dashboard-franchise__financial-amount--negative">
                          -{formatCurrency(stats.ventes_30j?.redevance_due)}
                        </span>
                      </div>
                      <div className="dashboard-franchise__financial-separator"></div>
                      <div className="dashboard-franchise__financial-row dashboard-franchise__financial-row--total">
                        <span>Chiffre d'affaires net</span>
                        <span className="dashboard-franchise__financial-amount dashboard-franchise__financial-amount--total">
                          {formatCurrency((stats.ventes_30j?.chiffre_affaires || 0) - (stats.ventes_30j?.redevance_due || 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardFranchise;