import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ChefHat, 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin,
  Clock,
  Truck,
  Users,
  Award,
  ArrowRight
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Section principale du footer */}
        <div className="footer-content">
          {/* Colonne 1: À propos */}
          <div className="footer-column">
            <div className="footer-brand">
              <ChefHat size={32} />
              <h3>DRIV'N COOK</h3>
            </div>
            <p className="footer-description">
              Food trucks de qualité proposant des plats à base de produits frais, 
              bruts et majoritairement locaux. Depuis 2013, nous révolutionnons 
              la restauration mobile en Île-de-France.
            </p>
            <div className="footer-stats">
              <div className="stat-item">
                <Truck size={20} />
                <span>30+ Food Trucks</span>
              </div>
              <div className="stat-item">
                <Users size={20} />
                <span>Franchisés actifs</span>
              </div>
              <div className="stat-item">
                <Award size={20} />
                <span>12 ans d'expérience</span>
              </div>
            </div>
          </div>

          {/* Colonne 2: Liens rapides */}
          <div className="footer-column">
            <h4 className="footer-title">Liens rapides</h4>
            <ul className="footer-links">
              <li>
                <Link to="/">
                  <ArrowRight size={16} />
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/services">
                  <ArrowRight size={16} />
                  Nos services
                </Link>
              </li>
              <li>
                <Link to="/contact">
                  <ArrowRight size={16} />
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/register">
                  <ArrowRight size={16} />
                  Créer un compte
                </Link>
              </li>
              <li>
                <Link to="/login">
                  <ArrowRight size={16} />
                  Se connecter
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3: Avantages DRIV'N COOK */}
          <div className="footer-column">
            <h4 className="footer-title">Nos avantages</h4>
            <ul className="footer-links">
              <li>
                <div className="advantage-item">
                  <ArrowRight size={16} />
                  <span>Produits frais et locaux</span>
                </div>
              </li>
              <li>
                <div className="advantage-item">
                  <ArrowRight size={16} />
                  <span>4 entrepôts en Île-de-France</span>
                </div>
              </li>
              <li>
                <div className="advantage-item">
                  <ArrowRight size={16} />
                  <span>Cuisine maison de qualité</span>
                </div>
              </li>
              <li>
                <div className="advantage-item">
                  <ArrowRight size={16} />
                  <span>Système de franchise éprouvé</span>
                </div>
              </li>
              <li>
                <div className="advantage-item">
                  <ArrowRight size={16} />
                  <span>Support complet aux franchisés</span>
                </div>
              </li>
              <li>
                <div className="advantage-item">
                  <ArrowRight size={16} />
                  <span>Programme fidélité digital</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Colonne 4: Contact & Infos */}
          <div className="footer-column">
            <h4 className="footer-title">Nous contacter</h4>
            <div className="footer-contact">
              <div className="contact-item">
                <MapPin size={18} />
                <div>
                  <p>123 Rue de la République</p>
                  <p>75012 Paris, France</p>
                </div>
              </div>
              <div className="contact-item">
                <Phone size={18} />
                <div>
                  <p>+33 1 23 45 67 89</p>
                  <p>Franchise: +33 1 23 45 67 90</p>
                </div>
              </div>
              <div className="contact-item">
                <Mail size={18} />
                <div>
                  <p>contact@drivncook.fr</p>
                  <p>franchise@drivncook.fr</p>
                </div>
              </div>
              <div className="contact-item">
                <Clock size={18} />
                <div>
                  <p>Lun - Ven: 9h00 - 18h00</p>
                  <p>Sam: 10h00 - 16h00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Séparateur */}
        <div className="footer-divider"></div>

        {/* Section bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p>&copy; 2025 DRIV'N COOK. Tous droits réservés.</p>
            <div className="footer-legal">
              <Link to="/privacy">Politique de confidentialité</Link>
              <span>•</span>
              <Link to="/terms">Conditions d'utilisation</Link>
              <span>•</span>
              <Link to="/cookies">Cookies</Link>
              <span>•</span>
              <Link to="/sitemap">Plan du site</Link>
            </div>
          </div>
          
          <div className="footer-bottom-right">
            <div className="footer-social">
              <span>Suivez-nous:</span>
              <div className="social-links">
                <a href="https://facebook.com/drivncook" target="_blank" rel="noopener noreferrer">
                  <Facebook size={20} />
                </a>
                <a href="https://instagram.com/drivncook" target="_blank" rel="noopener noreferrer">
                  <Instagram size={20} />
                </a>
                <a href="https://twitter.com/drivncook" target="_blank" rel="noopener noreferrer">
                  <Twitter size={20} />
                </a>
                <a href="https://linkedin.com/company/drivncook" target="_blank" rel="noopener noreferrer">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: #e2e8f0;
          margin-top: auto;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 2rem 1rem;
        }

        .footer-content {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr;
          gap: 3rem;
          margin-bottom: 2rem;
        }

        .footer-column h4 {
          color: #f1f5f9;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          position: relative;
        }

        .footer-title::after {
          content: '';
          position: absolute;
          bottom: -0.5rem;
          left: 0;
          width: 3rem;
          height: 2px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 1px;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .footer-brand h3 {
          color: #f1f5f9;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }

        .footer-brand svg {
          color: #3b82f6;
        }

        .footer-description {
          color: #cbd5e1;
          line-height: 1.6;
          margin-bottom: 2rem;
          font-size: 0.95rem;
        }

        .footer-stats {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .stat-item svg {
          color: #3b82f6;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-links li {
          margin-bottom: 0.75rem;
        }

        .footer-links a {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #cbd5e1;
          text-decoration: none;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          padding: 0.25rem 0;
        }

        .footer-links a:hover {
          color: #3b82f6;
          transform: translateX(0.25rem);
        }

        .footer-links svg {
          width: 12px;
          height: 12px;
          transition: transform 0.2s ease;
        }

        .footer-links a:hover svg {
          transform: translateX(0.25rem);
        }

        /* Style spécial pour les avantages (sans lien) */
        .advantage-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #cbd5e1;
          font-size: 0.9rem;
          padding: 0.25rem 0;
        }

        .advantage-item svg {
          width: 12px;
          height: 12px;
          color: #10b981;
          flex-shrink: 0;
        }

        .advantage-item span {
          color: #cbd5e1;
        }

        .footer-contact {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .contact-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .contact-item svg {
          color: #3b82f6;
          margin-top: 0.125rem;
          flex-shrink: 0;
        }

        .contact-item p {
          margin: 0;
          color: #cbd5e1;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .footer-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #475569, transparent);
          margin: 2rem 0;
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 1rem 0;
        }

        .footer-bottom-left p {
          margin: 0 0 0.5rem 0;
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .footer-legal {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .footer-legal a {
          color: #cbd5e1;
          text-decoration: none;
          font-size: 0.85rem;
          transition: color 0.2s ease;
        }

        .footer-legal a:hover {
          color: #3b82f6;
        }

        .footer-legal span {
          color: #64748b;
          font-size: 0.75rem;
        }

        .footer-social {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .footer-social span {
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .social-links {
          display: flex;
          gap: 0.75rem;
        }

        .social-links a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 0.5rem;
          color: #3b82f6;
          transition: all 0.2s ease;
        }

        .social-links a:hover {
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        /* Responsive design */
        @media (max-width: 1024px) {
          .footer-content {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
        }

        @media (max-width: 768px) {
          .footer-container {
            padding: 2rem 1rem 1rem;
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .footer-bottom {
            flex-direction: column;
            text-align: center;
            gap: 1.5rem;
          }

          .footer-legal {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .footer-brand {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
          }

          .footer-stats {
            align-items: center;
          }

          .social-links {
            justify-content: center;
          }

          .footer-legal {
            flex-direction: column;
            gap: 0.5rem;
          }

          .footer-legal span {
            display: none;
          }
        }

        /* Mode sombre amélioré */
        @media (prefers-color-scheme: dark) {
          .footer {
            background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
          }
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .footer-column {
          animation: fadeInUp 0.6s ease-out;
        }

        .footer-column:nth-child(2) {
          animation-delay: 0.1s;
        }

        .footer-column:nth-child(3) {
          animation-delay: 0.2s;
        }

        .footer-column:nth-child(4) {
          animation-delay: 0.3s;
        }
      `}</style>
    </footer>
  );
};

export default Footer;