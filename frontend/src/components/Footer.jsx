import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css"
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
  ArrowRight,
} from "lucide-react";

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
                Food trucks de qualité proposant des plats à base de produits
                frais, bruts et majoritairement locaux. Depuis 2013, nous
                révolutionnons la restauration mobile en Île-de-France.
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
                  <a
                    href="https://facebook.com/drivncook"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Facebook size={20} />
                  </a>
                  <a
                    href="https://instagram.com/drivncook"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram size={20} />
                  </a>
                  <a
                    href="https://twitter.com/drivncook"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter size={20} />
                  </a>
                  <a
                    href="https://linkedin.com/company/drivncook"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
  );
};

export default Footer;
