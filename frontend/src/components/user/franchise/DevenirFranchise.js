// components/user/DevenirFranchise.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, 
  CheckCircle, 
  Users, 
  Calendar,
  DollarSign,
  TrendingUp,
  Shield,
  Star,
} from 'lucide-react';
import Navigation from '../../Navigation';
import './DevenirFranchise.css';
import useAuthStore from '../../../store/authStore';
import apiClient from '../../../api/axiosConfig';

const initialForm = {
  nom_franchise: '',
  adresse: '',
  ville: '',
  code_postal: '',
  date_signature: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Dans 7 jours par défaut
};

export default function DevenirFranchise() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // États pour Google Maps
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [addressValidated, setAddressValidated] = useState(false);
  const [validationLoading, setValidationLoading] = useState(false);
  const {getHasFranchise} = useAuthStore();
  
  const has_franchise = getHasFranchise();
  const autocompleteRef = useRef(null);
  const addressInputRef = useRef(null);
  
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Charger Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsGoogleMapsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCUyOh-xB1lhs4IUvGOL2l31v1GfxBsMIE&libraries=places&language=fr&region=FR`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsGoogleMapsLoaded(true);
      script.onerror = () => console.error('Erreur lors du chargement de Google Maps');
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialiser l'autocomplétion Google Places
  useEffect(() => {
    if (isGoogleMapsLoaded && addressInputRef.current && !autocompleteRef.current && showForm) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          componentRestrictions: { country: 'fr' },
          fields: ['formatted_address', 'address_components', 'geometry'],
          types: ['address']
        }
      );

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        if (place && place.address_components) {
          handlePlaceSelect(place);
        }
      });
    }
  }, [isGoogleMapsLoaded, showForm]);

  // Gérer la sélection d'une adresse
  const handlePlaceSelect = (place) => {
    const components = place.address_components;
    let ville = '';
    let codePostal = '';
    let adresse = place.formatted_address || '';

    components.forEach(component => {
      const types = component.types;
      if (types.includes('locality')) {
        ville = component.long_name;
      } else if (types.includes('postal_code')) {
        codePostal = component.long_name;
      }
    });

    setForm(prev => ({
      ...prev,
      adresse,
      ville,
      code_postal: codePostal
    }));

    setAddressValidated(true);
  };

  // Validation manuelle d'adresse
  const validateAddress = async () => {
    if (!form.adresse.trim()) return;
    
    setValidationLoading(true);
    try {
      const geocoder = new window.google.maps.Geocoder();
      await new Promise((resolve, reject) => {
        geocoder.geocode(
          { 
            address: `${form.adresse}, ${form.ville}, ${form.code_postal}, France`,
            region: 'fr'
          },
          (results, status) => {
            if (status === 'OK' && results[0]) {
              resolve(results[0]);
            } else {
              reject(new Error('Adresse non trouvée'));
            }
          }
        );
      });

      setAddressValidated(true);
    } catch (err) {
      setError('Impossible de valider cette adresse');
      setAddressValidated(false);
    } finally {
      setValidationLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Reset validation si l'adresse change
    if (name === 'adresse' || name === 'ville' || name === 'code_postal') {
      setAddressValidated(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // L'utilisateur sera assigné automatiquement côté backend
      await apiClient.post('api/franchises/register/', form);
      setSuccess(true);
      setShowForm(false);
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Erreur lors de la demande de franchise');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
      <Navigation />
      <div className="devenir-franchise">

        <div className="devenir-franchise__container">
          <div className="devenir-franchise__auth-required">
            <h2>Connexion requise</h2>
            <p>Vous devez être connecté pour postuler à une franchise.</p>
          </div>
        </div>
      </div>
      </>
    );
  }

  if (user?.has_franchise) {
    return (
      <>
      <Navigation />
      <div className="devenir-franchise">
        <div className="devenir-franchise__container">
          <div className="devenir-franchise__already-franchisee">
            <CheckCircle className="success-icon" size={48} />
            <h2>Vous êtes déjà franchisé !</h2>
            <p>Vous possédez déjà une franchise DRIV'N COOK.</p>
          </div>
        </div>
      </div>
      </>
    );
  }

  if (success) {
    return (
      <>
      <Navigation />    
      <div className="devenir-franchise">
        <div className="devenir-franchise__container">
          <div className="devenir-franchise__success">
            <CheckCircle className="success-icon" size={64} />
            <h2>Demande envoyée avec succès !</h2>
            <p>Votre demande de franchise a été transmise à notre équipe.</p>
            <p>Vous recevrez une réponse sous 48h.</p>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
    <Navigation />
    <div className="devenir-franchise">
      <div className="devenir-franchise__container">
        
        {/* Hero Section */}
        <div className="devenir-franchise__hero">
          <div className="devenir-franchise__hero-content">
            <h1 className="devenir-franchise__title">
              Rejoignez le réseau DRIV'N COOK
            </h1>
            <p className="devenir-franchise__subtitle">
              Lancez votre propre food truck avec le soutien d'une marque reconnue
            </p>
            
            {!showForm ? (
              <button 
                className="devenir-franchise__cta-btn"
                onClick={() => setShowForm(true)}
              >
                <Users size={20} />
                Devenir franchisé
              </button>
            ) : (
              <button 
                className="devenir-franchise__back-btn"
                onClick={() => setShowForm(false)}
              >
                ← Retour à la présentation
              </button>
            )}
          </div>
          
          {!showForm && (
            <div style={{ padding: '2rem 3rem' }}>
              <p style={{ color: '#374151', fontSize: '1.1rem', margin: 0, lineHeight: '1.6' }}>
                Avec plus de 30 franchisés depuis 2013, DRIV'N COOK vous accompagne dans la création 
                de votre entreprise de restauration mobile. Bénéficiez de notre expertise, 
                de nos fournisseurs et de notre réseau pour réussir votre projet entrepreneurial.
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="devenir-franchise__alert devenir-franchise__alert--error">
            {error}
          </div>
        )}

        {!showForm ? (
          /* Présentation du concept */
          <div className="devenir-franchise__presentation">
            
            {/* Avantages */}
            <div className="devenir-franchise__benefits">
              <h2>Pourquoi rejoindre DRIV'N COOK ?</h2>
              <div className="devenir-franchise__benefits-grid">
                <div className="devenir-franchise__benefit">
                  <Star className="benefit-icon" size={32} />
                  <h3>Marque reconnue</h3>
                  <p>Rejoignez un réseau de plus de 30 franchisés avec une marque établie depuis 2013</p>
                </div>
                <div className="devenir-franchise__benefit">
                  <Shield className="benefit-icon" size={32} />
                  <h3>Accompagnement complet</h3>
                  <p>Formation, support technique et commercial pour assurer votre succès</p>
                </div>
                <div className="devenir-franchise__benefit">
                  <TrendingUp className="benefit-icon" size={32} />
                  <p>Croissance à deux chiffres et expansion continue en Île-de-France</p>
                </div>
              </div>
            </div>

            {/* Investissement */}
            <div className="devenir-franchise__investment">
              <h2>Investissement requis</h2>
              <div className="devenir-franchise__investment-details">
                <div className="devenir-franchise__investment-item">
                  <DollarSign className="investment-icon" size={24} />
                  <div>
                    <h3>Droit d'entrée</h3>
                    <p className="price">50 000 €</p>
                  </div>
                </div>
                <div className="devenir-franchise__investment-item">
                  <TrendingUp className="investment-icon" size={24} />
                  <div>
                    <h3>Redevance</h3>
                    <p className="price">4% du CA</p>
                  </div>
                </div>
              </div>
              <div className="devenir-franchise__investment-note">
                <p><strong>Inclus :</strong> Camion équipé, formation complète, accès aux 4 entrepôts d'Île-de-France</p>
              </div>
            </div>

          </div>
        ) : (
          /* Formulaire d'inscription */
          <div className="devenir-franchise__form-section">
            <div className="devenir-franchise__form-card">
              <h2>Votre demande de franchise</h2>
              <p>Remplissez ce formulaire pour démarrer votre projet avec DRIV'N COOK</p>
              
              <form onSubmit={handleSubmit} className="devenir-franchise__form">
                <div className="devenir-franchise__form-group">
                  <label htmlFor="nom_franchise">Nom de votre future franchise *</label>
                  <input
                    type="text"
                    id="nom_franchise"
                    name="nom_franchise"
                    value={form.nom_franchise}
                    onChange={handleChange}
                    required
                    className="devenir-franchise__input"
                    placeholder="Ex: DRIV'N COOK Paris 15"
                  />
                  <small>Ce nom apparaîtra sur votre camion et dans la communication</small>
                </div>

                {/* Adresse avec autocomplétion Google Maps */}
                <div className="devenir-franchise__form-group">
                  <label htmlFor="adresse">
                    Zone d'implantation souhaitée
                    {isGoogleMapsLoaded && <span className="devenir-franchise__maps-badge">🗺️ Google Maps</span>}
                  </label>
                  <div className="devenir-franchise__address-input-group">
                    <div className="devenir-franchise__address-input-wrapper">
                      <MapPin className="devenir-franchise__address-icon" size={16} />
                      <input
                        ref={addressInputRef}
                        type="text"
                        id="adresse"
                        name="adresse"
                        value={form.adresse}
                        onChange={handleChange}
                        className={`devenir-franchise__input devenir-franchise__input--with-icon ${addressValidated ? 'devenir-franchise__input--validated' : ''}`}
                        placeholder="Commencez à taper l'adresse..."
                      />
                      {addressValidated && (
                        <CheckCircle className="devenir-franchise__address-check" size={16} />
                      )}
                    </div>
                    {isGoogleMapsLoaded && form.adresse && !addressValidated && (
                      <button
                        type="button"
                        onClick={validateAddress}
                        disabled={validationLoading}
                        className="devenir-franchise__btn devenir-franchise__btn--outline devenir-franchise__btn--small"
                      >
                        {validationLoading ? 'Validation...' : 'Valider adresse'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="devenir-franchise__form-row">
                  <div className="devenir-franchise__form-group">
                    <label htmlFor="ville">Ville</label>
                    <input
                      type="text"
                      id="ville"
                      name="ville"
                      value={form.ville}
                      onChange={handleChange}
                      className="devenir-franchise__input"
                      placeholder="Paris"
                    />
                  </div>
                  <div className="devenir-franchise__form-group">
                    <label htmlFor="code_postal">Code postal</label>
                    <input
                      type="text"
                      id="code_postal"
                      name="code_postal"
                      value={form.code_postal}
                      onChange={handleChange}
                      pattern="\d*"
                      maxLength={5}
                      className="devenir-franchise__input"
                      placeholder="75001"
                    />
                  </div>
                </div>

                <div className="devenir-franchise__form-group">
                  <label htmlFor="date_signature">Date de signature souhaitée *</label>
                  <div className="devenir-franchise__date-input-wrapper">
                    <Calendar className="devenir-franchise__date-icon" size={16} />
                    <input
                      type="date"
                      id="date_signature"
                      name="date_signature"
                      value={form.date_signature}
                      onChange={handleChange}
                      required
                      className="devenir-franchise__input devenir-franchise__input--with-icon"
                    />
                  </div>
                  <small>Date souhaitée pour la signature du contrat de franchise (peut être programmée dans le futur)</small>
                </div>

                {/* Engagement financier */}
                <div className="devenir-franchise__engagement-notice">
                  <div className="devenir-franchise__engagement-icon">💰</div>
                  <div className="devenir-franchise__engagement-text">
                    <strong>Engagement financier :</strong>
                    <p>En soumettant cette demande, je confirme comprendre l'engagement de <strong>50 000€</strong> de droit d'entrée et <strong>4%</strong> de redevance sur le chiffre d'affaires.</p>
                  </div>
                </div>

                <div className="devenir-franchise__form-actions">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    className="devenir-franchise__btn devenir-franchise__btn--secondary"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading || (!addressValidated && form.adresse)}
                    className="devenir-franchise__btn devenir-franchise__btn--primary"
                  >
                    {loading ? (
                      <>
                        <div className="devenir-franchise__spinner"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      'Envoyer ma demande'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}