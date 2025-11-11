# views.py - DRIV'N COOK Mission 1 (VERSION FINALE 80/20)
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, F
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import (
    Entrepot, Franchise, Emplacement, Camion, MaintenanceCamion,
    AffectationEmplacement, CategorieProduit, Produit, StockEntrepot,
    CommandeFranchise, VenteFranchise
)
from rest_framework.decorators import action
from rest_framework.decorators import api_view, permission_classes

from .serializers import (
    EntrepotSerializer, EmplacementSerializer,
    CamionSerializer, MaintenanceCamionSerializer, AffectationEmplacementSerializer,
    CategorieProduitSerializer, ProduitSerializer, StockEntrepotSerializer,
    VenteFranchiseSerializer, EntrepotSimpleSerializer,
    AdminCommandeFranchiseMultiEntrepotSerializer, AdminCommandeCreateSerializer,
    AdminCommandeUpdateSerializer,
    

)
from rest_framework import generics
from django.shortcuts import get_object_or_404
from django.core.exceptions import PermissionDenied

User = get_user_model()


class IsAdminOrOwner(permissions.BasePermission):
    """Permission personnalisée : Admin complet ou Franchisé ses données uniquement"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Admin a tous les droits
        if request.user.is_superuser:
            return True
        
        # Franchisé ne peut voir que ses propres données
        if hasattr(request.user, 'franchise'):
            # Pour les objets liés à une franchise
            if hasattr(obj, 'franchise'):
                return obj.franchise == request.user.franchise
            # Pour l'objet Franchise lui-même
            if isinstance(obj, Franchise):
                return obj == request.user.franchise
            # Pour les camions attribués au franchisé
            if isinstance(obj, Camion):
                return obj.franchise == request.user.franchise
        
        return False


# ===============================================
# BACK-OFFICE VIEWS (Admin Driv'n Cook uniquement)
# ===============================================

class EntrepotListCreateView(generics.ListCreateAPIView):
    """Liste et création des entrepôts (Driv'n Cook + fournisseurs libres)"""
    queryset = Entrepot.objects.all()
    serializer_class = EntrepotSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def get_queryset(self):
        """Filtrage par statut et type d'entrepôt"""
        queryset = Entrepot.objects.all().order_by('type_entrepot', 'nom_entrepot')
        
        statut = self.request.query_params.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)
        
        type_entrepot = self.request.query_params.get('type')
        if type_entrepot:
            queryset = queryset.filter(type_entrepot=type_entrepot)
        
        return queryset


class EntrepotDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'un entrepôt"""
    queryset = Entrepot.objects.all()
    serializer_class = EntrepotSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def entrepots_disponibles(request):
    """Liste des entrepôts disponibles pour les commandes (actifs uniquement)"""
    entrepots = Entrepot.objects.filter(statut='actif').order_by('type_entrepot', 'nom_entrepot')
    serializer = EntrepotSimpleSerializer(entrepots, many=True)
    return Response(serializer.data)


class EmplacementListCreateView(generics.ListCreateAPIView):
    """Liste et création des emplacements"""
    queryset = Emplacement.objects.all()
    serializer_class = EmplacementSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def get_queryset(self):
        """Filtrage par type de zone"""
        queryset = Emplacement.objects.all()
        type_zone = self.request.query_params.get('type_zone')
        if type_zone:
            queryset = queryset.filter(type_zone=type_zone)
        return queryset


class EmplacementDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'un emplacement"""
    queryset = Emplacement.objects.all()
    serializer_class = EmplacementSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]


class CamionListCreateView(generics.ListCreateAPIView):
    """Liste et création des camions"""
    queryset = Camion.objects.all()
    serializer_class = CamionSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]


class CamionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'un camion"""
    queryset = Camion.objects.all()
    serializer_class = CamionSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]


class MaintenanceListCreateView(generics.ListCreateAPIView):
    """Liste et création des maintenances"""
    queryset = MaintenanceCamion.objects.all()
    serializer_class = MaintenanceCamionSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]


class MaintenanceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'une maintenance"""
    queryset = MaintenanceCamion.objects.all()
    serializer_class = MaintenanceCamionSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]


class AffectationListCreateView(generics.ListCreateAPIView):
    """Liste et création des affectations"""
    queryset = AffectationEmplacement.objects.all()
    serializer_class = AffectationEmplacementSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]


class AffectationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'une affectation"""
    queryset = AffectationEmplacement.objects.all()
    serializer_class = AffectationEmplacementSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]


# ===============================================
# GESTION DES PRODUITS ET STOCKS (Admin)
# ===============================================

class CategorieListCreateView(generics.ListCreateAPIView):
    """Liste et création des catégories"""
    queryset = CategorieProduit.objects.all()
    serializer_class = CategorieProduitSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]


class CategorieDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'une catégorie"""
    queryset = CategorieProduit.objects.all()
    serializer_class = CategorieProduitSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]


class ProduitListCreateView(generics.ListCreateAPIView):
    """Liste et création des produits"""
    queryset = Produit.objects.all()
    serializer_class = ProduitSerializer
    permission_classes = [permissions.IsAuthenticated]


class ProduitDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'un produit"""
    queryset = Produit.objects.all()
    serializer_class = ProduitSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]


class StockEntrepotListCreateView(generics.ListCreateAPIView):
    """Liste et création des stocks"""
    queryset = StockEntrepot.objects.all()
    serializer_class = StockEntrepotSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filtrage par entrepôt et alertes"""
        queryset = StockEntrepot.objects.select_related('produit', 'entrepot')
        
        entrepot = self.request.query_params.get('entrepot')
        if entrepot:
            queryset = queryset.filter(entrepot_id=entrepot)
        
        alerte = self.request.query_params.get('alerte')
        if alerte == 'true':
            queryset = queryset.filter(quantite_disponible__lte=F('seuil_alerte'))
        
        return queryset.order_by('entrepot__nom_entrepot', 'produit__nom_produit')


class StockEntrepotDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'un stock"""
    queryset = StockEntrepot.objects.all()
    serializer_class = StockEntrepotSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]


class StockEntrepotByEntrepotView(generics.ListAPIView):
    """Stocks disponibles pour un entrepôt donné (pour les commandes)"""
    serializer_class = StockEntrepotSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        entrepot_id = self.kwargs.get('entrepot_id')
        return StockEntrepot.objects.filter(
            entrepot_id=entrepot_id,
            quantite_disponible__gt=0  # Seulement les produits en stock
        ).select_related('produit', 'entrepot').order_by('produit__nom_produit')


# ===============================================
# GESTION DES COMMANDES ET APPROVISIONNEMENT AVEC RÈGLE 80/20
# ===============================================



# ===============================================
# GESTION DES VENTES ET REDEVANCES
# ===============================================

class VenteFranchiseViewSet(viewsets.ModelViewSet):
    """Gestion des ventes quotidiennes avec redevance 4%"""
    queryset = VenteFranchise.objects.all().select_related('franchise')
    serializer_class = VenteFranchiseSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrOwner]
    
    def get_queryset(self):
        queryset = self.queryset
        
        # Filtrage pour franchisés
        if not self.request.user.is_superuser and hasattr(self.request.user, 'franchise'):
            queryset = queryset.filter(franchise=self.request.user.franchise)
        
        return queryset.order_by('-date_vente')


# ===============================================
# VUES UTILITAIRES ET RAPPORTS
# ===============================================
class AdminCommandesListCreateView(generics.ListCreateAPIView):
    """Liste et création des commandes multi-entrepôts (admin uniquement)"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Vérifier que l'utilisateur est admin
        if not (hasattr(self.request.user, 'is_staff') and self.request.user.is_staff):
            return CommandeFranchise.objects.none()
        
        # Retourner toutes les commandes avec tous les détails
        queryset = CommandeFranchise.objects.all().prefetch_related(
            'details__produit',
            'details__entrepot_livraison',
            'franchise'
        )
        
        # Filtres optionnels
        statut = self.request.query_params.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)
        
        franchise_id = self.request.query_params.get('franchise')
        if franchise_id:
            queryset = queryset.filter(franchise_id=franchise_id)
        
        # Filtre par conformité 80/20
        conforme_80_20 = self.request.query_params.get('conforme_80_20')
        if conforme_80_20 is not None:
            # Appliquer le filtre après avoir récupéré les objets
            # car la conformité est calculée dynamiquement
            queryset_list = list(queryset)
            if conforme_80_20 == 'false':
                queryset_list = [cmd for cmd in queryset_list if not cmd.respecte_regle_80_20()[0]]
            elif conforme_80_20 == 'true':
                queryset_list = [cmd for cmd in queryset_list if cmd.respecte_regle_80_20()[0]]
            return queryset_list
        
        return queryset.order_by('-date_commande')
    
    def get_serializer_class(self):
        """Utiliser différents serializers selon l'action"""
        if self.request.method == 'POST':
            return AdminCommandeCreateSerializer
        return AdminCommandeFranchiseMultiEntrepotSerializer
    
    def perform_create(self, serializer):
        # Vérifier que l'utilisateur est admin
        if not (hasattr(self.request.user, 'is_staff') and self.request.user.is_staff):
            raise PermissionDenied("Seuls les admins peuvent créer des commandes pour les franchises")
        
        # L'admin peut créer des commandes pour n'importe quelle franchise
        serializer.save()


class AdminCommandesDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'une commande multi-entrepôts (admin)"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Vérifier que l'utilisateur est admin
        if not (hasattr(self.request.user, 'is_staff') and self.request.user.is_staff):
            return CommandeFranchise.objects.none()
        
        # Retourner toutes les commandes avec tous les détails
        return CommandeFranchise.objects.all().prefetch_related(
            'details__produit',
            'details__entrepot_livraison',
            'franchise'
        )
    
    def get_serializer_class(self):
        """Utiliser différents serializers selon l'action"""
        if self.request.method in ['PUT', 'PATCH']:
            return AdminCommandeUpdateSerializer
        return AdminCommandeFranchiseMultiEntrepotSerializer
    
    def perform_update(self, serializer):
        """Gestion de la mise à jour avec vérifications"""
        # Vérifier que l'utilisateur est admin
        if not (hasattr(self.request.user, 'is_staff') and self.request.user.is_staff):
            raise PermissionDenied("Seuls les admins peuvent modifier les commandes")
        
        # Vérifier que la commande peut être modifiée (seulement en attente)
        commande = self.get_object()
        if commande.statut != 'en_attente':
            raise serializers.ValidationError({
                'statut': 'Seules les commandes en attente peuvent être modifiées'
            })
        
        # L'admin peut modifier pour n'importe quelle franchise
        serializer.save()
    
    def perform_destroy(self, instance):
        """Suppression avec vérifications"""
        # Vérifier que l'utilisateur est admin
        if not (hasattr(self.request.user, 'is_staff') and self.request.user.is_staff):
            raise PermissionDenied("Seuls les admins peuvent supprimer les commandes")
        
        # Vérifier que la commande peut être supprimée
        if instance.statut not in ['en_attente', 'annulee']:
            raise serializers.ValidationError({
                'statut': 'Seules les commandes en attente ou annulées peuvent être supprimées'
            })
        
        instance.delete()    

from django.db import transaction

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@transaction.atomic
def admin_valider_commande(request, pk):
    """Valider une commande (admin ou franchisé propriétaire)"""
    commande = get_object_or_404(CommandeFranchise, pk=pk)
    
    # Vérifier l'accès
    if hasattr(request.user, 'franchise') and commande.franchise != request.user.franchise:
        if not (request.user.is_staff or request.user.is_superuser):
            return Response({'error': 'Accès refusé'}, status=status.HTTP_403_FORBIDDEN)
    
    if not hasattr(request.user, 'franchise') and not (request.user.is_staff or request.user.is_superuser):
        return Response({'error': 'Accès refusé'}, status=status.HTTP_403_FORBIDDEN)
    
    # Vérifier le statut
    if commande.statut != 'en_attente':
        return Response(
            {'error': 'Seules les commandes en attente peuvent être validées'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Recalculer et vérifier la règle 80/20
    commande.calculer_montants()
    commande.save()
    
    conforme, pourcentage_drivn, message = commande.respecte_regle_80_20()
    if not conforme:
        return Response(
            {
                'error': 'Règle 80/20 non respectée',
                'details': message,
                'pourcentage_drivn_cook': pourcentage_drivn,
                'montant_drivn_cook': float(commande.montant_drivn_cook),
                'montant_fournisseur_libre': float(commande.montant_fournisseur_libre),
                'montant_total': float(commande.montant_total)
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Vérifier les stocks pour chaque entrepôt de livraison
    stocks_insuffisants = []
    for detail in commande.details.all():
        try:
            stock = StockEntrepot.objects.get(
                produit=detail.produit,
                entrepot=detail.entrepot_livraison
            )
            if stock.quantite_disponible < detail.quantite_commandee:
                stocks_insuffisants.append({
                    'produit': detail.produit.nom_produit,
                    'entrepot': detail.entrepot_livraison.nom_entrepot,
                    'demande': detail.quantite_commandee,
                    'disponible': stock.quantite_disponible
                })
        except StockEntrepot.DoesNotExist:
            stocks_insuffisants.append({
                'produit': detail.produit.nom_produit,
                'entrepot': detail.entrepot_livraison.nom_entrepot,
                'demande': detail.quantite_commandee,
                'disponible': 0
            })
    
    if stocks_insuffisants:
        return Response(
            {
                'error': 'Stocks insuffisants',
                'details': stocks_insuffisants
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validation réussie : diminuer les stocks et passer en validée
    commande.statut = 'validee'
    commande.save()
    
    # Diminuer les stocks disponibles dans chaque entrepôt
    for detail in commande.details.all():
        stock = StockEntrepot.objects.get(
            produit=detail.produit,
            entrepot=detail.entrepot_livraison
        )
        stock.quantite_disponible -= detail.quantite_commandee
        stock.quantite_reservee += detail.quantite_commandee
        stock.save()
    
    return Response({
        'message': 'Commande validée avec succès',
        'numero_commande': commande.numero_commande,
        'regle_80_20': message,
        'pourcentage_drivn_cook': pourcentage_drivn
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def admin_marquer_preparee(request, pk):
    """Marquer une commande comme préparée (admin uniquement)"""
    # Vérifier que l'utilisateur est admin
    if not (hasattr(request.user, 'is_staff') and request.user.is_staff):
        return Response({'error': 'Seuls les admins peuvent marquer les commandes comme préparées'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    commande = get_object_or_404(CommandeFranchise, pk=pk)
    
    if commande.statut != 'validee':
        return Response(
            {'error': 'Seules les commandes validées peuvent être marquées comme préparées'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Marquer comme préparée
    commande.statut = 'preparee'
    commande.save()
    
    return Response({'message': 'Commande marquée comme préparée'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def admin_marquer_livree(request, pk):
    """Marquer une commande comme livrée (admin uniquement)"""
    # Vérifier que l'utilisateur est admin
    if not (hasattr(request.user, 'is_staff') and request.user.is_staff):
        return Response({'error': 'Seuls les admins peuvent marquer les commandes comme livrées'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    commande = get_object_or_404(CommandeFranchise, pk=pk)
    
    if commande.statut != 'preparee':
        return Response(
            {'error': 'Seules les commandes préparées peuvent être marquées comme livrées'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # 🎯 LIBÉRER LES STOCKS RÉSERVÉS (SI GÉRÉ)
    for detail in commande.details.all():
        try:
            stock = StockEntrepot.objects.get(
                produit=detail.produit,
                entrepot=detail.entrepot_livraison
            )
            # Diminuer la quantité réservée si ce champ est géré
            if hasattr(stock, 'quantite_reservee'):
                stock.quantite_reservee -= detail.quantite_commandee
            stock.save()
        except StockEntrepot.DoesNotExist:
            pass
    
    commande.statut = 'livree'
    commande.save()
    
    return Response({'message': 'Commande marquée comme livrée'})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def rapport_conformite_80_20(request):
    """Rapport de conformité à la règle 80/20 sur une période"""
    queryset = CommandeFranchise.objects.select_related('franchise').prefetch_related('details')
    
    # Filtrage pour franchisés
    if hasattr(request.user, 'franchise'):
        queryset = queryset.filter(franchise=request.user.franchise)
    
    # Filtrage par période
    date_debut = request.query_params.get('date_debut')
    date_fin = request.query_params.get('date_fin')
    if date_debut:
        queryset = queryset.filter(date_commande__gte=date_debut)
    if date_fin:
        queryset = queryset.filter(date_commande__lte=date_fin)
    
    # Analyse
    commandes_conformes = []
    commandes_non_conformes = []
    
    for commande in queryset:
        commande.calculer_montants()
        conforme, message = commande.respecte_regle_80_20()
        
        data = {
            'numero_commande': commande.numero_commande,
            'franchise': commande.franchise.nom_franchise,
            'date_commande': commande.date_commande,
            'montant_total': float(commande.montant_total),
            'pourcentage_drivn_cook': commande.pourcentage_drivn_cook,
            'message': message
        }
        
        if conforme:
            commandes_conformes.append(data)
        else:
            commandes_non_conformes.append(data)
    
    total_commandes = len(commandes_conformes) + len(commandes_non_conformes)
    taux_conformite = (len(commandes_conformes) / total_commandes * 100) if total_commandes > 0 else 0
    
    return Response({
        'periode': {
            'date_debut': date_debut,
            'date_fin': date_fin
        },
        'statistiques': {
            'total_commandes': total_commandes,
            'commandes_conformes': len(commandes_conformes),
            'commandes_non_conformes': len(commandes_non_conformes),
            'taux_conformite': round(taux_conformite, 2)
        },
        'commandes_conformes': commandes_conformes,
        'commandes_non_conformes': commandes_non_conformes
    })


class DashboardViewSet(viewsets.ViewSet):
    """Tableau de bord et statistiques"""
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def stats_generales(self, request):
        """Statistiques générales (Admin) ou personnelles (Franchisé)"""
        if request.user.is_superuser:
            # Stats admin globales
            total_commandes = CommandeFranchise.objects.count()
            commandes_conformes = sum(
                1 for cmd in CommandeFranchise.objects.all() 
                if cmd.respecte_regle_80_20()[0]
            )
            
            stats = {
                'franchises_actives': Franchise.objects.filter(statut='actif').count(),
                'entrepots_drivn_cook': Entrepot.objects.filter(type_entrepot='drivn_cook', statut='actif').count(),
                'fournisseurs_libres': Entrepot.objects.filter(type_entrepot='fournisseur_libre', statut='actif').count(),
                'camions_disponibles': Camion.objects.filter(statut='disponible').count(),
                'commandes_en_attente': CommandeFranchise.objects.filter(statut='en_attente').count(),
                'alertes_stock': StockEntrepot.objects.filter(
                    quantite_disponible__lte=F('seuil_alerte')
                ).count(),
                'total_commandes': total_commandes,
                'commandes_conformes_80_20': commandes_conformes,
                'taux_conformite_80_20': round((commandes_conformes / total_commandes * 100), 2) if total_commandes > 0 else 0
            }
        else:
            # Stats franchisé
            franchise = getattr(request.user, 'franchise', None)
            if not franchise:
                return Response({'error': 'Utilisateur non associé à une franchise'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            mes_commandes = CommandeFranchise.objects.filter(franchise=franchise)
            commandes_conformes = sum(1 for cmd in mes_commandes if cmd.respecte_regle_80_20()[0])
            
            stats = {
                'mes_camions': Camion.objects.filter(franchise=franchise).count(),
                'mes_commandes_en_cours': CommandeFranchise.objects.filter(
                    franchise=franchise, statut__in=['en_attente', 'validee', 'preparee']
                ).count(),
                'mes_commandes_total': mes_commandes.count(),
                'mes_commandes_conformes': commandes_conformes,
                'mon_taux_conformite_80_20': round((commandes_conformes / mes_commandes.count() * 100), 2) if mes_commandes.count() > 0 else 0,
                'ca_mois_courant': VenteFranchise.objects.filter(
                    franchise=franchise,
                    date_vente__month=timezone.now().month,
                    date_vente__year=timezone.now().year
                ).aggregate(total=Sum('chiffre_affaires_jour'))['total'] or 0,
            }
        
        return Response(stats)