# views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from decimal import Decimal
from rest_framework.views import APIView
from .serializers import ContactSerializer
from gestion_camions.models import Franchise
from .serializers import FranchiseSerializer, UserSerializer, FranchiseUserRegistrationSerializer

User = get_user_model()

class FranchiseListCreateView(generics.ListCreateAPIView):
    """Liste et création des franchises"""
    queryset = Franchise.objects.all().select_related('user')
    serializer_class = FranchiseSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def get_queryset(self):
        """Filtrage par statut si spécifié"""
        queryset = Franchise.objects.all().select_related('user')  # Ne pas utiliser self.queryset
        statut = self.request.query_params.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)
        return queryset
    
    def create(self, request, *args, **kwargs):
        """Création d'une franchise avec validation"""
        try:
            # Vérifier que l'utilisateur n'a pas déjà une franchise
            user_id = request.data.get('user')
            if user_id and Franchise.objects.filter(user_id=user_id).exists():
                return Response(
                    {'error': 'Cet utilisateur a déjà une franchise associée.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Sauvegarder avec droit d'entrée fixé
            serializer.save(droit_entree=Decimal('50000.00'))
            
                
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la création: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class FranchiseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'une franchise"""
    queryset = Franchise.objects.all().select_related('user')
    serializer_class = FranchiseSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def update(self, request, *args, **kwargs):
        """Mise à jour d'une franchise avec protection du champ user"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Créer une copie des données pour modification
        data = request.data.copy()
        
        # Si on tente de modifier l'utilisateur, vérifier que c'est le même
        if 'user' in data and str(data['user']) != str(instance.user_id):
            return Response(
                {'user': "Vous ne pouvez pas modifier l'utilisateur associé à une franchise existante."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)
    
    def perform_destroy(self, instance):
        """Suppression d'une franchise avec mise à jour de has_franchise"""
        # Sauvegarder l'utilisateur avant suppression
        user = instance.user
        
        # Supprimer la franchise
        super().perform_destroy(instance)
        
        if user:
            user.has_franchise = False
            user.save()


class UserListView(generics.ListAPIView):
    """Liste des utilisateurs disponibles pour créer des franchises"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def get_queryset(self):
        """Utilisateurs actifs sans franchise existante"""
        return User.objects.filter(
            is_active=True,
            franchise__isnull=True
        ).exclude(
            is_superuser=True
        ).order_by('first_name', 'last_name')
       
class FranchiseUserRegistrationView(generics.CreateAPIView):
    """Inscription d'un utilisateur comme franchisé"""
    serializer_class = FranchiseUserRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        """Création d'une franchise pour l'utilisateur connecté"""
        try:
            # Vérifier que l'utilisateur n'a pas déjà une franchise
            if Franchise.objects.filter(user=request.user).exists():
                return Response(
                    {'error': 'Vous avez déjà une franchise associée à votre compte.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Vérifier que l'utilisateur n'est pas un admin
            if request.user.is_superuser or request.user.is_staff:
                return Response(
                    {'error': 'Les administrateurs ne peuvent pas créer de franchise via cette interface.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Assigner automatiquement l'utilisateur connecté et le droit d'entrée
            franchise = serializer.save(
                user=request.user,
                droit_entree=Decimal('50000.00')
            )
            
            return Response(
                {
                    'message': 'Demande de franchise créée avec succès !',
                    'franchise': FranchiseSerializer(franchise).data
                }, 
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la création de la demande: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
class ContactView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ContactSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                    'success': True,
                    'message': 'Message envoyé avec succès !',
                }, status=status.HTTP_201_CREATED)
        return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
