import React, { useState, useEffect } from 'react';
import { 
  Truck,  
  Home, 
  ChefHat,
  Mail,
  LogIn,
  LogOut,
  UserPlus,
  Menu,
  X,
  Settings,
  Users
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const navigate = useNavigate();

  // États du store Zustand
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const getFullName = useAuthStore((state) => state.getFullName);
  const getInitials = useAuthStore((state) => state.getInitials);
  const getUserType = useAuthStore((state) => state.getUserType);
  const getHasFranchise = useAuthStore((state) => state.getHasFranchise);
  const isLoading = useAuthStore((state) => state.isLoading);

  // États locaux pour l'interface
  const [activeSection, setActiveSection] = useState('accueil');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleLogin = () => {
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const handleRegister = () => {
    navigate('/register');
    setIsMobileMenuOpen(false);
  };

  const handleHome = () => {
    navigate('/');
    setActiveSection('accueil');
    setIsMobileMenuOpen(false);
  };

  const handleDashboard = () => {
    const userType = getUserType();
    const hasFranchise = getHasFranchise();
    
    if (userType === 'admin') {
      navigate('/admin/dashboard');
    } else if (userType === 'franchise' && hasFranchise) {
      navigate('/franchise/dashboard');
    }
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigationLinks = [
    { id: 'accueil', title: 'Accueil', icon: Home, path: '/', action: () => navigate('/')},
    { id: 'services', title: 'Nos Services', icon: Truck, path: '/services', action: () => navigate('/services')},
    { id: 'contact', title: 'Contact', icon: Mail, path: '/contact', action: () => navigate('/contact')}
  ];

  const handleNavClick = (id, action) => {
    setActiveSection(id);
    setIsMobileMenuOpen(false);
    if (action) action();
  };

  // Déterminer le rôle affiché
  const getUserRole = () => {
    const userType = getUserType();
    if (userType === 'admin') return 'Administrateur';
    if (userType === 'franchise') return 'Franchisé';
    return 'Utilisateur';
  };

  // Déterminer si on peut afficher le bouton dashboard
  const canShowDashboard = () => {
    const userType = getUserType();
    const hasFranchise = getHasFranchise();
    
    return (userType === 'admin') || (userType === 'franchise' && hasFranchise);
  };

  // Déterminer le texte du bouton dashboard
  const getDashboardButtonText = () => {
    const userType = getUserType();
    if (userType === 'admin') return 'Admin Dashboard';
    return 'Franchise Dashboard';
  };

  return (
    <>
      {/* Header */}
      <header className={`drivn-header ${isScrolled ? 'drivn-header--scrolled' : ''}`}>
        <div className="drivn-header-container">
          
          {/* Logo */}
          <div className="drivn-logo" onClick={handleHome}>
            <div className="drivn-logo__icon">
              <ChefHat size={24} color="white" />
            </div>
            <div>
              <h1 className="drivn-logo__text">DRIV'N COOK</h1>
              <p className="drivn-logo__subtitle">Food Trucks de Qualité</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="drivn-nav-desktop">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button 
                  key={link.id} 
                  className={`drivn-nav-btn ${
                    activeSection === link.id ? 'drivn-nav-btn--active' : ''
                  }`}
                  onClick={() => handleNavClick(link.id, link.action)}
                  disabled={isLoading}
                >
                  <Icon size={18} />
                  <span>{link.title}</span>
                </button>
              );
            })}
          </nav>

          {/* Desktop Auth */}
          <div className="drivn-auth-section">
            {/* Desktop Auth - Toujours visible sur desktop */}
            {!isAuthenticated ? (
              <div className="drivn-desktop-auth">
                <button 
                  onClick={handleLogin} 
                  className="drivn-btn drivn-btn--secondary"
                  disabled={isLoading}
                >
                  <LogIn size={16} />
                  <span>Connexion</span>
                </button>
                <button 
                  onClick={handleRegister} 
                  className="drivn-btn drivn-btn--primary"
                  disabled={isLoading}
                >
                  <UserPlus size={16} />
                  <span>S'inscrire</span>
                </button>
              </div>
            ) : (
              <div className="drivn-desktop-auth">
                <div className="drivn-user-info">
                  <div className="drivn-user-avatar">
                    {getInitials()}
                  </div>
                  <div className="drivn-user-details">
                    <p className="drivn-user-name">{getFullName()}</p>
                    <p className="drivn-user-role">{getUserRole()}</p>
                  </div>
                </div>
                <div className="drivn-status">
                  <div className="drivn-status__dot"></div>
                  <span>Connecté</span>
                </div>
                
                {/* Bouton Dashboard pour desktop */}
                {canShowDashboard() && (
                  <button 
                    onClick={handleDashboard} 
                    className="drivn-btn drivn-btn--success"
                    disabled={isLoading}
                  >
                    {getUserType() === 'admin' ? <Settings size={16} /> : <Users size={16} />}
                    <span>{getDashboardButtonText()}</span>
                  </button>
                )}
                
                <button 
                  onClick={handleLogout} 
                  className="drivn-btn drivn-btn--danger"
                  disabled={isLoading}
                >
                  <LogOut size={16} />
                  <span>{isLoading ? 'Déconnexion...' : 'Déconnexion'}</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="drivn-mobile-menu-btn"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
              disabled={isLoading}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`drivn-mobile-menu ${isMobileMenuOpen ? 'drivn-mobile-menu--open' : ''}`}>
        <div className="drivn-mobile-menu__content">
          
          {/* Mobile Navigation */}
          <nav className="drivn-mobile-nav">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  className={`drivn-mobile-nav-btn ${
                    activeSection === link.id ? 'drivn-mobile-nav-btn--active' : ''
                  }`}
                  onClick={() => handleNavClick(link.id, link.action)}
                  disabled={isLoading}
                >
                  <Icon size={20} />
                  <span>{link.title}</span>
                </button>
              );
            })}

            {/* Boutons Auth et Dashboard dans la navigation mobile */}
            {!isAuthenticated ? (
              <>
                <button 
                  onClick={handleLogin} 
                  className="drivn-mobile-nav-btn drivn-mobile-nav-btn--auth"
                  disabled={isLoading}
                >
                  <LogIn size={20} />
                  <span>Connexion</span>
                </button>
                <button 
                  onClick={handleRegister} 
                  className="drivn-mobile-nav-btn drivn-mobile-nav-btn--auth drivn-mobile-nav-btn--primary"
                  disabled={isLoading}
                >
                  <UserPlus size={20} />
                  <span>S'inscrire</span>
                </button>
              </>
            ) : (
              <>
                {/* Bouton Dashboard pour mobile */}
                {canShowDashboard() && (
                  <button
                    onClick={handleDashboard}
                    className="drivn-mobile-nav-btn drivn-mobile-nav-btn--dashboard"
                    disabled={isLoading}
                  >
                    {getUserType() === 'admin' ? <Settings size={20} /> : <Users size={20} />}
                    <span>{getDashboardButtonText()}</span>
                  </button>
                )}
                
                <button 
                  onClick={handleLogout} 
                  className="drivn-mobile-nav-btn drivn-mobile-nav-btn--danger"
                  disabled={isLoading}
                >
                  <LogOut size={20} />
                  <span>{isLoading ? 'Déconnexion...' : 'Déconnexion'}</span>
                </button>
              </>
            )}
          </nav>

          {/* Mobile User Info - Affiché uniquement si connecté */}
          {isAuthenticated && (
            <div className="drivn-mobile-user-info">
              <div className="drivn-user-avatar">
                {getInitials()}
              </div>
              <div className="drivn-user-details">
                <p className="drivn-user-name">{getFullName()}</p>
                <p className="drivn-user-role">{getUserRole()}</p>
              </div>
              <div className="drivn-status">
                <div className="drivn-status__dot"></div>
                <span>Connecté</span>
              </div>
            </div>
          )}

          {/* État de chargement */}
          {isLoading && (
            <div className="drivn-loading-indicator">
              <div className="drivn-spinner"></div>
              <span>Chargement...</span>
            </div>
          )}
        </div>
      </div>

      {/* Spacer */}
      <div style={{ height: window.innerWidth <= 767 ? '60px' : '70px' }}></div>
    </>
  );
};

export default Navigation;