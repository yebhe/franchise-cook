import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ChefHat, 
  CheckCircle,
  AlertCircle,
  Loader2,
  KeyRound,
  ArrowRight,
  Navigation
} from 'lucide-react';
import './PasswordResetPage.css';

const PasswordResetPage = () => {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    re_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isValidToken, setIsValidToken] = useState(true);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!uidb64 || !token) {
      setIsValidToken(false);
    }
  }, [uidb64, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Password validation
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre";
    }

    // Confirm password validation
    if (!formData.re_password) {
      newErrors.re_password = "Veuillez confirmer votre mot de passe";
    } else if (formData.password !== formData.re_password) {
      newErrors.re_password = "Les mots de passe ne correspondent pas";
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
      const csrfToken = document.cookie.match(/csrftoken=([^;]*)/)?.[1];
      const baseURL = import.meta.env.REACT_APP_BASE_DJANGO_URL
      const response = await axios.put(`${baseURL}/password/reset/${uidb64}/${token}/`, {
        password: formData.password,
        re_password: formData.re_password
      }, {
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRFToken': csrfToken })
        },
        withCredentials: true
      });

      // Succès
      setSuccess(true);
      setSuccessMessage(response.data.message || 'Mot de passe réinitialisé avec succès !');
      setFormData({
        password: '',
        re_password: ''
      });

    } catch (error) {
      console.error('Password reset error:', error);
      
      if (error.response) {
        const data = error.response.data;
        
        if (data.error) {
          if (data.error.includes('invalide')) {
            setIsValidToken(false);
          } else {
            setErrors({ general: data.error });
          }
        } else if (data.password) {
          setErrors({ 
            password: Array.isArray(data.password) ? data.password[0] : data.password 
          });
        } else if (data.non_field_errors) {
          setErrors({ 
            general: Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors 
          });
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

  const handleGoToLogin = () => {
    navigate('/login');
  };

  if (!isValidToken) {
    return (
      <div className="password-reset-container">
        <Navigation/>
        <div className="password-reset-card">
          <div className="password-reset-header">
            <div className="password-reset-logo">
              <ChefHat size={32} />
            </div>
            <h1 className="password-reset-title">DRIV'N COOK</h1>
            <p className="password-reset-subtitle">Réinitialisation de mot de passe</p>
          </div>
          
          <div className="error-content">
            <AlertCircle className="error-icon" size={48} />
            <h2>Lien invalide</h2>
            <p>Le lien de réinitialisation est invalide ou manquant. Veuillez demander un nouveau lien.</p>
            <button 
              className="password-reset-btn password-reset-btn--primary"
              onClick={() => navigate('/forgot-password')}
            >
              Demander un nouveau lien
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="password-reset-container">
        <div className="password-reset-card">
          <div className="password-reset-header">
            <div className="password-reset-logo">
              <ChefHat size={32} />
            </div>
            <h1 className="password-reset-title">DRIV'N COOK</h1>
            <p className="password-reset-subtitle">Mot de passe réinitialisé</p>
          </div>
          
          <div className="success-content">
            <CheckCircle className="success-icon" size={48} />
            <h2>Succès !</h2>
            <p>{successMessage}</p>
            <button 
              className="password-reset-btn password-reset-btn--primary"
              onClick={handleGoToLogin}
            >
              <ArrowRight size={20} />
              Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="password-reset-container">
      <div className="password-reset-card">
        <div className="password-reset-header">
          <div className="password-reset-logo">
            <ChefHat size={32} />
          </div>
          <h1 className="password-reset-title">DRIV'N COOK</h1>
          <p className="password-reset-subtitle">Nouveau mot de passe</p>
        </div>

        <div className="password-reset-form-container">
          {errors.general && (
            <div className="password-reset-alert password-reset-alert--error">
              <AlertCircle size={20} />
              <span>{errors.general}</span>
            </div>
          )}

          <div className="password-reset-form-group">
            <label className="password-reset-form-label">
              Nouveau mot de passe <span className="password-reset-required">*</span>
            </label>
            <div className="password-reset-input-group">
              <Lock className="password-reset-input-icon" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`password-reset-form-input ${errors.password ? 'password-reset-form-input--error' : ''}`}
                placeholder="Choisissez un nouveau mot de passe"
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-reset-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <span className="password-reset-error-message">{errors.password}</span>
            )}
            <div className="password-reset-password-requirements">
              <small>
                Le mot de passe doit contenir au moins 8 caractères avec une majuscule, une minuscule et un chiffre.
              </small>
            </div>
          </div>

          <div className="password-reset-form-group">
            <label className="password-reset-form-label">
              Confirmer le mot de passe <span className="password-reset-required">*</span>
            </label>
            <div className="password-reset-input-group">
              <Lock className="password-reset-input-icon" size={20} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="re_password"
                value={formData.re_password}
                onChange={handleChange}
                className={`password-reset-form-input ${errors.re_password ? 'password-reset-form-input--error' : ''}`}
                placeholder="Confirmez votre nouveau mot de passe"
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-reset-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.re_password && (
              <span className="password-reset-error-message">{errors.re_password}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="password-reset-btn password-reset-btn--primary password-reset-btn--full"
            onClick={handleSubmit}
          >
            {isLoading ? (
              <>
                <Loader2 className="password-reset-btn-icon password-reset-spinning" size={20} />
                Réinitialisation...
              </>
            ) : (
              <>
                <KeyRound className="password-reset-btn-icon" size={20} />
                Réinitialiser le mot de passe
              </>
            )}
          </button>

          <div className="password-reset-form-footer">
            <p>
              Vous vous souvenez de votre mot de passe ?{' '}
              <button 
                type="button"
                className="password-reset-link"
                onClick={handleGoToLogin}
              >
                Se connecter
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;