import React, { useEffect, useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChefHat,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import "./LoginPage.css";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation.jsx";
import useAuthStore from "../store/authStore.js";




const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localErrors, setLocalErrors] = useState({});

  const navigate = useNavigate();

  // Zustand store
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const getUserType = useAuthStore((state) => state.getUserType);
  const clearError = useAuthStore((state) => state.clearError);
  const getHasFranchise = useAuthStore((state) => state.getHasFranchise);

  
  useEffect(() => {
    if (isAuthenticated) {
      const userType = getUserType();
      const has_franchise = getHasFranchise();

      if (userType === "admin") {
        navigate("/admin/dashboard");
      } else if (userType === "franchise") {
        navigate(has_franchise ? '/franchise/dashboard' : '/devenir-franchise');
      }
    }
  }, [isAuthenticated, navigate, getUserType, getHasFranchise]);

  const handleInputChange = (e) => {
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

    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";
    }

    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit intercepté ✅");
    e.stopPropagation();

    if (!validateForm()) return;

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        console.log("Connexion réussie !", result.user);

      }
    } catch (err) {
      console.error("Erreur de connexion:", err);
    }
  };

  if (isAuthenticated) {
    return (
      <>
        <Navigation />
        <div className="login-container">
          <div className="login-card">
            <div className="alert alert-success">
              <Loader2 className="spinning" size={20} />
              <span>Connecté ! Redirection en cours...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="login-logo">
                <ChefHat size={32} />
              </div>
              <h1 className="login-title">DRIV'N COOK</h1>
            </Link>
            <p className="login-subtitle">Connectez-vous à votre compte</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {(error?.message || error?.detail || localErrors.general) && (
              <div className="alert alert-error">
                <AlertCircle size={20} />
                <span>
                  {error?.detail || error?.message || localErrors.general}
                </span>
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
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-input ${
                    localErrors.email || error?.email ? "error" : ""
                  }`}
                  placeholder="votre@email.com"
                  disabled={isLoading}
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
                Mot de passe <span className="required">*</span>
              </label>
              <div className="input-group">
                <Lock className="input-icon" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`form-input ${
                    localErrors.password || error?.password ? "error" : ""
                  }`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
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

            <div className="forgot-password">
              <Link to="/forgot-password" className="link">
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="btn-icon spinning" size={20} />
                  Connexion...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="btn-icon" size={20} />
                </>
              )}
            </button>
          </form>

          <div className="form-footer">
            <p>
              Pas encore de compte ?{" "}
              <Link to="/register" className="link">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;