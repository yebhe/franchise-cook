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

const ActivationResultPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('loading'); // loading, success, error, info

  useEffect(() => {
    // Récupérer le message depuis les paramètres URL
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

      <style jsx>{`
        .activation-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          padding: 2rem 1rem;
        }

        .activation-card {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          width: 100%;
          max-width: 500px;
          overflow: hidden;
          animation: slideIn 0.5s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .activation-header {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          padding: 2rem;
          text-align: center;
        }

        .activation-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 4rem;
          height: 4rem;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          margin-bottom: 1rem;
        }

        .activation-brand {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .activation-subtitle {
          font-size: 1rem;
          opacity: 0.9;
          margin: 0;
        }

        .activation-content {
          padding: 2.5rem 2rem;
          text-align: center;
        }

        .status-container {
          margin-bottom: 2rem;
        }

        .status-icon {
          margin-bottom: 1.5rem;
        }

        .status-icon.success {
          color: #10b981;
        }

        .status-icon.error {
          color: #ef4444;
        }

        .status-icon.info {
          color: #3b82f6;
        }

        .status-icon.loading {
          color: #6b7280;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .status-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 1rem 0;
        }

        .status-message {
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
          font-size: 1rem;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          min-width: 140px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
        }

        .loading-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.95rem;
        }

        .activation-footer {
          background: #f9fafb;
          padding: 1.5rem 2rem;
          border-top: 1px solid #e5e7eb;
        }

        .help-text {
          text-align: center;
        }

        .help-text p {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .help-text svg {
          flex-shrink: 0;
        }

        /* Responsive design */
        @media (max-width: 640px) {
          .activation-container {
            padding: 1rem;
          }

          .activation-header {
            padding: 1.5rem;
          }

          .activation-content {
            padding: 2rem 1.5rem;
          }

          .activation-footer {
            padding: 1.25rem 1.5rem;
          }

          .activation-brand {
            font-size: 1.25rem;
          }

          .status-title {
            font-size: 1.25rem;
          }

          .action-buttons {
            flex-direction: column;
            align-items: center;
          }

          .btn {
            min-width: 200px;
            width: 100%;
            max-width: 250px;
          }
        }

        /* Mode sombre */
        @media (prefers-color-scheme: dark) {
          .activation-card {
            background: #1f2937;
            color: #f9fafb;
          }

          .status-title {
            color: #f9fafb;
          }

          .status-message {
            color: #d1d5db;
          }

          .activation-footer {
            background: #111827;
            border-color: #374151;
          }

          .help-text p {
            color: #9ca3af;
          }
        }

        /* Améliorations des transitions */
        .btn,
        .status-icon {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* États de focus pour l'accessibilité */
        .btn:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }

        /* Animation pour les états de statut */
        .status-icon {
          animation: iconAppear 0.5s ease-out 0.2s both;
        }

        @keyframes iconAppear {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .status-title {
          animation: textSlideUp 0.5s ease-out 0.4s both;
        }

        .status-message {
          animation: textSlideUp 0.5s ease-out 0.6s both;
        }

        .action-buttons {
          animation: textSlideUp 0.5s ease-out 0.8s both;
        }

        @keyframes textSlideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ActivationResultPage;