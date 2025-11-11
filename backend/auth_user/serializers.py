from pyexpat import model
from . import models
from django.contrib.auth.password_validation import validate_password, ValidationError
from django.contrib.auth import password_validation
from rest_framework import serializers
from gestion_camions.models import Franchise

class FranchiseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Franchise
        fields = ('id', 'nom_franchise', 'ville', 'statut')  # Ajout de champs utiles

class UserProfileSerializer(serializers.ModelSerializer):
    # Champ personnalisé pour la franchise
    franchise = serializers.SerializerMethodField()
    
    class Meta:
        model = models.User
        fields = (
            'id', 
            'username', 
            'email', 
            'first_name', 
            'last_name', 
            'phone_number', 
            'is_superuser',
            'has_franchise',
            'franchise'
        )
    
    def get_franchise(self, obj):
        """Récupère les données de la franchise liée à l'utilisateur"""
        if hasattr(obj, 'franchise'):
            return FranchiseSerializer(obj.franchise).data
        return None
        
class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = ('username', 'email', 'first_name', 'last_name', 'phone_number', 'password')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        return models.User.objects.create_user(**validated_data)
        
class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = ('username',  'first_name', 'last_name', 'phone_number')

class UserCustomUpdatePasswordSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    re_password = serializers.CharField(write_only=True)

    class Meta:
        model = models.User
        fields = ('password', 're_password')

    def validate(self, attrs):
        # Validation des mots de passe
        password = attrs.get('password')
        re_password = attrs.get('re_password')

        if password != re_password:
            raise serializers.ValidationError({"re_password": "Les mots de passe ne correspondent pas."})

        try:
            password_validation.validate_password(password)
        except ValidationError as e:
            raise serializers.ValidationError({"password": e.messages})

        return attrs

class PasswordUpdateSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        # Ensure the new password and confirm password match
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Les mots de passe doivent correspondre.")
        
        # Ensure the new password is valid according to Django's password validation rules
        try:
            password_validation.validate_password(data['new_password'])
        except ValidationError as e:
            raise serializers.ValidationError({"new_password": e.messages})
        
        return data

    def save(self):
        # Handle password update
        user = self.context['request'].user
        old_password = self.initial_data['old_password']

        if not user.check_password(old_password):
            raise serializers.ValidationError("L'ancien mot de passe est incorrect.")

        new_password = self.validated_data['new_password']
        user.set_password(new_password)
        user.save()
       