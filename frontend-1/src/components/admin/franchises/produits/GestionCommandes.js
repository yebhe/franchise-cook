// components/admin/commandes/GestionCommandes.jsx - VERSION ADMIN ADAPTÉE
import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Package,
  AlertTriangle,
  Info,
  Calendar,
  Building,
  TrendingUp,
  FileText,
  MapPin,
  Warehouse,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./GestionCommandes.css";
import useAuthStore from "../../../../store/authStore";
import apiClient from "../../../../api/axiosConfig";
import AdminNavigation from "../../AdminNavigation";

const initialCommandeForm = {
  franchise: "",
  date_livraison_prevue: "",
  adresse_livraison: "", // 🎯 ADRESSE DE LIVRAISON DIRECTE
  details: [],
};

const initialDetailForm = {
  entrepot_actuel: "", // 🎯 WORKFLOW : D'abord sélectionner l'entrepôt
  produit: "",
  quantite_commandee: 1,
  prix_unitaire: 0,
};

const STATUT_OPTIONS = [
  { value: "en_attente", label: "En attente", color: "#f59e0b", icon: Clock },
  { value: "validee", label: "Validée", color: "#3b82f6", icon: CheckCircle },
  { value: "preparee", label: "Préparée", color: "#8b5cf6", icon: Package },
  { value: "livree", label: "Livrée", color: "#10b981", icon: Truck },
  { value: "annulee", label: "Annulée", color: "#ef4444", icon: XCircle },
];

export default function GestionCommandes() {
  // États principaux
  const [commandes, setCommandes] = useState([]);
  const [franchises, setFranchises] = useState([]);
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
  const [franchiseFilter, setFranchiseFilter] = useState("");
  const [conformiteFilter, setConformiteFilter] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  // États pour le rapport de conformité
  const [showConformiteModal, setShowConformiteModal] = useState(false);
  const [rapportConformite, setRapportConformite] = useState(null);

  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userType = useAuthStore((state) => state.getUserType());

  // Vérification des permissions
  useEffect(() => {
    if (!isAuthenticated || userType !== "admin") {
      navigate("/");
    }
  }, [isAuthenticated, userType, navigate]);

  // Fonctions utilitaires
  const getStatutInfo = (statut) => {
    return (
      STATUT_OPTIONS.find((option) => option.value === statut) ||
      STATUT_OPTIONS[0]
    );
  };

  const getFranchiseNom = (franchiseId) => {
    const franchise = franchises.find((f) => f.id === franchiseId);
    return franchise ? franchise.nom_franchise : "Franchise inconnue";
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

  // 🎯 FONCTION : Initialiser l'adresse de livraison avec celle de la franchise sélectionnée
  const initialiserAdresseFranchise = (franchiseId) => {
    if (franchiseId) {
      const franchise = franchises.find((f) => f.id === parseInt(franchiseId));
      if (franchise) {
        const adresseComplete = [
          franchise.adresse,
          franchise.code_postal,
          franchise.ville,
        ]
          .filter(Boolean)
          .join(", ");

        setCommandeForm((prev) => ({
          ...prev,
          adresse_livraison: adresseComplete,
        }));
      }
    }
  };

  // Chargement des données
  const fetchCommandes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("api/commandes/");
      setCommandes(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError("Erreur lors du chargement des commandes");
      setCommandes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFranchises = async () => {
    try {
      const response = await apiClient.get("api/franchises/");
      setFranchises(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Erreur lors du chargement des franchises");
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
    fetchCommandes();
    fetchFranchises();
    fetchEntrepots();
    fetchProduits();
    fetchStocks();
  }, []);

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

    // Gestion spéciale pour la franchise
    if (name === "franchise") {
      setCommandeForm((prev) => ({ ...prev, [name]: value }));
      // Initialiser automatiquement l'adresse quand on sélectionne une franchise
      if (value) {
        initialiserAdresseFranchise(value);
      } else {
        setCommandeForm((prev) => ({ ...prev, adresse_livraison: "" }));
      }
      setError(null);
      return;
    }

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

      if (!commandeForm.franchise) {
        throw new Error("Veuillez sélectionner une franchise");
      }

      if (!commandeForm.adresse_livraison?.trim()) {
        throw new Error("L'adresse de livraison est obligatoire");
      }

      const formData = {
        franchise: parseInt(commandeForm.franchise),
        date_livraison_prevue: commandeForm.date_livraison_prevue || null,
        adresse_livraison: commandeForm.adresse_livraison || "",
        details: commandeForm.details,
      };

      if (editingId) {
        await apiClient.put(`api/commandes/${editingId}/`, formData);
        setMessage("Commande modifiée avec succès !");
      } else {
        await apiClient.post("api/commandes/", formData);
        setMessage("Commande créée avec succès !");
      }

      resetForm();
      fetchCommandes();
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

  // 🎯 NOUVELLE FONCTION : Validation d'une commande (admin uniquement)
  const validerCommande = async (commandeId) => {
    try {
      const response = await apiClient.post(
        `api/commandes/${commandeId}/valider/`
      );
      setMessage(response.data.message || "Commande validée avec succès");
      fetchCommandes();
      fetchStocks(); 
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Erreur lors de la validation");
      }
    }
  };

  // 🎯 NOUVELLE FONCTION : Marquer comme livrée (admin uniquement)
  const marquerLivree = async (commandeId) => {
    try {
      const response = await apiClient.post(
        `api/commandes/${commandeId}/livrer/`
      );
      setMessage(response.data.message || "Commande marquée comme livrée");
      fetchCommandes();
    } catch (err) {
      setError("Erreur lors du marquage de livraison");
    }
  };
  const marquerPreparee = async (commandeId) => {
    try {
      const response = await apiClient.post(
        `api/commandes/${commandeId}/preparer/`
      );
      setMessage(response.data.message || "Commande marquée comme préparée");
      fetchCommandes();
    } catch (err) {
      setError("Erreur lors du marquage en préparation");
    }
  };

  // Suppression d'une commande
  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette commande ?"))
      return;

    try {
      await apiClient.delete(`api/commandes/${id}/`);
      setMessage("Commande supprimée avec succès");
      fetchCommandes();
    } catch (err) {
      setError("Erreur lors de la suppression");
    }
  };

  // Modification d'une commande
  const handleEdit = (commande) => {
    const detailsFormatted = (commande.details || []).map((detail) => ({
      produit: detail.produit || detail.produit_id,
      entrepot_livraison:
        detail.entrepot_livraison || detail.entrepot_livraison_id,
      quantite_commandee: parseInt(detail.quantite_commandee),
      prix_unitaire: parseFloat(detail.prix_unitaire),
    }));

    // Récupérer l'adresse de livraison
    let adresseLivraison = commande.adresse_livraison || "";
    if (!adresseLivraison && commande.franchise) {
      const franchise = franchises.find((f) => f.id === commande.franchise);
      if (franchise) {
        adresseLivraison = [
          franchise.adresse,
          franchise.code_postal,
          franchise.ville,
        ]
          .filter(Boolean)
          .join(", ");
      }
    }

    setCommandeForm({
      franchise: commande.franchise || "",
      date_livraison_prevue: commande.date_livraison_prevue || "",
      adresse_livraison: adresseLivraison,
      details: detailsFormatted,
    });

    // Reset le formulaire de détail
    setDetailForm(initialDetailForm);

    setEditingId(commande.id);
    setShowForm(true);
    setError(null);
    setMessage(null);
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

    const matchesSearch =
      (commande.numero_commande || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      getFranchiseNom(commande.franchise)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatut =
      statutFilter === "" || commande.statut === statutFilter;
    const matchesFranchise =
      franchiseFilter === "" ||
      commande.franchise === parseInt(franchiseFilter);

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

    return (
      matchesSearch &&
      matchesStatut &&
      matchesFranchise &&
      matchesConformite &&
      matchesDate
    );
  });

  // Obtenir la commande sélectionnée pour les détails
  const getSelectedCommande = () => {
    return commandes.find((c) => c.id === selectedCommandeId);
  };

  return (
    <div className="admin-layout">
      <AdminNavigation />

      <main className="admin-main-content">
        <div className="gestion-commandes">
          <div className="gestion-commandes__container">
            {/* Header */}
            <div className="gestion-commandes__header">
              <div className="gestion-commandes__header-content">
                <div className="gestion-commandes__title-section">
                  <h1 className="gestion-commandes__title">
                    <ShoppingCart
                      className="gestion-commandes__title-icon"
                      size={32}
                    />
                    Gestion des Commandes Multi-Entrepôts
                  </h1>
                  <p className="gestion-commandes__subtitle">
                    Administration : Workflow Entrepôt → Produits → Panier avec
                    règle 80/20
                  </p>
                </div>
                <div className="gestion-commandes__header-actions">
                  <button
                    className="gestion-commandes__btn gestion-commandes__btn--primary"
                    onClick={() => setShowForm(true)}
                  >
                    <Plus size={20} />
                    Nouvelle commande
                  </button>
                </div>
              </div>
            </div>

            {/* Bannière d'information 80/20 */}
            <div className="gestion-commandes__info-banner">
              <Info size={20} />
              <div>
                <strong>Administration des commandes multi-entrepôts :</strong>{" "}
                Sélectionnez une franchise → choisissez un entrepôt → ajoutez
                vos produits → validez. 80% minimum du montant total doit
                provenir des entrepôts Driv'n Cook !
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="gestion-commandes__alert gestion-commandes__alert--error">
                {error}
              </div>
            )}
            {message && (
              <div className="gestion-commandes__alert gestion-commandes__alert--success">
                {message}
              </div>
            )}

            {/* Filtres et recherche */}
            <div className="gestion-commandes__filters">
              <div className="gestion-commandes__search">
                <Search className="gestion-commandes__search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par numéro de commande ou franchise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="gestion-commandes__search-input"
                />
              </div>

              <div className="gestion-commandes__filters-row">
                <div className="gestion-commandes__filter">
                  <Filter
                    className="gestion-commandes__filter-icon"
                    size={20}
                  />
                  <select
                    value={statutFilter}
                    onChange={(e) => setStatutFilter(e.target.value)}
                    className="gestion-commandes__filter-select"
                  >
                    <option value="">Tous les statuts</option>
                    {STATUT_OPTIONS.map((statut) => (
                      <option key={statut.value} value={statut.value}>
                        {statut.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="gestion-commandes__filter">
                  <Building
                    className="gestion-commandes__filter-icon"
                    size={20}
                  />
                  <select
                    value={franchiseFilter}
                    onChange={(e) => setFranchiseFilter(e.target.value)}
                    className="gestion-commandes__filter-select"
                  >
                    <option value="">Toutes les franchises</option>
                    {franchises.map((franchise) => (
                      <option key={franchise.id} value={franchise.id}>
                        {franchise.nom_franchise}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="gestion-commandes__filter">
                  <TrendingUp
                    className="gestion-commandes__filter-icon"
                    size={20}
                  />
                  <select
                    value={conformiteFilter}
                    onChange={(e) => setConformiteFilter(e.target.value)}
                    className="gestion-commandes__filter-select"
                  >
                    <option value="">Toutes (80/20)</option>
                    <option value="true">Conformes (≥80%)</option>
                    <option value="false">Non-conformes (&lt;80%)</option>
                  </select>
                </div>

                <div className="gestion-commandes__filter">
                  <Calendar
                    className="gestion-commandes__filter-icon"
                    size={20}
                  />
                  <input
                    type="date"
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="gestion-commandes__filter-date"
                    placeholder="Date début"
                  />
                </div>

                <div className="gestion-commandes__filter">
                  <Calendar
                    className="gestion-commandes__filter-icon"
                    size={20}
                  />
                  <input
                    type="date"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    className="gestion-commandes__filter-date"
                    placeholder="Date fin"
                  />
                </div>
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="gestion-commandes__stats">
              <div className="gestion-commandes__stat-card">
                <div className="gestion-commandes__stat-icon gestion-commandes__stat-icon--total">
                  <ShoppingCart size={24} />
                </div>
                <div className="gestion-commandes__stat-content">
                  <span className="gestion-commandes__stat-number">
                    {filteredCommandes.length}
                  </span>
                  <span className="gestion-commandes__stat-label">
                    Commandes
                  </span>
                </div>
              </div>

              <div className="gestion-commandes__stat-card">
                <div className="gestion-commandes__stat-icon gestion-commandes__stat-icon--conforme">
                  <CheckCircle size={24} />
                </div>
                <div className="gestion-commandes__stat-content">
                  <span className="gestion-commandes__stat-number">
                    {
                      filteredCommandes.filter(
                        (c) => c.respecte_regle_80_20_result?.conforme
                      ).length
                    }
                  </span>
                  <span className="gestion-commandes__stat-label">
                    Conformes 80/20
                  </span>
                </div>
              </div>

              <div className="gestion-commandes__stat-card">
                <div className="gestion-commandes__stat-icon gestion-commandes__stat-icon--non-conforme">
                  <AlertTriangle size={24} />
                </div>
                <div className="gestion-commandes__stat-content">
                  <span className="gestion-commandes__stat-number">
                    {
                      filteredCommandes.filter(
                        (c) => !c.respecte_regle_80_20_result?.conforme
                      ).length
                    }
                  </span>
                  <span className="gestion-commandes__stat-label">
                    Non-conformes
                  </span>
                </div>
              </div>

              <div className="gestion-commandes__stat-card">
                <div className="gestion-commandes__stat-icon gestion-commandes__stat-icon--attente">
                  <Clock size={24} />
                </div>
                <div className="gestion-commandes__stat-content">
                  <span className="gestion-commandes__stat-number">
                    {
                      filteredCommandes.filter((c) => c.statut === "en_attente")
                        .length
                    }
                  </span>
                  <span className="gestion-commandes__stat-label">
                    En attente
                  </span>
                </div>
              </div>
            </div>

            {/* Liste des commandes */}
            <div className="gestion-commandes__content">
              <div className="gestion-commandes__card">
                <div className="gestion-commandes__card-header">
                  <h3 className="gestion-commandes__card-title">
                    Commandes Multi-Entrepôts ({filteredCommandes.length})
                  </h3>
                </div>

                {loading ? (
                  <div className="gestion-commandes__loading">
                    <div className="gestion-commandes__spinner"></div>
                    <p>Chargement des commandes...</p>
                  </div>
                ) : (
                  <div className="gestion-commandes__table-container">
                    <table className="gestion-commandes__table">
                      <thead>
                        <tr>
                          <th>N° Commande</th>
                          <th>Franchise</th>
                          <th>Date</th>
                          <th>Entrepôts</th>
                          <th>Montant</th>
                          <th>Règle 80/20</th>
                          <th>Statut</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCommandes.length === 0 ? (
                          <tr>
                            <td
                              colSpan="8"
                              className="gestion-commandes__empty"
                            >
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
                                className="gestion-commandes__table-row"
                              >
                                <td>
                                  <div className="gestion-commandes__numero">
                                    <strong>{commande.numero_commande}</strong>
                                  </div>
                                </td>
                                <td>
                                  <div className="gestion-commandes__franchise">
                                    {getFranchiseNom(commande.franchise)}
                                  </div>
                                </td>
                                <td>
                                  <div className="gestion-commandes__date">
                                    {new Date(
                                      commande.date_commande
                                    ).toLocaleDateString("fr-FR")}
                                  </div>
                                </td>
                                <td>
                                  <div className="gestion-commandes__entrepots">
                                    <span className="gestion-commandes__entrepots-count">
                                      <Warehouse size={16} />
                                      {commande.entrepots_count ||
                                        commande.entrepots_utilises?.length ||
                                        1}{" "}
                                      entrepôt(s)
                                    </span>
                                    {commande.entrepots_utilises && (
                                      <div className="gestion-commandes__entrepots-list">
                                        {commande.entrepots_utilises
                                          .slice(0, 2)
                                          .map((entrepot, idx) => (
                                            <span
                                              key={idx}
                                              className={`gestion-commandes__entrepot-badge ${
                                                entrepot.type_entrepot ===
                                                "drivn_cook"
                                                  ? "gestion-commandes__entrepot-badge--drivn"
                                                  : "gestion-commandes__entrepot-badge--libre"
                                              }`}
                                            >
                                              {entrepot.nom_entrepot}
                                            </span>
                                          ))}
                                        {commande.entrepots_utilises.length >
                                          2 && (
                                          <span className="gestion-commandes__entrepot-more">
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
                                  <div className="gestion-commandes__montant">
                                    <strong>
                                      {parseFloat(
                                        commande.montant_total
                                      ).toFixed(2)}
                                      €
                                    </strong>
                                    <small>
                                      Driv'n:{" "}
                                      {parseFloat(
                                        commande.montant_drivn_cook || 0
                                      ).toFixed(2)}
                                      €<br />
                                      Libre:{" "}
                                      {parseFloat(
                                        commande.montant_fournisseur_libre || 0
                                      ).toFixed(2)}
                                      €
                                    </small>
                                  </div>
                                </td>
                                <td>
                                  <div className="gestion-commandes__conformite">
                                    <span
                                      className={`gestion-commandes__conformite-badge ${
                                        conformite?.conforme
                                          ? "gestion-commandes__conformite-badge--conforme"
                                          : "gestion-commandes__conformite-badge--non-conforme"
                                      }`}
                                    >
                                      {conformite?.conforme ? "✅" : "❌"}{" "}
                                      {parseFloat(
                                        commande.pourcentage_drivn_cook || 0
                                      ).toFixed(1)}
                                      %
                                    </span>
                                    <small className="gestion-commandes__conformite-detail">
                                      {conformite?.message ||
                                        "Calcul en cours..."}
                                    </small>
                                  </div>
                                </td>
                                <td>
                                  <div className="gestion-commandes__statut">
                                    <span
                                      className="gestion-commandes__statut-badge"
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
                                  <div className="gestion-commandes__actions">
                                    <button
                                      className="gestion-commandes__action-btn gestion-commandes__action-btn--view"
                                      onClick={() => voirDetails(commande.id)}
                                      title="Voir détails"
                                    >
                                      <Eye size={16} />
                                    </button>

                                    {commande.statut === "en_attente" && (
                                      <>
                                        <button
                                          className="gestion-commandes__action-btn gestion-commandes__action-btn--edit"
                                          onClick={() => handleEdit(commande)}
                                          title="Modifier"
                                        >
                                          <Edit size={16} />
                                        </button>
                                        <button
                                          className="gestion-commandes__action-btn gestion-commandes__action-btn--validate"
                                          onClick={() =>
                                            validerCommande(commande.id)
                                          }
                                          title="Valider"
                                        >
                                          <CheckCircle size={16} />
                                        </button>
                                      </>
                                    )}

                                    {commande.statut === "validee" && (
                                      <button
                                        className="gestion-commandes__action-btn gestion-commandes__action-btn--prepare"
                                        onClick={() =>
                                          marquerPreparee(commande.id)
                                        }
                                        title="Marquer préparée"
                                      >
                                        <Package size={16} />
                                      </button>
                                    )}

                                    {commande.statut === "preparee" && (
                                      <button
                                        className="gestion-commandes__action-btn gestion-commandes__action-btn--deliver"
                                        onClick={() =>
                                          marquerLivree(commande.id)
                                        }
                                        title="Marquer livré"
                                      >
                                        <Truck size={16} />
                                      </button>
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

            {/* Modal Formulaire de commande - WORKFLOW ADMIN : Franchise → Entrepôt → Produits */}
            {showForm && (
              <div
                className="gestion-commandes__modal-overlay"
                onClick={resetForm}
              >
                <div
                  className="gestion-commandes__modal gestion-commandes__modal--large"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="gestion-commandes__modal-header">
                    <h3>
                      {editingId ? "Modifier" : "Créer"} une commande
                      multi-entrepôts
                    </h3>
                    <button
                      className="gestion-commandes__modal-close"
                      onClick={resetForm}
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="gestion-commandes__form"
                  >
                    {/* Messages d'erreur et de succès dans le modal */}
                    {error && (
                      <div className="gestion-commandes__alert gestion-commandes__alert--error">
                        {error}
                      </div>
                    )}
                    {message && (
                      <div className="gestion-commandes__alert gestion-commandes__alert--success">
                        {message}
                      </div>
                    )}

                    {/* Informations de base */}
                    <div className="gestion-commandes__form-section">
                      <h4>Informations générales</h4>
                      <div className="gestion-commandes__form-row">
                        {/* Sélection de la franchise (obligatoire pour admin) */}
                        <div className="gestion-commandes__form-group">
                          <label htmlFor="franchise">Franchise *</label>
                          <select
                            id="franchise"
                            name="franchise"
                            value={commandeForm.franchise}
                            onChange={handleCommandeChange}
                            required
                            className="gestion-commandes__select"
                          >
                            <option value="">Sélectionner une franchise</option>
                            {franchises.map((franchise) => (
                              <option key={franchise.id} value={franchise.id}>
                                {franchise.nom_franchise} - {franchise.ville}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="gestion-commandes__form-group">
                          <label htmlFor="date_livraison_prevue">
                            Date livraison prévue
                          </label>
                          <input
                            type="date"
                            id="date_livraison_prevue"
                            name="date_livraison_prevue"
                            value={commandeForm.date_livraison_prevue}
                            onChange={handleCommandeChange}
                            className="gestion-commandes__input"
                            min={new Date().toISOString().split("T")[0]}
                          />
                        </div>

                        {/* Adresse de livraison automatique */}
                        <div className="gestion-commandes__form-group">
                          <label htmlFor="adresse_livraison">
                            Adresse de livraison *
                          </label>
                          <input
                          type="text"
                          id="adresse_livraison"
                          name="adresse_livraison"
                          value={commandeForm.adresse_livraison}
                          onChange={handleCommandeChange}
                          className="gestion-commandes__input"
                          placeholder="Indiquer l'adresse de livraison"
                        />
                        </div>
                      </div>
                    </div>

                    {/* Ajouter des produits - WORKFLOW : Entrepôt puis Produits */}
                    {commandeForm.franchise && (
                      <div className="gestion-commandes__form-section">
                        <h4>Ajouter des produits</h4>
                        <div className="gestion-commandes__info-banner">
                          <Info size={16} />
                          <span>
                            1️⃣ Sélectionnez l'entrepôt → 2️⃣ Choisissez le
                            produit → 3️⃣ Ajoutez au panier
                          </span>
                        </div>

                        <div className="gestion-commandes__form-row">
                          {/* ÉTAPE 1 : Sélection de l'entrepôt */}
                          <div className="gestion-commandes__form-group">
                            <label htmlFor="entrepot_actuel">
                              1️⃣ Entrepôt *
                            </label>
                            <select
                              id="entrepot_actuel"
                              name="entrepot_actuel"
                              value={detailForm.entrepot_actuel}
                              onChange={handleDetailChange}
                              className="gestion-commandes__select"
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
                            <small className="gestion-commandes__info-text">
                              <Warehouse size={14} />
                              Choisissez l'entrepôt pour voir ses produits
                              disponibles
                            </small>
                          </div>

                          {/* ÉTAPE 2 : Sélection du produit (seulement si entrepôt sélectionné) */}
                          {detailForm.entrepot_actuel && (
                            <div className="gestion-commandes__form-group">
                              <label htmlFor="produit">
                                2️⃣ Produit disponible *
                              </label>
                              <select
                                id="produit"
                                name="produit"
                                value={detailForm.produit}
                                onChange={handleDetailChange}
                                className="gestion-commandes__select"
                              >
                                <option value="">
                                  Sélectionner un produit
                                </option>
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
                                <small className="gestion-commandes__warning-text">
                                  ⚠️ Aucun produit disponible dans cet entrepôt
                                </small>
                              )}
                            </div>
                          )}

                          {/* ÉTAPE 3 : Quantité et ajout (seulement si produit sélectionné) */}
                          {detailForm.entrepot_actuel && detailForm.produit && (
                            <>
                              <div className="gestion-commandes__form-group">
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
                                  className="gestion-commandes__input"
                                />
                                <small className="gestion-commandes__stock-info">
                                  📦 Stock disponible:{" "}
                                  {getStockDisponible(
                                    parseInt(detailForm.produit),
                                    parseInt(detailForm.entrepot_actuel)
                                  )}
                                </small>
                              </div>

                              <div className="gestion-commandes__form-group">
                                <label htmlFor="prix_unitaire">
                                  Prix unitaire
                                </label>
                                <input
                                  type="number"
                                  id="prix_unitaire"
                                  name="prix_unitaire"
                                  value={detailForm.prix_unitaire}
                                  step="0.01"
                                  className="gestion-commandes__input"
                                  readOnly
                                />
                                <small className="gestion-commandes__info-text">
                                  💰 Sous-total:{" "}
                                  {(
                                    detailForm.quantite_commandee *
                                    detailForm.prix_unitaire
                                  ).toFixed(2)}
                                  €
                                </small>
                              </div>

                              <div className="gestion-commandes__form-group">
                                <button
                                  type="button"
                                  onClick={ajouterDetail}
                                  className="gestion-commandes__btn gestion-commandes__btn--add"
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
                          <div className="gestion-commandes__help-message">
                            <Info size={16} />
                            <span>
                              Commencez par sélectionner un entrepôt pour voir
                              les produits disponibles
                            </span>
                          </div>
                        )}

                        {detailForm.entrepot_actuel &&
                          !detailForm.produit &&
                          getProduitsDisponiblesDansEntrepot(
                            detailForm.entrepot_actuel
                          ).length > 0 && (
                            <div className="gestion-commandes__help-message">
                              <Info size={16} />
                              <span>
                                Sélectionnez un produit disponible dans
                                l'entrepôt{" "}
                                {getEntrepotNom(detailForm.entrepot_actuel)}
                              </span>
                            </div>
                          )}
                      </div>
                    )}

                    {/* Message si pas de franchise sélectionnée */}
                    {!commandeForm.franchise && (
                      <div className="gestion-commandes__help-message">
                        <Info size={16} />
                        <span>
                          Sélectionnez d'abord une franchise pour commencer à
                          créer la commande
                        </span>
                      </div>
                    )}

                    {/* Liste des produits ajoutés */}
                    {commandeForm.details.length > 0 && (
                      <div className="gestion-commandes__form-section">
                        <h4>
                          Produits de la commande ({commandeForm.details.length}
                          )
                        </h4>

                        {/* Vérification de la règle 80/20 en temps réel */}
                        {(() => {
                          const conformite = calculateConformite80_20(
                            commandeForm.details
                          );
                          return (
                            <div
                              className={`gestion-commandes__conformite-preview ${
                                conformite.conforme
                                  ? "gestion-commandes__conformite-preview--conforme"
                                  : "gestion-commandes__conformite-preview--non-conforme"
                              }`}
                            >
                              <div className="gestion-commandes__conformite-preview-header">
                                <span className="gestion-commandes__conformite-preview-icon">
                                  {conformite.conforme ? "✅" : "❌"}
                                </span>
                                <span className="gestion-commandes__conformite-preview-text">
                                  {conformite.message}
                                </span>
                              </div>
                              {conformite.montant_total > 0 && (
                                <div className="gestion-commandes__conformite-preview-details">
                                  <span>
                                    Total: {conformite.montant_total.toFixed(2)}
                                    €
                                  </span>
                                  <span>
                                    Driv'n Cook:{" "}
                                    {conformite.montant_drivn_cook.toFixed(2)}€
                                    ({conformite.pourcentage_drivn.toFixed(1)}%)
                                  </span>
                                  <span>
                                    Fournisseur libre:{" "}
                                    {conformite.montant_fournisseur_libre.toFixed(
                                      2
                                    )}
                                    € ({conformite.pourcentage_libre.toFixed(1)}
                                    %)
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

                        <div className="gestion-commandes__details-list">
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
                                className="gestion-commandes__detail-item"
                              >
                                <div className="gestion-commandes__detail-content">
                                  <div className="gestion-commandes__detail-info">
                                    <strong>{produit?.nom_produit}</strong>
                                    <span className="gestion-commandes__detail-entrepot">
                                      <Warehouse size={14} />
                                      {entrepot?.nom_entrepot}
                                      <span
                                        className={`gestion-commandes__entrepot-type ${
                                          entrepot?.type_entrepot ===
                                          "drivn_cook"
                                            ? "gestion-commandes__entrepot-type--drivn"
                                            : "gestion-commandes__entrepot-type--libre"
                                        }`}
                                      >
                                        (
                                        {entrepot?.type_entrepot ===
                                        "drivn_cook"
                                          ? "80%"
                                          : "20%"}
                                        )
                                      </span>
                                    </span>
                                  </div>
                                  <div className="gestion-commandes__detail-quantities">
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
                                  className="gestion-commandes__detail-remove"
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
                    <div className="gestion-commandes__form-actions">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="gestion-commandes__btn gestion-commandes__btn--secondary"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={
                          submitLoading ||
                          !commandeForm.franchise ||
                          commandeForm.details.length === 0 ||
                          !calculateConformite80_20(commandeForm.details)
                            .conforme
                        }
                        className="gestion-commandes__btn gestion-commandes__btn--primary"
                      >
                        {submitLoading ? (
                          <>
                            <div className="gestion-commandes__spinner gestion-commandes__spinner--small"></div>
                            {editingId ? "Modification..." : "Création..."}
                          </>
                        ) : editingId ? (
                          "Modifier la commande"
                        ) : (
                          "Créer la commande"
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
                    className="gestion-commandes__modal-overlay"
                    onClick={() => setShowDetailModal(false)}
                  >
                    <div
                      className="gestion-commandes__modal"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="gestion-commandes__modal-header">
                        <h3>
                          Détails de la commande {commande.numero_commande}
                        </h3>
                        <button
                          className="gestion-commandes__modal-close"
                          onClick={() => setShowDetailModal(false)}
                        >
                          <X size={24} />
                        </button>
                      </div>

                      <div className="gestion-commandes__detail-view">
                        {/* Informations générales */}
                        <div className="gestion-commandes__detail-section">
                          <h4>Informations générales</h4>
                          <div className="gestion-commandes__detail-grid">
                            <div className="gestion-commandes__detail-field">
                              <label>Franchise:</label>
                              <span>{getFranchiseNom(commande.franchise)}</span>
                            </div>
                            <div className="gestion-commandes__detail-field">
                              <label>Date commande:</label>
                              <span>
                                {new Date(
                                  commande.date_commande
                                ).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                            <div className="gestion-commandes__detail-field">
                              <label>Date livraison prévue:</label>
                              <span>
                                {commande.date_livraison_prevue
                                  ? new Date(
                                      commande.date_livraison_prevue
                                    ).toLocaleDateString("fr-FR")
                                  : "Non définie"}
                              </span>
                            </div>
                            <div className="gestion-commandes__detail-field">
                              <label>Entrepôts utilisés:</label>
                              <span>
                                {commande.entrepots_utilises?.length || 1}{" "}
                                entrepôt(s)
                              </span>
                            </div>
                            <div className="gestion-commandes__detail-field">
                              <label>Adresse livraison:</label>
                              <span>
                                {commande.adresse_livraison_complete ||
                                  commande.adresse_franchise_complete ||
                                  (() => {
                                    // Récupérer l'adresse de la franchise
                                    const franchise = franchises.find(
                                      (f) => f.id === commande.franchise
                                    );
                                    if (franchise) {
                                      const adresseAuto = [
                                        franchise.adresse,
                                        franchise.code_postal,
                                        franchise.ville,
                                      ]
                                        .filter(Boolean)
                                        .join(", ");
                                      return (
                                        adresseAuto || "Adresse non définie"
                                      );
                                    }
                                    return "Adresse non disponible";
                                  })()}
                              </span>
                            </div>
                            <div className="gestion-commandes__detail-field">
                              <label>Statut:</label>
                              <span
                                className="gestion-commandes__statut-badge"
                                style={{
                                  backgroundColor: getStatutInfo(
                                    commande.statut
                                  ).color,
                                }}
                              >
                                {getStatutInfo(commande.statut).label}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Règle 80/20 */}
                        <div className="gestion-commandes__detail-section">
                          <h4>Conformité 80/20</h4>
                          <div
                            className={`gestion-commandes__conformite-detail ${
                              commande.respecte_regle_80_20_result?.conforme
                                ? "gestion-commandes__conformite-detail--conforme"
                                : "gestion-commandes__conformite-detail--non-conforme"
                            }`}
                          >
                            <div className="gestion-commandes__conformite-summary">
                              <span className="gestion-commandes__conformite-icon">
                                {commande.respecte_regle_80_20_result?.conforme
                                  ? "✅"
                                  : "❌"}
                              </span>
                              <span>
                                {commande.respecte_regle_80_20_result?.message}
                              </span>
                            </div>
                            <div className="gestion-commandes__conformite-breakdown">
                              <div className="gestion-commandes__conformite-item">
                                <span>Total commande:</span>
                                <strong>
                                  {parseFloat(commande.montant_total).toFixed(
                                    2
                                  )}
                                  €
                                </strong>
                              </div>
                              <div className="gestion-commandes__conformite-item">
                                <span>Driv'n Cook:</span>
                                <strong>
                                  {parseFloat(
                                    commande.montant_drivn_cook || 0
                                  ).toFixed(2)}
                                  € (
                                  {parseFloat(
                                    commande.pourcentage_drivn_cook || 0
                                  ).toFixed(1)}
                                  %)
                                </strong>
                              </div>
                              <div className="gestion-commandes__conformite-item">
                                <span>Fournisseur libre:</span>
                                <strong>
                                  {parseFloat(
                                    commande.montant_fournisseur_libre || 0
                                  ).toFixed(2)}
                                  € (
                                  {parseFloat(
                                    commande.pourcentage_fournisseur_libre || 0
                                  ).toFixed(1)}
                                  %)
                                </strong>
                              </div>
                              <div className="gestion-commandes__conformite-item">
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
                        <div className="gestion-commandes__detail-section">
                          <h4>
                            Produits commandés ({commande.details?.length || 0})
                          </h4>
                          <div className="gestion-commandes__products-list">
                            {(commande.details || []).map((detail) => {
                              const entrepotType = getEntrepotType(
                                detail.entrepot_livraison
                              );

                              return (
                                <div
                                  key={detail.id}
                                  className="gestion-commandes__product-item"
                                >
                                  <div className="gestion-commandes__product-info">
                                    <div className="gestion-commandes__product-name">
                                      <strong>{detail.produit_nom}</strong>
                                      <span
                                        className={`gestion-commandes__product-type ${
                                          entrepotType === "drivn_cook"
                                            ? "gestion-commandes__product-type--drivn"
                                            : "gestion-commandes__product-type--libre"
                                        }`}
                                      >
                                        {entrepotType === "drivn_cook"
                                          ? "Driv'n Cook"
                                          : "Fournisseur libre"}
                                      </span>
                                    </div>
                                    <div className="gestion-commandes__product-entrepot">
                                      <Warehouse size={14} />
                                      {detail.entrepot_nom}
                                    </div>
                                  </div>
                                  <div className="gestion-commandes__product-quantities">
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

            {/* Modal Rapport de Conformité 80/20 */}
            {showConformiteModal && rapportConformite && (
              <div
                className="gestion-commandes__modal-overlay"
                onClick={() => setShowConformiteModal(false)}
              >
                <div
                  className="gestion-commandes__modal gestion-commandes__modal--large"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="gestion-commandes__modal-header">
                    <h3>Rapport de Conformité 80/20</h3>
                    <button
                      className="gestion-commandes__modal-close"
                      onClick={() => setShowConformiteModal(false)}
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="gestion-commandes__rapport">
                    {/* Statistiques globales */}
                    <div className="gestion-commandes__rapport-stats">
                      <div className="gestion-commandes__rapport-stat">
                        <span className="gestion-commandes__rapport-stat-number">
                          {rapportConformite.statistiques.total_commandes}
                        </span>
                        <span className="gestion-commandes__rapport-stat-label">
                          Commandes analysées
                        </span>
                      </div>
                      <div className="gestion-commandes__rapport-stat">
                        <span className="gestion-commandes__rapport-stat-number">
                          {rapportConformite.statistiques.commandes_conformes}
                        </span>
                        <span className="gestion-commandes__rapport-stat-label">
                          Conformes
                        </span>
                      </div>
                      <div className="gestion-commandes__rapport-stat">
                        <span className="gestion-commandes__rapport-stat-number">
                          {
                            rapportConformite.statistiques
                              .commandes_non_conformes
                          }
                        </span>
                        <span className="gestion-commandes__rapport-stat-label">
                          Non conformes
                        </span>
                      </div>
                      <div className="gestion-commandes__rapport-stat">
                        <span className="gestion-commandes__rapport-stat-number">
                          {rapportConformite.statistiques.taux_conformite}%
                        </span>
                        <span className="gestion-commandes__rapport-stat-label">
                          Taux de conformité
                        </span>
                      </div>
                    </div>

                    {/* Commandes non conformes */}
                    {rapportConformite.commandes_non_conformes.length > 0 && (
                      <div className="gestion-commandes__rapport-section">
                        <h4>⚠️ Commandes non conformes à la règle 80/20</h4>
                        <div className="gestion-commandes__rapport-list">
                          {rapportConformite.commandes_non_conformes.map(
                            (commande) => (
                              <div
                                key={commande.numero_commande}
                                className="gestion-commandes__rapport-item gestion-commandes__rapport-item--non-conforme"
                              >
                                <div className="gestion-commandes__rapport-item-header">
                                  <strong>{commande.numero_commande}</strong>
                                  <span>{commande.franchise}</span>
                                  <span>
                                    {new Date(
                                      commande.date_commande
                                    ).toLocaleDateString("fr-FR")}
                                  </span>
                                </div>
                                <div className="gestion-commandes__rapport-item-details">
                                  <span>
                                    Montant total:{" "}
                                    {commande.montant_total.toFixed(2)}€
                                  </span>
                                  <span className="gestion-commandes__rapport-pourcentage">
                                    {commande.pourcentage_drivn_cook.toFixed(1)}
                                    % Driv'n Cook
                                  </span>
                                </div>
                                <div className="gestion-commandes__rapport-message">
                                  {commande.message}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Commandes conformes */}
                    {rapportConformite.commandes_conformes.length > 0 && (
                      <div className="gestion-commandes__rapport-section">
                        <h4>✅ Commandes conformes à la règle 80/20</h4>
                        <div className="gestion-commandes__rapport-list">
                          {rapportConformite.commandes_conformes
                            .slice(0, 10)
                            .map((commande) => (
                              <div
                                key={commande.numero_commande}
                                className="gestion-commandes__rapport-item gestion-commandes__rapport-item--conforme"
                              >
                                <div className="gestion-commandes__rapport-item-header">
                                  <strong>{commande.numero_commande}</strong>
                                  <span>{commande.franchise}</span>
                                  <span>
                                    {new Date(
                                      commande.date_commande
                                    ).toLocaleDateString("fr-FR")}
                                  </span>
                                </div>
                                <div className="gestion-commandes__rapport-item-details">
                                  <span>
                                    Montant total:{" "}
                                    {commande.montant_total.toFixed(2)}€
                                  </span>
                                  <span className="gestion-commandes__rapport-pourcentage">
                                    {commande.pourcentage_drivn_cook.toFixed(1)}
                                    % Driv'n Cook
                                  </span>
                                </div>
                              </div>
                            ))}
                          {rapportConformite.commandes_conformes.length >
                            10 && (
                            <div className="gestion-commandes__rapport-more">
                              ... et{" "}
                              {rapportConformite.commandes_conformes.length -
                                10}{" "}
                              autres commandes conformes
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
