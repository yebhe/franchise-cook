import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Mail, 
  ChefHat, 
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Send,
  Clock
} from 'lucide-react';
import Navigation from '../components/Navigation';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
    
    // Clear errors when user starts typing
    if (errors.email || errors.general) {
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "L'adresse email est requise";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Format d'email invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      // Configuration de l'URL de base depuis les variables d'environnement
      const baseURL = process.env.REACT_APP_BASE_DJANGO_URL || 'http://localhost:8000';
      
      // Appel API réel avec axios - à votre endpoint Django pour forgot password
      const response = await axios.post(`${baseURL}/user/password/forgot/`, {
        email: email.trim()
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Succès - utilise le message de votre API Django
      setSuccess(true);
      setSuccessMessage(
        response.data.message || 
        "Un lien de réinitialisation a été envoyé à votre adresse email."
      );

    } catch (error) {
      console.error('Forgot password error:', error);
      
      if (error.response) {
        // Erreur de réponse du serveur
        const data = error.response.data;
        
        if (data.error) {
          // Messages d'erreur de votre API Django
          if (data.error.includes('compte') || data.error.includes('email')) {
            setErrors({ email: data.error });
          } else {
            setErrors({ general: data.error });
          }
        } else if (data.email) {
          // Erreurs de validation sur le champ email
          setErrors({ 
            email: Array.isArray(data.email) ? data.email[0] : data.email 
          });
        } else if (data.non_field_errors) {
          // Erreurs générales du serializer
          setErrors({ 
            general: Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors 
          });
        } else if (error.response.status === 404) {
          // Email non trouvé
          setErrors({ email: "Aucun compte n'est associé à cette adresse email." });
        } else {
          setErrors({ general: 'Une erreur est survenue. Veuillez réessayer.' });
        }
      } else if (error.request) {
        // Erreur réseau - pas de réponse du serveur
        setErrors({ general: 'Erreur de connexion. Vérifiez votre connexion internet.' });
      } else {
        // Autre erreur (configuration, etc.)
        setErrors({ general: 'Une erreur inattendue est survenue.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleTryAgain = () => {
    setSuccess(false);
    setSuccessMessage('');
    setEmail('');
  };

  return (
    <>
      <Navigation/>
      {success ? (
        <div className="forgot-password-container">
          <div className="forgot-password-card">
            <div className="forgot-password-header">
              <Link to='/' style={{textDecoration: 'none', color: 'inherit'}}>
                <div className="forgot-password-logo">
                <ChefHat size={32} />
                </div>
                <h1 className="login-title">DRIV'N COOK</h1>
              </Link>
              <p className="forgot-password-subtitle">Email envoyé !</p>
            </div>
            
            <div className="success-content">
              <div className="success-icon-container">
                <CheckCircle className="success-icon" size={48} />
                <Mail className="mail-icon" size={24} />
              </div>
              
              <h2>Vérifiez votre email</h2>
              
              <p className="success-message">
                {successMessage}
              </p>
              
              <div className="email-info">
                <div className="sent-to">
                  <strong>Envoyé à :</strong> {email || 'votre adresse email'}
                </div>
              </div>

              <div className="success-actions">
                <button 
                  className="btn btn-primary"
                  onClick={handleBackToLogin}
                >
                  <ArrowLeft size={20} />
                  Retour à la connexion
                </button>
                
                <button 
                  className="btn btn-secondary"
                  onClick={handleTryAgain}
                >
                  Autre adresse email
                </button>
              </div>

              <div className="help-text">
                <Clock size={16} />
                <span>Le lien expirera dans 1 heure. Vérifiez aussi vos spams.</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="forgot-password-container">
          <div className="forgot-password-card">
            <div className="forgot-password-header">
              <Link to='/' style={{textDecoration: 'none', color: 'inherit'}}>
                <div className="forgot-password-logo">
                <ChefHat size={32} />
                </div>
                <h1 className="login-title">DRIV'N COOK</h1>
              </Link>
              <p className="forgot-password-subtitle">Mot de passe oublié</p>
            </div>

            <div className="forgot-password-form-container">
              <div className="form-intro">
                <h2>Réinitialiser votre mot de passe</h2>
                <p>
                  Entrez votre adresse email et nous vous enverrons un lien 
                  pour réinitialiser votre mot de passe.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="forgot-password-form">
                {errors.general && (
                  <div className="alert alert-error">
                    <AlertCircle size={20} />
                    <span>{errors.general}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">
                    Adresse email <span className="required">*</span>
                  </label>
                  <div className="input-group">
                    <Mail className="input-icon" size={20} />
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={handleChange}
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="votre@email.com"
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>
                  {errors.email && (
                    <span className="error-message">{errors.email}</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="btn btn-primary btn-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="btn-icon spinning" size={20} />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="btn-icon" size={20} />
                      Envoyer le lien de réinitialisation
                    </>
                  )}
                </button>
              </form>

              <div className="form-footer">
                <button 
                  type="button"
                  className="back-link"
                  onClick={handleBackToLogin}
                >
                  <ArrowLeft size={16} />
                  Retour à la connexion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .forgot-password-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          padding: 2rem 1rem;
        }

        .forgot-password-card {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          width: 100%;
          max-width: 450px;
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

        .forgot-password-header {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          padding: 2rem;
          text-align: center;
        }

        .forgot-password-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 4rem;
          height: 4rem;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          margin-bottom: 1rem;
        }

        .forgot-password-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .forgot-password-subtitle {
          font-size: 1rem;
          opacity: 0.9;
          margin: 0;
        }

        .forgot-password-form-container {
          padding: 2rem;
        }

        .form-intro {
          text-align: center;
          margin-bottom: 2rem;
        }

        .form-intro h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.75rem 0;
        }

        .form-intro p {
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
          font-size: 0.95rem;
        }

        .forgot-password-form {
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .required {
          color: #ef4444;
        }

        .input-group {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 0.75rem;
          color: #9ca3af;
          z-index: 1;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: all 0.2s;
          background: white;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-input.error {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .form-input:disabled {
          background-color: #f9fafb;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .error-message {
          display: block;
          font-size: 0.75rem;
          color: #ef4444;
          margin-top: 0.25rem;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          animation: fadeIn 0.3s ease-out;
        }

        .alert-error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
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

        .btn-full {
          width: 100%;
        }

        .btn-icon {
          flex-shrink: 0;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .form-footer {
          text-align: center;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          font-size: 0.875rem;
          transition: color 0.2s;
          padding: 0.5rem;
        }

        .back-link:hover {
          color: #3b82f6;
        }

        /* Success page styles */
        .success-content {
          text-align: center;
          padding: 2rem;
        }

        .success-icon-container {
          position: relative;
          display: inline-block;
          margin-bottom: 1.5rem;
        }

        .success-icon {
          color: #10b981;
        }

        .mail-icon {
          position: absolute;
          bottom: -8px;
          right: -8px;
          background: white;
          border-radius: 50%;
          padding: 2px;
          color: #3b82f6;
        }

        .success-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 1rem 0;
        }

        .success-message {
          color: #6b7280;
          line-height: 1.6;
          margin: 0 0 1.5rem 0;
        }

        .email-info {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 2rem;
        }

        .sent-to {
          font-size: 0.875rem;
          color: #374151;
        }

        .success-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }

        .help-text {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.75rem;
          line-height: 1.4;
        }

        .help-text svg {
          flex-shrink: 0;
        }

        /* Responsive design */
        @media (max-width: 640px) {
          .forgot-password-container {
            padding: 1rem;
          }

          .forgot-password-card {
            margin: 0;
          }

          .forgot-password-header {
            padding: 1.5rem;
          }

          .forgot-password-form-container,
          .success-content {
            padding: 1.5rem;
          }

          .forgot-password-title {
            font-size: 1.25rem;
          }

          .success-actions {
            flex-direction: column;
            align-items: center;
          }

          .success-actions .btn {
            min-width: 200px;
            width: 100%;
            max-width: 250px;
          }

          .btn {
            padding: 1rem 1.5rem;
          }
        }

        /* Focus states pour l'accessibilité */
        .form-input:focus,
        .btn:focus,
        .back-link:focus {
          outline: none;
        }

        .form-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .btn:focus {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }

        .back-link:focus {
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
          border-radius: 0.25rem;
        }

        /* Mode sombre */
        @media (prefers-color-scheme: dark) {
          .forgot-password-card {
            background: #1f2937;
            color: #f9fafb;
          }

          .form-intro h2 {
            color: #f9fafb;
          }

          .form-intro p {
            color: #d1d5db;
          }

          .form-label {
            color: #d1d5db;
          }

          .form-input {
            background: #374151;
            border-color: #4b5563;
            color: #f9fafb;
          }

          .form-input:focus {
            border-color: #3b82f6;
            background: #4b5563;
          }

          .input-icon {
            color: #9ca3af;
          }

          .back-link {
            color: #9ca3af;
          }

          .success-content h2 {
            color: #f9fafb;
          }

          .success-message {
            color: #d1d5db;
          }

          .email-info {
            background: #374151;
            border-color: #4b5563;
          }

          .sent-to {
            color: #d1d5db;
          }

          .help-text {
            color: #9ca3af;
          }
        }

        /* Améliorations des transitions */
        .form-input,
        .btn,
        .back-link {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Animation d'entrée pour les éléments */
        .form-intro {
          animation: fadeInUp 0.5s ease-out 0.2s both;
        }

        .forgot-password-form {
          animation: fadeInUp 0.5s ease-out 0.4s both;
        }

        .form-footer {
          animation: fadeInUp 0.5s ease-out 0.6s both;
        }

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
      `}</style>
    </>
  );
};

export default ForgotPasswordPage;