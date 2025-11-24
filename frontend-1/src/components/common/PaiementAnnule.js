// pages/franchise/PaiementAnnule.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  XCircle, 
  ArrowLeft, 
  RefreshCw,
  HelpCircle,
  Phone,
  Mail
} from 'lucide-react';
import './PaiementAnnule.css';
import Navigation from '../Navigation';

export default function PaiementAnnule() {
  return (
    <div className="paiement-annule">
      <Navigation />
      
      <div className="paiement-annule__container">
        <div className="paiement-annule__card">
          {/* Header d'annulation */}
          <div className="paiement-annule__header">
            <div className="paiement-annule__icon-container">
              <XCircle className="paiement-annule__icon" size={64} />
            </div>
            <h1 className="paiement-annule__title">
              Paiement annulé
            </h1>
            <p className="paiement-annule__subtitle">
              Votre transaction n'a pas été finalisée
            </p>
          </div>

          {/* Contenu principal */}
          <div className="paiement-annule__content">
            <div className="paiement-annule__message">
              <h2>Que s'est-il passé ?</h2>
              <p>
                Vous avez annulé le processus de paiement ou fermé la fenêtre avant la finalisation. 
                Aucun montant n'a été débité de votre compte.
              </p>
            </div>

            {/* Informations importantes */}
            <div className="paiement-annule__info-box">
              <div className="paiement-annule__info-item">
                <h3>💳 Votre carte n'a pas été débitée</h3>
                <p>Aucune transaction n'a été effectuée.</p>
              </div>
              <div className="paiement-annule__info-item">
                <h3>⏳ Votre demande reste valide</h3>
                <p>Votre franchise reste validée, seul le paiement est en attente.</p>
              </div>
              <div className="paiement-annule__info-item">
                <h3>🔄 Vous pouvez réessayer</h3>
                <p>Un nouveau lien de paiement peut être généré à tout moment.</p>
              </div>
            </div>

            {/* Raisons possibles */}
            <div className="paiement-annule__reasons">
              <h3>Raisons possibles de l'annulation :</h3>
              <ul>
                <li>Vous avez cliqué sur "Annuler" ou fermé la fenêtre</li>
                <li>La session de paiement a expiré (après 24h)</li>
                <li>Problème de connexion internet</li>
                <li>Problème temporaire avec votre carte bancaire</li>
              </ul>
            </div>

            {/* Solutions */}
            <div className="paiement-annule__solutions">
              <h3>Comment procéder maintenant ?</h3>
              <div className="paiement-annule__solution-cards">
                <div className="paiement-annule__solution-card">
                  <RefreshCw size={24} />
                  <h4>Réessayer le paiement</h4>
                  <p>Contactez notre équipe pour obtenir un nouveau lien de paiement</p>
                </div>
                <div className="paiement-annule__solution-card">
                  <HelpCircle size={24} />
                  <h4>Besoin d'aide ?</h4>
                  <p>Notre support est disponible pour vous accompagner</p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="paiement-annule__contact">
              <h3>Contactez-nous</h3>
              <div className="paiement-annule__contact-options">
                <div className="paiement-annule__contact-item">
                  <Mail size={20} />
                  <div>
                    <strong>Email</strong>
                    <a href="mailto:franchise@drivncook.fr">franchise@drivncook.fr</a>
                  </div>
                </div>
                <div className="paiement-annule__contact-item">
                  <Phone size={20} />
                  <div>
                    <strong>Téléphone</strong>
                    <a href="tel:+33123456789">01 23 45 67 89</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="paiement-annule__actions">
            <Link 
              to="/" 
              className="paiement-annule__btn paiement-annule__btn--secondary"
            >
              <ArrowLeft size={20} />
              Retour à l'accueil
            </Link>
            <a 
              href="mailto:franchise@drivncook.fr?subject=Nouveau lien de paiement&body=Bonjour, je souhaiterais recevoir un nouveau lien de paiement pour finaliser ma franchise. Merci."
              className="paiement-annule__btn paiement-annule__btn--primary"
            >
              <Mail size={20} />
              Demander un nouveau lien
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}