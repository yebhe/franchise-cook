# views.py - Version TEST simplifiée pour développement

import stripe
import json
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.http import HttpResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from decimal import Decimal

from gestion_camions.models import Franchise
from .serializers import FranchiseSerializer

# Configuration Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def valider_franchise(request, franchise_id):
    """Valider une franchise et envoyer l'email avec lien de paiement"""
    try:
        franchise = Franchise.objects.get(id=franchise_id)
        
        # Vérifier que la franchise peut être validée
        if franchise.statut != 'en_attente' and not (franchise.statut == 'actif' and not franchise.date_validation):
            return Response(
                {'error': f'Cette franchise ne peut pas être validée. Statut actuel: {franchise.statut}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Marquer comme validée
        franchise.statut = 'valide'
        franchise.valide_par = request.user
        franchise.date_validation = timezone.now()
        franchise.commentaire_admin = request.data.get('commentaire', '')
        franchise.save()
        
        # Construire les URLs avec request.build_absolute_uri()
        base_url = request.build_absolute_uri('/').rstrip('/')
        success_url = f"{base_url}/franchise/paiement/succes?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{base_url}/franchise/paiement/annule"
        
        # Créer la session de paiement Stripe
        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'eur',
                        'product_data': {
                            'name': f'Droit d\'entrée franchise - {franchise.nom_franchise}',
                            'description': f'Paiement du droit d\'entrée pour la franchise {franchise.nom_franchise}',
                        },
                        'unit_amount': int(franchise.droit_entree * 100),  # Stripe utilise les centimes
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=success_url,
                cancel_url=cancel_url,
                customer_email=franchise.user.email,
                metadata={
                    'franchise_id': str(franchise.id),
                    'user_id': str(franchise.user.id),
                    'type': 'droit_entree_franchise',
                    'nom_franchise': franchise.nom_franchise,
                    'montant': str(franchise.droit_entree)
                }
            )
            
            # Sauvegarder l'ID de session Stripe
            franchise.stripe_checkout_session_id = checkout_session.id
            franchise.statut_paiement = 'lien_envoye'
            franchise.save()
            
            print(f"✅ Session Stripe créée: {checkout_session.id} pour franchise {franchise.id}")
            
            # Envoyer l'email
            envoi_reussi = envoyer_email_validation(franchise, checkout_session.url)
            
            return Response({
                'message': 'Franchise validée avec succès',
                'payment_url': checkout_session.url,
                'session_id': checkout_session.id,
                'email_envoye': envoi_reussi,
                'franchise': FranchiseSerializer(franchise).data
            })
            
        except stripe.error.StripeError as e:
            # Annuler la validation en cas d'erreur Stripe
            franchise.statut = 'en_attente'
            franchise.valide_par = None
            franchise.date_validation = None
            franchise.save()
            
            print(f"❌ Erreur Stripe: {str(e)}")
            
            return Response(
                {'error': f'Erreur lors de la création du paiement Stripe: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except Franchise.DoesNotExist:
        return Response(
            {'error': 'Franchise non trouvée'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        print(f"❌ Erreur validation: {str(e)}")
        return Response(
            {'error': f'Erreur lors de la validation: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@csrf_exempt
@require_POST
def webhook_stripe(request):
    """
    🎯 WEBHOOK STRIPE - VERSION TEST SIMPLIFIÉE
    Traite automatiquement TOUS les paiements réussis en mode développement
    """
    try:
        # 📝 VERSION TEST : Parse direct sans vérification signature
        event = json.loads(request.body)
        event_type = event['type']
        
        print(f"🔔 Webhook Stripe reçu: {event_type}")
        
        # Traitement principal : checkout.session.completed
        if event_type == 'checkout.session.completed':
            session = event['data']['object']
            session_id = session['id']
            payment_status = session.get('payment_status')
            
            print(f"💳 Session completed: {session_id}, Status: {payment_status}")
            
            # Vérifier que le paiement est bien confirmé
            if payment_status == 'paid':
                return traiter_paiement_reussi_test(session)
            else:
                print(f"⚠️ Paiement non confirmé: {payment_status}")
        
        # Traitement backup : payment_intent.succeeded
        elif event_type == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            print(f"💰 Payment Intent réussi: {payment_intent['id']}")
            return traiter_payment_intent_test(payment_intent)
        
        # Session expirée
        elif event_type == 'checkout.session.expired':
            session = event['data']['object']
            print(f"⏰ Session expirée: {session['id']}")
            traiter_session_expiree_test(session)
        
        else:
            print(f"ℹ️ Événement non traité: {event_type}")
        
        return HttpResponse("OK", status=200)
        
    except json.JSONDecodeError as e:
        print(f"❌ Erreur JSON webhook: {e}")
        return HttpResponse("Invalid JSON", status=400)
    except Exception as e:
        print(f"❌ Erreur webhook: {e}")
        return HttpResponse(f"Erreur: {e}", status=500)


def traiter_paiement_reussi_test(session):
    """
    🎯 TRAITEMENT PRINCIPAL VERSION TEST
    Met à jour automatiquement la franchise et l'utilisateur
    """
    session_id = session['id']
    
    try:
        print(f"🔍 Recherche de la franchise pour session: {session_id}")
        
        # 🔍 RECHERCHE DE LA FRANCHISE (plusieurs méthodes)
        franchise = None
        
        # Méthode 1: Par session_id direct
        try:
            franchise = Franchise.objects.get(stripe_checkout_session_id=session_id)
            print(f"✅ Franchise trouvée par session_id: {franchise.id} - {franchise.nom_franchise}")
        except Franchise.DoesNotExist:
            print(f"⚠️ Aucune franchise trouvée avec session_id: {session_id}")
        
        # Méthode 2: Par métadonnées Stripe
        if not franchise:
            metadata = session.get('metadata', {})
            franchise_id = metadata.get('franchise_id')
            print(f"🔍 Recherche par metadata franchise_id: {franchise_id}")
            
            if franchise_id:
                try:
                    franchise = Franchise.objects.get(id=int(franchise_id))
                    print(f"✅ Franchise trouvée par metadata: {franchise.id} - {franchise.nom_franchise}")
                    # Corriger le session_id si manquant
                    if not franchise.stripe_checkout_session_id:
                        franchise.stripe_checkout_session_id = session_id
                        print(f"🔧 Session_id mis à jour pour franchise {franchise.id}")
                except (Franchise.DoesNotExist, ValueError) as e:
                    print(f"❌ Erreur recherche par metadata: {e}")
        
        if not franchise:
            print(f"❌ AUCUNE FRANCHISE TROUVÉE pour session {session_id}")
            return HttpResponse("Franchise non trouvée", status=404)
        
        # 🎯 MISE À JOUR COMPLÈTE DE LA FRANCHISE
        ancien_statut = franchise.statut
        ancien_statut_paiement = franchise.statut_paiement
        
        franchise.statut = 'paye'
        franchise.statut_paiement = 'paye'
        franchise.date_paiement = timezone.now()
        franchise.stripe_payment_intent_id = session.get('payment_intent')
        franchise.save()
        
        print(f"✅ Franchise mise à jour:")
        print(f"   - ID: {franchise.id}")
        print(f"   - Nom: {franchise.nom_franchise}")
        print(f"   - Statut: {ancien_statut} → {franchise.statut}")
        print(f"   - Statut paiement: {ancien_statut_paiement} → {franchise.statut_paiement}")
        print(f"   - Date paiement: {franchise.date_paiement}")
        
        # 🎯 MISE À JOUR DE L'UTILISATEUR
        ancien_has_franchise = franchise.user.has_franchise
        franchise.user.has_franchise = True
        franchise.user.save()
        
        print(f"✅ Utilisateur mis à jour:")
        print(f"   - ID: {franchise.user.id}")
        print(f"   - Email: {franchise.user.email}")
        print(f"   - has_franchise: {ancien_has_franchise} → {franchise.user.has_franchise}")
        
        # 📧 ENVOI EMAIL DE CONFIRMATION
        try:
            email_envoye = envoyer_email_paiement_confirme(franchise)
            if email_envoye:
                print(f"📧 Email de confirmation envoyé à {franchise.user.email}")
            else:
                print(f"⚠️ Échec envoi email à {franchise.user.email}")
        except Exception as e:
            print(f"❌ Erreur envoi email: {e}")
        
        print(f"🎉 PAIEMENT TRAITÉ AVEC SUCCÈS !")
        return HttpResponse("Paiement traité avec succès", status=200)
        
    except Exception as e:
        print(f"❌ ERREUR lors du traitement du paiement {session_id}: {e}")
        return HttpResponse(f"Erreur interne: {e}", status=500)


def traiter_payment_intent_test(payment_intent):
    """
    🔄 TRAITEMENT BACKUP : Payment Intent réussi
    Au cas où checkout.session.completed ne se déclenche pas
    """
    payment_intent_id = payment_intent['id']
    metadata = payment_intent.get('metadata', {})
    
    print(f"💰 Traitement Payment Intent: {payment_intent_id}")
    
    franchise_id = metadata.get('franchise_id')
    if franchise_id:
        try:
            franchise = Franchise.objects.get(id=int(franchise_id))
            
            # Ne mettre à jour que si pas encore fait
            if franchise.statut_paiement != 'paye':
                print(f"🔄 Mise à jour via Payment Intent pour franchise {franchise.id}")
                
                franchise.statut = 'paye'
                franchise.statut_paiement = 'paye'
                franchise.date_paiement = timezone.now()
                franchise.stripe_payment_intent_id = payment_intent_id
                franchise.save()
                
                # Mettre à jour l'utilisateur
                franchise.user.has_franchise = True
                franchise.user.save()
                
                print(f"✅ Franchise {franchise.id} mise à jour via Payment Intent")
                
                # Envoyer email
                envoyer_email_paiement_confirme(franchise)
            else:
                print(f"ℹ️ Franchise {franchise.id} déjà marquée comme payée")
            
        except (Franchise.DoesNotExist, ValueError) as e:
            print(f"❌ Franchise non trouvée pour Payment Intent {payment_intent_id}: {e}")
    else:
        print(f"⚠️ Pas de franchise_id dans metadata du Payment Intent {payment_intent_id}")
    
    return HttpResponse("Payment Intent traité", status=200)


def traiter_session_expiree_test(session):
    """Traitement session expirée"""
    session_id = session['id']
    metadata = session.get('metadata', {})
    franchise_id = metadata.get('franchise_id')
    
    if franchise_id:
        try:
            franchise = Franchise.objects.get(id=int(franchise_id))
            franchise.statut_paiement = 'echec'
            franchise.save()
            print(f"⏰ Session expirée pour franchise {franchise.nom_franchise}")
        except (Franchise.DoesNotExist, ValueError):
            print(f"❌ Franchise non trouvée pour session expirée {session_id}")


def envoyer_email_validation(franchise, payment_url):
    """Envoyer l'email de validation avec le lien de paiement"""
    try:
        sujet = f"🎉 Votre franchise {franchise.nom_franchise} a été validée !"
        
        message_text = f"""
Bonjour {franchise.user.first_name} {franchise.user.last_name},

Félicitations ! Votre demande de franchise "{franchise.nom_franchise}" a été validée.

Pour finaliser votre inscription, veuillez procéder au paiement du droit d'entrée de {franchise.droit_entree}€ :
{payment_url}

Validé par : {franchise.valide_par.first_name} {franchise.valide_par.last_name}
Date de validation : {franchise.date_validation.strftime('%d/%m/%Y à %H:%M')}

{f'Commentaire : {franchise.commentaire_admin}' if franchise.commentaire_admin else ''}

Cordialement,
L'équipe DRIV'N COOK
        """
        
        send_mail(
            subject=sujet,
            message=message_text,
            from_email=getattr(settings, 'EMAIL_FROM', 'noreply@drivncook.fr'),
            recipient_list=[franchise.user.email],
            fail_silently=False,
        )
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur envoi email validation: {e}")
        return False


def envoyer_email_paiement_confirme(franchise):
    """Envoyer email de confirmation de paiement"""
    try:
        sujet = f"✅ Paiement confirmé - Bienvenue dans le réseau DRIV'N COOK !"
        
        message_text = f"""
Bonjour {franchise.user.first_name} {franchise.user.last_name},

Excellente nouvelle ! Votre paiement de {franchise.droit_entree}€ a été confirmé.

Votre franchise "{franchise.nom_franchise}" est maintenant active dans le réseau DRIV'N COOK !

Date de paiement : {franchise.date_paiement.strftime('%d/%m/%Y à %H:%M')}

Nos équipes vont vous contacter prochainement pour les prochaines étapes.

Bienvenue dans la famille DRIV'N COOK !

Cordialement,
L'équipe DRIV'N COOK
        """
        
        send_mail(
            subject=sujet,
            message=message_text,
            from_email=getattr(settings, 'EMAIL_FROM', 'noreply@drivncook.fr'),
            recipient_list=[franchise.user.email],
            fail_silently=False,
        )
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur envoi email confirmation: {e}")
        return False


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def regenerer_lien_paiement(request, franchise_id):
    """Régénérer un lien de paiement en cas d'échec"""
    try:
        franchise = Franchise.objects.get(id=franchise_id)
        
        if franchise.statut != 'valide' or franchise.statut_paiement == 'paye':
            return Response(
                {'error': 'Impossible de générer un lien de paiement pour cette franchise'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Construire les URLs
        base_url = request.build_absolute_uri('/').rstrip('/')
        success_url = f"{base_url}/franchise/paiement/succes?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{base_url}/franchise/paiement/annule"
        
        # Créer une nouvelle session Stripe
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': f'Droit d\'entrée franchise - {franchise.nom_franchise}',
                        'description': f'Paiement du droit d\'entrée pour la franchise {franchise.nom_franchise}',
                    },
                    'unit_amount': int(franchise.droit_entree * 100),
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=franchise.user.email,
            metadata={
                'franchise_id': str(franchise.id),
                'user_id': str(franchise.user.id),
                'type': 'droit_entree_franchise'
            }
        )
        
        # Mettre à jour la franchise
        franchise.stripe_checkout_session_id = checkout_session.id
        franchise.statut_paiement = 'lien_envoye'
        franchise.save()
        
        return Response({
            'message': 'Nouveau lien de paiement généré',
            'payment_url': checkout_session.url
        })
        
    except Franchise.DoesNotExist:
        return Response(
            {'error': 'Franchise non trouvée'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Erreur: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
@api_view(['POST'])
def verifier_paiement(request):
    """
    🎯 MISE À JOUR AUTOMATIQUE DU PAIEMENT
    Appelé automatiquement depuis la page de succès
    Vérifie et met à jour les infos de la franchise
    """
    try:
        session_id = request.data.get('session_id')
        
        if not session_id:
            return Response({
                'success': False,
                'error': 'Session ID requis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"🔍 [AUTO-UPDATE] Vérification paiement pour session: {session_id}")
        
        # 1️⃣ VÉRIFIER LE STATUT CÔTÉ STRIPE ET RÉCUPÉRER LE PAYMENT INTENT
        try:
            # Récupérer la session avec tous les détails
            session = stripe.checkout.Session.retrieve(
                session_id,
                expand=['payment_intent']  # 🎯 IMPORTANT : expand pour récupérer le payment_intent
            )
            
            payment_status = session.payment_status
            payment_intent = session.payment_intent
            payment_intent_id = payment_intent.id if payment_intent else session.payment_intent
            
            print(f"💳 [STRIPE] Session ID: {session_id}")
            print(f"💳 [STRIPE] Payment Status: {payment_status}")
            print(f"💳 [STRIPE] Payment Intent ID: {payment_intent_id}")
            print(f"💳 [STRIPE] Metadata: {session.metadata}")
            
            if payment_status != 'paid':
                return Response({
                    'success': False,
                    'error': f'Paiement non confirmé côté Stripe. Statut: {payment_status}',
                    'stripe_status': payment_status,
                    'session_id': session_id
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except stripe.error.StripeError as e:
            print(f"❌ [STRIPE] Erreur: {str(e)}")
            return Response({
                'success': False,
                'error': f'Erreur Stripe: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # 2️⃣ RECHERCHER LA FRANCHISE
        franchise = None
        
        # Méthode 1: Par session_id direct
        try:
            franchise = Franchise.objects.get(stripe_checkout_session_id=session_id)
            print(f"✅ [FRANCHISE] Trouvée par session_id: {franchise.id} - {franchise.nom_franchise}")
        except Franchise.DoesNotExist:
            print(f"⚠️ [FRANCHISE] Aucune franchise avec session_id: {session_id}")
        
        # Méthode 2: Par metadata Stripe si pas trouvée
        if not franchise:
            metadata = session.get('metadata', {})
            franchise_id = metadata.get('franchise_id')
            
            if franchise_id:
                try:
                    franchise = Franchise.objects.get(id=int(franchise_id))
                    print(f"✅ [FRANCHISE] Trouvée par metadata: {franchise.id} - {franchise.nom_franchise}")
                    
                    # Corriger le session_id manquant
                    if not franchise.stripe_checkout_session_id:
                        franchise.stripe_checkout_session_id = session_id
                        print(f"🔧 [CORRECTION] Session_id ajouté à la franchise {franchise.id}")
                        
                except (Franchise.DoesNotExist, ValueError) as e:
                    print(f"❌ [FRANCHISE] Erreur recherche par metadata: {e}")
        
        if not franchise:
            print(f"❌ [FRANCHISE] AUCUNE FRANCHISE TROUVÉE pour session {session_id}")
            return Response({
                'success': False,
                'error': 'Franchise non trouvée pour cette session de paiement'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # 3️⃣ VÉRIFIER SI DÉJÀ MISE À JOUR
        if franchise.statut == 'paye' and franchise.statut_paiement == 'paye':
            print(f"ℹ️ [DÉJÀ FAIT] Franchise {franchise.id} déjà marquée comme payée")
            return Response({
                'success': True,
                'message': 'Paiement déjà confirmé',
                'already_processed': True,
                'franchise': {
                    'id': franchise.id,
                    'nom': franchise.nom_franchise,
                    'statut': franchise.statut,
                    'statut_paiement': franchise.statut_paiement,
                    'date_paiement': franchise.date_paiement,
                    'montant': float(franchise.droit_entree)
                },
                'user': {
                    'id': franchise.user.id,
                    'email': franchise.user.email,
                    'nom_complet': f"{franchise.user.first_name} {franchise.user.last_name}",
                    'has_franchise': franchise.user.has_franchise
                }
            })
        
        # 4️⃣ SAUVEGARDER LES ANCIENNES VALEURS POUR LOG
        ancien_statut = franchise.statut
        ancien_statut_paiement = franchise.statut_paiement
        ancien_has_franchise = franchise.user.has_franchise
        
        # 5️⃣ METTRE À JOUR LA FRANCHISE AVEC LE PAYMENT INTENT ID
        franchise.statut = 'paye'
        franchise.statut_paiement = 'paye'
        franchise.date_paiement = timezone.now()
        
        # 🎯 RÉCUPÉRER LE PAYMENT INTENT ID DE MANIÈRE SÛRE
        if payment_intent_id:
            franchise.stripe_payment_intent_id = payment_intent_id
        elif hasattr(session, 'payment_intent') and session.payment_intent:
            franchise.stripe_payment_intent_id = session.payment_intent
        else:
            print(f"⚠️ [WARNING] Payment Intent ID non trouvé pour session {session_id}")
        
        franchise.save()
        
        print(f"✅ [FRANCHISE] Mise à jour réussie:")
        print(f"   - Statut: {ancien_statut} → {franchise.statut}")
        print(f"   - Statut paiement: {ancien_statut_paiement} → {franchise.statut_paiement}")
        print(f"   - Date paiement: {franchise.date_paiement}")
        print(f"   - Payment Intent: {franchise.stripe_payment_intent_id}")
        print(f"   - Session ID: {franchise.stripe_checkout_session_id}")
        
        # 6️⃣ METTRE À JOUR L'UTILISATEUR
        franchise.user.has_franchise = True
        franchise.user.save()
        
        print(f"✅ [USER] Mise à jour réussie:")
        print(f"   - has_franchise: {ancien_has_franchise} → {franchise.user.has_franchise}")
        
        # 7️⃣ ENVOYER EMAIL DE CONFIRMATION
        email_envoye = False
        try:
            email_envoye = envoyer_email_paiement_confirme(franchise)
            if email_envoye:
                print(f"📧 [EMAIL] Confirmation envoyée à {franchise.user.email}")
            else:
                print(f"⚠️ [EMAIL] Échec envoi à {franchise.user.email}")
        except Exception as e:
            print(f"❌ [EMAIL] Erreur: {e}")
        
        # 8️⃣ RÉPONSE DE SUCCÈS COMPLÈTE
        print(f"🎉 [SUCCÈS] Paiement traité automatiquement pour {franchise.nom_franchise}")
        
        return Response({
            'success': True,
            'message': 'Paiement confirmé et franchise activée automatiquement',
            'franchise': {
                'id': franchise.id,
                'nom': franchise.nom_franchise,
                'statut': franchise.statut,
                'statut_paiement': franchise.statut_paiement,
                'date_paiement': franchise.date_paiement,
                'montant': float(franchise.droit_entree),
                'adresse': franchise.adresse,
                'ville': franchise.ville,
                'code_postal': franchise.code_postal
            },
            'user': {
                'id': franchise.user.id,
                'email': franchise.user.email,
                'prenom': franchise.user.first_name,
                'nom': franchise.user.last_name,
                'nom_complet': f"{franchise.user.first_name} {franchise.user.last_name}",
                'has_franchise': franchise.user.has_franchise
            },
            'paiement': {
                'session_id': session_id,
                'payment_intent_id': franchise.stripe_payment_intent_id,
                'montant': float(franchise.droit_entree),
                'devise': 'EUR',
                'date': franchise.date_paiement
            },
            'email_envoye': email_envoye,
            'mise_a_jour': {
                'ancien_statut': ancien_statut,
                'nouveau_statut': franchise.statut,
                'ancien_has_franchise': ancien_has_franchise,
                'nouveau_has_franchise': franchise.user.has_franchise
            }
        })
        
    except Exception as e:
        print(f"❌ [ERREUR GLOBALE] {str(e)}")
        return Response({
            'success': False,
            'error': f'Erreur lors de la vérification: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def envoyer_email_paiement_confirme(franchise):
    """Envoyer email de confirmation de paiement avec détails complets"""
    try:
        sujet = f"🎉 Paiement confirmé - Bienvenue dans DRIV'N COOK !"
        
        message_text = f"""
Bonjour {franchise.user.first_name} {franchise.user.last_name},

🎉 EXCELLENTE NOUVELLE ! Votre paiement a été confirmé avec succès.

📋 DÉTAILS DE VOTRE FRANCHISE :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏪 Nom de la franchise : {franchise.nom_franchise}
💰 Montant payé : {franchise.droit_entree}€
📅 Date de paiement : {franchise.date_paiement.strftime('%d/%m/%Y à %H:%M')}
📍 Adresse : {franchise.adresse}, {franchise.code_postal} {franchise.ville}

✅ VOTRE FRANCHISE EST MAINTENANT ACTIVE !

🚀 PROCHAINES ÉTAPES :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣ Formation complète (sous 48h)
2️⃣ Livraison de votre camion équipé
3️⃣ Mise en place de votre activité
4️⃣ Accompagnement de démarrage

📞 CONTACT :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nos équipes vont vous contacter prochainement pour organiser votre formation.

Questions ? Contactez-nous à franchise@drivncook.fr

Bienvenue dans la famille DRIV'N COOK ! 🚚👨‍🍳

Cordialement,
L'équipe DRIV'N COOK
        """
        
        send_mail(
            subject=sujet,
            message=message_text,
            from_email=getattr(settings, 'EMAIL_FROM', 'noreply@drivncook.fr'),
            recipient_list=[franchise.user.email],
            fail_silently=False,
        )
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur envoi email: {e}")
        return False


# 🎯 ENDPOINT ALTERNATIF : Vérification par GET (optionnel)
@api_view(['GET'])
def statut_paiement(request, session_id):
    """
    Vérifier le statut d'un paiement par GET
    URL: /api/paiement/statut/<session_id>/
    """
    try:
        # Rechercher la franchise
        franchise = None
        try:
            franchise = Franchise.objects.get(stripe_checkout_session_id=session_id)
        except Franchise.DoesNotExist:
            return Response({
                'error': 'Session non trouvée'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Retourner le statut actuel
        return Response({
            'session_id': session_id,
            'franchise_id': franchise.id,
            'nom_franchise': franchise.nom_franchise,
            'statut': franchise.statut,
            'statut_paiement': franchise.statut_paiement,
            'date_paiement': franchise.date_paiement,
            'has_franchise': franchise.user.has_franchise,
            'montant': float(franchise.droit_entree),
            'user_email': franchise.user.email
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)