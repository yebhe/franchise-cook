import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChefHat, 
  Home, 
  ArrowLeft, 
  Search, 
  MapPin,
  Truck,
  Mail,
  Phone
} from 'lucide-react';
import './Page404.css'

const Page404 = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const quickLinks = [
    { to: '/', icon: Home, label: 'Accueil', description: 'Retour à la page principale' },
    { to: '/services', icon: Truck, label: 'Nos Services', description: 'Découvrez nos services' },
    { to: '/contact', icon: Mail, label: 'Contact', description: 'Contactez-nous' },
    { to: '/register', icon: ChefHat, label: 'Inscription', description: 'Créer un compte' }
  ];

  return (
    <div className="page-404">
      <div className="page-404__container">
        {/* Header avec logo */}
        <div className="page-404__header">
          <Link to="/" className="page-404__logo">
            <div className="page-404__logo-icon">
              <ChefHat size={40} />
            </div>
            <div className="page-404__logo-text">
              <h1>DRIV'N COOK</h1>
              <p>Food Trucks de Qualité</p>
            </div>
          </Link>
        </div>

        <div className="page-404__content">
          <div className="page-404__illustration">
            <div className="illustration-container">
              <div className="truck-illustration">
                <Truck size={120} />
              </div>
              <div className="smoke-animation">
                <div className="smoke smoke-1"></div>
                <div className="smoke smoke-2"></div>
                <div className="smoke smoke-3"></div>
              </div>
            </div>
            
            <div className="page-404__number">
              <span className="number">4</span>
              <span className="number">0</span>
              <span className="number">4</span>
            </div>
          </div>

          <div className="page-404__text">
            <h2>Oups ! Notre food truck s'est perdu...</h2>
            <p className="page-404__description">
              La page que vous cherchez n'existe pas ou a été déplacée. 
              Mais ne vous inquiétez pas, nous allons vous aider à retrouver votre chemin !
            </p>
          </div>

          <div className="page-404__search">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-group">
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher sur notre site..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-button">
                  Rechercher
                </button>
              </div>
            </form>
          </div>

          <div className="page-404__quick-links">
            <h3>Liens utiles</h3>
            <div className="quick-links-grid">
              {quickLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <Link 
                    key={index} 
                    to={link.to} 
                    className="quick-link-card"
                  >
                    <div className="quick-link-icon">
                      <Icon size={24} />
                    </div>
                    <div className="quick-link-content">
                      <h4>{link.label}</h4>
                      <p>{link.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="page-404__actions">
            <button 
              onClick={() => navigate(-1)} 
              className="btn btn-secondary"
            >
              <ArrowLeft size={20} />
              Page précédente
            </button>
            
            <Link to="/" className="btn btn-primary">
              <Home size={20} />
              Retour à l'accueil
            </Link>
          </div>

          <div className="page-404__redirect">
            <p>
              Redirection automatique vers l'accueil dans <strong>{countdown}</strong> seconde{countdown > 1 ? 's' : ''}
            </p>
            <div className="countdown-bar">
              <div 
                className="countdown-progress" 
                style={{ width: `${(10 - countdown) * 10}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Footer contact */}
        <div className="page-404__footer">
          <div className="footer-contact">
            <div className="contact-item">
              <Phone size={16} />
              <span>+33 1 23 45 67 89</span>
            </div>
            <div className="contact-item">
              <Mail size={16} />
              <span>contact@drivncook.fr</span>
            </div>
            <div className="contact-item">
              <MapPin size={16} />
              <span>Paris, Île-de-France</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Page404;