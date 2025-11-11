# urls.py - DRIV'N COOK API URLs (VERSION FINALE 80/20)
from django.urls import path
from . import views

# ===============================================
# URLS PRINCIPALES - BACK-OFFICE & FRONT-OFFICE
# ===============================================

urlpatterns = [
    
    # ===============================================
    # ENTREPÔTS (Admin uniquement) - Driv'n Cook + Fournisseurs libres
    # ===============================================
    path('entrepots/', views.EntrepotListCreateView.as_view(), name='entrepot-list-create'),
    path('entrepots/<int:pk>/', views.EntrepotDetailView.as_view(), name='entrepot-detail'),
    path('entrepots/disponibles/', views.entrepots_disponibles, name='entrepots-disponibles'),
    
    # ===============================================
    # EMPLACEMENTS (Lecture tous, Écriture admin)
    # ===============================================
    path('emplacements/', views.EmplacementListCreateView.as_view(), name='emplacement-list-create'),
    path('emplacements/<int:pk>/', views.EmplacementDetailView.as_view(), name='emplacement-detail'),
    
    # ===============================================
    # CAMIONS (Admin complet, Franchisé ses camions uniquement)
    # ===============================================
    path('camions/', views.CamionListCreateView.as_view(), name='camion-list-create'),
    path('camions/<int:pk>/', views.CamionDetailView.as_view(), name='camion-detail'),
    
    # ===============================================
    # MAINTENANCE CAMIONS
    # ===============================================
    path('maintenances/', views.MaintenanceListCreateView.as_view(), name='maintenance-list-create'),
    path('maintenances/<int:pk>/', views.MaintenanceDetailView.as_view(), name='maintenance-detail'),
    
    # ===============================================
    # AFFECTATIONS EMPLACEMENTS
    # ===============================================
    path('affectations/', views.AffectationListCreateView.as_view(), name='affectation-list-create'),
    path('affectations/<int:pk>/', views.AffectationDetailView.as_view(), name='affectation-detail'),
    
    # ===============================================
    # CATÉGORIES PRODUITS (Admin uniquement)
    # ===============================================
    path('categories/', views.CategorieListCreateView.as_view(), name='categorie-list-create'),
    path('categories/<int:pk>/', views.CategorieDetailView.as_view(), name='categorie-detail'),
    
    # ===============================================
    # PRODUITS (Lecture tous, Écriture admin) - Simplifiés sans provenance
    # ===============================================
    path('produits/', views.ProduitListCreateView.as_view(), name='produit-list-create'),
    path('produits/<int:pk>/', views.ProduitDetailView.as_view(), name='produit-detail'),
    
    # ===============================================
    # STOCKS ENTREPÔTS (Admin uniquement) - Avec type d'entrepôt
    # ===============================================
    path('stocks/', views.StockEntrepotListCreateView.as_view(), name='stock-list-create'),
    path('stocks/<int:pk>/', views.StockEntrepotDetailView.as_view(), name='stock-detail'),
    
    # STOCKS PAR ENTREPÔT (pour les commandes avec contrôle 80/20)
    path('entrepots/<int:entrepot_id>/stocks/', views.StockEntrepotByEntrepotView.as_view(), name='stocks-entrepot'),
    
    # ===============================================
    # COMMANDES FRANCHISES AVEC CONTRÔLE STRICT 80/20
    # ===============================================
    path('commandes/', views.AdminCommandesListCreateView.as_view(), name='admin-commandes-list-create'),
    path('commandes/<int:pk>/', views.AdminCommandesDetailView.as_view(), name='admin-commandes-detail'),
    
    # Actions spéciales sur les commandes
    path('commandes/<int:pk>/valider/', views.admin_valider_commande, name='admin-valider-commande'),
    path('commandes/<int:pk>/preparer/', views.admin_marquer_preparee, name='admin-marquer-preparee'),
    path('commandes/<int:pk>/livrer/', views.admin_marquer_livree, name='admin-marquer-livree'),
    
    
    # ===============================================
    # GESTION DES VENTES ET REDEVANCES (4%)
    # ===============================================
    path('ventes/', views.VenteFranchiseViewSet.as_view({'get': 'list', 'post': 'create'}), name='ventes'),
    path('ventes/<int:pk>/', views.VenteFranchiseViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='vente-detail'),
    
    # ===============================================
    # RAPPORTS ET STATISTIQUES 80/20
    # ===============================================
    path('dashboard/stats/', views.DashboardViewSet.as_view({'get': 'stats_generales'}), name='dashboard-stats'),
    path('rapport/conformite-80-20/', views.rapport_conformite_80_20, name='rapport-conformite-80-20'),
    
    # ===============================================
    # ENDPOINTS SPÉCIALISÉS POUR FRANCHISÉS
    # ===============================================
    
    # Mes ventes et redevances
    path('mes-ventes/', views.VenteFranchiseViewSet.as_view({'get': 'list', 'post': 'create'}), name='mes-ventes'),
    
    # Mes statistiques personnelles
    path('mes-stats/', views.DashboardViewSet.as_view({'get': 'stats_generales'}), name='mes-stats'),
    
    # Mon rapport de conformité 80/20
    path('mon-rapport-80-20/', views.rapport_conformite_80_20, name='mon-rapport-80-20'),
]