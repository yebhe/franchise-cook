import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChefHat,
  X,
} from "lucide-react";
import './RegisterPage.css'
import authStore from "../store/authStore";
import { Link } from "react-router-dom";

const UserRegisterForm = () => {
  const { register, isLoading, error, clearError } = authStore();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localErrors, setLocalErrors] = useState({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (localErrors[name]) {
      setLocalErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis";
    } else if (formData.username.length < 3) {
      newErrors.username =
        "Le nom d'utilisateur doit contenir au moins 3 caractères";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = "Le prénom est requis";
    }


    if (!formData.last_name.trim()) {
      newErrors.last_name = "Le nom est requis";
    }

    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Le numéro de téléphone est requis";
    } else if (!phoneRegex.test(formData.phone_number)) {
      newErrors.phone_number = "Format de téléphone invalide";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 8) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères";
    }


    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Veuillez confirmer votre mot de passe";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    clearError();
    setLocalErrors({});

    try {

      const result = await register(formData);

      if (result.success) {
        setShowSuccessPopup(true);
        setSuccessMessage(result.message);
        setFormData({
          username: "",
          email: "",
          first_name: "",
          last_name: "",
          phone_number: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        if (result.errors) {
          setLocalErrors(result.errors);
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      setLocalErrors({
        general: "Une erreur est survenue. Veuillez réessayer.",
      });
    }
  };

  const handleClosePopup = () => {
    setShowSuccessPopup(false);
  };

  if (success) {
    return (
      <>
        <div className="register-container">
          <div className="register-card">
            <div className="register-header">
              <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                <div className="register-logo">
                  <ChefHat size={32} />
                </div>
                <h1 className="login-title">DRIV'N COOK</h1>
              </Link>
              <p className="register-subtitle">Inscription réussie !</p>
            </div>

            <div className="success-message">
              <CheckCircle className="success-icon" size={48} />
              <h2>Compte créé avec succès !</h2>
              <p>
                {successMessage ||
                  "Un email de confirmation a été envoyé à votre adresse email. Veuillez cliquer sur le lien dans l'email pour activer votre compte."}
              </p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSuccess(false);
                  setSuccessMessage("");
                }}
              >
                Créer un autre compte
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="login-logo">
                <ChefHat size={32} />
              </div>
              <h1 className="login-title">DRIV'N COOK</h1>
            </Link>
            <p className="register-subtitle">Créer votre compte</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            {(error?.message || localErrors.general) && (
              <div className="alert alert-error">
                <AlertCircle size={20} />
                <span>{error?.message || localErrors.general}</span>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Prénom <span className="required">*</span>
                </label>
                <div className="input-group">
                  <User className="input-icon" size={20} />
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`form-input ${
                      localErrors.first_name || error?.first_name ? "error" : ""
                    }`}
                    placeholder="Votre prénom"
                  />
                </div>
                {(localErrors.first_name || error?.first_name) && (
                  <span className="error-message">
                    {localErrors.first_name || error?.first_name?.[0]}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Nom <span className="required">*</span>
                </label>
                <div className="input-group">
                  <User className="input-icon" size={20} />
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`form-input ${
                      localErrors.last_name || error?.last_name ? "error" : ""
                    }`}
                    placeholder="Votre nom"
                  />
                </div>
                {(localErrors.last_name || error?.last_name) && (
                  <span className="error-message">
                    {localErrors.last_name || error?.last_name?.[0]}
                  </span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Nom d'utilisateur <span className="required">*</span>
              </label>
              <div className="input-group">
                <UserPlus className="input-icon" size={20} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`form-input ${
                    localErrors.username || error?.username ? "error" : ""
                  }`}
                  placeholder="Choisissez un nom d'utilisateur"
                />
              </div>
              {(localErrors.username || error?.username) && (
                <span className="error-message">
                  {localErrors.username || error?.username?.[0]}
                </span>
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
                  className={`form-input ${
                    localErrors.email || error?.email ? "error" : ""
                  }`}
                  placeholder="votre@email.com"
                />
              </div>
              {(localErrors.email || error?.email) && (
                <span className="error-message">
                  {localErrors.email || error?.email?.[0]}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Téléphone <span className="required">*</span>
              </label>
              <div className="input-group">
                <Phone className="input-icon" size={20} />
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className={`form-input ${
                    localErrors.phone_number || error?.phone_number
                      ? "error"
                      : ""
                  }`}
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
              {(localErrors.phone_number || error?.phone_number) && (
                <span className="error-message">
                  {localErrors.phone_number || error?.phone_number?.[0]}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Mot de passe <span className="required">*</span>
              </label>
              <div className="input-group">
                <Lock className="input-icon" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input ${
                    localErrors.password || error?.password ? "error" : ""
                  }`}
                  placeholder="Choisissez un mot de passe"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {(localErrors.password || error?.password) && (
                <span className="error-message">
                  {localErrors.password || error?.password?.[0]}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Confirmer le mot de passe <span className="required">*</span>
              </label>
              <div className="input-group">
                <Lock className="input-icon" size={20} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-input ${
                    localErrors.confirmPassword ? "error" : ""
                  }`}
                  placeholder="Confirmez votre mot de passe"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {localErrors.confirmPassword && (
                <span className="error-message">
                  {localErrors.confirmPassword}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="btn-icon spinning" size={20} />
                  Création en cours...
                </>
              ) : (
                <>
                  <UserPlus className="btn-icon" size={20} />
                  Créer mon compte
                </>
              )}
            </button>

            <div className="form-footer">
              <p>
                Vous avez déjà un compte ?{" "}
                <a href="/login" className="link">
                  Se connecter
                </a>
              </p>
            </div>
          </form>
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

                <h2 className="popup-title">Inscription réussie !</h2>

                <p className="popup-message">
                  {successMessage ||
                    "Un email de confirmation a été envoyé à votre adresse email. Veuillez cliquer sur le lien dans l'email pour activer votre compte."}
                </p>

                <div className="popup-actions">
                  <Link to="/login" className="btn btn-primary">
                    Aller à la connexion
                  </Link>
                  <button
                    className="btn btn-secondary"
                    onClick={handleClosePopup}
                  >
                    Rester ici
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

export default UserRegisterForm;
