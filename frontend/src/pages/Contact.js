import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, User, MessageSquare, ChefHat, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import Navigation from '../components/Navigation';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await apiClient.post('api/contact/', formData);
      
      if (response.data.success) {
        setShowSuccessPopup(true);
        // Reset du formulaire
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        setErrors(response.data.errors || { general: 'Une erreur est survenue' });
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: 'Erreur de connexion. Veuillez réessayer.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePopup = () => {
    setShowSuccessPopup(false);
  };

  return (
    <>
      <Navigation />
      <div className="contact-container">
        <div className="contact-card">
          <div className="contact-header">
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="contact-logo">
                <ChefHat size={32} />
              </div>
              <h1 className="contact-title">DRIV'N COOK</h1>
            </Link>
            <p className="contact-subtitle">Contactez-nous</p>
          </div>

          <div className="contact-content">
            {/* Informations de contact */}
            <div className="contact-info">
              <h2>Nos coordonnées</h2>
              
              <div className="contact-info-item">
                <Mail className="contact-info-icon" />
                <div>
                  <h3>Email</h3>
                  <p>contact@drivncook.fr</p>
                  <p>support@drivncook.fr</p>
                </div>
              </div>

              <div className="contact-info-item">
                <Phone className="contact-info-icon" />
                <div>
                  <h3>Téléphone</h3>
                  <p>+33 1 23 45 67 89</p>
                  <p>Du lundi au vendredi, 9h-18h</p>
                </div>
              </div>

              <div className="contact-info-item">
                <MapPin className="contact-info-icon" />
                <div>
                  <h3>Adresse</h3>
                  <p>123 Rue de la République</p>
                  <p>75001 Paris, France</p>
                </div>
              </div>
            </div>

            {/* Formulaire de contact */}
            <div className="contact-form-container">
              <h2>Envoyez-nous un message</h2>
              
              <form onSubmit={handleSubmit} className="contact-form">
                {errors.general && (
                  <div className="alert alert-error">
                    <AlertCircle size={20} />
                    <span>{errors.general}</span>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Nom complet <span className="required">*</span>
                    </label>
                    <div className="input-group">
                      <User className="input-icon" size={20} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`form-input ${errors.name ? "error" : ""}`}
                        placeholder="Votre nom complet"
                        required
                      />
                    </div>
                    {errors.name && (
                      <span className="error-message">{errors.name}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Email <span className="required">*</span>
                    </label>
                    <div className="input-group">
                      <Mail className="input-icon" size={20} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`form-input ${errors.email ? "error" : ""}`}
                        placeholder="votre@email.fr"
                        required
                      />
                    </div>
                    {errors.email && (
                      <span className="error-message">{errors.email}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Téléphone
                    </label>
                    <div className="input-group">
                      <Phone className="input-icon" size={20} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`form-input ${errors.phone ? "error" : ""}`}
                        placeholder="+33 1 23 45 67 89"
                      />
                    </div>
                    {errors.phone && (
                      <span className="error-message">{errors.phone}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Sujet <span className="required">*</span>
                    </label>
                    <div className="input-group">
                      <MessageSquare className="input-icon" size={20} />
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`form-input ${errors.subject ? "error" : ""}`}
                        required
                      >
                        <option value="">Choisir un sujet</option>
                        <option value="info">Demande d'information</option>
                        <option value="support">Support technique</option>
                        <option value="partnership">Partenariat</option>
                        <option value="franchise">Devenir franchisé</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>
                    {errors.subject && (
                      <span className="error-message">{errors.subject}</span>
                    )}
                  </div>
                </div>

                <div className="form-group form-group-full">
                  <label className="form-label">
                    Message <span className="required">*</span>
                  </label>
                  <div className="input-group">
                    <MessageSquare className="input-icon" size={20} />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className={`form-input form-textarea ${errors.message ? "error" : ""}`}
                      rows="6"
                      placeholder="Décrivez votre demande..."
                      required
                    />
                  </div>
                  {errors.message && (
                    <span className="error-message">{errors.message}</span>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="btn-icon spinning" size={20} />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="btn-icon" size={20} />
                      Envoyer le message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Popup de succès */}
        {showSuccessPopup && (
          <div className="popup-overlay">
            <div className="popup-container">
              <button
                className="popup-close"
                onClick={handleClosePopup}
                aria-label="Fermer"
              >
                <X size={20} />
              </button>

              <div className="popup-content">
                <div className="popup-icon">
                  <CheckCircle size={48} />
                </div>

                <h2 className="popup-title">Message envoyé !</h2>

                <p className="popup-message">
                  Merci pour votre message. Notre équipe va traiter votre demande dans les plus brefs délais et vous répondra directement par email.
                </p>

                <div className="popup-actions">
                  <Link to="/" className="btn btn-primary">
                    Retour à l'accueil
                  </Link>
                  <button
                    className="btn btn-secondary"
                    onClick={handleClosePopup}
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Contact;