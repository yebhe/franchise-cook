# models.py - DRIV'N COOK Mission 1 : Gestion des Services Franchisés (VERSION FINALE 80/20)
# MODIFICATION : Multi-emplacements pour une franchise

from django.db import models
from decimal import Decimal
from django.core.exceptions import ValidationError
from django.conf import settings
from django.utils import timezone
from django.db import transaction

class Entrepot(models.Model):
    """Entrepôts : 4 officiels Driv'n Cook + autres fournisseurs libres"""
    STATUT_CHOICES = [
        ('actif', 'Actif'),
        ('maintenance', 'Maintenance'),
        ('ferme', 'Fermé'),
    ]
    
    TYPE_ENTREPOT_CHOICES = [
        ('drivn_cook', 'Entrepôt Driv\'n Cook (80% obligatoire)'),
        ('fournisseur_libre', 'Fournisseur libre (20% maximum)'),
    ]
    
    nom_entrepot = models.CharField(max_length=100)
    adresse = models.CharField(max_length=255)
    ville = models.CharField(max_length=50)
    code_postal = models.CharField(max_length=10)
    telephone = models.CharField(max_length=15, blank=True)
    responsable = models.CharField(max_length=100, blank=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='actif')
    
    # 🎯 CHAMP CLÉ POUR LA RÈGLE 80/20
    type_entrepot = models.CharField(
        max_length=20, 
        choices=TYPE_ENTREPOT_CHOICES, 
        default='drivn_cook',
        help_text="Définit si l'entrepôt fait partie des 4 entrepôts Driv'n Cook obligatoires"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Entrepôt"
        verbose_name_plural = "Entrepôts"
        
    def __str__(self):
        return f"{self.nom_entrepot} ({self.get_type_entrepot_display()})"


class Franchise(models.Model):
    """Franchisés avec droit d'entrée de 50 000€ et redevance de 4%"""
    STATUT_CHOICES = [
        ('en_attente', 'En attente de validation'),
        ('valide', 'Validé - En attente de paiement'),
        ('paye', 'Payé - Actif'),
        ('suspendu', 'Suspendu'),
        ('resilie', 'Résilié'),
    ]
    
    STATUT_PAIEMENT_CHOICES = [
        ('en_attente', 'En attente'),
        ('lien_envoye', 'Lien de paiement envoyé'),
        ('en_cours', 'Paiement en cours'),
        ('paye', 'Payé'),
        ('echec', 'Échec de paiement'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='franchise')
    nom_franchise = models.CharField(max_length=100)
    adresse = models.CharField(max_length=255, blank=True)
    ville = models.CharField(max_length=50, blank=True)
    code_postal = models.CharField(max_length=10, blank=True)
    date_signature = models.DateField()
    droit_entree = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('50000.00'))
    
    # Statut mis à jour
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
    
    # Nouveaux champs pour la validation et le paiement
    valide_par = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='franchises_validees',
        verbose_name="Validé par"
    )
    date_validation = models.DateTimeField(null=True, blank=True, verbose_name="Date de validation")
    statut_paiement = models.CharField(max_length=20, choices=STATUT_PAIEMENT_CHOICES, default='en_attente')
    stripe_payment_intent_id = models.CharField(max_length=200, blank=True, null=True)
    stripe_checkout_session_id = models.CharField(max_length=200, blank=True, null=True)
    date_paiement = models.DateTimeField(null=True, blank=True)
    commentaire_admin = models.TextField(blank=True, verbose_name="Commentaire administrateur")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Franchisé"
        verbose_name_plural = "Franchisés"
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.nom_franchise} - {self.user.first_name} {self.user.last_name}"
    
    # 🎯 NOUVELLES PROPRIÉTÉS POUR GÉRER LES MULTI-EMPLACEMENTS (existantes)
    @property
    def emplacements_count(self):
        """Nombre total d'emplacements autorisés pour cette franchise"""
        return self.emplacements_autorises.count()
    
    @property
    def emplacements_actifs(self):
        """Emplacements actuellement occupés par cette franchise"""
        return self.emplacements_autorises.filter(
            affectations__statut__in=['programme', 'en_cours'],
            affectations__camion__franchise=self
        ).distinct()
    
    # Nouvelles propriétés pour la validation et paiement
    @property
    def peut_etre_valide(self):
        """Vérifie si la franchise peut être validée"""
        return self.statut == 'en_attente'
    
    @property
    def peut_generer_lien_paiement(self):
        """Vérifie si un lien de paiement peut être généré"""
        return self.statut == 'valide' and self.statut_paiement in ['en_attente', 'echec']
    
    @property
    def est_active(self):
        """Vérifie si la franchise est active"""
        return self.statut == 'paye'
    
    @property
    def nom_validateur(self):
        """Retourne le nom du validateur"""
        if self.valide_par:
            return f"{self.valide_par.first_name} {self.valide_par.last_name}".strip()
        return "Non validé"


class Emplacement(models.Model):
    """Emplacements où les camions peuvent se positionner - MODIFIÉ POUR MULTI-FRANCHISE"""
    TYPE_ZONE_CHOICES = [
        ('centre_ville', 'Centre-ville'),
        ('zone_commerciale', 'Zone commerciale'),
        ('parc', 'Parc'),
        ('entreprise', 'Entreprise'),
        ('marche', 'Marché'),
    ]
    
    nom_emplacement = models.CharField(max_length=100)
    adresse = models.CharField(max_length=255)
    ville = models.CharField(max_length=50)
    code_postal = models.CharField(max_length=10, blank=True)
    type_zone = models.CharField(max_length=20, choices=TYPE_ZONE_CHOICES)
    tarif_journalier = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    horaires_autorises = models.CharField(max_length=100, blank=True)
    
    # 🎯 RELATION MANY-TO-MANY DIRECTE AVEC LES FRANCHISES
    # Une franchise peut avoir accès à plusieurs emplacements
    # Un emplacement peut être accessible à plusieurs franchises
    franchises_autorisees = models.ManyToManyField(
        Franchise, 
        blank=True,
        related_name='emplacements_autorises',
        help_text="Franchises autorisées à utiliser cet emplacement"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Emplacement"
        verbose_name_plural = "Emplacements"
    
    def __str__(self):
        return f"{self.nom_emplacement} - {self.ville}"
    
    # 🎯 NOUVELLES MÉTHODES POUR GÉRER LES MULTI-FRANCHISES
    @property
    def franchises_count(self):
        """Nombre de franchises autorisées pour cet emplacement"""
        return self.franchises_autorisees.count()
    
    @property
    def est_disponible(self):
        """Vérifie si l'emplacement est disponible (pas d'affectation en cours)"""
        return not self.affectations.filter(
            statut__in=['programme', 'en_cours']
        ).exists()
    
    @property
    def affectation_actuelle(self):
        """Retourne l'affectation actuelle si elle existe"""
        return self.affectations.filter(
            statut__in=['programme', 'en_cours']
        ).first()
    
    def peut_etre_reserve_par(self, franchise):
        """Vérifie si une franchise peut réserver cet emplacement"""
        # Vérifier si la franchise est autorisée
        if not self.franchises_autorisees.filter(id=franchise.id).exists():
            return False, "Franchise non autorisée pour cet emplacement"
        
        # Vérifier si l'emplacement est disponible
        if not self.est_disponible:
            affectation = self.affectation_actuelle
            return False, f"Emplacement occupé par {affectation.camion.franchise.nom_franchise}"
        
        return True, "Emplacement disponible"


class Camion(models.Model):
    """Camions food truck attribués aux franchisés"""
    STATUT_CHOICES = [
        ('disponible', 'Disponible'),
        ('attribue', 'Attribué'),
        ('maintenance', 'Maintenance'),
        ('hors_service', 'Hors service'),
    ]
    
    numero_camion = models.CharField(max_length=20, unique=True)
    marque = models.CharField(max_length=50, blank=True)
    modele = models.CharField(max_length=50, blank=True)
    immatriculation = models.CharField(max_length=15, unique=True)
    franchise = models.ForeignKey(Franchise, on_delete=models.SET_NULL, null=True, blank=True, related_name='camions')
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='disponible')
    date_attribution = models.DateField(null=True, blank=True)
    kilometrage = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.numero_camion} - {self.immatriculation}"


class MaintenanceCamion(models.Model):
    """Carnet d'entretien et gestion des pannes"""
    TYPE_MAINTENANCE_CHOICES = [
        ('revision', 'Révision'),
        ('reparation', 'Réparation'),
        ('panne', 'Panne'),
        ('controle_technique', 'Contrôle technique'),
    ]
    
    STATUT_CHOICES = [
        ('programme', 'Programmé'),
        ('en_cours', 'En cours'),
        ('termine', 'Terminé'),
    ]
    
    camion = models.ForeignKey(Camion, on_delete=models.CASCADE, related_name='maintenances')
    type_maintenance = models.CharField(max_length=20, choices=TYPE_MAINTENANCE_CHOICES)
    description = models.TextField()
    date_maintenance = models.DateField()
    cout = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    garage = models.CharField(max_length=100, blank=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='programme')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date_maintenance']
        
    def __str__(self):
        return f"{self.camion.numero_camion} - {self.type_maintenance} - {self.date_maintenance}"


class AffectationEmplacement(models.Model):
    """Envoi de camion dans un emplacement - MODIFIÉ POUR VALIDATION MULTI-EMPLACEMENTS"""
    STATUT_CHOICES = [
        ('programme', 'Programmé'),
        ('en_cours', 'En cours'),
        ('termine', 'Terminé'),
        ('annule', 'Annulé'),
    ]
    
    camion = models.ForeignKey(Camion, on_delete=models.CASCADE, related_name='affectations')
    emplacement = models.ForeignKey(Emplacement, on_delete=models.CASCADE, related_name='affectations')
    date_debut = models.DateField()
    date_fin = models.DateField(null=True, blank=True)
    horaire_debut = models.TimeField(null=True, blank=True)
    horaire_fin = models.TimeField(null=True, blank=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='programme')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date_debut']
        verbose_name = "Affectation d'emplacement"
        verbose_name_plural = "Affectations d'emplacements"
    
    def clean(self):
        """Validation des affectations avec vérification des autorisations multi-emplacements"""
        if self.camion and self.emplacement:
            # Vérifier que la franchise du camion est autorisée pour cet emplacement
            franchise = self.camion.franchise
            if franchise and not self.emplacement.franchises_autorisees.filter(id=franchise.id).exists():
                raise ValidationError(
                    f"La franchise '{franchise.nom_franchise}' n'est pas autorisée "
                    f"pour l'emplacement '{self.emplacement.nom_emplacement}'"
                )
            
            # Vérifier les conflits de dates/horaires pour le même emplacement
            if self.date_debut and self.statut in ['programme', 'en_cours']:
                conflits = AffectationEmplacement.objects.filter(
                    emplacement=self.emplacement,
                    date_debut=self.date_debut,
                    statut__in=['programme', 'en_cours']
                ).exclude(pk=self.pk if self.pk else None)
                
                if conflits.exists():
                    conflit = conflits.first()
                    raise ValidationError(
                        f"Conflit d'affectation : l'emplacement '{self.emplacement.nom_emplacement}' "
                        f"est déjà occupé le {self.date_debut} par le camion {conflit.camion.numero_camion}"
                    )
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
        
    def __str__(self):
        return f"{self.camion.numero_camion} → {self.emplacement.nom_emplacement} ({self.date_debut})"


# 🎯 NOUVEAU MODÈLE : AUTORISATIONS D'EMPLACEMENTS (OPTIONNEL POUR PLUS DE CONTRÔLE)
class AutorisationEmplacement(models.Model):
    """Gestion fine des autorisations d'emplacements par franchise (optionnel)"""
    franchise = models.ForeignKey(Franchise, on_delete=models.CASCADE, related_name='autorisations_emplacements')
    emplacement = models.ForeignKey(Emplacement, on_delete=models.CASCADE, related_name='autorisations')
    date_autorisation = models.DateField(auto_now_add=True)
    date_expiration = models.DateField(null=True, blank=True, help_text="Laisser vide pour une autorisation permanente")
    est_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True, help_text="Notes sur l'autorisation (conditions particulières, etc.)")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['franchise', 'emplacement']
        verbose_name = "Autorisation d'emplacement"
        verbose_name_plural = "Autorisations d'emplacements"
    
    def __str__(self):
        statut = "✅ Active" if self.est_active else "❌ Inactive"
        return f"{self.franchise.nom_franchise} → {self.emplacement.nom_emplacement} ({statut})"
    
    @property
    def est_valide(self):
        """Vérifie si l'autorisation est valide (active et non expirée)"""
        if not self.est_active:
            return False
        
        if self.date_expiration:
            from django.utils import timezone
            return timezone.now().date() <= self.date_expiration
        
        return True


# ===== RESTE DU CODE INCHANGÉ =====

class CategorieProduit(models.Model):
    """Catégories de produits (ingrédients, plats préparés, boissons)"""
    nom_categorie = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Catégorie de produit"
        verbose_name_plural = "Catégories de produits"
        
    def __str__(self):
        return self.nom_categorie


class Produit(models.Model):
    """Produits : disponibles dans tous types d'entrepôts"""
    UNITE_CHOICES = [
        ('kg', 'Kilogramme'),
        ('litre', 'Litre'),
        ('piece', 'Pièce'),
        ('portion', 'Portion'),
    ]
    
    nom_produit = models.CharField(max_length=100)
    categorie = models.ForeignKey(CategorieProduit, on_delete=models.PROTECT, related_name='produits')
    prix_unitaire = models.DecimalField(max_digits=6, decimal_places=2)
    unite = models.CharField(max_length=20, choices=UNITE_CHOICES)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.nom_produit} - {self.prix_unitaire}€/{self.unite}"


class StockEntrepot(models.Model):
    """Stocks disponibles par entrepôt"""
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='stocks')
    entrepot = models.ForeignKey(Entrepot, on_delete=models.CASCADE, related_name='stocks')
    quantite_disponible = models.PositiveIntegerField(default=0)
    quantite_reservee = models.PositiveIntegerField(default=0)
    seuil_alerte = models.PositiveIntegerField(default=10)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['produit', 'entrepot']
        
    def __str__(self):
        return f"{self.produit.nom_produit} - {self.entrepot.nom_entrepot} : {self.quantite_disponible}"
    
    @property
    def quantite_totale(self):
        return self.quantite_disponible + self.quantite_reservee
    
    @property
    def alerte_stock(self):
        return self.quantite_disponible <= self.seuil_alerte

# models.py - MODIFICATION pour supporter le multi-entrepôts

class CommandeFranchise(models.Model):
    """Commandes d'approvisionnement des franchisés avec support multi-entrepôts et contrôle 80/20"""
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('validee', 'Validée'),
        ('preparee', 'Préparée'),
        ('livree', 'Livrée'),
        ('annulee', 'Annulée'),
    ]
    
    numero_commande = models.CharField(max_length=30, unique=True, blank=True)
    franchise = models.ForeignKey(Franchise, on_delete=models.CASCADE, related_name='commandes')
    
    date_commande = models.DateField(auto_now_add=True)
    date_livraison_prevue = models.DateField(null=True, blank=True)
    
    # 🎯 NOUVEAU : Adresse de livraison simple
    adresse_livraison = models.CharField(
        max_length=500, 
        blank=True,
        help_text="Adresse complète de livraison (par défaut : adresse de la franchise)"
    )
    
    montant_total = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    montant_drivn_cook = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'), 
                                           help_text="Montant des produits Driv'n Cook (80% minimum)")
    montant_fournisseur_libre = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'),
                                                   help_text="Montant des produits libres (20% maximum)")
    
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date_commande']
    
    @property
    def entrepots_utilises(self):
        """Retourne la liste des entrepôts utilisés dans cette commande"""
        return Entrepot.objects.filter(
            details_livraisons__commande=self
        ).distinct().order_by('nom_entrepot')
    
    @property
    def entrepots_count(self):
        """Nombre d'entrepôts différents utilisés"""
        return self.entrepots_utilises.count()
    
    @property
    def entrepots_drivn_cook(self):
        """Entrepôts Driv'n Cook utilisés"""
        return self.entrepots_utilises.filter(type_entrepot='drivn_cook')
    
    @property
    def entrepots_fournisseur_libre(self):
        """Entrepôts fournisseurs libres utilisés"""
        return self.entrepots_utilises.filter(type_entrepot='fournisseur_libre')
    
    @property
    def adresse_livraison_complete(self):

        if self.adresse_livraison:
            return self.adresse_livraison
        else:
            # Utiliser l'adresse de la franchise par défaut
            return self.adresse_franchise_complete
    
    @property
    def adresse_franchise_complete(self):
        """Retourne l'adresse complète de la franchise"""
        if self.franchise:
            adresse_parts = []
            if self.franchise.adresse:
                adresse_parts.append(self.franchise.adresse)
            if self.franchise.code_postal and self.franchise.ville:
                adresse_parts.append(f"{self.franchise.code_postal} {self.franchise.ville}")
            elif self.franchise.ville:
                adresse_parts.append(self.franchise.ville)
            return ", ".join(adresse_parts) if adresse_parts else "Adresse non définie"
        return "Franchise non définie"
    
    def initialiser_adresse_franchise(self):
        """Initialise l'adresse de livraison avec les données de la franchise"""
        if self.franchise and not self.adresse_livraison:
            self.adresse_livraison = self.adresse_franchise_complete
    
    montant_total = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    montant_drivn_cook = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'), 
                                           help_text="Montant des produits Driv'n Cook (80% minimum)")
    montant_fournisseur_libre = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'),
                                                   help_text="Montant des produits libres (20% maximum)")
    
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date_commande']
    
    @property
    def entrepots_utilises(self):
        """Retourne la liste des entrepôts utilisés dans cette commande"""
        return Entrepot.objects.filter(
            details_livraisons__commande=self
        ).distinct().order_by('nom_entrepot')
    
    @property
    def entrepots_count(self):
        """Nombre d'entrepôts différents utilisés"""
        return self.entrepots_utilises.count()
    
    @property
    def entrepots_drivn_cook(self):
        """Entrepôts Driv'n Cook utilisés"""
        return self.entrepots_utilises.filter(type_entrepot='drivn_cook')
    
    @property
    def entrepots_fournisseur_libre(self):
        """Entrepôts fournisseurs libres utilisés"""
        return self.entrepots_utilises.filter(type_entrepot='fournisseur_libre')
    
    # 🎯 NOUVELLES PROPRIÉTÉS POUR L'ADRESSE DE LIVRAISON
    @property
    def adresse_livraison_complete(self):
        """Retourne l'adresse de livraison complète"""
        if self.adresse_livraison:
            adresse_parts = [self.adresse_livraison]
            if self.code_postal_livraison and self.ville_livraison:
                adresse_parts.append(f"{self.code_postal_livraison} {self.ville_livraison}")
            elif self.ville_livraison:
                adresse_parts.append(self.ville_livraison)
            return ", ".join(adresse_parts)
        else:
            # Utiliser l'adresse de la franchise par défaut
            return self.adresse_franchise_complete
    
    @property
    def adresse_franchise_complete(self):
        """Retourne l'adresse complète de la franchise"""
        if self.franchise:
            adresse_parts = []
            if self.franchise.adresse:
                adresse_parts.append(self.franchise.adresse)
            if self.franchise.code_postal and self.franchise.ville:
                adresse_parts.append(f"{self.franchise.code_postal} {self.franchise.ville}")
            elif self.franchise.ville:
                adresse_parts.append(self.franchise.ville)
            return ", ".join(adresse_parts) if adresse_parts else "Adresse non définie"
        return "Franchise non définie"
    
    @property
    def contact_livraison_complet(self):
        """Retourne les informations de contact pour la livraison"""
        if self.nom_contact_livraison:
            contact = self.nom_contact_livraison
            if self.telephone_contact_livraison:
                contact += f" ({self.telephone_contact_livraison})"
            return contact
        else:
            # Utiliser les infos de la franchise par défaut
            if self.franchise and self.franchise.user:
                contact = f"{self.franchise.user.first_name} {self.franchise.user.last_name}".strip()
                return contact if contact else "Contact non défini"
            return "Contact non défini"
    
    def initialiser_adresse_franchise(self):
        """Initialise l'adresse de livraison avec les données de la franchise"""
        if self.franchise:
            if not self.adresse_livraison and self.franchise.adresse:
                self.adresse_livraison = self.franchise.adresse
            if not self.ville_livraison and self.franchise.ville:
                self.ville_livraison = self.franchise.ville
            if not self.code_postal_livraison and self.franchise.code_postal:
                self.code_postal_livraison = self.franchise.code_postal
            if not self.nom_contact_livraison and self.franchise.user:
                self.nom_contact_livraison = f"{self.franchise.user.first_name} {self.franchise.user.last_name}".strip()
        
    def calculer_montants(self):
        """Calcule les montants selon le type d'entrepôt de livraison - MULTI-ENTREPÔTS"""
        if not self.pk:
            return
            
        # Le contrôle 80/20 se base sur le TYPE D'ENTREPÔT, pas le produit
        self.montant_drivn_cook = sum(
            detail.sous_total for detail in self.details.all() 
            if detail.entrepot_livraison.type_entrepot == 'drivn_cook'
        )
        self.montant_fournisseur_libre = sum(
            detail.sous_total for detail in self.details.all() 
            if detail.entrepot_livraison.type_entrepot == 'fournisseur_libre'
        )
        self.montant_total = self.montant_drivn_cook + self.montant_fournisseur_libre

    def respecte_regle_80_20(self):
        """Vérifie que 80% minimum du montant vient des entrepôts Driv'n Cook - MULTI-ENTREPÔTS"""
        if self.montant_total == 0:
            return True, 0, "Commande vide"
            
        pourcentage_drivn = (self.montant_drivn_cook / self.montant_total) * 100
        pourcentage_libre = (self.montant_fournisseur_libre / self.montant_total) * 100
        
        if pourcentage_drivn >= 80:
            message = f"✅ Conforme : {pourcentage_drivn:.1f}% Driv'n Cook ({self.entrepots_drivn_cook.count()} entrepôts), {pourcentage_libre:.1f}% libre ({self.entrepots_fournisseur_libre.count()} entrepôts)"
            return True, pourcentage_drivn, message
        else:
            message = f"❌ Non-conforme : {pourcentage_drivn:.1f}% Driv'n Cook (minimum 80%), {pourcentage_libre:.1f}% libre"
            return False, pourcentage_drivn, message

    # 🎯 NOUVELLE PROPRIÉTÉ POUR LE FRONTEND
    @property
    def respecte_regle_80_20_result(self):
        """Retourne le résultat complet de la règle 80/20 pour le frontend"""
        conforme, pourcentage_drivn, message = self.respecte_regle_80_20()
        return {
            'conforme': conforme,
            'pourcentage_drivn': pourcentage_drivn,
            'pourcentage_libre': self.pourcentage_fournisseur_libre,
            'message': message,
            'montant_total': float(self.montant_total),
            'montant_drivn_cook': float(self.montant_drivn_cook),
            'montant_fournisseur_libre': float(self.montant_fournisseur_libre),
            'entrepots_count': self.entrepots_count,
            'entrepots_drivn_count': self.entrepots_drivn_cook.count(),
            'entrepots_libre_count': self.entrepots_fournisseur_libre.count()
        }

    @property
    def pourcentage_drivn_cook(self):
        """Retourne le pourcentage de produits Driv'n Cook"""
        if self.montant_total == 0:
            return 0
        return (self.montant_drivn_cook / self.montant_total) * 100

    @property
    def pourcentage_fournisseur_libre(self):
        """Retourne le pourcentage de produits libres"""
        if self.montant_total == 0:
            return 0
        return (self.montant_fournisseur_libre / self.montant_total) * 100

    def clean(self):
        """Validation stricte de la règle 80/20 avant sauvegarde - MULTI-ENTREPÔTS"""
        # Seulement valider si la commande a des détails
        if self.pk and self.details.exists():
            self.calculer_montants()
            conforme, pourcentage_drivn, message = self.respecte_regle_80_20()
            
            if not conforme:
                raise ValidationError(f"Règle 80/20 non respectée : {message}")

    def generer_numero_commande(self):
        """Génère automatiquement un numéro de commande unique"""
        with transaction.atomic():
            date_str = timezone.now().strftime('%Y%m%d')
            
            # Récupérer le dernier numéro pour ce jour
            derniere_commande = CommandeFranchise.objects.select_for_update().filter(
                numero_commande__startswith=f'CMD-{date_str}'
            ).order_by('-numero_commande').first()
            
            if derniere_commande:
                try:
                    dernier_seq = int(derniere_commande.numero_commande.split('-')[-1])
                    nouveau_seq = dernier_seq + 1
                except (ValueError, IndexError):
                    nouveau_seq = 1
            else:
                nouveau_seq = 1
            
            numero = f'CMD-{date_str}-{nouveau_seq:04d}'
            
            while CommandeFranchise.objects.filter(numero_commande=numero).exists():
                nouveau_seq += 1
                numero = f'CMD-{date_str}-{nouveau_seq:04d}'
            
            return numero

    def save(self, *args, **kwargs):
        # Initialiser l'adresse de livraison avec celle de la franchise si vide
        if not self.adresse_livraison and self.franchise:
            self.initialiser_adresse_franchise()
        
        # Génération automatique du numéro de commande
        if not self.numero_commande:
            self.numero_commande = self.generer_numero_commande()
        
        super().save(*args, **kwargs)
        
        # Calculer les montants si la commande a des détails
        if self.details.exists():
            self.calculer_montants()
            CommandeFranchise.objects.filter(pk=self.pk).update(
                montant_total=self.montant_total,
                montant_drivn_cook=self.montant_drivn_cook,
                montant_fournisseur_libre=self.montant_fournisseur_libre
            )

    def __str__(self):
        entrepots_info = f"({self.entrepots_count} entrepôts)" if self.pk else ""
        return f"{self.numero_commande} - {self.franchise.nom_franchise} - {self.montant_total}€ {entrepots_info}"


class DetailCommande(models.Model):
    """Lignes de commande avec entrepôt de livraison spécifique - MULTI-ENTREPÔTS"""
    commande = models.ForeignKey(CommandeFranchise, on_delete=models.CASCADE, related_name='details')
    produit = models.ForeignKey(Produit, on_delete=models.PROTECT, related_name='details_commandes')
    
    # 🎯 CHAMP CLÉ : L'entrepôt peut être différent pour chaque produit
    entrepot_livraison = models.ForeignKey(
        Entrepot, 
        on_delete=models.PROTECT, 
        related_name='details_livraisons',  # 🎯 CHANGÉ pour éviter les conflits
        help_text="Entrepôt d'où vient le produit (détermine le statut 80/20)"
    )
    
    quantite_commandee = models.PositiveIntegerField()
    prix_unitaire = models.DecimalField(max_digits=6, decimal_places=2)
    sous_total = models.DecimalField(max_digits=8, decimal_places=2, editable=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        # 🎯 NOUVEAU : Empêcher les doublons (même produit + même entrepôt dans une commande)
        unique_together = ['commande', 'produit', 'entrepot_livraison']
        verbose_name = "Détail de commande"
        verbose_name_plural = "Détails de commandes"
    
    def __str__(self):
        return f"{self.commande.numero_commande} - {self.produit.nom_produit} x{self.quantite_commandee} depuis {self.entrepot_livraison.nom_entrepot}"
    
    def clean(self):
        """Validation du détail"""
        # Vérifier que le produit est disponible dans l'entrepôt
        if self.produit and self.entrepot_livraison:
            try:
                stock = StockEntrepot.objects.get(
                    produit=self.produit, 
                    entrepot=self.entrepot_livraison
                )
                if stock.quantite_disponible < self.quantite_commandee:
                    raise ValidationError(
                        f"Stock insuffisant pour {self.produit.nom_produit} "
                        f"dans {self.entrepot_livraison.nom_entrepot} : "
                        f"disponible {stock.quantite_disponible}, demandé {self.quantite_commandee}"
                    )
            except StockEntrepot.DoesNotExist:
                raise ValidationError(
                    f"Le produit {self.produit.nom_produit} n'est pas disponible "
                    f"dans l'entrepôt {self.entrepot_livraison.nom_entrepot}"
                )
    
    def save(self, *args, **kwargs):
        # Validation avant sauvegarde
        self.clean()
        
        # Calcul automatique du sous-total
        self.sous_total = self.quantite_commandee * self.prix_unitaire
        super().save(*args, **kwargs)
        
        # Recalcul des montants de la commande parent
        if self.commande_id:
            self.commande.calculer_montants()
            CommandeFranchise.objects.filter(pk=self.commande_id).update(
                montant_total=self.commande.montant_total,
                montant_drivn_cook=self.commande.montant_drivn_cook,
                montant_fournisseur_libre=self.commande.montant_fournisseur_libre
            )

class VenteFranchise(models.Model):
    """Chiffres de ventes quotidiens avec redevance de 4%"""
    franchise = models.ForeignKey(Franchise, on_delete=models.CASCADE, related_name='ventes')
    date_vente = models.DateField()
    chiffre_affaires_jour = models.DecimalField(max_digits=10, decimal_places=2)
    redevance_due = models.DecimalField(max_digits=8, decimal_places=2, editable=False)
    nombre_transactions = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['franchise', 'date_vente']
        ordering = ['-date_vente']
        
    def __str__(self):
        return f"{self.franchise.nom_franchise} - {self.date_vente} : {self.chiffre_affaires_jour}€ (redevance: {self.redevance_due}€)"
    
    def save(self, *args, **kwargs):
        # Calcul automatique de la redevance (4% du CA)
        self.redevance_due = self.chiffre_affaires_jour * Decimal('0.04')
        super().save(*args, **kwargs)


