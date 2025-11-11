from django.urls import path
from .views import (
    FranchiseProfileView,
    CamionFranchiseListView,
    CamionFranchiseDetailView,
    EmplacementListView,
    AffectationEmplacementListCreateView,
    AffectationEmplacementDetailView,
    MaintenanceCamionListView,
    EntrepotListView,
    StockEntrepotListView,
    VenteFranchiseListCreateView,
    VenteFranchiseDetailView,
    MesCommandesListCreateView,
    MesCommandesDetailView,
    MesDetailCommandeListCreateView,    
    MesDetailCommandeDetailView,
    StockMultiEntrepotListView,
    dashboard_stats,
    rapport_ventes_mensuel,
)


urlpatterns = [
    path('profile/', FranchiseProfileView.as_view(), name='profil'),
    path('camions/', CamionFranchiseListView.as_view(), name='camions-list'),
    path('camions/<int:pk>/', CamionFranchiseDetailView.as_view(), name='camions-detail'),
    path('emplacements/', EmplacementListView.as_view(), name='emplacements-list'),
    path('affectations/', AffectationEmplacementListCreateView.as_view(), name='affectations-list-create'),
    path('affectations/<int:pk>/', AffectationEmplacementDetailView.as_view(), name='affectations-detail'),
    path('maintenances/', MaintenanceCamionListView.as_view(), name='maintenances-list'),
    path('entrepots/', EntrepotListView.as_view(), name='entrepots-list'),
    path('stocks/', StockEntrepotListView.as_view(), name='stocks-list'),

    path('ventes/', VenteFranchiseListCreateView.as_view(), name='ventes-list-create'),
    path('ventes/<int:pk>/', VenteFranchiseDetailView.as_view(), name='ventes-detail'),
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),
    path('rapports/ventes/', rapport_ventes_mensuel, name='rapport-ventes-mensuel'),
    
    path('mes-commandes/', 
         MesCommandesListCreateView.as_view(), 
         name='mes-commandes-list-create'),
    
    path('mes-commandes/<int:pk>/', 
         MesCommandesDetailView.as_view(), 
         name='mes-commandes-detail'),
    
    # Gestion des détails de commande multi-entrepôts
    path('mes-commandes/<int:commande_id>/details/', 
         MesDetailCommandeListCreateView.as_view(), 
         name='mes-detail-commande-list-create'),
    
    path('mes-commandes/<int:commande_id>/details/<int:pk>/', 
         MesDetailCommandeDetailView.as_view(), 
         name='mes-detail-commande-detail'),
    
    # Alternative pour gérer les détails directement par ID
    path('mes-details-commande/<int:pk>/', 
         MesDetailCommandeDetailView.as_view(), 
         name='mes-detail-commande-direct'),
    
    # Consultation des stocks multi-entrepôts
    path('stocks-multi-entrepots/', 
         StockMultiEntrepotListView.as_view(), 
         name='stocks-multi-entrepots-list'),
]