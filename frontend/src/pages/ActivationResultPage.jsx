import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ChefHat, 
  ArrowRight,
  Mail,
  RefreshCw
} from 'lucide-react';
import "./ActivationResultPage.css"
const ActivationResultPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('loading'); 

  useEffect(() => {

    const messageParam = searchParams.get('message');
    
    if (messageParam) {
      setMessage(decodeURIComponent(messageParam));
      
      // Déterminer le statut basé sur le message
      if (messageParam.includes('activé avec succès')) {
        setStatus('success');
      } else if (messageParam.includes('déjà activé')) {
        setStatus('info');
      } else if (messageParam.includes('invalide') || messageParam.includes('expiré')) {
        setStatus('error');
      } else {
        setStatus('info');
      }
    } else {
      setMessage('Aucune information d\'activation disponible.');
      setStatus('error');
    }
  }, [searchParams]);

  const getIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle size={64} className="status-icon success" />;
      case 'error':
        return <XCircle size={64} className="status-icon error" />;
      case 'info':
        return <AlertCircle size={64} className="status-icon info" />;
      default:
        return <RefreshCw size={64} className="status-icon loading spinning" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'success':
        return 'Activation réussie !';
      case 'error':
        return 'Erreur d\'activation';
      case 'info':
        return 'Information';
      default:
        return 'Vérification en cours...';
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoToRegister = () => {
    navigate('/register');
  };

  const handleGoToHome = () => {
    navigate('/');
  };

  return (
    <div className="activation-container">
      <div className="activation-card">
        {/* Header */}
        <div className="activation-header">
          <div className="activation-logo">
            <ChefHat size={32} />
          </div>
          <h1 className="activation-brand">DRIV'N COOK</h1>
          <p className="activation-subtitle">Activation de compte</p>
        </div>

        {/* Contenu principal */}
        <div className="activation-content">
          <div className="status-container">
            {getIcon()}
            <h2 className="status-title">{getTitle()}</h2>
            <p className="status-message">{message}</p>
          </div>

          {/* Actions basées sur le statut */}
          <div className="action-buttons">
            {status === 'success' && (
              <>
                <button 
                  className="btn btn-primary"
                  onClick={handleGoToLogin}
                >
                  <ArrowRight size={20} />
                  Se connecter
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={handleGoToHome}
                >
                  Retour à l'accueil
                </button>
              </>
            )}

            {status === 'info' && message.includes('déjà activé') && (
              <>
                <button 
                  className="btn btn-primary"
                  onClick={handleGoToLogin}
                >
                  <ArrowRight size={20} />
                  Se connecter
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={handleGoToHome}
                >
                  Retour à l'accueil
                </button>
              </>
            )}

            {status === 'error' && (
              <>
                <button 
                  className="btn btn-primary"
                  onClick={handleGoToRegister}
                >
                  <Mail size={20} />
                  Nouvelle inscription
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={handleGoToHome}
                >
                  Retour à l'accueil
                </button>
              </>
            )}

            {status === 'loading' && (
              <div className="loading-spinner">
                <RefreshCw size={24} className="spinning" />
                <span>Vérification en cours...</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer informatif */}
        <div className="activation-footer">
          <div className="help-text">
            {status === 'success' && (
              <p>
                <CheckCircle size={16} />
                Votre compte est maintenant actif. Vous pouvez vous connecter.
              </p>
            )}
            {status === 'error' && (
              <p>
                <AlertCircle size={16} />
                Le lien d'activation a peut-être expiré. Créez un nouveau compte si nécessaire.
              </p>
            )}
            {status === 'info' && (
              <p>
                <AlertCircle size={16} />
                Votre compte est déjà prêt à l'utilisation.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivationResultPage;