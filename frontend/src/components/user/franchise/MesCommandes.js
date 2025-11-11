// MesCommandes.jsx - VERSION WORKFLOW : Entrepôt → Produits → Panier (sans entrepôt de livraison)
import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  Clock,
  Package,
  AlertTriangle,
  Info,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  MapPin,
  Warehouse,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./MesCommandes.css";
import useAuthStore from "../../../store/authStore";
import apiClient from "../../../api/axiosConfig";
import FranchiseNavigation from "./FranchiseNavigation";

const initialCommandeForm = {
  date_livraison_prevue: "",
  adresse_livraison: "", // 🎯 ADRESSE DE LIVRAISON UNIQUEMENT
  details: [],
};

const initialDetailForm = {
  entrepot_actuel: "", // 🎯 NOUVEAU WORKFLOW : D'abord sélectionner l'entrepôt
  produit: "",
  quantite_commandee: 1,
  prix_unitaire: 0,
};

const STATUT_OPTIONS = [
  { value: "en_attente", label: "En attente", color: "#f59e0b", icon: Clock },
  { value: "validee", label: "Validée", color: "#3b82f6", icon: CheckCircle },
  { value: "preparee", label: "Préparée", color: "#8b5cf6", icon: Package },
  { value: "livree", label: "Livrée", color: "#10b981", icon: CheckCircle },
  { value: "annulee", label: "Annulée", color: "#ef4444", icon: XCircle },
];

export default function MesCommandes() {
  // États principaux
  const [commandes, setCommandes] = useState([]);
  const [entrepots, setEntrepots] = useState([]);
  const [produits, setProduits] = useState([]);
  const [stocks, setStocks] = useState([]);

  // États du formulaire
  const [commandeForm, setCommandeForm] = useState(initialCommandeForm);
  const [detailForm, setDetailForm] = useState(initialDetailForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCommandeId, setSelectedCommandeId] = useState(null);

  // États de l'interface
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [conformiteFilter, setConformiteFilter] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");


  const currentUser = useAuthStore((state) => state.user);


  // Fonctions utilitaires
  const getStatutInfo = (statut) => {
    return (
      STATUT_OPTIONS.find((option) => option.value === statut) ||
      STATUT_OPTIONS[0]
    );
  };

  const getEntrepotNom = (entrepotId) => {
    const entrepot = entrepots.find((e) => e.id === entrepotId);
    return entrepot ? entrepot.nom_entrepot : "Entrepôt inconnu";
  };

  const getEntrepotType = (entrepotId) => {
    const entrepot = entrepots.find((e) => e.id === entrepotId);
    return entrepot ? entrepot.type_entrepot : "unknown";
  };

  const getProduitNom = (produitId) => {
    const produit = produits.find((p) => p.id === produitId);
    return produit ? produit.nom_produit : "Produit inconnu";
  };

  const getStockDisponible = (produitId, entrepotId) => {
    const stock = stocks.find(
      (s) => s.produit === produitId && s.entrepot === entrepotId
    );
    return stock ? stock.quantite_disponible : 0;
  };

  // 🎯 NOUVELLE FONCTION : Obtenir les produits disponibles dans l'entrepôt sélectionné
  const getProduitsDisponiblesDansEntrepot = (entrepotId) => {
    if (!entrepotId) return [];

    const stocksDisponibles = stocks.filter(
      (stock) =>
        stock.entrepot === parseInt(entrepotId) && stock.quantite_disponible > 0
    );

    return stocksDisponibles
      .map((stock) => {
        const produit = produits.find((p) => p.id === stock.produit);
        return produit
          ? { ...produit, stock_disponible: stock.quantite_disponible }
          : null;
      })
      .filter(Boolean);
  };

  // 🎯 FONCTION : Initialiser l'adresse de livraison avec celle de la franchise
  const initialiserAdresseFranchise = () => {
    if (currentUser?.franchise && !commandeForm.adresse_livraison) {
      const adresseComplete = [
        currentUser.franchise.adresse,
        currentUser.franchise.code_postal,
        currentUser.franchise.ville,
      ]
        .filter(Boolean)
        .join(", ");

      setCommandeForm((prev) => ({
        ...prev,
        adresse_livraison: adresseComplete,
      }));
    }
  };

  // Chargement des données
  const fetchMesCommandes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("api_user/mes-commandes/");
      setCommandes(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError("Erreur lors du chargement de vos commandes");
      setCommandes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntrepots = async () => {
    try {
      const response = await apiClient.get("api/entrepots/disponibles/");
      setEntrepots(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Erreur lors du chargement des entrepôts");
    }
  };

  const fetchProduits = async () => {
    try {
      const response = await apiClient.get("api/produits/");
      setProduits(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Erreur lors du chargement des produits");
    }
  };

  const fetchStocks = async () => {
    try {
      const response = await apiClient.get("api/stocks/");
      setStocks(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Erreur lors du chargement des stocks");
    }
  };

  useEffect(() => {
    fetchMesCommandes();
    fetchEntrepots();
    fetchProduits();
    fetchStocks();
  }, []);

  useEffect(() => {
    if (showForm && !editingId) {
      initialiserAdresseFranchise();
    }
  }, [showForm, editingId]);

  useEffect(() => {
    if (commandeForm.details.length > 0) {
      const conformite = calculateConformite80_20(commandeForm.details);

    }
  }, [commandeForm.details, produits, entrepots]);

  // Effacer automatiquement les messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // 🎯 NOUVELLE FONCTION : Calculer la conformité 80/20 multi-entrepôts
  const calculateConformite80_20 = (details) => {

  
  if (!details || details.length === 0) {
    return {
      conforme: true,
      pourcentage_drivn: 0,
      pourcentage_libre: 0,
      message: "Aucun produit",
      entrepots_utilises: [],
    };
  }

  // Vérification que les données sont chargées
  if (produits.length === 0 || entrepots.length === 0) {
    return {
      conforme: true,
      pourcentage_drivn: 0,
      pourcentage_libre: 0,
      message: "Chargement des données...",
      entrepots_utilises: [],
    };
  }

  let montant_drivn_cook = 0;
  let montant_fournisseur_libre = 0;
  const entrepotsUtilises = new Set();

  details.forEach((detail) => {
    const produit = produits.find((p) => p.id === parseInt(detail.produit));
    const entrepot = entrepots.find(
      (e) => e.id === parseInt(detail.entrepot_livraison)
    );



    if (produit && entrepot) {
      const sous_total =
        parseInt(detail.quantite_commandee) *
        parseFloat(detail.prix_unitaire || produit.prix_unitaire);
      entrepotsUtilises.add(entrepot.nom_entrepot);

      if (entrepot.type_entrepot === "drivn_cook") {
        montant_drivn_cook += sous_total;
      } else {
        montant_fournisseur_libre += sous_total;
      }
      
    }
  });

  const montant_total = montant_drivn_cook + montant_fournisseur_libre;

  if (montant_total === 0) {
    return {
      conforme: true,
      pourcentage_drivn: 0,
      pourcentage_libre: 0,
      message: "Montant nul",
      entrepots_utilises: Array.from(entrepotsUtilises),
    };
  }

  const pourcentage_drivn = (montant_drivn_cook / montant_total) * 100;
  const pourcentage_libre = (montant_fournisseur_libre / montant_total) * 100;

  const conforme = pourcentage_drivn >= 80;
  const message = conforme
    ? `✅ Conforme : ${pourcentage_drivn.toFixed(
        1
      )}% Driv'n Cook, ${pourcentage_libre.toFixed(1)}% libre`
    : `❌ Non-conforme : ${pourcentage_drivn.toFixed(
        1
      )}% Driv'n Cook (minimum 80%), ${pourcentage_libre.toFixed(1)}% libre`;


  return {
    conforme,
    pourcentage_drivn,
    pourcentage_libre,
    message,
    montant_total,
    montant_drivn_cook,
    montant_fournisseur_libre,
    entrepots_utilises: Array.from(entrepotsUtilises),
  };
};

  // Gestion du formulaire de commande
  const handleCommandeChange = (e) => {
    const { name, value } = e.target;
    setCommandeForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  // 🎯 NOUVEAU WORKFLOW : Gestion du changement d'entrepôt - reset des produits
  const handleEntrepotChange = (e) => {
    const entrepotId = e.target.value;

    setDetailForm((prev) => ({
      ...prev,
      entrepot_actuel: entrepotId,
      produit: "", // Reset le produit quand on change d'entrepôt
      prix_unitaire: 0,
      quantite_commandee: 1,
    }));
    setError(null);
  };

  // Gestion du changement de produit - mise à jour automatique du prix
  const handleProduitChange = (e) => {
    const produitId = e.target.value;
    let nouveauPrix = 0;

    if (produitId) {
      const produit = produits.find((p) => p.id === parseInt(produitId));
      nouveauPrix = produit ? produit.prix_unitaire : 0;
    }

    setDetailForm((prev) => ({
      ...prev,
      produit: produitId,
      prix_unitaire: nouveauPrix,
      quantite_commandee: produitId ? prev.quantite_commandee : 1,
    }));
    setError(null);
  };

  const handleDetailChange = (e) => {
    const { name, value } = e.target;

    if (name === "entrepot_actuel") {
      handleEntrepotChange(e);
      return;
    }

    if (name === "produit") {
      handleProduitChange(e);
      return;
    }

    setDetailForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🎯 NOUVEAU : Ajouter un détail à la commande (entrepôt_actuel devient entrepot_livraison)
  const ajouterDetail = () => {
    if (
      !detailForm.entrepot_actuel ||
      !detailForm.produit ||
      !detailForm.quantite_commandee
    ) {
      setError("L'entrepôt et tous les champs du produit sont obligatoires");
      return;
    }

    // Vérifier le stock disponible dans l'entrepôt sélectionné
    const stockDisponible = getStockDisponible(
      parseInt(detailForm.produit),
      parseInt(detailForm.entrepot_actuel)
    );
    if (stockDisponible < parseInt(detailForm.quantite_commandee)) {
      setError(
        `Stock insuffisant dans l'entrepôt sélectionné : ${stockDisponible} disponible(s)`
      );
      return;
    }

    // Vérifier les doublons (même produit + même entrepôt dans la commande)
    const existe = commandeForm.details.some(
      (detail) =>
        detail.produit === parseInt(detailForm.produit) &&
        detail.entrepot_livraison === parseInt(detailForm.entrepot_actuel)
    );

    if (existe) {
      setError("Ce produit est déjà commandé depuis cet entrepôt");
      return;
    }

    const nouveauDetail = {
      produit: parseInt(detailForm.produit),
      entrepot_livraison: parseInt(detailForm.entrepot_actuel), // L'entrepôt actuel devient l'entrepôt de livraison
      quantite_commandee: parseInt(detailForm.quantite_commandee),
      prix_unitaire: parseFloat(detailForm.prix_unitaire),
    };

    setCommandeForm((prev) => ({
      ...prev,
      details: [...prev.details, nouveauDetail],
    }));

    // Reset seulement le produit et la quantité, garder l'entrepôt pour faciliter l'ajout
    setDetailForm((prev) => ({
      ...prev,
      produit: "",
      quantite_commandee: 1,
      prix_unitaire: 0,
    }));
    setError(null);
  };

  // Supprimer un détail de la commande
  const supprimerDetail = (index) => {
    setCommandeForm((prev) => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index),
    }));
  };

  // Soumission de la commande
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Vérifier la règle 80/20
      const conformite = calculateConformite80_20(commandeForm.details);

      if (!conformite.conforme) {
        throw new Error(`Règle 80/20 non respectée : ${conformite.message}`);
      }

      if (commandeForm.details.length === 0) {
        throw new Error("La commande doit contenir au moins un produit");
      }

      if (!commandeForm.adresse_livraison?.trim()) {
        throw new Error("L'adresse de livraison est obligatoire");
      }

      const formData = {
        date_livraison_prevue: commandeForm.date_livraison_prevue || null,
        adresse_livraison: commandeForm.adresse_livraison || "",
        details: commandeForm.details,
      };

      if (editingId) {
        await apiClient.put(`api_user/mes-commandes/${editingId}/`, formData);
        setMessage("Votre commande a été modifiée avec succès !");
         await fetchMesCommandes();
      } else {
        await apiClient.post("api_user/mes-commandes/", formData);
        setMessage("Votre commande a été créée avec succès !");
      }

      resetForm();
      fetchMesCommandes();
    } catch (err) {
      console.error("Erreur complète:", err);
      if (err.response?.data) {
        if (err.response.data.__all__) {
          setError(err.response.data.__all__[0]);
        } else if (err.response.data.error) {
          setError(err.response.data.error);
        } else if (typeof err.response.data === "object") {
          const errors = Object.entries(err.response.data)
            .map(
              ([field, messages]) =>
                `${field}: ${
                  Array.isArray(messages) ? messages.join(", ") : messages
                }`
            )
            .join(" | ");
          setError(errors);
        } else {
          setError(err.response.data.toString());
        }
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Erreur lors de l'opération");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // Suppression d'une commande
  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette commande ?"))
      return;

    try {
      await apiClient.delete(`api_user/mes-commandes/${id}/`);
      setMessage("Commande supprimée avec succès");
      fetchMesCommandes();
    } catch (err) {
      setError("Erreur lors de la suppression");
    }
  };

  // Modification d'une commande

  // Modifier la fonction handleEdit
const handleEdit = (commande) => {
  
  const detailsFormatted = (commande.details || []).map((detail) => ({
    produit: detail.produit || detail.produit_id,
    entrepot_livraison: detail.entrepot_livraison || detail.entrepot_livraison_id,
    quantite_commandee: parseInt(detail.quantite_commandee),
    prix_unitaire: parseFloat(detail.prix_unitaire),
  }));


  setCommandeForm({
    date_livraison_prevue: commande.date_livraison_prevue || "",
    adresse_livraison: commande.adresse_livraison || "",
    details: detailsFormatted,
  });
  
  // Reset le formulaire de détail
  setDetailForm(initialDetailForm);
  
  setEditingId(commande.id);
  setShowForm(true);
  setError(null);
  setMessage(null);
  
  // 🎯 FORCER le recalcul après un court délai pour laisser le temps aux données de se mettre à jour
  setTimeout(() => {
    const conformite = calculateConformite80_20(detailsFormatted);

  }, 100);
};

  // Voir les détails d'une commande
  const voirDetails = (commandeId) => {
    setSelectedCommandeId(commandeId);
    setShowDetailModal(true);
  };

  // Reset du formulaire
  const resetForm = () => {
    setCommandeForm(initialCommandeForm);
    setDetailForm(initialDetailForm);
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  // Filtrage des commandes
  const filteredCommandes = (commandes || []).filter((commande) => {
    if (!commande) return false;

    const matchesSearch = (commande.numero_commande || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatut =
      statutFilter === "" || commande.statut === statutFilter;

    let matchesConformite = true;
    if (conformiteFilter !== "") {
      const conformite = commande.respecte_regle_80_20_result;
      matchesConformite =
        conformiteFilter === "true"
          ? conformite?.conforme === true
          : conformite?.conforme === false;
    }

    const matchesDate =
      (!dateDebut || new Date(commande.date_commande) >= new Date(dateDebut)) &&
      (!dateFin || new Date(commande.date_commande) <= new Date(dateFin));

    return matchesSearch && matchesStatut && matchesConformite && matchesDate;
  });

  // Obtenir la commande sélectionnée pour les détails
  const getSelectedCommande = () => {
    return commandes.find((c) => c.id === selectedCommandeId);
  };

  return (
    <div className="franchise-layout">
      <FranchiseNavigation />

      <main className="franchise-main-content">
        <div className="mes-commandes">
          <div className="mes-commandes__container">
            {/* Header */}
            <div className="mes-commandes__header">
              <div className="mes-commandes__header-content">
                <div className="mes-commandes__title-section">
                  <h1 className="mes-commandes__title">
                    <ShoppingCart
                      className="mes-commandes__title-icon"
                      size={32}
                    />
                    Mes Commandes Multi-Entrepôts
                  </h1>
                  <p className="mes-commandes__subtitle">
                    Workflow simple : Entrepôt → Produits → Panier (règle 80/20)
                  </p>
                </div>
                <div className="mes-commandes__header-actions">
                  <button
                    className="mes-commandes__btn mes-commandes__btn--primary"
                    onClick={() => setShowForm(true)}
                  >
                    <Plus size={20} />
                    Nouvelle commande
                  </button>
                </div>
              </div>
            </div>

            {/* Bannière d'information 80/20 */}
            <div className="mes-commandes__info-banner">
              <Info size={20} />
              <div>
                <strong>Workflow simplifié :</strong> Sélectionnez un entrepôt →
                choisissez vos produits → ajoutez au panier. 80% minimum du
                montant total doit provenir des entrepôts Driv'n Cook !
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="mes-commandes__alert mes-commandes__alert--error">
                {error}
              </div>
            )}
            {message && (
              <div className="mes-commandes__alert mes-commandes__alert--success">
                {message}
              </div>
            )}

            {/* Filtres et recherche */}
            <div className="mes-commandes__filters">
              <div className="mes-commandes__search">
                <Search className="mes-commandes__search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par numéro de commande..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mes-commandes__search-input"
                />
              </div>

              <div className="mes-commandes__filters-row">
                <div className="mes-commandes__filter">
                  <Filter className="mes-commandes__filter-icon" size={20} />
                  <select
                    value={statutFilter}
                    onChange={(e) => setStatutFilter(e.target.value)}
                    className="mes-commandes__filter-select"
                  >
                    <option value="">Tous les statuts</option>
                    {STATUT_OPTIONS.map((statut) => (
                      <option key={statut.value} value={statut.value}>
                        {statut.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mes-commandes__filter">
                  <TrendingUp
                    className="mes-commandes__filter-icon"
                    size={20}
                  />
                  <select
                    value={conformiteFilter}
                    onChange={(e) => setConformiteFilter(e.target.value)}
                    className="mes-commandes__filter-select"
                  >
                    <option value="">Toutes (80/20)</option>
                    <option value="true">Conformes (≥80%)</option>
                    <option value="false">Non-conformes (&lt;80%)</option>
                  </select>
                </div>

                <div className="mes-commandes__filter">
                  <Calendar className="mes-commandes__filter-icon" size={20} />
                  <input
                    type="date"
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="mes-commandes__filter-date"
                    placeholder="Date début"
                  />
                </div>

                <div className="mes-commandes__filter">
                  <Calendar className="mes-commandes__filter-icon" size={20} />
                  <input
                    type="date"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    className="mes-commandes__filter-date"
                    placeholder="Date fin"
                  />
                </div>
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="mes-commandes__stats">
              <div className="mes-commandes__stat-card">
                <div className="mes-commandes__stat-icon mes-commandes__stat-icon--total">
                  <ShoppingCart size={24} />
                </div>
                <div className="mes-commandes__stat-content">
                  <span className="mes-commandes__stat-number">
                    {filteredCommandes.length}
                  </span>
                  <span className="mes-commandes__stat-label">
                    Mes Commandes
                  </span>
                </div>
              </div>

              <div className="mes-commandes__stat-card">
                <div className="mes-commandes__stat-icon mes-commandes__stat-icon--conforme">
                  <CheckCircle size={24} />
                </div>
                <div className="mes-commandes__stat-content">
                  <span className="mes-commandes__stat-number">
                    {
                      filteredCommandes.filter(
                        (c) => c.respecte_regle_80_20_result?.conforme
                      ).length
                    }
                  </span>
                  <span className="mes-commandes__stat-label">
                    Conformes 80/20
                  </span>
                </div>
              </div>

              <div className="mes-commandes__stat-card">
                <div className="mes-commandes__stat-icon mes-commandes__stat-icon--entrepots">
                  <Warehouse size={24} />
                </div>
                <div className="mes-commandes__stat-content">
                  <span className="mes-commandes__stat-number">
                    {Math.round(
                      filteredCommandes.reduce(
                        (acc, c) => acc + (c.entrepots_count || 1),
                        0
                      ) / Math.max(filteredCommandes.length, 1)
                    )}
                  </span>
                  <span className="mes-commandes__stat-label">
                    Entrepôts/Commande
                  </span>
                </div>
              </div>

              <div className="mes-commandes__stat-card">
                <div className="mes-commandes__stat-icon mes-commandes__stat-icon--attente">
                  <Clock size={24} />
                </div>
                <div className="mes-commandes__stat-content">
                  <span className="mes-commandes__stat-number">
                    {
                      filteredCommandes.filter((c) => c.statut === "en_attente")
                        .length
                    }
                  </span>
                  <span className="mes-commandes__stat-label">En attente</span>
                </div>
              </div>
            </div>

            {/* Liste des commandes */}
            <div className="mes-commandes__content">
              <div className="mes-commandes__card">
                <div className="mes-commandes__card-header">
                  <h3 className="mes-commandes__card-title">
                    Mes Commandes Multi-Entrepôts ({filteredCommandes.length})
                  </h3>
                </div>

                {loading ? (
                  <div className="mes-commandes__loading">
                    <div className="mes-commandes__spinner"></div>
                    <p>Chargement de vos commandes...</p>
                  </div>
                ) : (
                  <div className="mes-commandes__table-container">
                    <table className="mes-commandes__table">
                      <thead>
                        <tr>
                          <th>N° Commande</th>
                          <th>Date</th>
                          <th>Entrepôts</th>
                          <th>Adresse Livraison</th>
                          <th>Montant</th>
                          <th>Règle 80/20</th>
                          <th>Statut</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCommandes.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="mes-commandes__empty">
                              Aucune commande trouvée
                            </td>
                          </tr>
                        ) : (
                          filteredCommandes.map((commande) => {
                            const statutInfo = getStatutInfo(commande.statut);
                            const IconComponent = statutInfo.icon;
                            const conformite =
                              commande.respecte_regle_80_20_result;

                            return (
                              <tr
                                key={commande.id}
                                className="mes-commandes__table-row"
                              >
                                <td>
                                  <div className="mes-commandes__numero">
                                    <strong>{commande.numero_commande}</strong>
                                  </div>
                                </td>
                                <td>
                                  <div className="mes-commandes__date">
                                    {new Date(
                                      commande.date_commande
                                    ).toLocaleDateString("fr-FR")}
                                  </div>
                                </td>
                                <td>
                                  <div className="mes-commandes__entrepots">
                                    <span className="mes-commandes__entrepots-count">
                                      <Warehouse size={16} />
                                      {commande.entrepots_count ||
                                        commande.entrepots_utilises?.length ||
                                        1}{" "}
                                      entrepôt(s)
                                    </span>
                                    {commande.entrepots_utilises && (
                                      <div className="mes-commandes__entrepots-list">
                                        {commande.entrepots_utilises
                                          .slice(0, 2)
                                          .map((entrepot, idx) => (
                                            <span
                                              key={idx}
                                              className={`mes-commandes__entrepot-badge ${
                                                entrepot.type_entrepot ===
                                                "drivn_cook"
                                                  ? "mes-commandes__entrepot-badge--drivn"
                                                  : "mes-commandes__entrepot-badge--libre"
                                              }`}
                                            >
                                              {entrepot.nom_entrepot}
                                            </span>
                                          ))}
                                        {commande.entrepots_utilises.length >
                                          2 && (
                                          <span className="mes-commandes__entrepot-more">
                                            +
                                            {commande.entrepots_utilises
                                              .length - 2}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <div className="mes-commandes__adresse">
                                    <MapPin size={14} />
                                    <span>
                                      {commande.adresse_livraison_complete ||
                                        commande.adresse_franchise_complete ||
                                        "Adresse franchise"}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <div className="mes-commandes__montant">
                                    <strong>
                                      {parseFloat(
                                        commande.montant_total
                                      ).toFixed(2)}
                                      €
                                    </strong>
                                  </div>
                                </td>
                                <td>
                                  <div className="mes-commandes__conformite">
                                    <span
                                      className={`mes-commandes__conformite-badge ${
                                        conformite?.conforme
                                          ? "mes-commandes__conformite-badge--conforme"
                                          : "mes-commandes__conformite-badge--non-conforme"
                                      }`}
                                    >
                                      {conformite?.conforme ? "✅" : "❌"}{" "}
                                      {parseFloat(
                                        commande.pourcentage_drivn_cook || 0
                                      ).toFixed(1)}
                                      %
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <div className="mes-commandes__statut">
                                    <span
                                      className="mes-commandes__statut-badge"
                                      style={{
                                        backgroundColor: statutInfo.color,
                                      }}
                                    >
                                      <IconComponent size={14} />
                                      {statutInfo.label}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <div className="mes-commandes__actions">
                                    <button
                                      className="mes-commandes__action-btn mes-commandes__action-btn--view"
                                      onClick={() => voirDetails(commande.id)}
                                      title="Voir détails"
                                    >
                                      <Eye size={16} />
                                    </button>

                                    {commande.statut === "en_attente" && (
                                      <>
                                        <button
                                          className="mes-commandes__action-btn mes-commandes__action-btn--edit"
                                          onClick={() => handleEdit(commande)}
                                          title="Modifier"
                                        >
                                          <Edit size={16} />
                                        </button>
                                        <button
                                          className="mes-commandes__action-btn mes-commandes__action-btn--delete"
                                          onClick={() =>
                                            handleDelete(commande.id)
                                          }
                                          title="Supprimer"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </>
                                    )}
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

            {/* Modal Formulaire de commande - WORKFLOW ENTREPÔT → PRODUITS */}
            {showForm && (
              <div className="mes-commandes__modal-overlay" onClick={resetForm}>
                <div
                  className="mes-commandes__modal mes-commandes__modal--large"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mes-commandes__modal-header">
                    <h3>
                      {editingId ? "Modifier" : "Créer"} ma commande
                      multi-entrepôts
                    </h3>
                    <button
                      className="mes-commandes__modal-close"
                      onClick={resetForm}
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="mes-commandes__form">
                    {/* Messages d'erreur et de succès dans le modal */}
                    {error && (
                      <div className="mes-commandes__alert mes-commandes__alert--error">
                        {error}
                      </div>
                    )}
                    {message && (
                      <div className="mes-commandes__alert mes-commandes__alert--success">
                        {message}
                      </div>
                    )}

                    {/* Informations de base */}
                    <div className="mes-commandes__form-section">
                      <h4>Informations générales</h4>
                      <div className="mes-commandes__form-row">
                        <div className="mes-commandes__form-group">
                          <label htmlFor="date_livraison_prevue">
                            Date livraison prévue
                          </label>
                          <input
                            type="date"
                            id="date_livraison_prevue"
                            name="date_livraison_prevue"
                            value={commandeForm.date_livraison_prevue}
                            onChange={handleCommandeChange}
                            className="mes-commandes__input"
                            min={new Date().toISOString().split("T")[0]}
                          />
                        </div>

                        {/* Adresse de livraison simplifiée */}
                        <div className="mes-commandes__form-group">
                          <label htmlFor="adresse_livraison">
                            Adresse de livraison *
                          </label>
                          <input
                            type="text"
                            id="adresse_livraison"
                            name="adresse_livraison"
                            value={commandeForm.adresse_livraison}
                            onChange={handleCommandeChange}
                            className="mes-commandes__input"
                            placeholder="Adresse complète de livraison"
                          />
                          <small className="mes-commandes__info-text">
                            <MapPin size={14} />
                            Adresse par défaut : votre franchise
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Ajouter des produits - WORKFLOW : Entrepôt puis Produits */}
                    <div className="mes-commandes__form-section">
                      <h4>Ajouter des produits</h4>
                      <div className="mes-commandes__info-banner">
                        <Info size={16} />
                        <span>
                          1️⃣ Sélectionnez l'entrepôt → 2️⃣ Choisissez le produit
                          → 3️⃣ Ajoutez au panier
                        </span>
                      </div>

                      <div className="mes-commandes__form-row">
                        {/* ÉTAPE 1 : Sélection de l'entrepôt */}
                        <div className="mes-commandes__form-group">
                          <label htmlFor="entrepot_actuel">1️⃣ Entrepôt *</label>
                          <select
                            id="entrepot_actuel"
                            name="entrepot_actuel"
                            value={detailForm.entrepot_actuel}
                            onChange={handleDetailChange}
                            className="mes-commandes__select"
                          >
                            <option value="">Sélectionner un entrepôt</option>
                            {entrepots.map((entrepot) => (
                              <option key={entrepot.id} value={entrepot.id}>
                                {entrepot.nom_entrepot} -{" "}
                                {entrepot.type_entrepot === "drivn_cook"
                                  ? "Driv'n Cook ✅"
                                  : "Fournisseur libre ⚠️"}
                              </option>
                            ))}
                          </select>
                          <small className="mes-commandes__info-text">
                            <Warehouse size={14} />
                            Choisissez l'entrepôt pour voir ses produits
                            disponibles
                          </small>
                        </div>

                        {/* ÉTAPE 2 : Sélection du produit (seulement si entrepôt sélectionné) */}
                        {detailForm.entrepot_actuel && (
                          <div className="mes-commandes__form-group">
                            <label htmlFor="produit">
                              2️⃣ Produit disponible *
                            </label>
                            <select
                              id="produit"
                              name="produit"
                              value={detailForm.produit}
                              onChange={handleDetailChange}
                              className="mes-commandes__select"
                            >
                              <option value="">Sélectionner un produit</option>
                              {getProduitsDisponiblesDansEntrepot(
                                detailForm.entrepot_actuel
                              ).map((produit) => (
                                <option key={produit.id} value={produit.id}>
                                  {produit.nom_produit} -{" "}
                                  {produit.prix_unitaire}€/{produit.unite}{" "}
                                  (Stock: {produit.stock_disponible})
                                </option>
                              ))}
                            </select>
                            {getProduitsDisponiblesDansEntrepot(
                              detailForm.entrepot_actuel
                            ).length === 0 && (
                              <small className="mes-commandes__warning-text">
                                ⚠️ Aucun produit disponible dans cet entrepôt
                              </small>
                            )}
                          </div>
                        )}

                        {/* ÉTAPE 3 : Quantité et ajout (seulement si produit sélectionné) */}
                        {detailForm.entrepot_actuel && detailForm.produit && (
                          <>
                            <div className="mes-commandes__form-group">
                              <label htmlFor="quantite_commandee">
                                3️⃣ Quantité *
                              </label>
                              <input
                                type="number"
                                id="quantite_commandee"
                                name="quantite_commandee"
                                value={detailForm.quantite_commandee}
                                onChange={handleDetailChange}
                                min="1"
                                max={getStockDisponible(
                                  parseInt(detailForm.produit),
                                  parseInt(detailForm.entrepot_actuel)
                                )}
                                className="mes-commandes__input"
                              />
                              <small className="mes-commandes__stock-info">
                                📦 Stock disponible:{" "}
                                {getStockDisponible(
                                  parseInt(detailForm.produit),
                                  parseInt(detailForm.entrepot_actuel)
                                )}
                              </small>
                            </div>

                            <div className="mes-commandes__form-group">
                              <label htmlFor="prix_unitaire">
                                Prix unitaire
                              </label>
                              <input
                                type="number"
                                id="prix_unitaire"
                                name="prix_unitaire"
                                value={detailForm.prix_unitaire}
                                step="0.01"
                                className="mes-commandes__input"
                                readOnly
                              />
                              <small className="mes-commandes__info-text">
                                💰 Sous-total:{" "}
                                {(
                                  detailForm.quantite_commandee *
                                  detailForm.prix_unitaire
                                ).toFixed(2)}
                                €
                              </small>
                            </div>

                            <div className="mes-commandes__form-group">
                              <button
                                type="button"
                                onClick={ajouterDetail}
                                className="mes-commandes__btn mes-commandes__btn--add"
                                disabled={
                                  !detailForm.entrepot_actuel ||
                                  !detailForm.produit ||
                                  !detailForm.quantite_commandee ||
                                  detailForm.quantite_commandee < 1
                                }
                              >
                                <Plus size={16} />
                                Ajouter au panier
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Messages d'aide */}
                      {!detailForm.entrepot_actuel && (
                        <div className="mes-commandes__help-message">
                          <Info size={16} />
                          <span>
                            Commencez par sélectionner un entrepôt pour voir les
                            produits disponibles
                          </span>
                        </div>
                      )}

                      {detailForm.entrepot_actuel &&
                        !detailForm.produit &&
                        getProduitsDisponiblesDansEntrepot(
                          detailForm.entrepot_actuel
                        ).length > 0 && (
                          <div className="mes-commandes__help-message">
                            <Info size={16} />
                            <span>
                              Sélectionnez un produit disponible dans l'entrepôt{" "}
                              {getEntrepotNom(detailForm.entrepot_actuel)}
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Liste des produits ajoutés */}
                    {commandeForm.details.length > 0 && (
                      <div className="mes-commandes__form-section">
                        <h4>
                          Produits de ma commande ({commandeForm.details.length}
                          )
                        </h4>

                        {/* Vérification de la règle 80/20 en temps réel */}
                        {(() => {
                          const conformite = calculateConformite80_20(
                            commandeForm.details
                          );
                          return (
                            <div
                              className={`mes-commandes__conformite-preview ${
                                conformite.conforme
                                  ? "mes-commandes__conformite-preview--conforme"
                                  : "mes-commandes__conformite-preview--non-conforme"
                              }`}
                            >
                              <div className="mes-commandes__conformite-preview-header">
                                <span className="mes-commandes__conformite-preview-icon">
                                  {conformite.conforme ? "✅" : "❌"}
                                </span>
                                <span className="mes-commandes__conformite-preview-text">
                                  {conformite.message}
                                </span>
                              </div>
                              {conformite.montant_total > 0 && (
                                <div className="mes-commandes__conformite-preview-details">
                                  <span>
                                    Total: {conformite.montant_total.toFixed(2)}
                                    €
                                  </span>
                                  <span>
                                    Entrepôts utilisés:{" "}
                                    {conformite.entrepots_utilises.join(", ")}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        <div className="mes-commandes__details-list">
                          {commandeForm.details.map((detail, index) => {
                            const produit = produits.find(
                              (p) => p.id === detail.produit
                            );
                            const entrepot = entrepots.find(
                              (e) => e.id === detail.entrepot_livraison
                            );
                            const sousTotal =
                              detail.quantite_commandee * detail.prix_unitaire;

                            return (
                              <div
                                key={index}
                                className="mes-commandes__detail-item"
                              >
                                <div className="mes-commandes__detail-content">
                                  <div className="mes-commandes__detail-info">
                                    <strong>{produit?.nom_produit}</strong>
                                    <span className="mes-commandes__detail-entrepot">
                                      <Warehouse size={14} />
                                      {entrepot?.nom_entrepot} (
                                      {entrepot?.type_entrepot === "drivn_cook"
                                        ? "Driv'n Cook"
                                        : "Fournisseur libre"}
                                      )
                                    </span>
                                  </div>
                                  <div className="mes-commandes__detail-quantities">
                                    <span>
                                      {detail.quantite_commandee} ×{" "}
                                      {detail.prix_unitaire}€
                                    </span>
                                    <strong>{sousTotal.toFixed(2)}€</strong>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => supprimerDetail(index)}
                                  className="mes-commandes__detail-remove"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Actions du formulaire */}
                    <div className="mes-commandes__form-actions">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="mes-commandes__btn mes-commandes__btn--secondary"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={
                          submitLoading ||
                          commandeForm.details.length === 0 ||
                          !calculateConformite80_20(commandeForm.details)
                            .conforme
                        }
                        className="mes-commandes__btn mes-commandes__btn--primary"
                      >
                        {submitLoading ? (
                          <>
                            <div className="mes-commandes__spinner mes-commandes__spinner--small"></div>
                            {editingId ? "Modification..." : "Création..."}
                          </>
                        ) : editingId ? (
                          "Modifier ma commande"
                        ) : (
                          "Créer ma commande"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal des détails de commande */}
            {showDetailModal &&
              selectedCommandeId &&
              (() => {
                const commande = getSelectedCommande();
                if (!commande) return null;

                return (
                  <div
                    className="mes-commandes__modal-overlay"
                    onClick={() => setShowDetailModal(false)}
                  >
                    <div
                      className="mes-commandes__modal"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="mes-commandes__modal-header">
                        <h3>
                          Détails de ma commande {commande.numero_commande}
                        </h3>
                        <button
                          className="mes-commandes__modal-close"
                          onClick={() => setShowDetailModal(false)}
                        >
                          <X size={24} />
                        </button>
                      </div>

                      <div className="mes-commandes__detail-view">
                        {/* Informations générales */}
                        <div className="mes-commandes__detail-section">
                          <h4>Informations générales</h4>
                          <div className="mes-commandes__detail-grid">
                            <div className="mes-commandes__detail-field">
                              <label>Date commande:</label>
                              <span>
                                {new Date(
                                  commande.date_commande
                                ).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                            <div className="mes-commandes__detail-field">
                              <label>Date livraison prévue:</label>
                              <span>
                                {commande.date_livraison_prevue
                                  ? new Date(
                                      commande.date_livraison_prevue
                                    ).toLocaleDateString("fr-FR")
                                  : "Non définie"}
                              </span>
                            </div>
                            <div className="mes-commandes__detail-field">
                              <label>Statut:</label>
                              <span
                                className="mes-commandes__statut-badge"
                                style={{
                                  backgroundColor: getStatutInfo(
                                    commande.statut
                                  ).color,
                                }}
                              >
                                {getStatutInfo(commande.statut).label}
                              </span>
                            </div>
                            <div className="mes-commandes__detail-field">
                              <label>Entrepôts utilisés:</label>
                              <span>
                                {commande.entrepots_utilises?.length || 1}{" "}
                                entrepôt(s)
                              </span>
                            </div>
                            <div className="mes-commandes__detail-field">
                              <label>Adresse livraison:</label>
                              <span>
                                {commande.adresse_livraison_complete ||
                                  commande.adresse_franchise_complete}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Règle 80/20 */}
                        <div className="mes-commandes__detail-section">
                          <h4>Conformité 80/20</h4>
                          <div
                            className={`mes-commandes__conformite-detail ${
                              commande.respecte_regle_80_20_result?.conforme
                                ? "mes-commandes__conformite-detail--conforme"
                                : "mes-commandes__conformite-detail--non-conforme"
                            }`}
                          >
                            <div className="mes-commandes__conformite-summary">
                              <span className="mes-commandes__conformite-icon">
                                {commande.respecte_regle_80_20_result?.conforme
                                  ? "✅"
                                  : "❌"}
                              </span>
                              <span>
                                {commande.respecte_regle_80_20_result?.message}
                              </span>
                            </div>
                            <div className="mes-commandes__conformite-breakdown">
                              <div className="mes-commandes__conformite-item">
                                <span>Total commande:</span>
                                <strong>
                                  {parseFloat(commande.montant_total).toFixed(
                                    2
                                  )}
                                  €
                                </strong>
                              </div>
                              <div className="mes-commandes__conformite-item">
                                <span>Entrepôts utilisés:</span>
                                <strong>
                                  {commande.entrepots_utilises
                                    ?.map((e) => e.nom_entrepot)
                                    .join(", ") || "Non défini"}
                                </strong>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Produits commandés */}
                        <div className="mes-commandes__detail-section">
                          <h4>
                            Produits commandés ({commande.details?.length || 0})
                          </h4>
                          <div className="mes-commandes__products-list">
                            {(commande.details || []).map((detail) => {
                              return (
                                <div
                                  key={detail.id}
                                  className="mes-commandes__product-item"
                                >
                                  <div className="mes-commandes__product-info">
                                    <div className="mes-commandes__product-name">
                                      <strong>{detail.produit_nom}</strong>
                                    </div>
                                    <div className="mes-commandes__product-entrepot">
                                      <Warehouse size={14} />
                                      {detail.entrepot_nom} (
                                      {detail.entrepot_type === "drivn_cook"
                                        ? "Driv'n Cook"
                                        : "Fournisseur libre"}
                                      )
                                    </div>
                                  </div>
                                  <div className="mes-commandes__product-quantities">
                                    <span>
                                      {detail.quantite_commandee} ×{" "}
                                      {parseFloat(detail.prix_unitaire).toFixed(
                                        2
                                      )}
                                      €
                                    </span>
                                    <strong>
                                      {parseFloat(detail.sous_total).toFixed(2)}
                                      €
                                    </strong>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
          </div>
        </div>
      </main>
    </div>
  );
}
