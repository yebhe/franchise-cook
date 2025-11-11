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

const Page404 = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  // Compte à rebours pour redirection automatique
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

        {/* Contenu principal */}
        <div className="page-404__content">
          {/* Illustration 404 */}
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

          {/* Texte principal */}
          <div className="page-404__text">
            <h2>Oups ! Notre food truck s'est perdu...</h2>
            <p className="page-404__description">
              La page que vous cherchez n'existe pas ou a été déplacée. 
              Mais ne vous inquiétez pas, nous allons vous aider à retrouver votre chemin !
            </p>
          </div>

          {/* Barre de recherche */}
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

          {/* Liens rapides */}
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

          {/* Actions principales */}
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

          {/* Redirection automatique */}
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

      <style jsx>{`
        .page-404 {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .page-404__container {
          max-width: 800px;
          width: 100%;
          text-align: center;
        }

        /* Header avec logo */
        .page-404__header {
          margin-bottom: 40px;
        }

        .page-404__logo {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          text-decoration: none;
          color: white;
          transition: transform 0.3s ease;
        }

        .page-404__logo:hover {
          transform: scale(1.05);
        }

        .page-404__logo-icon {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          padding: 12px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
        }

        .page-404__logo-text h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: white;
        }

        .page-404__logo-text p {
          margin: 0;
          font-size: 12px;
          color: #94a3b8;
        }

        /* Contenu principal */
        .page-404__content {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
        }

        /* Illustration */
        .page-404__illustration {
          margin-bottom: 40px;
          position: relative;
        }

        .illustration-container {
          position: relative;
          display: inline-block;
          margin-bottom: 20px;
        }

        .truck-illustration {
          color: #3b82f6;
          filter: drop-shadow(0 4px 20px rgba(59, 130, 246, 0.3));
          animation: bounce 2s infinite;
        }

        /* Animation fumée */
        .smoke-animation {
          position: absolute;
          top: -10px;
          right: -20px;
        }

        .smoke {
          position: absolute;
          width: 8px;
          height: 8px;
          background: rgba(148, 163, 184, 0.6);
          border-radius: 50%;
          animation: smoke-rise 3s infinite;
        }

        .smoke-1 { animation-delay: 0s; }
        .smoke-2 { animation-delay: 0.5s; left: 10px; }
        .smoke-3 { animation-delay: 1s; left: 20px; }

        .page-404__number {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 20px;
        }

        .number {
          font-size: 80px;
          font-weight: 900;
          color: transparent;
          background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
          background-clip: text;
          -webkit-background-clip: text;
          text-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
          animation: pulse 2s infinite;
        }

        /* Texte */
        .page-404__text h2 {
          color: white;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .page-404__description {
          color: #94a3b8;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 40px;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }

        /* Recherche */
        .page-404__search {
          margin-bottom: 40px;
        }

        .search-form {
          max-width: 400px;
          margin: 0 auto;
        }

        .search-input-group {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          overflow: hidden;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          color: #94a3b8;
          z-index: 1;
        }

        .search-input {
          flex: 1;
          padding: 16px 16px 16px 48px;
          background: transparent;
          border: none;
          color: white;
          font-size: 14px;
          outline: none;
        }

        .search-input::placeholder {
          color: #64748b;
        }

        .search-button {
          padding: 16px 20px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .search-button:hover {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
        }

        /* Liens rapides */
        .page-404__quick-links h3 {
          color: white;
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 24px;
        }

        .quick-links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 40px;
        }

        .quick-link-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          text-decoration: none;
          color: white;
          transition: all 0.3s ease;
        }

        .quick-link-card:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .quick-link-icon {
          color: #3b82f6;
          flex-shrink: 0;
        }

        .quick-link-content {
          text-align: left;
        }

        .quick-link-content h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
          color: white;
        }

        .quick-link-content p {
          margin: 0;
          font-size: 12px;
          color: #94a3b8;
        }

        /* Actions */
        .page-404__actions {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        /* Redirection */
        .page-404__redirect {
          margin-bottom: 40px;
        }

        .page-404__redirect p {
          color: #94a3b8;
          font-size: 14px;
          margin-bottom: 12px;
        }

        .countdown-bar {
          width: 200px;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          margin: 0 auto;
          overflow: hidden;
        }

        .countdown-progress {
          height: 100%;
          background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
          border-radius: 2px;
          transition: width 1s linear;
        }

        /* Footer */
        .page-404__footer {
          margin-top: 40px;
        }

        .footer-contact {
          display: flex;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #94a3b8;
          font-size: 14px;
        }

        .contact-item svg {
          color: #3b82f6;
        }

        /* Animations */
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }

        @keyframes smoke-rise {
          0% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
          100% { 
            opacity: 0; 
            transform: translateY(-30px) scale(1.5); 
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .page-404__content {
            padding: 30px 20px;
          }

          .page-404__logo {
            flex-direction: column;
            gap: 8px;
          }

          .number {
            font-size: 60px;
          }

          .page-404__text h2 {
            font-size: 24px;
          }

          .quick-links-grid {
            grid-template-columns: 1fr;
          }

          .page-404__actions {
            flex-direction: column;
            align-items: center;
          }

          .btn {
            width: 100%;
            max-width: 200px;
            justify-content: center;
          }

          .footer-contact {
            flex-direction: column;
            gap: 16px;
          }
        }

        @media (max-width: 480px) {
          .page-404 {
            padding: 10px;
          }

          .page-404__content {
            padding: 20px 15px;
          }

          .number {
            font-size: 48px;
          }

          .page-404__text h2 {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Page404;