import React, { useEffect, useState } from "react";
import { Tag, Plus, Edit, Trash2, Search } from "lucide-react";
import "./GestionCategories.css";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../../store/authStore";
import apiClient from "../../../../api/axiosConfig";

const initialForm = {
  nom_categorie: "",
  description: "",
};

export default function GestionCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userType = useAuthStore((state) => state.getUserType());

  // Vérification des permissions
  useEffect(() => {
    if (!isAuthenticated || userType !== "admin") {
      navigate("/");
    }
  }, [isAuthenticated, userType, navigate]);

  // Charger les données
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("api/categories/");
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError("Erreur lors du chargement des catégories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Gestion formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (editingId) {
        await apiClient.put(`api/categories/${editingId}/`, form);
        setMessage("Catégorie modifiée avec succès !");
      } else {
        await apiClient.post("api/categories/", form);
        setMessage("Catégorie créée avec succès !");
      }

      setForm(initialForm);
      setEditingId(null);
      setShowForm(false);
      fetchCategories();
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
  const handleEdit = (categorie) => {
    setForm({
      nom_categorie: categorie.nom_categorie || "",
      description: categorie.description || "",
    });
    setEditingId(categorie.id);
    setShowForm(true);
  };

  // Suppression
  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?"))
      return;

    try {
      await apiClient.delete(`api/categories/${id}/`);
      setMessage("Catégorie supprimée avec succès");
      fetchCategories();
    } catch (err) {
      setError("Erreur lors de la suppression");
    }
  };

  // Filtrage
  const filteredCategories = (categories || []).filter((categorie) => {
    if (!categorie) return false;

    const matchesSearch =
      (categorie.nom_categorie || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (categorie.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Reset form
  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="gestion-categories__container">
      {/* Header */}
      <div className="gestion-categories__header">
        <div className="gestion-categories__header-content">
          <div className="gestion-categories__title-section">
            <h1 className="gestion-categories__title">
              <Tag className="gestion-categories__title-icon" size={32} />
              Catégories de Produits
            </h1>
            <p className="gestion-categories__subtitle">
              Gérer les catégories : ingrédients, plats préparés, boissons
            </p>
          </div>
          <button
            className="gestion-categories__btn gestion-categories__btn--primary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={20} />
            Nouvelle catégorie
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="gestion-categories__alert gestion-categories__alert--error">
          {error}
        </div>
      )}
      {message && (
        <div className="gestion-categories__alert gestion-categories__alert--success">
          {message}
        </div>
      )}

      {/* Recherche */}
      <div className="gestion-categories__filters">
        <div className="gestion-categories__search">
          <Search className="gestion-categories__search-icon" size={20} />
          <input
            type="text"
            placeholder="Rechercher par nom ou description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="gestion-categories__search-input"
          />
        </div>
      </div>

      {/* Liste des catégories */}
      <div className="gestion-categories__content">
        <div className="gestion-categories__list-section">
          <div className="gestion-categories__card">
            <div className="gestion-categories__card-header">
              <h3 className="gestion-categories__card-title">
                Catégories de produits ({filteredCategories.length})
              </h3>
            </div>

            {loading ? (
              <div className="gestion-categories__loading">
                <div className="gestion-categories__spinner"></div>
                <p>Chargement des catégories...</p>
              </div>
            ) : (
              <div className="gestion-categories__table-container">
                <table className="gestion-categories__table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="gestion-categories__empty">
                          {(categories || []).length === 0
                            ? "Aucune catégorie enregistrée"
                            : "Aucune catégorie trouvée"}
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((categorie, i) => (
                        <tr
                          key={categorie.id}
                          className="gestion-categories__table-row"
                        >
                          <td>
                            <div className="gestion-categories__nom">
                              <strong>{categorie.nom_categorie}</strong>
                            </div>
                          </td>
                          <td>
                            <div className="gestion-categories__description">
                              {categorie.description || "Aucune description"}
                            </div>
                          </td>
                          <td>
                            <div className="gestion-categories__actions">
                              <button
                                className="gestion-categories__action-btn gestion-categories__action-btn--edit"
                                onClick={() => handleEdit(categorie)}
                                title="Modifier"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="gestion-categories__action-btn gestion-categories__action-btn--delete"
                                onClick={() => handleDelete(categorie.id)}
                                title="Supprimer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Formulaire modal */}
        {showForm && (
          <div
            className="gestion-categories__modal-overlay"
            onClick={resetForm}
          >
            <div
              className="gestion-categories__modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="gestion-categories__modal-header">
                <h3>{editingId ? "Modifier" : "Créer"} une catégorie</h3>
                <button
                  className="gestion-categories__modal-close"
                  onClick={resetForm}
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="gestion-categories__form"
              >
                <div className="gestion-categories__form-group">
                  <label htmlFor="nom_categorie">Nom de la catégorie *</label>
                  <input
                    type="text"
                    id="nom_categorie"
                    name="nom_categorie"
                    value={form.nom_categorie}
                    onChange={handleChange}
                    required
                    className="gestion-categories__input"
                    placeholder="Ex: Ingrédients, Plats préparés, Boissons"
                  />
                </div>

                <div className="gestion-categories__form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="3"
                    className="gestion-categories__textarea"
                    placeholder="Description de la catégorie..."
                  />
                </div>

                <div className="gestion-categories__form-actions">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="gestion-categories__btn gestion-categories__btn--secondary"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="gestion-categories__btn gestion-categories__btn--primary"
                  >
                    {submitLoading ? (
                      <>
                        <div className="gestion-categories__spinner gestion-categories__spinner--small"></div>
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
