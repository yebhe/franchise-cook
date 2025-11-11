# admin.py - DRIV'N COOK Administration personnalisée CORRIGÉE
from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from django.urls import reverse
from django.db.models import Sum, Count, Q
from decimal import Decimal
from . import models

class CustomAdminMixin:
    class Media:
        css = {
            'all': ('admin/css/custom.css',)
        }

# Personnalisation du site admin
admin.site.site_header = "DRIV'N COOK - Administration"
admin.site.site_title = "DRIV'N COOK Admin"
admin.site.index_title = "Gestion des franchises et services"


@admin.register(models.Entrepot)
class EntrepotAdmin(CustomAdminMixin, admin.ModelAdmin):  # ✅ AJOUTÉ CustomAdminMixin
    list_display = ['nom_entrepot', 'ville', 'type_entrepot_badge', 'statut_badge', 'stock_count', 'created_at']
    list_filter = ['type_entrepot', 'statut', 'ville', 'created_at']
    search_fields = ['nom_entrepot', 'ville', 'responsable', 'adresse']
    list_per_page = 20
    ordering = ['type_entrepot', 'nom_entrepot']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('nom_entrepot', 'type_entrepot', 'statut')
        }),
        ('Localisation', {
            'fields': ('adresse', 'ville', 'code_postal')
        }),
        ('Contact', {
            'fields': ('telephone', 'responsable')
        }),
    )
    
    def type_entrepot_badge(self, obj):
        if obj.type_entrepot == 'drivn_cook':
            return format_html('<span style="background-color: #3b82f6; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px;">🏢 DRIV\'N COOK</span>')
        return format_html('<span style="background-color: #10b981; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px;">🚚 LIBRE</span>')
    type_entrepot_badge.short_description = 'Type'
    
    def statut_badge(self, obj):
        colors = {
            'actif': '#10b981',
            'maintenance': '#f59e0b',
            'ferme': '#ef4444'
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px;">{}</span>',
            colors.get(obj.statut, '#6b7280'),
            obj.get_statut_display()
        )
    statut_badge.short_description = 'Statut'
    
    def stock_count(self, obj):
        count = obj.stocks.count()
        return format_html('<strong>{}</strong> produits', count)
    stock_count.short_description = 'Produits en stock'


@admin.register(models.Franchise)
class FranchiseAdmin(CustomAdminMixin, admin.ModelAdmin):  # ✅ AJOUTÉ CustomAdminMixin
    list_display = ['nom_franchise', 'get_franchisee_name', 'statut_badge', 'statut_paiement_badge', 'droit_entree', 'camions_count', 'emplacements_count', 'created_at']
    list_filter = ['statut', 'statut_paiement', 'date_signature', 'created_at']
    search_fields = ['nom_franchise', 'user__first_name', 'user__last_name', 'user__email', 'ville']
    list_per_page = 20
    ordering = ['-created_at']
    
    fieldsets = (
        ('Franchisé', {
            'fields': ('user', 'nom_franchise')
        }),
        ('Localisation', {
            'fields': ('adresse', 'ville', 'code_postal')
        }),
        ('Contrat', {
            'fields': ('date_signature', 'droit_entree', 'statut')
        }),
        ('Validation et paiement', {
            'fields': ('valide_par', 'date_validation', 'statut_paiement', 'date_paiement', 'commentaire_admin'),
            'classes': ('collapse',)
        }),
        ('Informations techniques', {
            'fields': ('stripe_payment_intent_id', 'stripe_checkout_session_id'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['date_validation', 'date_paiement']
    
    def get_franchisee_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email
        return "Utilisateur non défini"
    get_franchisee_name.short_description = 'Franchisé'
    
    def statut_badge(self, obj):
        colors = {
            'en_attente': '#f59e0b',
            'valide': '#3b82f6',
            'paye': '#10b981',
            'suspendu': '#ef4444',
            'resilie': '#6b7280'
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px;">{}</span>',
            colors.get(obj.statut, '#6b7280'),
            obj.get_statut_display()
        )
    statut_badge.short_description = 'Statut'
    
    def statut_paiement_badge(self, obj):
        colors = {
            'en_attente': '#6b7280',
            'lien_envoye': '#3b82f6',
            'en_cours': '#f59e0b',
            'paye': '#10b981',
            'echec': '#ef4444'
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px;">{}</span>',
            colors.get(obj.statut_paiement, '#6b7280'),
            obj.get_statut_paiement_display()
        )
    statut_paiement_badge.short_description = 'Paiement'
    
    def camions_count(self, obj):
        count = obj.camions.count()
        return format_html('<strong>{}</strong> camion(s)', count)
    camions_count.short_description = 'Camions'
    
    def emplacements_count(self, obj):
        count = obj.emplacements_autorises.count()
        return format_html('<strong>{}</strong> emplacement(s)', count)
    emplacements_count.short_description = 'Emplacements'


@admin.register(models.Emplacement)
class EmplacementAdmin(CustomAdminMixin, admin.ModelAdmin):  # ✅ AJOUTÉ CustomAdminMixin
    list_display = ['nom_emplacement', 'ville', 'type_zone_badge', 'tarif_journalier', 'franchises_count', 'disponibilite_badge']
    list_filter = ['type_zone', 'ville', 'created_at']
    search_fields = ['nom_emplacement', 'ville', 'adresse']
    filter_horizontal = ['franchises_autorisees']
    list_per_page = 20
    ordering = ['ville', 'nom_emplacement']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('nom_emplacement', 'type_zone')
        }),
        ('Localisation', {
            'fields': ('adresse', 'ville', 'code_postal')
        }),
        ('Conditions', {
            'fields': ('tarif_journalier', 'horaires_autorises')
        }),
        ('Autorisations', {
            'fields': ('franchises_autorisees',)
        }),
    )
    
    def type_zone_badge(self, obj):
        colors = {
            'centre_ville': '#3b82f6',
            'zone_commerciale': '#10b981',
            'parc': '#059669',
            'entreprise': '#f59e0b',
            'marche': '#ef4444'
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px;">{}</span>',
            colors.get(obj.type_zone, '#6b7280'),
            obj.get_type_zone_display()
        )
    type_zone_badge.short_description = 'Type'
    
    def franchises_count(self, obj):
        count = obj.franchises_autorisees.count()
        return format_html('<strong>{}</strong> franchise(s)', count)
    franchises_count.short_description = 'Franchises autorisées'
    
    def disponibilite_badge(self, obj):
        if obj.est_disponible:
            return format_html('<span style="color: #10b981;">✅ Disponible</span>')
        else:
            affectation = obj.affectation_actuelle
            if affectation:
                return format_html('<span style="color: #ef4444;">❌ Occupé par {}</span>', affectation.camion.numero_camion)
            return format_html('<span style="color: #f59e0b;">⚠️ Indisponible</span>')
    disponibilite_badge.short_description = 'Disponibilité'


@admin.register(models.Camion)
class CamionAdmin(CustomAdminMixin, admin.ModelAdmin):  # ✅ AJOUTÉ CustomAdminMixin
    list_display = ['numero_camion', 'immatriculation', 'get_franchise_name', 'statut_badge', 'kilometrage', 'maintenances_count']
    list_filter = ['statut', 'marque', 'franchise', 'date_attribution']
    search_fields = ['numero_camion', 'immatriculation', 'marque', 'modele', 'franchise__nom_franchise']
    list_per_page = 20
    ordering = ['numero_camion']
    
    fieldsets = (
        ('Identification', {
            'fields': ('numero_camion', 'immatriculation')
        }),
        ('Caractéristiques', {
            'fields': ('marque', 'modele', 'kilometrage')
        }),
        ('Attribution', {
            'fields': ('franchise', 'statut', 'date_attribution')
        }),
    )
    
    def get_franchise_name(self, obj):
        return obj.franchise.nom_franchise if obj.franchise else "Non attribué"
    get_franchise_name.short_description = 'Franchise'
    
    def statut_badge(self, obj):
        colors = {
            'disponible': '#10b981',
            'attribue': '#3b82f6',
            'maintenance': '#f59e0b',
            'hors_service': '#ef4444'
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px;">{}</span>',
            colors.get(obj.statut, '#6b7280'),
            obj.get_statut_display()
        )
    statut_badge.short_description = 'Statut'
    
    def maintenances_count(self, obj):
        count = obj.maintenances.count()
        return format_html('<strong>{}</strong> intervention(s)', count)
    maintenances_count.short_description = 'Maintenances'


@admin.register(models.MaintenanceCamion)
class MaintenanceCamionAdmin(CustomAdminMixin, admin.ModelAdmin):  # ✅ AJOUTÉ CustomAdminMixin
    list_display = ['camion', 'type_maintenance_badge', 'date_maintenance', 'statut_badge', 'cout', 'garage']
    list_filter = ['type_maintenance', 'statut', 'date_maintenance', 'camion__franchise']
    search_fields = ['camion__numero_camion', 'camion__immatriculation', 'description', 'garage']
    date_hierarchy = 'date_maintenance'
    list_per_page = 20
    ordering = ['-date_maintenance']
    
    fieldsets = (
        ('Maintenance', {
            'fields': ('camion', 'type_maintenance', 'date_maintenance')
        }),
        ('Détails', {
            'fields': ('description', 'cout', 'garage', 'statut')
        }),
    )
    
    def type_maintenance_badge(self, obj):
        colors = {
            'revision': '#3b82f6',
            'reparation': '#f59e0b',
            'panne': '#ef4444',
            'controle_technique': '#10b981'
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px;">{}</span>',
            colors.get(obj.type_maintenance, '#6b7280'),
            obj.get_type_maintenance_display()
        )
    type_maintenance_badge.short_description = 'Type'
    
    def statut_badge(self, obj):
        colors = {
            'programme': '#f59e0b',
            'en_cours': '#3b82f6',
            'termine': '#10b981'
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px;">{}</span>',
            colors.get(obj.statut, '#6b7280'),
            obj.get_statut_display()
        )
    statut_badge.short_description = 'Statut'


@admin.register(models.AffectationEmplacement)
class AffectationEmplacementAdmin(CustomAdminMixin, admin.ModelAdmin):  # ✅ AJOUTÉ CustomAdminMixin
    list_display = ['camion', 'emplacement', 'date_debut', 'date_fin', 'statut_badge', 'get_franchise_name']
    list_filter = ['statut', 'date_debut', 'emplacement__type_zone', 'camion__franchise']
    search_fields = ['camion__numero_camion', 'emplacement__nom_emplacement', 'emplacement__ville']
    date_hierarchy = 'date_debut'
    list_per_page = 20
    ordering = ['-date_debut']
    
    fieldsets = (
        ('Affectation', {
            'fields': ('camion', 'emplacement', 'statut')
        }),
        ('Période', {
            'fields': ('date_debut', 'date_fin', 'horaire_debut', 'horaire_fin')
        }),
    )
    
    def statut_badge(self, obj):
        colors = {
            'programme': '#f59e0b',
            'en_cours': '#3b82f6',
            'termine': '#10b981',
            'annule': '#ef4444'
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px;">{}</span>',
            colors.get(obj.statut, '#6b7280'),
            obj.get_statut_display()
        )
    statut_badge.short_description = 'Statut'
    
    def get_franchise_name(self, obj):
        return obj.camion.franchise.nom_franchise if obj.camion.franchise else "Non attribué"
    get_franchise_name.short_description = 'Franchise'


@admin.register(models.CategorieProduit)
class CategorieProduitAdmin(CustomAdminMixin, admin.ModelAdmin):  # ✅ AJOUTÉ CustomAdminMixin
    list_display = ['nom_categorie', 'produits_count', 'created_at']
    search_fields = ['nom_categorie', 'description']
    list_per_page = 20
    ordering = ['nom_categorie']
    
    def produits_count(self, obj):
        count = obj.produits.count()
        return format_html('<strong>{}</strong> produit(s)', count)
    produits_count.short_description = 'Produits'


@admin.register(models.Produit)
class ProduitAdmin(CustomAdminMixin, admin.ModelAdmin):  # ✅ AJOUTÉ CustomAdminMixin
    list_display = ['nom_produit', 'categorie', 'prix_unitaire_badge', 'unite', 'stocks_count']
    list_filter = ['categorie', 'unite', 'created_at']
    search_fields = ['nom_produit', 'categorie__nom_categorie']
    list_per_page = 20
    ordering = ['nom_produit']
    
    def prix_unitaire_badge(self, obj):
        return format_html('<strong style="color: #10b981;">{} €</strong>', obj.prix_unitaire)
    prix_unitaire_badge.short_description = 'Prix unitaire'
    
    def stocks_count(self, obj):
        count = obj.stocks.count()
        return format_html('<strong>{}</strong> entrepôt(s)', count)
    stocks_count.short_description = 'Entrepôts'


@admin.register(models.StockEntrepot)
class StockEntrepotAdmin(CustomAdminMixin, admin.ModelAdmin):  # ✅ AJOUTÉ CustomAdminMixin
    list_display = ['produit', 'entrepot', 'quantite_disponible_badge', 'quantite_reservee', 'alerte_badge']
    list_filter = ['entrepot', 'produit__categorie', 'created_at']
    search_fields = ['produit__nom_produit', 'entrepot__nom_entrepot']
    list_per_page = 20
    ordering = ['entrepot__nom_entrepot', 'produit__nom_produit']
    
    def quantite_disponible_badge(self, obj):
        color = '#ef4444' if obj.alerte_stock else '#10b981'
        return format_html('<strong style="color: {};">{}</strong>', color, obj.quantite_disponible)
    quantite_disponible_badge.short_description = 'Quantité disponible'
    
    def alerte_badge(self, obj):
        if obj.alerte_stock:
            return format_html('<span style="color: #ef4444;">⚠️ Stock faible</span>')
        return format_html('<span style="color: #10b981;">✅ Stock OK</span>')
    alerte_badge.short_description = 'Alerte'


class DetailCommandeInline(admin.TabularInline):
    model = models.DetailCommande
    extra = 0
    fields = ['produit', 'entrepot_livraison', 'quantite_commandee', 'prix_unitaire', 'sous_total']
    readonly_fields = ['sous_total']


@admin.register(models.CommandeFranchise)
class CommandeFranchiseAdmin(CustomAdminMixin, admin.ModelAdmin):  # ✅ AJOUTÉ CustomAdminMixin
    list_display = ['numero_commande', 'franchise', 'date_commande', 'statut_badge', 'montant_total_badge', 'regle_80_20_badge', 'entrepots_count']
    list_filter = ['statut', 'date_commande', 'franchise']
    search_fields = ['numero_commande', 'franchise__nom_franchise', 'franchise__user__first_name', 'franchise__user__last_name']
    date_hierarchy = 'date_commande'
    list_per_page = 20
    ordering = ['-date_commande']
    inlines = [DetailCommandeInline]
    
    fieldsets = (
        ('Commande', {
            'fields': ('numero_commande', 'franchise', 'statut')
        }),
        ('Livraison', {
            'fields': ('date_livraison_prevue', 'adresse_livraison')
        }),
        ('Montants', {
            'fields': ('montant_total', 'montant_drivn_cook', 'montant_fournisseur_libre'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['numero_commande', 'montant_total', 'montant_drivn_cook', 'montant_fournisseur_libre']
    
    def statut_badge(self, obj):
        colors = {
            'en_attente': '#f59e0b',
            'validee': '#3b82f6',
            'preparee': '#10b981',
            'livree': '#059669',
            'annulee': '#ef4444'
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px;">{}</span>',
            colors.get(obj.statut, '#6b7280'),
            obj.get_statut_display()
        )
    statut_badge.short_description = 'Statut'
    
    def montant_total_badge(self, obj):
        return format_html('<strong style="color: #10b981; font-size: 14px;">{} €</strong>', obj.montant_total)
    montant_total_badge.short_description = 'Montant total'
    
    def regle_80_20_badge(self, obj):
        if obj.montant_total == 0:
            return format_html('<span style="color: #6b7280;">Commande vide</span>')
        
        conforme, pourcentage, _ = obj.respecte_regle_80_20()
        if conforme:
            return format_html('<span style="color: #10b981;">✅ {:.1f}% Driv\'n Cook</span>', pourcentage)
        else:
            return format_html('<span style="color: #ef4444;">❌ {:.1f}% Driv\'n Cook</span>', pourcentage)
    regle_80_20_badge.short_description = 'Règle 80/20'
    
    def entrepots_count(self, obj):
        if obj.pk:
            count = obj.entrepots_count
            drivn_count = obj.entrepots_drivn_cook.count()
            libre_count = obj.entrepots_fournisseur_libre.count()
            return format_html(
                '<strong>{}</strong> entrepôts<br><small>📦 {} Driv\'n Cook | 🚚 {} Libres</small>',
                count, drivn_count, libre_count
            )
        return "Aucun"
    entrepots_count.short_description = 'Entrepôts'


@admin.register(models.DetailCommande)
class DetailCommandeAdmin(CustomAdminMixin, admin.ModelAdmin):  # ✅ AJOUTÉ CustomAdminMixin
    list_display = ['commande', 'produit', 'entrepot_livraison', 'quantite_commandee', 'prix_unitaire', 'sous_total_badge']
    list_filter = ['entrepot_livraison', 'produit__categorie', 'entrepot_livraison__type_entrepot']
    search_fields = ['commande__numero_commande', 'produit__nom_produit', 'entrepot_livraison__nom_entrepot']
    list_per_page = 20
    ordering = ['-commande__date_commande']
    
    def sous_total_badge(self, obj):
        return format_html('<strong style="color: #10b981;">{} €</strong>', obj.sous_total)
    sous_total_badge.short_description = 'Sous-total'


@admin.register(models.VenteFranchise)
class VenteFranchiseAdmin(CustomAdminMixin, admin.ModelAdmin):  # ✅ AJOUTÉ CustomAdminMixin
    list_display = ['franchise', 'date_vente', 'chiffre_affaires_badge', 'redevance_badge', 'nombre_transactions']
    list_filter = ['date_vente', 'franchise']
    search_fields = ['franchise__nom_franchise', 'franchise__user__first_name', 'franchise__user__last_name']
    date_hierarchy = 'date_vente'
    list_per_page = 20
    ordering = ['-date_vente']
    
    fieldsets = (
        ('Vente', {
            'fields': ('franchise', 'date_vente')
        }),
        ('Chiffres', {
            'fields': ('chiffre_affaires_jour', 'nombre_transactions', 'redevance_due')
        }),
    )
    readonly_fields = ['redevance_due']
    
    def chiffre_affaires_badge(self, obj):
        return format_html('<strong style="color: #10b981; font-size: 14px;">{} €</strong>', obj.chiffre_affaires_jour)
    chiffre_affaires_badge.short_description = 'Chiffre d\'affaires'
    
    def redevance_badge(self, obj):
        return format_html('<strong style="color: #3b82f6; font-size: 12px;">{} €</strong>', obj.redevance_due)
    redevance_badge.short_description = 'Redevance (4%)'


@admin.register(models.AutorisationEmplacement)
class AutorisationEmplacementAdmin(CustomAdminMixin, admin.ModelAdmin):  # ✅ AJOUTÉ CustomAdminMixin
    list_display = ['franchise', 'emplacement', 'date_autorisation', 'date_expiration', 'est_active_badge', 'est_valide_badge']
    list_filter = ['est_active', 'date_autorisation', 'date_expiration']
    search_fields = ['franchise__nom_franchise', 'emplacement__nom_emplacement']
    date_hierarchy = 'date_autorisation'
    list_per_page = 20
    ordering = ['-date_autorisation']
    
    def est_active_badge(self, obj):
        if obj.est_active:
            return format_html('<span style="color: #10b981;">✅ Active</span>')
        return format_html('<span style="color: #ef4444;">❌ Inactive</span>')
    est_active_badge.short_description = 'Active'
    
    def est_valide_badge(self, obj):
        if obj.est_valide:
            return format_html('<span style="color: #10b981;">✅ Valide</span>')
        return format_html('<span style="color: #f59e0b;">⚠️ Expirée</span>')
    est_valide_badge.short_description = 'Validité'