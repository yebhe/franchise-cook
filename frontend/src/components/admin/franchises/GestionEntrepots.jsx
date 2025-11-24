// components/admin/entrepots/GestionEntrepots.jsx - VERSION FINALE 80/20
import React, { useEffect, useState, useRef } from "react";
import {
  Warehouse,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Phone,
  User,
  MapPin,
  CheckCircle,
  Truck,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../api/axiosConfig";
import useAuthStore from "../../../store/authStore";
import "./GestionEntrepots.css";

const initialForm = {
  nom_entrepot: "",
  adresse: "",
  ville: "",
  code_postal: "",
  telephone: "",
  responsable: "",
  statut: "actif",
  type_entrepot: "drivn_cook",
};

const TYPE_ENTREPOT_OPTIONS = [
  {
    value: "drivn_cook",
    label: "Entrepôt Driv'n Cook (80% obligatoire)",
    icon: Warehouse,
    color: "green",
  },
  {
    value: "fournisseur_libre",
    label: "Fournisseur libre (20% maximum)",
    icon: Truck,
    color: "orange",
  },
];

export default function GestionEntrepots() {
  const [entrepots, setEntrepots] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showForm, setShowForm] = useState(false);

  // États pour Google Maps
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [addressValidated, setAddressValidated] = useState(false);
  const [validationLoading, setValidationLoading] = useState(false);

  const autocompleteRef = useRef(null);
  const addressInputRef = useRef(null);

  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userType = useAuthStore((state) => state.getUserType());

  // Vérification des permissions
  useEffect(() => {
    if (!isAuthenticated || userType !== "admin") {
      navigate("/");
    }
  }, [isAuthenticated, userType, navigate]);

  // Charger Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsGoogleMapsLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCUyOh-xB1lhs4IUvGOL2l31v1GfxBsMIE&libraries=places&language=fr&region=FR`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsGoogleMapsLoaded(true);
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialiser l'autocomplétion Google Places
  useEffect(() => {
    if (isGoogleMapsLoaded && addressInputRef.current && showForm) {
      // Nettoyer l'ancienne instance
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current
        );
      }

      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          componentRestrictions: { country: "fr" },
          fields: ["formatted_address", "address_components", "geometry"],
          types: ["address"],
        }
      );

      autocompleteRef.current.addListener("place_changed", () => {
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
    let ville = "";
    let codePostal = "";
    let adresse = place.formatted_address || "";

    components.forEach((component) => {
      const types = component.types;
      if (types.includes("locality")) {
        ville = component.long_name;
      } else if (types.includes("postal_code")) {
        codePostal = component.long_name;
      }
    });

    setForm((prev) => ({
      ...prev,
      adresse,
      ville,
      code_postal: codePostal,
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
            region: "fr",
          },
          (results, status) => {
            if (status === "OK" && results[0]) {
              resolve(results[0]);
            } else {
              reject(new Error("Adresse non trouvée"));
            }
          }
        );
      });

      setAddressValidated(true);
      setMessage("Adresse validée avec succès !");
    } catch (err) {
      setError("Impossible de valider cette adresse");
      setAddressValidated(false);
    } finally {
      setValidationLoading(false);
    }
  };

  // Charger les données
  const fetchEntrepots = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("api/entrepots/");
      setEntrepots(response.data);
    } catch (err) {
      setError("Erreur lors du chargement des entrepôts");
      setEntrepots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntrepots();
  }, []);

  // Utilitaires
  const getTypeEntrepotInfo = (type) => {
    return (
      TYPE_ENTREPOT_OPTIONS.find((option) => option.value === type) ||
      TYPE_ENTREPOT_OPTIONS[0]
    );
  };

  const getEntrepotStats = () => {
    const drivnCookCount = entrepots.filter(
      (e) => e.type_entrepot === "drivn_cook" && e.statut === "actif"
    ).length;
    const fournisseurLibreCount = entrepots.filter(
      (e) => e.type_entrepot === "fournisseur_libre" && e.statut === "actif"
    ).length;

    return { drivnCookCount, fournisseurLibreCount };
  };

  // Gestion formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Reset validation si l'adresse change
    if (name === "adresse" || name === "ville" || name === "code_postal") {
      setAddressValidated(false);
    }
  };

  // Soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (editingId) {
        await apiClient.put(`api/entrepots/${editingId}/`, form);
        setMessage("Entrepôt modifié avec succès !");
      } else {
        await apiClient.post("api/entrepots/", form);
        setMessage("Entrepôt créé avec succès !");
      }

      setForm(initialForm);
      setEditingId(null);
      setShowForm(false);
      setAddressValidated(false);
      fetchEntrepots();
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Erreur lors de l'opération");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // Modification
  const handleEdit = (entrepot) => {
    setForm({
      nom_entrepot: entrepot.nom_entrepot || "",
      adresse: entrepot.adresse || "",
      ville: entrepot.ville || "",
      code_postal: entrepot.code_postal || "",
      telephone: entrepot.telephone || "",
      responsable: entrepot.responsable || "",
      statut: entrepot.statut || "actif",
      type_entrepot: entrepot.type_entrepot || "drivn_cook",
    });
    setEditingId(entrepot.id);
    setShowForm(true);
    setAddressValidated(true);
  };

  // Suppression
  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet entrepôt ?"))
      return;

    try {
      await apiClient.delete(`api/entrepots/${id}/`);
      setMessage("Entrepôt supprimé avec succès");
      fetchEntrepots();
    } catch (err) {
      setError("Erreur lors de la suppression");
    }
  };

  // Filtrage
  const filteredEntrepots = entrepots.filter((entrepot) => {
    if (!entrepot) return false;

    const matchesSearch =
      (entrepot.nom_entrepot || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (entrepot.ville || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entrepot.responsable || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "" || entrepot.statut === statusFilter;
    const matchesType =
      typeFilter === "" || entrepot.type_entrepot === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Reset form
  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
    setAddressValidated(false);
  };

  const stats = getEntrepotStats();

  return (
    <div className="gestion-entrepots__container">
      {/* Header */}
      <div className="gestion-entrepots__header">
        <div className="gestion-entrepots__header-content">
          <div className="gestion-entrepots__title-section">
            <h1 className="gestion-entrepots__title">
              <Warehouse className="gestion-entrepots__title-icon" size={32} />
              Gestion des Entrepôts
            </h1>
            <p className="gestion-entrepots__subtitle">
              Gérer les entrepôts Driv'n Cook et fournisseurs libres pour la
              règle 80/20
            </p>
          </div>
          <button
            className="gestion-entrepots__btn gestion-entrepots__btn--primary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={20} />
            Nouvel entrepôt
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="gestion-entrepots__stats">
        <div className="gestion-entrepots__stat-card gestion-entrepots__stat-card--drivn">
          <div className="gestion-entrepots__stat-icon">
            <Warehouse size={24} />
          </div>
          <div className="gestion-entrepots__stat-content">
            <div className="gestion-entrepots__stat-number">
              {stats.drivnCookCount}
            </div>
            <div className="gestion-entrepots__stat-label">
              Entrepôts Driv'n Cook
            </div>
            <div className="gestion-entrepots__stat-sublabel">
              80% obligatoire
            </div>
          </div>
        </div>

        <div className="gestion-entrepots__stat-card gestion-entrepots__stat-card--libre">
          <div className="gestion-entrepots__stat-icon">
            <Truck size={24} />
          </div>
          <div className="gestion-entrepots__stat-content">
            <div className="gestion-entrepots__stat-number">
              {stats.fournisseurLibreCount}
            </div>
            <div className="gestion-entrepots__stat-label">
              Fournisseurs libres
            </div>
            <div className="gestion-entrepots__stat-sublabel">20% maximum</div>
          </div>
        </div>
      </div>

      {/* Explication de la règle 80/20 */}
      <div className="gestion-entrepots__info-banner">
        <Info size={20} />
        <div>
          <strong>Règle 80/20 :</strong> Les franchisés doivent acheter 80%
          minimum de leur montant total dans les entrepôts Driv'n Cook, et
          maximum 20% chez les fournisseurs libres.
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="gestion-entrepots__alert gestion-entrepots__alert--error">
          {error}
        </div>
      )}
      {message && (
        <div className="gestion-entrepots__alert gestion-entrepots__alert--success">
          {message}
        </div>
      )}

      {/* Filtres et recherche */}
      <div className="gestion-entrepots__filters">
        <div className="gestion-entrepots__search">
          <Search className="gestion-entrepots__search-icon" size={20} />
          <input
            type="text"
            placeholder="Rechercher par nom, ville ou responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="gestion-entrepots__search-input"
          />
        </div>

        <div className="gestion-entrepots__filter">
          <Filter className="gestion-entrepots__filter-icon" size={20} />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="gestion-entrepots__filter-select"
          >
            <option value="">Tous les types</option>
            <option value="drivn_cook">Entrepôts Driv'n Cook</option>
            <option value="fournisseur_libre">Fournisseurs libres</option>
          </select>
        </div>

        <div className="gestion-entrepots__filter">
          <Filter className="gestion-entrepots__filter-icon" size={20} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="gestion-entrepots__filter-select"
          >
            <option value="">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="maintenance">Maintenance</option>
            <option value="ferme">Fermé</option>
          </select>
        </div>
      </div>

      {/* Liste des entrepôts */}
      <div className="gestion-entrepots__content">
        <div className="gestion-entrepots__list-section">
          <div className="gestion-entrepots__card">
            <div className="gestion-entrepots__card-header">
              <h3 className="gestion-entrepots__card-title">
                Liste des entrepôts ({filteredEntrepots.length})
              </h3>
            </div>

            {loading ? (
              <div className="gestion-entrepots__loading">
                <div className="gestion-entrepots__spinner"></div>
                <p>Chargement des entrepôts...</p>
              </div>
            ) : (
              <div className="gestion-entrepots__table-container">
                <table className="gestion-entrepots__table">
                  <thead>
                    <tr>
                      <th>Entrepôt</th>
                      <th>Type</th>
                      <th>Responsable</th>
                      <th>Localisation</th>
                      <th>Contact</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntrepots.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="gestion-entrepots__empty">
                          {entrepots.length === 0
                            ? "Aucun entrepôt enregistré"
                            : "Aucun entrepôt trouvé"}
                        </td>
                      </tr>
                    ) : (
                      filteredEntrepots.map((entrepot, i) => {
                        const typeInfo = getTypeEntrepotInfo(
                          entrepot.type_entrepot
                        );
                        const TypeIcon = typeInfo.icon;

                        return (
                          <tr
                            key={entrepot.id}
                            className="gestion-entrepots__table-row"
                          >
                            <td>
                              <div className="gestion-entrepots__entrepot-info">
                                <strong>{entrepot.nom_entrepot}</strong>
                                <span className="gestion-entrepots__entrepot-id">
                                  N°{i + 1}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div
                                className={`gestion-entrepots__type-badge gestion-entrepots__type-badge--${typeInfo.color}`}
                              >
                                <TypeIcon size={16} />
                                <span>
                                  {entrepot.type_entrepot === "drivn_cook"
                                    ? "Driv'n Cook"
                                    : "Fournisseur libre"}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="gestion-entrepots__responsable-info">
                                <span>
                                  {entrepot.responsable || "Non assigné"}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="gestion-entrepots__location">
                                <span>{entrepot.ville || "N/A"}</span>
                                <span className="gestion-entrepots__postal">
                                  {entrepot.code_postal || "N/A"}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="gestion-entrepots__contact">
                                <span>{entrepot.telephone || "N/A"}</span>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`gestion-entrepots__badge gestion-entrepots__badge--${entrepot.statut}`}
                              >
                                {entrepot.statut?.charAt(0).toUpperCase() +
                                  entrepot.statut?.slice(1)}
                              </span>
                            </td>
                            <td>
                              <div className="gestion-entrepots__actions">
                                <button
                                  className="gestion-entrepots__action-btn gestion-entrepots__action-btn--edit"
                                  onClick={() => handleEdit(entrepot)}
                                  title="Modifier"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  className="gestion-entrepots__action-btn gestion-entrepots__action-btn--delete"
                                  onClick={() => handleDelete(entrepot.id)}
                                  title="Supprimer"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Formulaire modal */}
        {showForm && (
          <div className="gestion-entrepots__modal-overlay" onClick={resetForm}>
            <div
              className="gestion-entrepots__modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="gestion-entrepots__modal-header">
                <h3>{editingId ? "Modifier" : "Créer"} un entrepôt</h3>
                <button
                  className="gestion-entrepots__modal-close"
                  onClick={resetForm}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="gestion-entrepots__form">
                <div className="gestion-entrepots__form-group">
                  <label htmlFor="nom_entrepot">Nom de l'entrepôt *</label>
                  <input
                    type="text"
                    id="nom_entrepot"
                    name="nom_entrepot"
                    value={form.nom_entrepot}
                    onChange={handleChange}
                    required
                    className="gestion-entrepots__input"
                    placeholder="Ex: Entrepôt DRIV'N COOK Paris Nord"
                  />
                </div>

                {/* Type d'entrepôt */}
                <div className="gestion-entrepots__form-group">
                  <label htmlFor="type_entrepot">Type d'entrepôt *</label>
                  <div className="gestion-entrepots__type-options">
                    {TYPE_ENTREPOT_OPTIONS.map((option) => {
                      const OptionIcon = option.icon;
                      return (
                        <label
                          key={option.value}
                          className={`gestion-entrepots__type-option ${
                            form.type_entrepot === option.value
                              ? "gestion-entrepots__type-option--selected"
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="type_entrepot"
                            value={option.value}
                            checked={form.type_entrepot === option.value}
                            onChange={handleChange}
                            className="gestion-entrepots__radio"
                          />
                          <div
                            className={`gestion-entrepots__type-content gestion-entrepots__type-content--${option.color}`}
                          >
                            <OptionIcon size={20} />
                            <span>{option.label}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Notice selon le type */}
                <div
                  className={`gestion-entrepots__notice gestion-entrepots__notice--${
                    form.type_entrepot === "drivn_cook" ? "green" : "orange"
                  }`}
                >
                  <div className="gestion-entrepots__notice-icon">
                    {form.type_entrepot === "drivn_cook" ? "🏭" : "🚛"}
                  </div>
                  <div className="gestion-entrepots__notice-text">
                    <strong>
                      {form.type_entrepot === "drivn_cook"
                        ? "Entrepôt Driv'n Cook :"
                        : "Fournisseur libre :"}
                    </strong>
                    <p>
                      {form.type_entrepot === "drivn_cook"
                        ? "Les franchisés doivent acheter au minimum 80% de leur montant total dans ces entrepôts."
                        : "Les franchisés peuvent acheter maximum 20% de leur montant total chez ces fournisseurs."}
                    </p>
                  </div>
                </div>

                {/* Adresse avec validation Google Maps */}
                <div className="gestion-entrepots__form-group">
                  <label htmlFor="adresse">
                    Adresse complète *
                    {isGoogleMapsLoaded && (
                      <span className="gestion-entrepots__maps-badge">
                        Google Maps
                      </span>
                    )}
                  </label>
                  <div className="gestion-entrepots__address-group">
                    <div className="gestion-entrepots__address-wrapper">
                      <MapPin
                        className="gestion-entrepots__address-icon"
                        size={16}
                      />
                      <input
                        ref={addressInputRef}
                        type="text"
                        id="adresse"
                        name="adresse"
                        value={form.adresse}
                        onChange={handleChange}
                        required
                        className={`gestion-entrepots__input gestion-entrepots__input--with-icon ${
                          addressValidated
                            ? "gestion-entrepots__input--validated"
                            : ""
                        }`}
                        placeholder="Commencez à taper l'adresse..."
                      />
                      {addressValidated && (
                        <CheckCircle
                          className="gestion-entrepots__address-check"
                          size={16}
                        />
                      )}
                    </div>
                    {isGoogleMapsLoaded &&
                      form.adresse &&
                      !addressValidated && (
                        <button
                          type="button"
                          onClick={validateAddress}
                          disabled={validationLoading}
                          className="gestion-entrepots__btn gestion-entrepots__btn--outline gestion-entrepots__btn--small"
                        >
                          {validationLoading ? "Validation..." : "Valider"}
                        </button>
                      )}
                  </div>
                </div>

                <div className="gestion-entrepots__form-row">
                  <div className="gestion-entrepots__form-group">
                    <label htmlFor="ville">Ville *</label>
                    <input
                      type="text"
                      id="ville"
                      name="ville"
                      value={form.ville}
                      onChange={handleChange}
                      required
                      className="gestion-entrepots__input"
                      placeholder="Paris"
                    />
                  </div>
                  <div className="gestion-entrepots__form-group">
                    <label htmlFor="code_postal">Code postal *</label>
                    <input
                      type="text"
                      id="code_postal"
                      name="code_postal"
                      value={form.code_postal}
                      onChange={handleChange}
                      required
                      pattern="\d{5}"
                      maxLength={5}
                      className="gestion-entrepots__input"
                      placeholder="75001"
                    />
                  </div>
                </div>

                <div className="gestion-entrepots__form-row">
                  <div className="gestion-entrepots__form-group">
                    <label htmlFor="responsable">Responsable</label>
                    <div className="gestion-entrepots__input-wrapper">
                      <User
                        className="gestion-entrepots__input-icon"
                        size={16}
                      />
                      <input
                        type="text"
                        id="responsable"
                        name="responsable"
                        value={form.responsable}
                        onChange={handleChange}
                        className="gestion-entrepots__input gestion-entrepots__input--with-icon"
                        placeholder="Nom du responsable"
                      />
                    </div>
                  </div>
                  <div className="gestion-entrepots__form-group">
                    <label htmlFor="telephone">Téléphone</label>
                    <div className="gestion-entrepots__input-wrapper">
                      <Phone
                        className="gestion-entrepots__input-icon"
                        size={16}
                      />
                      <input
                        type="tel"
                        id="telephone"
                        name="telephone"
                        value={form.telephone}
                        onChange={handleChange}
                        className="gestion-entrepots__input gestion-entrepots__input--with-icon"
                        placeholder="01 23 45 67 89"
                      />
                    </div>
                  </div>
                </div>

                <div className="gestion-entrepots__form-group">
                  <label htmlFor="statut">Statut *</label>
                  <select
                    id="statut"
                    name="statut"
                    value={form.statut}
                    onChange={handleChange}
                    required
                    className="gestion-entrepots__select"
                  >
                    <option value="actif">Actif</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="ferme">Fermé</option>
                  </select>
                </div>

                <div className="gestion-entrepots__form-actions">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="gestion-entrepots__btn gestion-entrepots__btn--secondary"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={
                      submitLoading || (!addressValidated && form.adresse)
                    }
                    className="gestion-entrepots__btn gestion-entrepots__btn--primary"
                  >
                    {submitLoading ? (
                      <>
                        <div className="gestion-entrepots__spinner gestion-entrepots__spinner--small"></div>
                        {editingId ? "Modification..." : "Création..."}
                      </>
                    ) : editingId ? (
                      "Modifier"
                    ) : (
                      "Créer"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
