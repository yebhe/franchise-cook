# serializers.py - Serializer pour validation et paiement

from rest_framework import serializers
from django.contrib.auth import get_user_model
from gestion_camions.models import Franchise

User = get_user_model()

class FranchiseSerializer(serializers.ModelSerializer):
    """Serializer pour les franchises avec validation et paiement"""
    # Champs en lecture seule pour affichage
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    has_franchise = serializers.CharField(source='user.has_franchise', read_only=True)
    nom_validateur = serializers.CharField(read_only=True)
    peut_etre_valide = serializers.BooleanField(read_only=True)
    peut_generer_lien_paiement = serializers.BooleanField(read_only=True)
    est_active = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Franchise
        fields = '__all__'
        extra_kwargs = {
            'droit_entree': {'read_only': True},
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
            'user': {'required': False},
            'valide_par': {'read_only': True},
            'date_validation': {'read_only': True},
            'stripe_payment_intent_id': {'read_only': True},
            'stripe_checkout_session_id': {'read_only': True},
            'date_paiement': {'read_only': True},
        }


class ValidationFranchiseSerializer(serializers.Serializer):
    """Serializer pour valider une franchise"""
    commentaire = serializers.CharField(
        required=False, 
        allow_blank=True,
        max_length=1000,
        help_text="Commentaire optionnel pour le franchisé"
    )


class UserSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des utilisateurs"""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'username', 'has_franchise']