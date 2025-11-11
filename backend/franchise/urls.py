# urls.py de votre app
from django.urls import path
from .views import (FranchiseListCreateView, FranchiseDetailView,
                    UserListView, FranchiseUserRegistrationView,
                    ContactView
                    )


urlpatterns = [
    # Liste et création des franchises
    path('franchises/', FranchiseListCreateView.as_view(), name='franchise-list-create'),
    path('franchises/register/', FranchiseUserRegistrationView.as_view(), name='franchise-user-register'),
    
    # Détail, modification et suppression d'une franchise
    path('franchises/<int:pk>/', FranchiseDetailView.as_view(), name='franchise-detail'),
    
    # Liste des utilisateurs disponibles
    path('users/', UserListView.as_view(), name='user-list'),
    path('contact/', ContactView.as_view(), name='contact'),
]