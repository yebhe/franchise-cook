// pages/franchise/PaiementSucces.jsx - VERSION CORRIGÉE
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  ArrowRight, 
  Home, 
  Mail,
  Calendar,
  CreditCard,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

import './PaiementSucces.css';
import Navigation from '../Navigation';
import apiClient from '../../api/axiosConfig';

export default function PaiementSucces() {
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [franchiseInfo, setFranchiseInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [verificationError, setVerificationError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // 🎯 UN SEUL useEffect QUI FAIT TOUT
  useEffect(() => {
    const sessionIdParam = searchParams.get('session_id');
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
      // 🎯 APPEL AUTOMATIQUE DÈS L'ARRIVÉE SUR LA PAGE
      console.log('🚀 Démarrage vérification automatique...', sessionIdParam);
      verifierPaiementAutomatique(sessionIdParam);
    } else {
      setLoading(false);
      setVerificationError('Aucun ID de session fourni');
    }
  }, [searchParams]);

  const verifierPaiementAutomatique = async (sessionId, isRetry = false) => {
    try {
      if (!isRetry) {
        console.log('🔍 Vérification automatique du paiement...', sessionId);
      } else {
        console.log(`🔄 Tentative ${retryCount + 1}/3...`);
      }
      
      const response = await apiClient.post('/api/verifier-paiement/', {
        session_id: sessionId
      });
      
      if (response.data.success) {
        console.log('✅ Paiement confirmé automatiquement:', response.data);
        
        // Mise à jour des infos affichées
        setFranchiseInfo(response.data.franchise);
        setUserInfo(response.data.user);
        setVerificationError(null);
        
        // Message selon si c'était déjà traité ou non
        if (response.data.already_processed) {
          console.log('ℹ️ Paiement déjà traité précédemment');
        } else {
          console.log('🎉 Paiement traité avec succès !');
        }
      } else {
        throw new Error(response.data.error || 'Erreur de vérification');
      }
    } catch (error) {
      console.error('❌ Erreur vérification automatique:', error);
      
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          'Erreur lors de la vérification du paiement';
      
      // 🔄 RETRY AUTOMATIQUE (max 3 tentatives)
      if (retryCount < 2) {
        console.log(`⏳ Nouvelle tentative dans 3 secondes... (${retryCount + 1}/3)`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          verifierPaiementAutomatique(sessionId, true);
        }, 3000);
        return;
      }
      
      // Échec après toutes les tentatives
      setVerificationError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 FONCTION DE RETRY MANUEL
  const retryVerification = () => {
    setLoading(true);
    setVerificationError(null);
    setRetryCount(0);
    verifierPaiementAutomatique(sessionId);
  };

  // 🎯 RENDU PENDANT LE CHARGEMENT
  if (loading) {
    return (
      <div className="paiement-succes">
        <Navigation />
        <div className="paiement-succes__loading">
          <div className="paiement-succes__spinner"></div>
          <p>
            {retryCount === 0 
              ? 'Vérification et confirmation automatique du paiement...' 
              : `Tentative ${retryCount + 1}/3 - Vérification en cours...`
            }
          </p>
          {retryCount > 0 && (
            <small>Veuillez patienter, votre paiement est en cours de traitement.</small>
          )}
        </div>
      </div>
    );
  }

  // 🎯 RENDU EN CAS D'ERREUR
  if (verificationError && !franchiseInfo) {
    return (
      <div className="paiement-succes">
        <Navigation />
        <div className="paiement-succes__container">
          <div className="paiement-succes__card">
            <div className="paiement-succes__header" style={{background: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)'}}>
              <div className="paiement-succes__icon-container">
                <AlertCircle className="paiement-succes__icon" size={64} />
              </div>
              <h1 className="paiement-succes__title">
                Vérification en cours...
              </h1>
              <p className="paiement-succes__subtitle">
                Votre paiement est en cours de traitement
              </p>
            </div>

            <div className="paiement-succes__content">
              <div className="paiement-succes__success-message">
                <h2>Paiement reçu</h2>
                <p>
                  Votre paiement a été reçu par Stripe mais la mise à jour est en cours.
                  Votre franchise sera activée automatiquement.
                </p>
                <div style={{background: '#fef3c7', padding: '15px', borderRadius: '8px', marginTop: '15px'}}>
                  <small><strong>Détail :</strong> {verificationError}</small>
                </div>
              </div>

              <div style={{textAlign: 'center', margin: '30px 0'}}>
                <button 
                  onClick={retryVerification}
                  className="paiement-succes__btn paiement-succes__btn--secondary"
                  disabled={loading}
                  style={{display: 'inline-flex', alignItems: 'center', gap: '8px'}}
                >
                  <RefreshCw size={20} />
                  Vérifier à nouveau
                </button>
              </div>

              <div className="paiement-succes__contact-info">
                <Mail size={20} />
                <div>
                  <strong>Besoin d'aide ?</strong>
                  <p>Contactez-nous à <a href="mailto:franchise@drivncook.fr">franchise@drivncook.fr</a></p>
                </div>
              </div>
            </div>

            <div className="paiement-succes__actions">
              <Link 
                to="/" 
                className="paiement-succes__btn paiement-succes__btn--primary"
              >
                <Home size={20} />
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🎉 RENDU DE SUCCÈS
  return (
    <div className="paiement-succes">
      <Navigation />
      
      <div className="paiement-succes__container">
        <div className="paiement-succes__card">
          {/* Header de succès */}
          <div className="paiement-succes__header">
            <div className="paiement-succes__icon-container">
              <CheckCircle className="paiement-succes__icon" size={64} />
            </div>
            <h1 className="paiement-succes__title">
              🎉 Paiement confirmé !
            </h1>
            <p className="paiement-succes__subtitle">
              Bienvenue dans le réseau DRIV'N COOK
            </p>
          </div>

          {/* Contenu principal */}
          <div className="paiement-succes__content">
            <div className="paiement-succes__success-message">
              <h2>Félicitations !</h2>
              <p>
                Votre paiement de <strong>{franchiseInfo?.montant || '50 000'}€</strong> a été traité avec succès. 
                {franchiseInfo?.nom && (
                  <>Votre franchise <strong>{franchiseInfo.nom}</strong> est maintenant active dans notre réseau.</>
                )}
                {!franchiseInfo?.nom && (
                  <>Votre franchise est maintenant active dans notre réseau.</>
                )}
              </p>
            </div>

            {/* Informations de transaction */}
            {sessionId && (
              <div className="paiement-succes__transaction-info">
                <h3>Détails de la transaction</h3>
                <div className="paiement-succes__transaction-details">
                  <div className="paiement-succes__detail-item">
                    <CreditCard size={20} />
                    <div>
                      <span className="label">ID de session</span>
                      <span className="value">{sessionId}</span>
                    </div>
                  </div>
                  <div className="paiement-succes__detail-item">
                    <Calendar size={20} />
                    <div>
                      <span className="label">Date de paiement</span>
                      <span className="value">
                        {franchiseInfo?.date_paiement 
                          ? new Date(franchiseInfo.date_paiement).toLocaleDateString('fr-FR')
                          : new Date().toLocaleDateString('fr-FR')
                        }
                      </span>
                    </div>
                  </div>
                  {franchiseInfo && (
                    <div className="paiement-succes__detail-item">
                      <CheckCircle size={20} />
                      <div>
                        <span className="label">Statut franchise</span>
                        <span className="value" style={{color: '#10b981', fontWeight: 'bold'}}>
                          {franchiseInfo.statut === 'paye' ? 'ACTIVE ✅' : franchiseInfo.statut}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Prochaines étapes */}
            <div className="paiement-succes__next-steps">
              <h3>Prochaines étapes</h3>
              <div className="paiement-succes__steps-list">
                <div className="paiement-succes__step">
                  <div className="paiement-succes__step-number">1</div>
                  <div className="paiement-succes__step-content">
                    <h4>Email de confirmation</h4>
                    <p>Vous allez recevoir un email de confirmation dans les minutes qui suivent.</p>
                  </div>
                </div>
                <div className="paiement-succes__step">
                  <div className="paiement-succes__step-number">2</div>
                  <div className="paiement-succes__step-content">
                    <h4>Contact de notre équipe</h4>
                    <p>Un membre de notre équipe vous contactera sous 48h pour organiser la formation.</p>
                  </div>
                </div>
                <div className="paiement-succes__step">
                  <div className="paiement-succes__step-number">3</div>
                  <div className="paiement-succes__step-content">
                    <h4>Livraison du camion</h4>
                    <p>Votre camion équipé sera livré selon le planning convenu ensemble.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact d'urgence */}
            <div className="paiement-succes__contact-info">
              <Mail size={20} />
              <div>
                <strong>Une question ?</strong>
                <p>Contactez-nous à <a href="mailto:franchise@drivncook.fr">franchise@drivncook.fr</a></p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="paiement-succes__actions">
            <Link 
              to="/" 
              className="paiement-succes__btn paiement-succes__btn--primary"
            >
              <Home size={20} />
              Retour à l'accueil
            </Link>
            <Link 
              to="/dashboard" 
              className="paiement-succes__btn paiement-succes__btn--secondary"
            >
              Mon espace franchisé
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}