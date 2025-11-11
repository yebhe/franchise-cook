from django.urls import path
from . import views

urlpatterns = [
    path('verifier-paiement/', views.verifier_paiement, name='verifier_paiement'),
    path('paiement/statut/<str:session_id>/', views.statut_paiement, name='statut_paiement'),
    # Endpoints pour validation et paiement
    path('franchises/<int:franchise_id>/valider/', views.valider_franchise, name='franchise-validate'),
    path('franchises/<int:franchise_id>/regenerer-lien/', views.regenerer_lien_paiement, name='franchise-regenerate-payment'),
    path('webhook/stripe/', views.webhook_stripe, name='stripe-webhook'),
    
]
