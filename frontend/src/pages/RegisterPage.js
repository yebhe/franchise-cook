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
import authStore from "../store/authStore";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";

const UserRegisterForm = () => {
  // Zustand store
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

    // Clear errors when user starts typing
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

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis";
    } else if (formData.username.length < 3) {
      newErrors.username =
        "Le nom d'utilisateur doit contenir au moins 3 caractères";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    // First name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = "Le prénom est requis";
    }

    // Last name validation
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Le nom est requis";
    }

    // Phone validation
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

    // Confirm password validation
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

    // Clear previous errors
    clearError();
    setLocalErrors({});

    try {
      // Prepare data for API (exclude confirmPassword)
      const { confirmPassword, ...apiData } = formData;

      // Call register from Zustand store
      const result = await register(apiData);

      if (result.success) {
        setShowSuccessPopup(true);
        setSuccessMessage(result.message);
        // Reset form
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
        // Handle API errors
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
        <Navigation />
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
      <Navigation />
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

        <style jsx>{`
          .register-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            padding: 2rem 1rem;
          }

          .register-card {
            background: white;
            border-radius: 1rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
            width: 100%;
            max-width: 500px;
            overflow: hidden;
          }

          .register-header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 2rem;
            text-align: center;
          }

          .register-logo {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 4rem;
            height: 4rem;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            margin-bottom: 1rem;
          }

          .register-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin: 0 0 0.5rem 0;
          }

          .register-subtitle {
            font-size: 1rem;
            opacity: 0.9;
            margin: 0;
          }

          .register-form {
            padding: 2rem;
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 1rem;
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

          .password-toggle {
            position: absolute;
            right: 0.75rem;
            background: none;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            padding: 0.25rem;
            z-index: 1;
          }

          .password-toggle:hover {
            color: #6b7280;
          }

          .error-message {
            display: block;
            font-size: 0.75rem;
            color: #ef4444;
            margin-top: 0.25rem;
          }

          .alert {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1rem;
          }

          .alert-error {
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
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

          .btn-secondary:hover:not(:disabled) {
            background: #e5e7eb;
            transform: translateY(-1px);
            box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
          }

          /* Popup styles */
          .popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 1rem;
            animation: fadeInOverlay 0.3s ease-out;
          }

          @keyframes fadeInOverlay {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .popup-container {
            background: white;
            border-radius: 1rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            width: 100%;
            max-width: 400px;
            position: relative;
            animation: slideInPopup 0.3s ease-out;
          }

          @keyframes slideInPopup {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(-20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          .popup-close {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 0.25rem;
            transition: all 0.2s;
            z-index: 1;
          }

          .popup-close:hover {
            color: #6b7280;
            background: #f3f4f6;
          }

          .popup-content {
            text-align: center;
            padding: 2rem;
          }

          .popup-icon {
            display: flex;
            justify-content: center;
            margin-bottom: 1.5rem;
          }

          .popup-icon svg {
            color: #10b981;
          }

          .popup-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 1rem 0;
          }

          .popup-message {
            color: #6b7280;
            line-height: 1.6;
            margin: 0 0 2rem 0;
            font-size: 0.95rem;
          }

          .popup-actions {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
            flex-wrap: wrap;
          }

          .popup-actions .btn {
            min-width: 120px;
          }

          /* Responsive pour le popup */
          @media (max-width: 640px) {
            .popup-container {
              margin: 1rem;
              max-width: none;
            }

            .popup-content {
              padding: 1.5rem;
            }

            .popup-actions {
              flex-direction: column;
            }

            .popup-actions .btn {
              min-width: auto;
              width: 100%;
            }

            .popup-title {
              font-size: 1.25rem;
            }
          }

          /* Mode sombre pour le popup */
          @media (prefers-color-scheme: dark) {
            .popup-container {
              background: #1f2937;
            }

            .popup-title {
              color: #f9fafb;
            }

            .popup-message {
              color: #d1d5db;
            }

            .popup-close {
              color: #9ca3af;
            }

            .popup-close:hover {
              color: #d1d5db;
              background: #374151;
            }
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
            margin-top: 1.5rem;
            padding-top: 1rem;
            border-top: 1px solid #e5e7eb;
          }

          .form-footer p {
            margin: 0;
            color: #6b7280;
            font-size: 0.875rem;
          }

          .link {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s;
          }

          .link:hover {
            color: #1d4ed8;
            text-decoration: underline;
          }

          .success-message {
            text-align: center;
            padding: 2rem;
          }

          .success-icon {
            color: #10b981;
            margin: 0 auto 1rem auto;
          }

          .success-message h2 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 1rem 0;
          }

          .success-message p {
            color: #6b7280;
            line-height: 1.6;
            margin: 0 0 2rem 0;
          }

          /* Responsive design */
          @media (max-width: 640px) {
            .register-container {
              padding: 1rem;
            }

            .register-card {
              margin: 0;
            }

            .register-header {
              padding: 1.5rem;
            }

            .register-form {
              padding: 1.5rem;
            }

            .form-row {
              grid-template-columns: 1fr;
              gap: 0;
            }

            .register-title {
              font-size: 1.25rem;
            }

            .btn {
              padding: 1rem 1.5rem;
            }
          }

          /* Focus states pour l'accessibilité */
          .form-input:focus,
          .btn:focus {
            outline: none;
          }

          .form-input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .btn:focus {
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
          }

          /* Animation pour les erreurs */
          .error-message {
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

          /* Animation pour l'alerte */
          .alert {
            animation: fadeIn 0.3s ease-out;
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

          /* États désactivés */
          .form-input:disabled {
            background-color: #f9fafb;
            color: #9ca3af;
            cursor: not-allowed;
          }

          /* Amélioration des transitions */
          .form-input,
          .btn,
          .password-toggle,
          .link {
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }

          /* Mode sombre (optionnel) */
          @media (prefers-color-scheme: dark) {
            .register-card {
              background: #1f2937;
              color: #f9fafb;
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

            .input-icon,
            .password-toggle {
              color: #9ca3af;
            }

            .form-footer p {
              color: #9ca3af;
            }

            .success-message h2 {
              color: #f9fafb;
            }

            .success-message p {
              color: #d1d5db;
            }
          }

          /* Améliorations pour l'impression */
          @media print {
            .register-container {
              background: white;
            }

            .register-header {
              background: none;
              color: black;
            }

            .btn,
            .password-toggle {
              display: none;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default UserRegisterForm;
