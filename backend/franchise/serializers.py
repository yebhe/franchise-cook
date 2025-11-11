# serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from gestion_camions import models
from .models import Contact
from django.core.validators import validate_email as django_validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des utilisateurs"""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'username', 'has_franchise']


class FranchiseSerializer(serializers.ModelSerializer):
    """Serializer pour les franchises"""
    # Champs en lecture seule pour affichage
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    has_franchise = serializers.CharField(source='user.has_franchise', read_only=True)
    
    class Meta:
        model = models.Franchise
        fields = '__all__'
        extra_kwargs = {
            'droit_entree': {'read_only': True},
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
            'user': {'required': False},  # ← Pas obligatoire pour les updates
        }


# entrepot
class EntrepotSerializer(serializers.ModelSerializer):
    """Serializer pour les entrepôts d'Ile de France"""
    
    class Meta:
        model = models.Entrepot
        fields = '__all__'
        extra_kwargs = {
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }
        
class FranchiseUserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer pour l'inscription d'un utilisateur comme franchisé"""
    
    class Meta:
        model = models.Franchise
        fields = [
            'nom_franchise',
            'adresse', 
            'ville',
            'code_postal',
            'date_signature'
        ]
        extra_kwargs = {
            'nom_franchise': {'required': True},
            'date_signature': {'required': True},
        }
    
    def validate_nom_franchise(self, value):
        """Validation du nom de franchise"""
        if len(value.strip()) < 3:
            raise serializers.ValidationError(
                "Le nom de la franchise doit contenir au moins 3 caractères."
            )
        return value.strip()
    
    def validate_date_signature(self, value):
        """Validation de la date de signature"""
        from datetime import date, timedelta
        
        # La date ne peut pas être dans le passé (sauf aujourd'hui)
        if value < date.today():
            raise serializers.ValidationError(
                "La date de signature ne peut pas être antérieure à aujourd'hui."
            )
        
        # Optionnel : limiter à une période raisonnable (ex: 1 an max dans le futur)
        max_future_date = date.today() + timedelta(days=365)
        if value > max_future_date:
            raise serializers.ValidationError(
                "La date de signature ne peut pas être supérieure à un an dans le futur."
            )
            
        return value
    
class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['name', 'email', 'phone', 'subject', 'message']
    
    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("L'email est obligatoire.")
        try:
            django_validate_email(value)
        except DjangoValidationError:
            raise serializers.ValidationError("L'email n'est pas valide.")
        return value
    
    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Le nom est obligatoire.")
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Le nom doit contenir au moins 2 caractères.")
        return value.strip()
    
    def validate_subject(self, value):
        if not value:
            raise serializers.ValidationError("Le sujet est obligatoire.")
        valid_subjects = ['info', 'support', 'partnership', 'franchise', 'other']
        if value not in valid_subjects:
            raise serializers.ValidationError("Sujet non valide.")
        return value
    
    def validate_message(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Le message est obligatoire.")
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Le message doit contenir au moins 10 caractères.")
        return value.strip()
