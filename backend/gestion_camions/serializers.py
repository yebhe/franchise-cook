# serializers.py - DRIV'N COOK Mission 1 (VERSION FINALE 80/20)
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Entrepot, Franchise, Emplacement, Camion, MaintenanceCamion,
    AffectationEmplacement, CategorieProduit, Produit, StockEntrepot,
    CommandeFranchise, DetailCommande, VenteFranchise
)

User = get_user_model()


class EntrepotSerializer(serializers.ModelSerializer):
    """Serializer pour les entrepôts (Driv'n Cook + fournisseurs libres)"""
    
    class Meta:
        model = Entrepot
        fields = '__all__'
        extra_kwargs = {
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }


class EmplacementSerializer(serializers.ModelSerializer):
    """Serializer pour les emplacements où les camions peuvent se positionner"""
    
    class Meta:
        model = Emplacement
        fields = '__all__'
        extra_kwargs = {
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }


class CamionSerializer(serializers.ModelSerializer):
    """Serializer pour les camions food truck"""
    
    class Meta:
        model = Camion
        fields = '__all__'
        extra_kwargs = {
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }


class MaintenanceCamionSerializer(serializers.ModelSerializer):
    """Serializer pour la maintenance des camions"""
    
    class Meta:
        model = MaintenanceCamion
        fields = '__all__'
        extra_kwargs = {
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }


class AffectationEmplacementSerializer(serializers.ModelSerializer):
    """Serializer pour l'envoi de camions dans des emplacements"""
    
    class Meta:
        model = AffectationEmplacement
        fields = '__all__'
        extra_kwargs = {
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }


class CategorieProduitSerializer(serializers.ModelSerializer):
    """Serializer pour les catégories de produits"""
    
    class Meta:
        model = CategorieProduit
        fields = '__all__'
        extra_kwargs = {
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }


class ProduitSerializer(serializers.ModelSerializer):
    """Serializer pour les produits (simplifiés sans provenance)"""
    
    class Meta:
        model = Produit
        fields = '__all__'
        extra_kwargs = {
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }


class StockEntrepotSerializer(serializers.ModelSerializer):
    """Serializer pour les stocks par entrepôt"""
    produit_nom = serializers.CharField(source='produit.nom_produit', read_only=True)
    entrepot_nom = serializers.CharField(source='entrepot.nom_entrepot', read_only=True)
    entrepot_type = serializers.CharField(source='entrepot.get_type_entrepot_display', read_only=True)
    alerte_stock = serializers.ReadOnlyField()
    quantite_totale = serializers.ReadOnlyField()
    
    class Meta:
        model = StockEntrepot
        fields = [
            'id', 'produit', 'produit_nom', 'entrepot', 'entrepot_nom', 'entrepot_type',
            'quantite_disponible', 'quantite_reservee', 'quantite_totale', 
            'seuil_alerte', 'alerte_stock'
        ]
        extra_kwargs = {
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }


class AdminDetailCommandeSerializer(serializers.ModelSerializer):
    """Serializer pour les détails de commande multi-entrepôts (admin)"""
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


class AdminCommandeCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une commande multi-entrepôts (admin)"""
    details = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        allow_empty=False,
        help_text="Liste des produits avec leurs entrepôts de livraison"
    )

    class Meta:
        model = CommandeFranchise
        fields = [
            'franchise', 'date_livraison_prevue', 'adresse_livraison', 'details'
        ]

    def validate_franchise(self, value):
        """Validation de la franchise"""
        if not value:
            raise serializers.ValidationError("La franchise est obligatoire.")
        return value

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
        
        # Créer la commande
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


class AdminCommandeUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour modifier une commande multi-entrepôts (admin)"""
    details = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        allow_empty=False,
        help_text="Liste des produits avec leurs entrepôts de livraison"
    )

    class Meta:
        model = CommandeFranchise
        fields = [
            'franchise', 'date_livraison_prevue', 'adresse_livraison', 'details'
        ]

    def validate_franchise(self, value):
        """Validation de la franchise"""
        if not value:
            raise serializers.ValidationError("La franchise est obligatoire.")
        return value

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


# 🎯 Serializer pour les commandes complètes (lecture admin)
class AdminCommandeFranchiseMultiEntrepotSerializer(serializers.ModelSerializer):
    """Serializer complet pour les commandes multi-entrepôts (lecture admin)"""
    details = AdminDetailCommandeSerializer(many=True, read_only=True)
    franchise_nom = serializers.CharField(source='franchise.nom_franchise', read_only=True)
    entrepots_utilises = serializers.SerializerMethodField()
    respecte_regle_80_20_result = serializers.SerializerMethodField()
    pourcentage_drivn_cook = serializers.ReadOnlyField()
    pourcentage_fournisseur_libre = serializers.ReadOnlyField()
    entrepots_count = serializers.SerializerMethodField()
    
    # 🎯 CHAMPS ADRESSE DE LIVRAISON
    adresse_livraison_complete = serializers.SerializerMethodField()
    adresse_franchise_complete = serializers.SerializerMethodField()

    class Meta:
        model = CommandeFranchise
        fields = [
            'id', 'numero_commande', 'franchise', 'franchise_nom', 
            'date_commande', 'date_livraison_prevue', 'statut',
            'montant_total', 'montant_drivn_cook', 'montant_fournisseur_libre',
            'pourcentage_drivn_cook', 'pourcentage_fournisseur_libre',
            'respecte_regle_80_20_result', 'entrepots_utilises', 'entrepots_count', 'details',
            'adresse_livraison', 'adresse_livraison_complete', 'adresse_franchise_complete'
        ]
        read_only_fields = ['id', 'numero_commande', 'date_commande']
    
    def get_respecte_regle_80_20_result(self, obj):
        """Retourne le résultat de la vérification 80/20"""
        conforme, pourcentage_drivn, message = obj.respecte_regle_80_20()
        return {
            'conforme': conforme,
            'message': message,
            'pourcentage_drivn_cook': pourcentage_drivn
        }
    
    def get_entrepots_count(self, obj):
        """Retourne le nombre d'entrepôts utilisés"""
        return obj.details.values('entrepot_livraison').distinct().count()
    
    def get_entrepots_utilises(self, obj):
        """Retourne la liste des entrepôts utilisés avec leurs détails"""
        entrepots_ids = obj.details.values_list('entrepot_livraison', flat=True).distinct()
        entrepots = Entrepot.objects.filter(id__in=entrepots_ids)
        
        result = []
        for entrepot in entrepots:
            montant_entrepot = sum(
                detail.sous_total for detail in obj.details.filter(entrepot_livraison=entrepot)
            )
            result.append({
                'id': entrepot.id,
                'nom_entrepot': entrepot.nom_entrepot,
                'type_entrepot': entrepot.type_entrepot,
                'type_entrepot_display': entrepot.get_type_entrepot_display(),
                'ville': entrepot.ville,
                'montant_commande': float(montant_entrepot)
            })
        return result
    
    def get_adresse_livraison_complete(self, obj):
        """Retourne l'adresse de livraison complète"""
        if obj.adresse_livraison:
            return obj.adresse_livraison
        return self.get_adresse_franchise_complete(obj)
    
    def get_adresse_franchise_complete(self, obj):
        """Retourne l'adresse complète de la franchise"""
        if obj.franchise:
            parts = [obj.franchise.adresse, obj.franchise.code_postal, obj.franchise.ville]
            return ', '.join(filter(None, parts))
        return ""


# 🎯 Serializer pour récupérer les stocks multi-entrepôts (admin)
class AdminStockMultiEntrepotSerializer(serializers.Serializer):
    """Serializer pour récupérer les stocks disponibles dans tous les entrepôts (admin)"""
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
                'quantite_reservee': getattr(stock, 'quantite_reservee', 0),
                'alerte_stock': getattr(stock, 'alerte_stock', False)
            })
        
        return entrepots
   
class VenteFranchiseSerializer(serializers.ModelSerializer):
    """Ventes quotidiennes avec calcul automatique de la redevance 4%"""
    franchise_nom = serializers.CharField(source='franchise.nom_franchise', read_only=True)
    
    class Meta:
        model = VenteFranchise
        fields = '__all__'
        extra_kwargs = {
            'redevance_due': {'read_only': True},  # Calculé automatiquement (4%)
        }
    
    def validate_chiffre_affaires_jour(self, value):
        if value < 0:
            raise serializers.ValidationError("Le chiffre d'affaires ne peut pas être négatif.")
        return value
    
    def validate(self, attrs):
        # Une seule vente par franchise par jour
        franchise = attrs.get('franchise')
        date_vente = attrs.get('date_vente')
        
        if self.instance:
            # En modification, exclure l'instance actuelle
            existing = VenteFranchise.objects.filter(
                franchise=franchise, 
                date_vente=date_vente
            ).exclude(id=self.instance.id)
        else:
            existing = VenteFranchise.objects.filter(franchise=franchise, date_vente=date_vente)
        
        if existing.exists():
            raise serializers.ValidationError("Une vente existe déjà pour cette franchise à cette date.")
        
        return attrs



# Serializers simplifiés pour les listes/dropdown
class FranchiseSimpleSerializer(serializers.ModelSerializer):
    """Franchise simplifié pour les selects"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Franchise
        fields = ['id', 'nom_franchise', 'user_name', 'statut']


class ProduitSimpleSerializer(serializers.ModelSerializer):
    """Produit simplifié pour les selects"""
    class Meta:
        model = Produit
        fields = ['id', 'nom_produit', 'prix_unitaire', 'unite']


class EntrepotSimpleSerializer(serializers.ModelSerializer):
    """Entrepôt simplifié pour les selects avec type"""
    class Meta:
        model = Entrepot
        fields = ['id', 'nom_entrepot', 'type_entrepot', 'ville', 'statut']


class CamionSimpleSerializer(serializers.ModelSerializer):
    """Camion simplifié pour les selects"""
    class Meta:
        model = Camion
        fields = ['id', 'numero_camion', 'statut', 'franchise']


# Serializers spécialisés pour les rapports
class RapportCommandeSerializer(serializers.ModelSerializer):
    """Serializer pour les rapports de commandes"""
    franchise_nom = serializers.CharField(source='franchise.nom_franchise', read_only=True)
    pourcentage_drivn_cook = serializers.ReadOnlyField()
    nb_produits = serializers.SerializerMethodField()
    conforme_80_20 = serializers.SerializerMethodField()
    
    class Meta:
        model = CommandeFranchise
        fields = [
            'numero_commande', 'franchise_nom', 'date_commande', 
            'montant_total', 'montant_drivn_cook', 'montant_fournisseur_libre',
            'pourcentage_drivn_cook', 'nb_produits', 'conforme_80_20', 'statut'
        ]
    
    def get_nb_produits(self, obj):
        return obj.details.count()
    
    def get_conforme_80_20(self, obj):
        conforme, _ = obj.respecte_regle_80_20()
        return conforme