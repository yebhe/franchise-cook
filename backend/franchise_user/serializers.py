# serializers.py - Espace Franchisé DRIV'N COOK

from rest_framework import serializers
from django.contrib.auth.models import User
from gestion_camions.models import (
    Franchise, Camion, CommandeFranchise, DetailCommande, 
    VenteFranchise, Entrepot, Produit, StockEntrepot,
    AffectationEmplacement, Emplacement, MaintenanceCamion
)

# Dans serializers.py - Remplacez vos serializers par ceux-ci :

from rest_framework import serializers
from django.contrib.auth.models import User
from gestion_camions.models import Franchise

class UserSerializer(serializers.ModelSerializer):
    """Serializer simple pour les informations utilisateur"""
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username']
        read_only_fields = ['id', 'username']

# Dans serializers.py - Remplacez par cette version corrigée :

# Dans serializers.py - Remplacez votre FranchiseProfileSerializer par celui-ci :

class FranchiseProfileSerializer(serializers.ModelSerializer):
    """Profil complet du franchisé"""
    
    # Champs utilisateur (directement accessibles)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    first_name = serializers.CharField(max_length=150, required=False)
    last_name = serializers.CharField(max_length=150, required=False)
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Franchise
        fields = [
            'id', 'user_id', 'username', 'first_name', 'last_name', 'email',
            'nom_franchise', 'adresse', 'ville', 'code_postal', 
            'date_signature', 'droit_entree', 'statut'
        ]
        read_only_fields = ['id', 'user_id', 'username', 'email', 'date_signature', 'droit_entree', 'statut']
    
    def to_representation(self, instance):
        """Représentation des données pour la réponse"""
        data = super().to_representation(instance)
        # Ajouter les données utilisateur directement
        data['first_name'] = instance.user.first_name or ''
        data['last_name'] = instance.user.last_name or ''
        data['email'] = instance.user.email or ''
        return data
    
    def update(self, instance, validated_data):
        """Mise à jour du profil et de l'utilisateur"""
        
        # Extraire les données utilisateur
        first_name = validated_data.pop('first_name', None)
        last_name = validated_data.pop('last_name', None)
        
        # Mettre à jour l'utilisateur si nécessaire
        user_updated = False
        if first_name is not None and instance.user.first_name != first_name:
            instance.user.first_name = first_name
            user_updated = True
            
        if last_name is not None and instance.user.last_name != last_name:
            instance.user.last_name = last_name
            user_updated = True
        
        if user_updated:
            instance.user.save()
        
        # Mettre à jour la franchise
        franchise_updated = False
        for attr, value in validated_data.items():
            if hasattr(instance, attr) and getattr(instance, attr) != value:
                setattr(instance, attr, value)
                franchise_updated = True
        
        if franchise_updated:
            instance.save()
        
        return instance

class CamionFranchiseSerializer(serializers.ModelSerializer):
    """Camions attribués au franchisé (lecture seule)"""
    class Meta:
        model = Camion
        fields = [
            'id', 'numero_camion', 'marque', 'modele', 'immatriculation',
            'statut', 'date_attribution', 'kilometrage'
        ]
        read_only_fields = ['id', 'numero_camion', 'marque', 'modele', 'immatriculation', 'statut', 'date_attribution', 'kilometrage']

class EmplacementSerializer(serializers.ModelSerializer):
    """Emplacements autorisés pour la franchise connectée"""
    est_disponible = serializers.ReadOnlyField()
    affectation_actuelle = serializers.SerializerMethodField()
    
    class Meta:
        model = Emplacement
        fields = [
            'id', 'nom_emplacement', 'adresse', 'ville', 'type_zone',
            'tarif_journalier', 'horaires_autorises', 'est_disponible', 'affectation_actuelle'
        ]
        read_only_fields = [
            'id', 'nom_emplacement', 'adresse', 'ville', 'type_zone', 
            'tarif_journalier', 'horaires_autorises', 'est_disponible'
        ]
    
    def get_affectation_actuelle(self, obj):
        """Retourne l'affectation actuelle s'il y en a une"""
        request = self.context.get('request')
        if request and hasattr(request.user, 'franchise'):
            affectation = obj.affectations.filter(
                statut__in=['programme', 'en_cours'],
                camion__franchise=request.user.franchise
            ).first()
            
            if affectation:
                return {
                    'id': affectation.id,
                    'camion': affectation.camion.numero_camion,
                    'date_debut': affectation.date_debut,
                    'date_fin': affectation.date_fin,
                    'statut': affectation.statut
                }
        return None


class AffectationEmplacementSerializer(serializers.ModelSerializer):
    """Affectations d'emplacements pour les camions de la franchise"""
    emplacement_detail = EmplacementSerializer(source='emplacement', read_only=True)
    camion_detail = CamionFranchiseSerializer(source='camion', read_only=True)
    
    class Meta:
        model = AffectationEmplacement
        fields = [
            'id', 'camion', 'emplacement', 'date_debut', 'date_fin',
            'horaire_debut', 'horaire_fin', 'statut', 'emplacement_detail', 'camion_detail'
        ]
    
    def validate(self, data):
        """Validation complète pour les affectations"""
        request = self.context.get('request')
        if request and hasattr(request.user, 'franchise'):
            franchise = request.user.franchise
            camion = data['camion']
            emplacement = data['emplacement']
            
            # 🎯 Vérifier que le camion appartient au franchisé
            if camion.franchise != franchise:
                raise serializers.ValidationError({
                    'camion': "Vous ne pouvez affecter que vos propres camions."
                })
            
            # 🎯 Vérifier que la franchise est autorisée pour cet emplacement
            if not emplacement.franchises_autorisees.filter(id=franchise.id).exists():
                raise serializers.ValidationError({
                    'emplacement': f"Votre franchise n'est pas autorisée à utiliser l'emplacement '{emplacement.nom_emplacement}'"
                })
            
            # 🎯 Vérifier les conflits de dates/horaires
            date_debut = data.get('date_debut')
            if date_debut and data.get('statut', 'programme') in ['programme', 'en_cours']:
                conflits = AffectationEmplacement.objects.filter(
                    emplacement=emplacement,
                    date_debut=date_debut,
                    statut__in=['programme', 'en_cours']
                )
                
                # En modification, exclure l'instance actuelle
                if self.instance:
                    conflits = conflits.exclude(pk=self.instance.pk)
                
                if conflits.exists():
                    conflit = conflits.first()
                    raise serializers.ValidationError({
                        'date_debut': f"Conflit : emplacement déjà occupé le {date_debut} par le camion {conflit.camion.numero_camion}"
                    })
        
        return data

class MaintenanceCamionSerializer(serializers.ModelSerializer):
    """Maintenances des camions (lecture seule pour le franchisé)"""
    camion_detail = CamionFranchiseSerializer(source='camion', read_only=True)
    
    class Meta:
        model = MaintenanceCamion
        fields = [
            'id', 'camion', 'type_maintenance', 'description', 
            'date_maintenance', 'cout', 'garage', 'statut', 'camion_detail'
        ]
        read_only_fields = ['id', 'camion', 'type_maintenance', 'description', 'date_maintenance', 'cout', 'garage', 'statut', 'camion_detail']

class EntrepotSerializer(serializers.ModelSerializer):
    """Entrepôts disponibles pour approvisionnement"""
    class Meta:
        model = Entrepot
        fields = [
            'id', 'nom_entrepot', 'adresse', 'ville', 'type_entrepot', 'statut'
        ]
        read_only_fields = ['id', 'nom_entrepot', 'adresse', 'ville', 'type_entrepot', 'statut']

class ProduitSerializer(serializers.ModelSerializer):
    """Produits disponibles"""
    class Meta:
        model = Produit
        fields = ['id', 'nom_produit', 'prix_unitaire', 'unite']
        read_only_fields = ['id', 'nom_produit', 'prix_unitaire', 'unite']

class StockEntrepotSerializer(serializers.ModelSerializer):
    """Stocks disponibles par entrepôt"""
    produit_detail = ProduitSerializer(source='produit', read_only=True)
    entrepot_detail = EntrepotSerializer(source='entrepot', read_only=True)
    
    class Meta:
        model = StockEntrepot
        fields = [
            'id', 'produit', 'entrepot', 'quantite_disponible', 
            'alerte_stock', 'produit_detail', 'entrepot_detail'
        ]
        read_only_fields = ['id', 'produit', 'entrepot', 'quantite_disponible', 'alerte_stock', 'produit_detail', 'entrepot_detail']



# serializers.py - MODIFICATION pour supporter le multi-entrepôts

class MesDetailCommandeSerializer(serializers.ModelSerializer):
    """Serializer pour les détails de commande multi-entrepôts"""
    produit_nom = serializers.CharField(source='produit.nom_produit', read_only=True)
    entrepot_nom = serializers.CharField(source='entrepot_livraison.nom_entrepot', read_only=True)
    entrepot_type = serializers.CharField(source='entrepot_livraison.type_entrepot', read_only=True)
    entrepot_type_display = serializers.CharField(source='entrepot_livraison.get_type_entrepot_display', read_only=True)
    sous_total = serializers.SerializerMethodField()
    stock_disponible = serializers.SerializerMethodField()

    class Meta:
        model = DetailCommande
        fields = [
            'id', 'produit', 'produit_nom', 'entrepot_livraison', 'entrepot_nom', 
            'entrepot_type', 'entrepot_type_display', 'quantite_commandee', 
            'prix_unitaire', 'sous_total', 'stock_disponible'
        ]
        read_only_fields = ['id', 'prix_unitaire']

    def get_sous_total(self, obj):
        return obj.quantite_commandee * obj.prix_unitaire
    
    def get_stock_disponible(self, obj):
        """Stock disponible pour ce produit dans cet entrepôt"""
        try:
            stock = StockEntrepot.objects.get(
                produit=obj.produit,
                entrepot=obj.entrepot_livraison
            )
            return stock.quantite_disponible
        except StockEntrepot.DoesNotExist:
            return 0


class MesCommandeCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une commande multi-entrepôts avec adresse de livraison"""
    details = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        allow_empty=False,
        help_text="Liste des produits avec leurs entrepôts de livraison"
    )

    class Meta:
        model = CommandeFranchise
        fields = [
            'date_livraison_prevue', 'adresse_livraison', 'details'
        ]

    def validate_details(self, value):
        """Validation des détails multi-entrepôts"""
        if not value:
            raise serializers.ValidationError("Une commande doit contenir au moins un produit.")
        
        # Vérifier les doublons (même produit + même entrepôt)
        seen_combinations = set()
        for detail in value:
            produit_id = detail.get('produit')
            entrepot_id = detail.get('entrepot_livraison')
            
            if not produit_id or not entrepot_id:
                raise serializers.ValidationError(
                    "Chaque produit doit avoir un produit et un entrepôt de livraison spécifiés."
                )
            
            combination = (produit_id, entrepot_id)
            if combination in seen_combinations:
                raise serializers.ValidationError(
                    f"Le produit {produit_id} ne peut apparaître qu'une seule fois "
                    f"pour l'entrepôt {entrepot_id} dans la même commande."
                )
            seen_combinations.add(combination)
        
        return value

    def validate(self, data):
        """Validation globale avec règle 80/20 multi-entrepôts"""
        details_data = data.get('details', [])
        
        montant_drivn_cook = 0
        montant_fournisseur_libre = 0
        
        for detail in details_data:
            try:
                produit = Produit.objects.get(id=detail['produit'])
                entrepot = Entrepot.objects.get(id=detail['entrepot_livraison'])
            except (Produit.DoesNotExist, Entrepot.DoesNotExist):
                raise serializers.ValidationError(
                    f"Produit ou entrepôt introuvable : produit {detail.get('produit')}, "
                    f"entrepôt {detail.get('entrepot_livraison')}"
                )
            
            # Vérifier le stock disponible
            try:
                stock = StockEntrepot.objects.get(produit=produit, entrepot=entrepot)
                if stock.quantite_disponible < detail['quantite_commandee']:
                    raise serializers.ValidationError(
                        f"Stock insuffisant pour {produit.nom_produit} "
                        f"dans {entrepot.nom_entrepot} : "
                        f"disponible {stock.quantite_disponible}, "
                        f"demandé {detail['quantite_commandee']}"
                    )
            except StockEntrepot.DoesNotExist:
                raise serializers.ValidationError(
                    f"Le produit {produit.nom_produit} n'est pas disponible "
                    f"dans l'entrepôt {entrepot.nom_entrepot}"
                )
            
            quantite = int(detail['quantite_commandee'])
            prix = produit.prix_unitaire
            sous_total = quantite * prix
            
            # 🎯 CONTRÔLE BASÉ SUR LE TYPE D'ENTREPÔT POUR CHAQUE PRODUIT
            if entrepot.type_entrepot == 'drivn_cook':
                montant_drivn_cook += sous_total
            else:
                montant_fournisseur_libre += sous_total
        
        montant_total = montant_drivn_cook + montant_fournisseur_libre
        if montant_total == 0:
            raise serializers.ValidationError("Le montant total de la commande ne peut pas être nul.")
        
        pourcentage_drivn = (montant_drivn_cook / montant_total) * 100
        if pourcentage_drivn < 80:
            raise serializers.ValidationError(
                f"La commande ne respecte pas la règle 80/20 : "
                f"{pourcentage_drivn:.1f}% des achats viennent des entrepôts Driv'n Cook, "
                f"minimum requis 80%. Répartition : {montant_drivn_cook:.2f}€ Driv'n Cook, "
                f"{montant_fournisseur_libre:.2f}€ fournisseurs libres."
            )
        
        return data

    def create(self, validated_data):
        """Création d'une commande multi-entrepôts avec ses détails"""
        details_data = validated_data.pop('details')
        
        # Créer la commande sans entrepôt fixe
        commande = CommandeFranchise.objects.create(**validated_data)
        
        for detail_data in details_data:
            try:
                produit = Produit.objects.get(id=detail_data['produit'])
                entrepot_livraison = Entrepot.objects.get(id=detail_data['entrepot_livraison'])
            except (Produit.DoesNotExist, Entrepot.DoesNotExist):
                raise serializers.ValidationError(
                    f"Produit ou entrepôt introuvable : {detail_data}"
                )
            
            DetailCommande.objects.create(
                commande=commande,
                produit=produit,
                entrepot_livraison=entrepot_livraison,
                quantite_commandee=detail_data['quantite_commandee'],
                prix_unitaire=produit.prix_unitaire
            )
        
        # Calcul final des montants
        commande.calculer_montants()
        commande.save()
        return commande


class MesCommandeUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour modifier une commande multi-entrepôts avec adresse de livraison"""
    details = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        allow_empty=False,
        help_text="Liste des produits avec leurs entrepôts de livraison"
    )

    class Meta:
        model = CommandeFranchise
        fields = [
            'date_livraison_prevue', 'adresse_livraison', 'details'
        ]

    def validate_details(self, value):
        """Validation des détails multi-entrepôts"""
        if not value:
            raise serializers.ValidationError("Une commande doit contenir au moins un produit.")
        
        # Vérifier les doublons (même produit + même entrepôt)
        seen_combinations = set()
        for detail in value:
            produit_id = detail.get('produit')
            entrepot_id = detail.get('entrepot_livraison')
            
            if not produit_id or not entrepot_id:
                raise serializers.ValidationError(
                    "Chaque produit doit avoir un produit et un entrepôt de livraison spécifiés."
                )
            
            combination = (produit_id, entrepot_id)
            if combination in seen_combinations:
                raise serializers.ValidationError(
                    f"Le produit {produit_id} ne peut apparaître qu'une seule fois "
                    f"pour l'entrepôt {entrepot_id} dans la même commande."
                )
            seen_combinations.add(combination)
        
        return value

    def validate(self, data):
        """Validation globale avec règle 80/20 multi-entrepôts"""
        details_data = data.get('details', [])
        
        montant_drivn_cook = 0
        montant_fournisseur_libre = 0
        
        for detail in details_data:
            try:
                produit = Produit.objects.get(id=detail['produit'])
                entrepot = Entrepot.objects.get(id=detail['entrepot_livraison'])
            except (Produit.DoesNotExist, Entrepot.DoesNotExist):
                raise serializers.ValidationError(
                    f"Produit ou entrepôt introuvable : {detail}"
                )
            
            # Vérifier le stock disponible
            try:
                stock = StockEntrepot.objects.get(produit=produit, entrepot=entrepot)
                if stock.quantite_disponible < detail['quantite_commandee']:
                    raise serializers.ValidationError(
                        f"Stock insuffisant pour {produit.nom_produit} "
                        f"dans {entrepot.nom_entrepot} : "
                        f"disponible {stock.quantite_disponible}, "
                        f"demandé {detail['quantite_commandee']}"
                    )
            except StockEntrepot.DoesNotExist:
                raise serializers.ValidationError(
                    f"Le produit {produit.nom_produit} n'est pas disponible "
                    f"dans l'entrepôt {entrepot.nom_entrepot}"
                )
            
            quantite = int(detail['quantite_commandee'])
            prix = produit.prix_unitaire
            sous_total = quantite * prix
            
            # 🎯 CONTRÔLE BASÉ SUR LE TYPE D'ENTREPÔT
            if entrepot.type_entrepot == 'drivn_cook':
                montant_drivn_cook += sous_total
            else:
                montant_fournisseur_libre += sous_total
        
        montant_total = montant_drivn_cook + montant_fournisseur_libre
        if montant_total == 0:
            raise serializers.ValidationError("Le montant total de la commande ne peut pas être nul.")
        
        pourcentage_drivn = (montant_drivn_cook / montant_total) * 100
        if pourcentage_drivn < 80:
            raise serializers.ValidationError(
                f"La commande ne respecte pas la règle 80/20 : "
                f"{pourcentage_drivn:.1f}% des achats viennent des entrepôts Driv'n Cook, "
                f"minimum requis 80%. Répartition : {montant_drivn_cook:.2f}€ Driv'n Cook, "
                f"{montant_fournisseur_libre:.2f}€ fournisseurs libres."
            )
        
        return data

    def update(self, instance, validated_data):
        """Mise à jour d'une commande multi-entrepôts"""
        details_data = validated_data.pop('details', [])
        
        # Vérifier que la commande peut être modifiée
        if instance.statut not in ['en_attente']:
            raise serializers.ValidationError(
                f"Une commande au statut '{instance.get_statut_display()}' ne peut pas être modifiée."
            )
        
        # Mettre à jour les champs de base
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Supprimer les anciens détails
        instance.details.all().delete()
        
        # Créer les nouveaux détails
        for detail_data in details_data:
            try:
                produit = Produit.objects.get(id=detail_data['produit'])
                entrepot_livraison = Entrepot.objects.get(id=detail_data['entrepot_livraison'])
            except (Produit.DoesNotExist, Entrepot.DoesNotExist):
                raise serializers.ValidationError(
                    f"Produit ou entrepôt introuvable : {detail_data}"
                )
            
            DetailCommande.objects.create(
                commande=instance,
                produit=produit,
                entrepot_livraison=entrepot_livraison,
                quantite_commandee=detail_data['quantite_commandee'],
                prix_unitaire=produit.prix_unitaire
            )
        
       
        instance.refresh_from_db()  # Recharger l'instance depuis la DB
        instance.calculer_montants()  # Recalculer les montants
        instance.save()  # Sauvegarder les nouveaux montants
        
        return instance
# 🎯 NOUVEAU : Serializer pour les commandes complètes (lecture)
class CommandeFranchiseMultiEntrepotSerializer(serializers.ModelSerializer):
    """Serializer complet pour les commandes multi-entrepôts (lecture)"""
    details = MesDetailCommandeSerializer(many=True, read_only=True)
    franchise_nom = serializers.CharField(source='franchise.nom_franchise', read_only=True)
    entrepots_utilises = serializers.SerializerMethodField()
    respecte_regle_80_20_result = serializers.ReadOnlyField()
    pourcentage_drivn_cook = serializers.ReadOnlyField()
    pourcentage_fournisseur_libre = serializers.ReadOnlyField()
    
    # 🎯 CHAMP ADRESSE DE LIVRAISON SIMPLIFIÉ
    adresse_livraison_complete = serializers.ReadOnlyField()
    adresse_franchise_complete = serializers.ReadOnlyField()

    class Meta:
        model = CommandeFranchise
        fields = [
            'id', 'numero_commande', 'franchise', 'franchise_nom', 
            'date_commande', 'date_livraison_prevue', 'statut',
            'montant_total', 'montant_drivn_cook', 'montant_fournisseur_libre',
            'pourcentage_drivn_cook', 'pourcentage_fournisseur_libre',
            'respecte_regle_80_20_result', 'entrepots_utilises', 'details',
            # 🎯 CHAMP ADRESSE DE LIVRAISON SIMPLIFIÉ
            'adresse_livraison', 'adresse_livraison_complete', 'adresse_franchise_complete'
        ]
        read_only_fields = ['id', 'numero_commande', 'franchise', 'date_commande']
    
    def get_entrepots_utilises(self, obj):
        """Retourne la liste des entrepôts utilisés avec leurs détails"""
        entrepots = obj.entrepots_utilises
        return [
            {
                'id': entrepot.id,
                'nom_entrepot': entrepot.nom_entrepot,
                'type_entrepot': entrepot.type_entrepot,
                'type_entrepot_display': entrepot.get_type_entrepot_display(),
                'ville': entrepot.ville,
                'montant_commande': sum(
                    detail.sous_total for detail in obj.details.filter(entrepot_livraison=entrepot)
                )
            }
            for entrepot in entrepots
        ]


# 🎯 NOUVEAU : Serializer pour récupérer les stocks multi-entrepôts
class StockMultiEntrepotSerializer(serializers.Serializer):
    """Serializer pour récupérer les stocks disponibles dans tous les entrepôts"""
    produit_id = serializers.IntegerField()
    produit_nom = serializers.CharField()
    prix_unitaire = serializers.DecimalField(max_digits=6, decimal_places=2)
    unite = serializers.CharField()
    entrepots_disponibles = serializers.SerializerMethodField()
    
    def get_entrepots_disponibles(self, obj):
        """Retourne la liste des entrepôts où ce produit est disponible"""
        produit_id = obj['produit_id']
        stocks = StockEntrepot.objects.filter(
            produit_id=produit_id,
            quantite_disponible__gt=0
        ).select_related('entrepot')
        
        entrepots = []
        for stock in stocks:
            entrepots.append({
                'entrepot_id': stock.entrepot.id,
                'entrepot_nom': stock.entrepot.nom_entrepot,
                'entrepot_type': stock.entrepot.type_entrepot,
                'entrepot_type_display': stock.entrepot.get_type_entrepot_display(),
                'entrepot_ville': stock.entrepot.ville,
                'quantite_disponible': stock.quantite_disponible,
                'alerte_stock': stock.alerte_stock
            })
        
        return entrepots
# Remplacez votre VenteFranchiseSerializer par celui-ci :

class VenteFranchiseSerializer(serializers.ModelSerializer):
    """Chiffres de ventes quotidiens - Lecture seule"""
    class Meta:
        model = VenteFranchise
        fields = [
            'id', 'date_vente', 'chiffre_affaires_jour', 'redevance_due',
            'nombre_transactions'
        ]
        read_only_fields = ['id', 'redevance_due']

# Remplacez votre VenteFranchiseCreateSerializer par celui-ci :

class VenteFranchiseCreateSerializer(serializers.ModelSerializer):
    """Création/modification des ventes quotidiennes"""
    class Meta:
        model = VenteFranchise
        fields = ['date_vente', 'chiffre_affaires_jour', 'nombre_transactions']
    
    def validate(self, data):
        """Validation des données"""
        request = self.context.get('request')
        
        # Vérifier que l'utilisateur a une franchise
        if not (request and hasattr(request.user, 'franchise')):
            raise serializers.ValidationError("Utilisateur non authentifié ou pas de franchise associée")
        
        franchise = request.user.franchise
        date_vente = data.get('date_vente')
        
        # Vérifier qu'une vente n'existe pas déjà pour cette date (sauf en modification)
        if date_vente:
            existing_vente = VenteFranchise.objects.filter(
                franchise=franchise,
                date_vente=date_vente
            )
            
            # En modification, exclure l'instance actuelle
            if self.instance:
                existing_vente = existing_vente.exclude(pk=self.instance.pk)
            
            if existing_vente.exists():
                raise serializers.ValidationError({
                    'date_vente': 'Une vente existe déjà pour cette date'
                })
        
        return data
    
    def create(self, validated_data):
        """Création de la vente avec association automatique de la franchise"""
        request = self.context.get('request')
        
        # Associer la franchise de l'utilisateur connecté
        validated_data['franchise'] = request.user.franchise
        
        return VenteFranchise.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        """Mise à jour de la vente"""
        request = self.context.get('request')
        
        # Vérifier que l'instance appartient bien au franchisé
        if instance.franchise != request.user.franchise:
            raise serializers.ValidationError("Vous ne pouvez modifier que vos propres ventes")
        
        # Mettre à jour les champs
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance