# views.py - API Views pour l'espace Franchisé DRIV'N COOK

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from django.core.exceptions import PermissionDenied
from datetime import datetime, timedelta
from rest_framework import serializers
from gestion_camions.models import (
    Camion, CommandeFranchise, Franchise,
    VenteFranchise, Entrepot, StockEntrepot,
    AffectationEmplacement, Emplacement, MaintenanceCamion, DetailCommande
)

from .serializers import (
    MesCommandeCreateSerializer,
    MesCommandeUpdateSerializer,
    MesDetailCommandeSerializer,
    VenteFranchiseSerializer,
    VenteFranchiseCreateSerializer,
    FranchiseProfileSerializer,
    CamionFranchiseSerializer,
    EmplacementSerializer,
    AffectationEmplacementSerializer,
    MaintenanceCamionSerializer,
    EntrepotSerializer,
    StockEntrepotSerializer,
    StockMultiEntrepotSerializer,
    CommandeFranchiseMultiEntrepotSerializer
)


class IsFranchiseOwner(permissions.BasePermission):
    """Permission personnalisée pour les franchisés"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'franchise')
    
    def has_object_permission(self, request, view, obj):
        # Vérifier que l'objet appartient au franchisé connecté 
        if hasattr(obj, 'franchise'):
            return obj.franchise == request.user.franchise
        return True

# ========== GESTION DU PROFIL FRANCHISÉ ==========

class FranchiseProfileView(generics.RetrieveUpdateAPIView):
    """Profil du franchisé - lecture et modification limitée"""
    serializer_class = FranchiseProfileSerializer
    permission_classes = [IsFranchiseOwner]
    
    def get_object(self):
        """Récupérer l'objet franchise de l'utilisateur connecté"""
        try:
            return Franchise.objects.select_related('user').get(user=self.request.user)
        except Franchise.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("Aucune franchise associée à cet utilisateur")
    
    def retrieve(self, request, *args, **kwargs):
        """Récupération du profil"""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Erreur retrieve: {e}")
            return Response(
                {'error': f'Erreur lors du chargement du profil: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, *args, **kwargs):
        """Mise à jour du profil"""
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            
            # Log des données reçues
            print(f"Données reçues: {request.data}")
            
            # Préparer les données
            data = request.data.copy()
            
            # Gérer les données utilisateur si elles sont dans 'user'
            if 'user' in data:
                user_data = data.pop('user')
                for key, value in user_data.items():
                    data[key] = value
            
            print(f"Données préparées: {data}")
            
            serializer = self.get_serializer(instance, data=data, partial=partial)
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                print(f"Erreurs de validation: {serializer.errors}")
                return Response(
                    {'error': 'Données invalides', 'details': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            print(f"Erreur update: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Erreur lors de la mise à jour: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def partial_update(self, request, *args, **kwargs):
        """Mise à jour partielle"""
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
# ========== GESTION DES CAMIONS ==========

class CamionFranchiseListView(generics.ListAPIView):
    """Liste des camions du franchisé"""
    serializer_class = CamionFranchiseSerializer
    permission_classes = [IsFranchiseOwner]
    
    def get_queryset(self):
        return Camion.objects.filter(franchise=self.request.user.franchise)

class CamionFranchiseDetailView(generics.RetrieveAPIView):
    """Détail d'un camion du franchisé"""
    serializer_class = CamionFranchiseSerializer
    permission_classes = [IsFranchiseOwner]
    
    def get_queryset(self):
        return Camion.objects.filter(franchise=self.request.user.franchise)

# ========== GESTION DES EMPLACEMENTS ET AFFECTATIONS ==========

class EmplacementListView(generics.ListAPIView):
    """Liste des emplacements autorisés pour la franchise connectée"""
    serializer_class = EmplacementSerializer
    permission_classes = [IsFranchiseOwner]
    
    def get_queryset(self):
        """🎯 MODIFIÉ : Filtrer par franchises_autorisees"""
        return Emplacement.objects.filter(
            franchises_autorisees=self.request.user.franchise
        ).prefetch_related('affectations')
    
    def get_serializer_context(self):
        return {'request': self.request}

class AffectationEmplacementListCreateView(generics.ListCreateAPIView):
    """Affectations d'emplacements du franchisé"""
    serializer_class = AffectationEmplacementSerializer
    permission_classes = [IsFranchiseOwner]
    
    def get_queryset(self):
        return AffectationEmplacement.objects.filter(
            camion__franchise=self.request.user.franchise
        ).select_related('camion', 'emplacement').order_by('-date_debut')
    
    def get_serializer_context(self):
        return {'request': self.request}
    
    def create(self, request, *args, **kwargs):
        """🎯 MODIFIÉ : Validation supplémentaire lors de la création"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Vérifications supplémentaires avant création
        camion = serializer.validated_data['camion']
        emplacement = serializer.validated_data['emplacement']
        franchise = request.user.franchise
        
        # Double vérification que l'emplacement est autorisé
        if not emplacement.franchises_autorisees.filter(id=franchise.id).exists():
            return Response(
                {'error': f"Votre franchise n'est pas autorisée à utiliser l'emplacement '{emplacement.nom_emplacement}'"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class AffectationEmplacementDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail/modification/suppression d'une affectation"""
    serializer_class = AffectationEmplacementSerializer
    permission_classes = [IsFranchiseOwner]
    
    def get_queryset(self):
        return AffectationEmplacement.objects.filter(
            camion__franchise=self.request.user.franchise
        ).select_related('camion', 'emplacement')
    
    def get_serializer_context(self):
        return {'request': self.request}
    
    def update(self, request, *args, **kwargs):
        """🎯 MODIFIÉ : Validation lors de la mise à jour"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Vérifier que l'affectation peut être modifiée
        if instance.statut in ['termine', 'annule']:
            return Response(
                {'error': 'Impossible de modifier une affectation terminée ou annulée'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """🎯 MODIFIÉ : Validation lors de la suppression"""
        instance = self.get_object()
        
        # Seules les affectations programmées peuvent être supprimées
        if instance.statut not in ['programme']:
            return Response(
                {'error': 'Seules les affectations programmées peuvent être supprimées'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().destroy(request, *args, **kwargs)

# ========== GESTION DES MAINTENANCES ==========

class MaintenanceCamionListView(generics.ListAPIView):
    """Historique des maintenances des camions du franchisé"""
    serializer_class = MaintenanceCamionSerializer
    permission_classes = [IsFranchiseOwner]
    
    def get_queryset(self):
        return MaintenanceCamion.objects.filter(
            camion__franchise=self.request.user.franchise
        ).order_by('-date_maintenance')

# ========== GESTION DES ENTREPÔTS ET STOCKS ==========

class EntrepotListView(generics.ListAPIView):
    """Liste des entrepôts disponibles"""
    serializer_class = EntrepotSerializer
    permission_classes = [IsFranchiseOwner]
    queryset = Entrepot.objects.filter(statut='actif')

class StockEntrepotListView(generics.ListAPIView):
    """Consultation des stocks par entrepôt"""
    serializer_class = StockEntrepotSerializer
    permission_classes = [IsFranchiseOwner]
    
    def get_queryset(self):
        entrepot_id = self.request.query_params.get('entrepot')
        queryset = StockEntrepot.objects.filter(quantite_disponible__gt=0)
        
        if entrepot_id:
            queryset = queryset.filter(entrepot_id=entrepot_id)
        
        return queryset.select_related('produit', 'entrepot')

# ========== GESTION DES COMMANDES ==========

# ========== GESTION DES COMMANDES MULTI-ENTREPÔTS ==========

class MesCommandesListCreateView(generics.ListCreateAPIView):
    """Liste et création des commandes multi-entrepôts pour le franchisé connecté"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Vérifier que l'utilisateur est un franchisé
        if not hasattr(self.request.user, 'franchise'):
            return CommandeFranchise.objects.none()
        
        # Retourner seulement les commandes de sa franchise avec tous les détails
        queryset = CommandeFranchise.objects.filter(
            franchise=self.request.user.franchise
        ).prefetch_related(
            'details__produit',
            'details__entrepot_livraison'
        )
        
        # Filtres optionnels
        statut = self.request.query_params.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)
        
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
            return MesCommandeCreateSerializer
        return CommandeFranchiseMultiEntrepotSerializer
    
    def perform_create(self, serializer):
        # Vérifier que l'utilisateur est un franchisé
        if not hasattr(self.request.user, 'franchise'):
            raise PermissionDenied("Seuls les franchisés peuvent créer des commandes")
        
        # Créer la commande pour la franchise de l'utilisateur connecté
        serializer.save(franchise=self.request.user.franchise)


class MesCommandesDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'une commande multi-entrepôts du franchisé"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Vérifier que l'utilisateur est un franchisé
        if not hasattr(self.request.user, 'franchise'):
            return CommandeFranchise.objects.none()
        
        # Retourner seulement ses propres commandes avec tous les détails
        return CommandeFranchise.objects.filter(
            franchise=self.request.user.franchise
        ).prefetch_related(
            'details__produit',
            'details__entrepot_livraison'
        )
    
    def get_serializer_class(self):
        """Utiliser différents serializers selon l'action"""
        if self.request.method in ['PUT', 'PATCH']:
            return MesCommandeUpdateSerializer
        return CommandeFranchiseMultiEntrepotSerializer
    
    def perform_update(self, serializer):
        """Gestion de la mise à jour avec vérifications"""
        # Vérifier l'accès
        commande = self.get_object()
        if commande.franchise != self.request.user.franchise:
            raise PermissionDenied("Vous ne pouvez modifier que vos propres commandes")
        
        # Vérifier que la commande peut être modifiée (seulement en attente)
        if commande.statut != 'en_attente':
            raise serializers.ValidationError({
                'statut': 'Seules les commandes en attente peuvent être modifiées'
            })
        
        # Maintenir la franchise actuelle
        serializer.save(franchise=self.request.user.franchise)
    
    def perform_destroy(self, instance):
        """Suppression avec vérifications"""
        # Vérifier l'accès
        if instance.franchise != self.request.user.franchise:
            raise PermissionDenied("Vous ne pouvez supprimer que vos propres commandes")
        
        # Vérifier que la commande peut être supprimée
        if instance.statut not in ['en_attente', 'annulee']:
            raise serializers.ValidationError({
                'statut': 'Seules les commandes en attente ou annulées peuvent être supprimées'
            })
        
        instance.delete()


# ========== GESTION DES DÉTAILS DE COMMANDE MULTI-ENTREPÔTS ==========

class MesDetailCommandeListCreateView(generics.ListCreateAPIView):
    """Liste et création des détails pour une commande multi-entrepôts du franchisé"""
    serializer_class = MesDetailCommandeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        commande_id = self.kwargs.get('commande_id')
        
        # Vérifier que l'utilisateur est un franchisé
        if not hasattr(self.request.user, 'franchise'):
            return DetailCommande.objects.none()
        
        # Vérifier que la commande appartient au franchisé
        try:
            commande = CommandeFranchise.objects.get(
                id=commande_id, 
                franchise=self.request.user.franchise
            )
        except CommandeFranchise.DoesNotExist:
            return DetailCommande.objects.none()
        
        return DetailCommande.objects.filter(
            commande_id=commande_id
        ).select_related('produit', 'entrepot_livraison')
    
    def perform_create(self, serializer):
        commande_id = self.kwargs.get('commande_id')
        
        # Vérifier que l'utilisateur est un franchisé
        if not hasattr(self.request.user, 'franchise'):
            raise PermissionDenied("Seuls les franchisés peuvent ajouter des détails")
        
        # Récupérer et vérifier la commande
        commande = get_object_or_404(
            CommandeFranchise, 
            id=commande_id, 
            franchise=self.request.user.franchise
        )
        
        # Vérifier que la commande peut être modifiée
        if commande.statut != 'en_attente':
            raise serializers.ValidationError(
                "Seules les commandes en attente peuvent être modifiées"
            )
        
        produit = serializer.validated_data['produit']
        entrepot_livraison = serializer.validated_data['entrepot_livraison']
        
        # Vérifier que le produit est disponible dans l'entrepôt spécifié
        try:
            stock = StockEntrepot.objects.get(produit=produit, entrepot=entrepot_livraison)
            if stock.quantite_disponible < serializer.validated_data['quantite_commandee']:
                raise serializers.ValidationError(
                    f"Stock insuffisant : {stock.quantite_disponible} disponible(s)"
                )
        except StockEntrepot.DoesNotExist:
            raise serializers.ValidationError(
                f"Le produit {produit.nom_produit} n'est pas disponible dans {entrepot_livraison.nom_entrepot}"
            )
        
        # Vérifier les doublons (même produit + même entrepôt dans la même commande)
        if DetailCommande.objects.filter(
            commande=commande,
            produit=produit,
            entrepot_livraison=entrepot_livraison
        ).exists():
            raise serializers.ValidationError(
                f"Le produit {produit.nom_produit} est déjà commandé depuis {entrepot_livraison.nom_entrepot}"
            )
        
        # Sauvegarder le détail
        detail = serializer.save(
            commande=commande,
            prix_unitaire=produit.prix_unitaire
        )
        
        # Recalculer les montants et vérifier la règle 80/20
        commande.calculer_montants()
        
        # Vérifier la règle 80/20
        conforme, pourcentage_drivn, message = commande.respecte_regle_80_20()
        if not conforme:
            # Supprimer le détail qui vient d'être ajouté car il ne respecte pas la règle
            detail.delete()
            commande.calculer_montants()  # Recalculer sans ce détail
            raise serializers.ValidationError(
                f"Règle 80/20 non respectée avec ce produit : {message}"
            )
        
        commande.save()


class MesDetailCommandeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'un détail de commande multi-entrepôts du franchisé"""
    serializer_class = MesDetailCommandeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Vérifier que l'utilisateur est un franchisé
        if not hasattr(self.request.user, 'franchise'):
            return DetailCommande.objects.none()
        
        # Retourner seulement les détails des commandes de sa franchise
        return DetailCommande.objects.filter(
            commande__franchise=self.request.user.franchise
        ).select_related('produit', 'entrepot_livraison', 'commande')
    
    def perform_update(self, serializer):
        # Vérifier l'accès
        detail = self.get_object()
        if detail.commande.franchise != self.request.user.franchise:
            raise PermissionDenied("Vous ne pouvez modifier que vos propres détails de commande")
        
        # Vérifier que la commande peut être modifiée
        if detail.commande.statut != 'en_attente':
            raise serializers.ValidationError(
                "Seules les commandes en attente peuvent être modifiées"
            )
        
        # Sauvegarder avec recalcul des montants
        serializer.save()
        
        # Recalculer les montants après modification
        commande = serializer.instance.commande
        commande.calculer_montants()
        
        # Vérifier la règle 80/20 après modification
        conforme, pourcentage_drivn, message = commande.respecte_regle_80_20()
        if not conforme:
            # Restaurer l'ancien état si la règle n'est plus respectée
            raise serializers.ValidationError(
                f"Modification non autorisée - Règle 80/20 non respectée : {message}"
            )
        
        commande.save()
    
    def perform_destroy(self, instance):
        # Vérifier l'accès
        if instance.commande.franchise != self.request.user.franchise:
            raise PermissionDenied("Vous ne pouvez supprimer que vos propres détails de commande")
        
        # Vérifier que la commande peut être modifiée
        if instance.commande.statut != 'en_attente':
            raise serializers.ValidationError(
                "Seules les commandes en attente peuvent être modifiées"
            )
        
        commande = instance.commande
        instance.delete()
        
        # Recalculer les montants après suppression
        commande.calculer_montants()
        commande.save()


# ========== VUE POUR LES STOCKS MULTI-ENTREPÔTS ==========
class StockMultiEntrepotListView(generics.ListAPIView):
    """Consultation des stocks d'un produit dans tous les entrepôts"""
    serializer_class = StockMultiEntrepotSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Retourne les produits avec leurs stocks dans différents entrepôts"""
        produit_id = self.request.query_params.get('produit')
        
        if produit_id:
            # Stocks pour un produit spécifique
            stocks = StockEntrepot.objects.filter(
                produit_id=produit_id,
                quantite_disponible__gt=0
            ).select_related('produit', 'entrepot')
            
            if stocks.exists():
                produit = stocks.first().produit
                return [{
                    'produit_id': produit.id,
                    'produit_nom': produit.nom_produit,
                    'prix_unitaire': produit.prix_unitaire,
                    'unite': produit.unite,
                }]
        else:
            # Tous les produits avec leurs stocks
            from django.db.models import Exists, OuterRef
            from gestion_camions.models import Produit
            
            queryset = Produit.objects.filter(
                Exists(
                    StockEntrepot.objects.filter(
                        produit=OuterRef('pk'),
                        quantite_disponible__gt=0
                    )
                )
            ).values(
                'id', 'nom_produit', 'prix_unitaire', 'unite'
            )
            
            return [
                {
                    'produit_id': p['id'],
                    'produit_nom': p['nom_produit'],
                    'prix_unitaire': p['prix_unitaire'],
                    'unite': p['unite'],
                }
                for p in queryset
            ]
        
        return []
# ========== GESTION DES VENTES ==========

class VenteFranchiseListCreateView(generics.ListCreateAPIView):
    """Saisie et consultation des ventes quotidiennes"""
    permission_classes = [IsFranchiseOwner]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return VenteFranchiseCreateSerializer
        return VenteFranchiseSerializer
    
    def get_queryset(self):
        queryset = VenteFranchise.objects.filter(
            franchise=self.request.user.franchise
        ).order_by('-date_vente')
        
        # Filtrage par période
        date_debut = self.request.query_params.get('date_debut')
        date_fin = self.request.query_params.get('date_fin')
        
        if date_debut:
            queryset = queryset.filter(date_vente__gte=date_debut)
        if date_fin:
            queryset = queryset.filter(date_vente__lte=date_fin)
            
        return queryset
    
    def get_serializer_context(self):
        return {'request': self.request}

# Remplacez votre VenteFranchiseDetailView par celui-ci :

class VenteFranchiseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail/modification/suppression d'une vente"""
    permission_classes = [IsFranchiseOwner]
    
    def get_serializer_class(self):
        """Utiliser le bon serializer selon l'action"""
        if self.request.method in ['PUT', 'PATCH']:
            return VenteFranchiseCreateSerializer
        return VenteFranchiseSerializer
    
    def get_queryset(self):
        return VenteFranchise.objects.filter(
            franchise=self.request.user.franchise
        )
    
    def get_serializer_context(self):
        """Passer le contexte request au serializer"""
        return {'request': self.request}

# ========== VUES STATISTIQUES ==========

@api_view(['GET'])
@permission_classes([IsFranchiseOwner])
def dashboard_stats(request):
    """Statistiques pour le tableau de bord du franchisé"""
    franchise = request.user.franchise
    
    # Statistiques des camions
    camions_total = Camion.objects.filter(franchise=franchise).count()
    camions_actifs = Camion.objects.filter(
        franchise=franchise, 
        statut__in=['disponible', 'attribue']
    ).count()
    
    # 🎯 AJOUTÉ : Statistiques des emplacements
    emplacements_autorises = Emplacement.objects.filter(
        franchises_autorisees=franchise
    ).count()
    
    # Statistiques des commandes
    commandes_en_cours = CommandeFranchise.objects.filter(
        franchise=franchise,
        statut__in=['en_attente', 'validee', 'preparee']
    ).count()
    
    # Statistiques des ventes (30 derniers jours)
    date_limite = datetime.now().date() - timedelta(days=30)
    ventes_30j = VenteFranchise.objects.filter(
        franchise=franchise,
        date_vente__gte=date_limite
    ).aggregate(
        total_ca=Sum('chiffre_affaires_jour'),
        total_redevance=Sum('redevance_due')
    )
    
    # Affectations actives
    affectations_actives = AffectationEmplacement.objects.filter(
        camion__franchise=franchise,
        statut='en_cours'
    ).count()
    
    # 🎯 AJOUTÉ : Affectations programmées
    affectations_programmees = AffectationEmplacement.objects.filter(
        camion__franchise=franchise,
        statut='programme'
    ).count()
    
    return Response({
        'camions': {
            'total': camions_total,
            'actifs': camions_actifs
        },
        # 🎯 AJOUTÉ : Section emplacements
        'emplacements': {
            'autorises': emplacements_autorises,
            'affectations_actives': affectations_actives,
            'affectations_programmees': affectations_programmees
        },
        'commandes_en_cours': commandes_en_cours,
        'ventes_30j': {
            'chiffre_affaires': ventes_30j['total_ca'] or 0,
            'redevance_due': ventes_30j['total_redevance'] or 0
        },
        'affectations_actives': affectations_actives  # 🎯 Gardé pour compatibilité
    })
     
    
# Rapport de ventes mensuel en PDF
from django.http import HttpResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from io import BytesIO
from datetime import datetime



@api_view(['GET'])
@permission_classes([IsFranchiseOwner])
def rapport_ventes_mensuel(request):
    """Rapport de ventes mensuel en PDF"""
    franchise = request.user.franchise
    mois = request.query_params.get('mois')  # Format: YYYY-MM
    
    if not mois:
        return Response(
            {'error': 'Paramètre mois requis (format: YYYY-MM)'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        annee, mois_num = mois.split('-')
        annee, mois_num = int(annee), int(mois_num)
    except ValueError:
        return Response(
            {'error': 'Format de mois invalide (format: YYYY-MM)'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Récupérer les ventes du mois
    ventes = VenteFranchise.objects.filter(
        franchise=franchise,
        date_vente__year=annee,
        date_vente__month=mois_num
    ).order_by('date_vente')
    
    # Calculer les totaux
    total_ca = ventes.aggregate(Sum('chiffre_affaires_jour'))['chiffre_affaires_jour__sum'] or 0
    total_redevance = ventes.aggregate(Sum('redevance_due'))['redevance_due__sum'] or 0
    
    # Nom du mois en français
    mois_noms = [
        '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ]
    
    # Générer le PDF
    buffer = BytesIO()
    
    # Configuration du document
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        spaceAfter=30,
        textColor=colors.HexColor('#3b82f6'),
        alignment=1  # Centré
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=20,
        textColor=colors.HexColor('#666666'),
        alignment=1
    )
    
    normal_style = styles['Normal']
    
    # Contenu du PDF
    story = []
    
    # Titre
    story.append(Paragraph("RAPPORT MENSUEL DE VENTES", title_style))
    story.append(Paragraph(f"DRIV'N COOK - {franchise.nom_franchise}", subtitle_style))
    story.append(Spacer(1, 20))
    
    # Informations de la franchise
    franchise_data = [
        ['Franchise:', franchise.nom_franchise],
        ['Propriétaire:', f"{franchise.user.first_name} {franchise.user.last_name}"],
        ['Adresse:', f"{franchise.adresse}, {franchise.code_postal} {franchise.ville}"],
        ['Période:', f"{mois_noms[mois_num]} {annee}"],
        ['Date de génération:', datetime.now().strftime("%d/%m/%Y à %H:%M")],
    ]
    
    franchise_table = Table(franchise_data, colWidths=[4*cm, 12*cm])
    franchise_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f8fafc')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    story.append(franchise_table)
    story.append(Spacer(1, 20))
    
    # Résumé des ventes
    story.append(Paragraph("RÉSUMÉ DU MOIS", styles['Heading2']))
    story.append(Spacer(1, 10))
    
    resume_data = [
        ['Nombre de jours d\'activité:', str(ventes.count())],
        ['Chiffre d\'affaires total:', f"{total_ca:,.2f} €"],
        ['Redevances dues (4%):', f"{total_redevance:,.2f} €"],
        ['Moyenne journalière:', f"{(total_ca / ventes.count() if ventes.count() > 0 else 0):,.2f} €"],
    ]
    
    resume_table = Table(resume_data, colWidths=[8*cm, 8*cm])
    resume_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e0f2fe')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#bae6fd')),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    story.append(resume_table)
    story.append(Spacer(1, 30))
    
    # Détail des ventes
    if ventes.exists():
        story.append(Paragraph("DÉTAIL DES VENTES", styles['Heading2']))
        story.append(Spacer(1, 10))
        
        # En-têtes du tableau
        ventes_data = [['Date', 'Chiffre d\'affaires', 'Transactions', 'Redevance due']]
        
        # Données des ventes
        for vente in ventes:
            ventes_data.append([
                vente.date_vente.strftime("%d/%m/%Y"),
                f"{vente.chiffre_affaires_jour:,.2f} €",
                str(vente.nombre_transactions),
                f"{vente.redevance_due:,.2f} €"
            ])
        
        # Ligne de total
        ventes_data.append([
            'TOTAL',
            f"{total_ca:,.2f} €",
            str(sum(v.nombre_transactions for v in ventes)),
            f"{total_redevance:,.2f} €"
        ])
        
        ventes_table = Table(ventes_data, colWidths=[3*cm, 4*cm, 3*cm, 4*cm])
        ventes_table.setStyle(TableStyle([
            # En-tête
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            
            # Corps du tableau
            ('FONTNAME', (0, 1), (-1, -2), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -2), 9),
            ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
            ('ALIGN', (0, 1), (0, -1), 'CENTER'),
            
            # Ligne de total
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#dbeafe')),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 10),
            
            # Grille et espacement
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            
            # Alternance de couleurs
            ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.HexColor('#f9fafb')]),
        ]))
        
        story.append(ventes_table)
    else:
        story.append(Paragraph("Aucune vente enregistrée pour cette période.", normal_style))
    
    # Générer le PDF
    doc.build(story)
    
    # Nom du fichier
    filename = f"rapport_ventes_{franchise.nom_franchise.replace(' ', '_')}_{mois}.pdf"
    
    # Préparer la réponse
    pdf = buffer.getvalue()
    buffer.close()
    
    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    response['Content-Length'] = len(pdf)
    
    return response