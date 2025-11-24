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
import "./ForgotPasswordPage.css"
const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
  
    if (errors.email || errors.general) {
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors = {};


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
    
      const baseURL = import.meta.env.REACT_APP_BASE_DJANGO_URL
      
      const response = await axios.post(`${baseURL}/user/password/forgot/`, {
        email: email.trim()
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });


      setSuccess(true);
      setSuccessMessage(
        response.data.message || 
        "Un lien de réinitialisation a été envoyé à votre adresse email."
      );

    } catch (error) {
      console.error('Forgot password error:', error);
      
      if (error.response) {
        const data = error.response.data;
        
        if (data.error) {
  
          if (data.error.includes('compte') || data.error.includes('email')) {
            setErrors({ email: data.error });
          } else {
            setErrors({ general: data.error });
          }
        } else if (data.email) {

          setErrors({ 
            email: Array.isArray(data.email) ? data.email[0] : data.email 
          });
        } else if (data.non_field_errors) {
          setErrors({ 
            general: Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors 
          });
        } else if (error.response.status === 404) {
          setErrors({ email: "Aucun compte n'est associé à cette adresse email." });
        } else {
          setErrors({ general: 'Une erreur est survenue. Veuillez réessayer.' });
        }
      } else if (error.request) {
        setErrors({ general: 'Erreur de connexion. Vérifiez votre connexion internet.' });
      } else {
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
    </>
  );
};

export default ForgotPasswordPage;