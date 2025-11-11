from django.core.mail import EmailMessage, send_mail
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from . import serializers
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.urls import reverse
from django.template.loader import render_to_string
from rest_framework import status
from django.contrib.auth import get_user_model, authenticate, logout
from django.shortcuts import redirect
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import check_password
from django.utils.html import strip_tags
from rest_framework.decorators import api_view



class UserRegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = serializers.UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_active = False
            user.save()
            
            if user and not user.is_active:
                uidb64 = urlsafe_base64_encode(str(user.id).encode())
                token = default_token_generator.make_token(user)
                activation_url = request.build_absolute_uri(
                    reverse('activate', kwargs={'uidb64': uidb64, 'token': token})    
                )
                
                html_message = render_to_string('emails/inscription_email.html', {
                    'user': user,
                    'activation_url': activation_url,
                })
                
                # Correction : EmailMessage avec les paramètres dans le bon ordre
                email = EmailMessage(
                    "Inscription réussie - Lien d'activation",  # subject (1er paramètre)
                    html_message,                               # body (2ème paramètre)
                    settings.EMAIL_HOST_USER,                   # from_email (3ème paramètre)
                    [user.email],                              # to (4ème paramètre)
                )
                email.content_subtype = "html"
                email.send(fail_silently=False)
            
                return Response({"message": "Utilisateur enregistré avec succès ! Un email de confirmation a été envoyé."}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

   
class UserActivationView(APIView):
    def get(self, request, uidb64, token): 
        try: 
            uid = urlsafe_base64_decode(uidb64).decode() 
            user = get_user_model().objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist):
            return redirect("/activation/result?message=Le lien d'activation est invalide !")

        if default_token_generator.check_token(user, token):
            if user.is_active:
                return redirect("/activation/result?message=Ce compte est déjà activé.")

            user.is_active = True
            user.save()
            try:
                html_message = render_to_string('emails/activation_email.html', {
                    'user': user,
                })

                email = EmailMessage(
                    subject="Votre compte a été activé",
                    body=html_message,
                    from_email=settings.EMAIL_HOST_USER,
                    to=[user.email],
                )

                email.content_subtype = "html"
                email.send(fail_silently=False)
            except Exception as e:
                print(f"Error sending email: {str(e)}")
            return redirect("/activation/result?message=Votre compte a été activé avec succès !")
        else:
            return redirect("/activation/result?message=Le lien d'activation est invalide ou expiré !")
        

class UserLoginView(APIView):
    permission_classes = [AllowAny]
   
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        # Validation des champs requis
        if not email or not password:
            return Response(
                {"detail": "Email et mot de passe sont requis."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Authentification
        user = authenticate(request, username=email, password=password)
        
        if user is None:
            return Response(
                {"detail": "Identifiants invalides"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Génération des tokens JWT
        refresh = RefreshToken.for_user(user)
        
        # Préparation des données utilisateur
        user_data = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone_number': user.phone_number,
            'is_superuser': user.is_superuser,
            'is_staff': user.is_staff,
            'has_franchise': user.has_franchise,
        }

        # Réponse
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": user_data
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
def UserLogoutView(request):
    logout(request)
    return Response({"message": "Déconnexion réussie."}, status=status.HTTP_200_OK)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        serializer = serializers.UserProfileSerializer(user)
        
        return Response(serializer.data, status=status.HTTP_200_OK)

class UpdateUserInfoView(APIView):
    permission_classes = [IsAuthenticated]
     
    def get(self, request):
        serializer = serializers.UserUpdateSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
     
    def put(self, request):
        serializer = serializers.UserUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            user = serializer.save()
             
            try:
                html_message_user = render_to_string('emails/profile_email_user.html', {
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email,
                })
                email_user = EmailMessage(
                    subject=f"Profil mis à jour : {user.first_name}",
                    body=html_message_user,
                    from_email=settings.EMAIL_HOST_USER,
                    to=[user.email],
                )
                email_user.content_subtype = "html"
                email_user.send(fail_silently=False)
            except Exception as e:
                return Response(
                    {"error": f"Erreur lors de l'envoi de l'e-mail : {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserCustomUpdatePasswordView(APIView):
    def get(self, request, uidb64, token, *args, **kwargs):
        return redirect(f"/password-reset/{uidb64}/{token}/")
    def put(self, request, uidb64, token, *args, **kwargs):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = get_user_model().objects.get(id=uid)
        except (TypeError, ValueError, get_user_model().DoesNotExist):
            return Response({"error": "Lien de réinitialisation invalide."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Jeton invalide ou expiré."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = serializers.UserCustomUpdatePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True) 

        user.set_password(serializer.validated_data['password'])
        user.save()

        try:
            html_message = render_to_string('emails/password_reset_success.html', {'user': user})
            email = EmailMessage(
                subject="Votre mot de passe a été réinitialisé avec succès",
                body=html_message,
                from_email=settings.EMAIL_HOST_USER,
                to=[user.email],
            )
            email.content_subtype = "html"
            email.send(fail_silently=False)
        except Exception as e:
            print(f"Erreur lors de l'envoi de l'e-mail : {str(e)}")

        return Response(
            {"message": "Votre mot de passe a été réinitialisé avec succès."},
            status=status.HTTP_200_OK
        )
           
class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        try:
            user = get_user_model().objects.get(email=email)
            
            # Générer les tokens
            uidb64 = urlsafe_base64_encode(str(user.id).encode())
            token = default_token_generator.make_token(user)
            
            # URL de réinitialisation
            reset_url = request.build_absolute_uri(
                reverse('password-reset', kwargs={'uidb64': uidb64, 'token': token})
            )
            
            # Envoyer l'email
            html_message = render_to_string('emails/password_reset_email.html', {
                'user': user,
                'reset_url': reset_url,
            })
            
            send_mail(
                subject="Réinitialisation de votre mot de passe",
                message=strip_tags(html_message),
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )
            
            return Response({
                "message": "Un lien de réinitialisation a été envoyé à votre adresse email."
            }, status=status.HTTP_200_OK)
            
        except get_user_model().DoesNotExist:
            return Response({
                "error": "Aucun compte n'est associé à cette adresse email."
            }, status=status.HTTP_404_NOT_FOUND)
            
            
class UpdatePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        if not check_password(old_password, user.password):
            return Response(
                {"old_password_error": "L'ancien mot de passe est incorrect."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_password != confirm_password:
            return Response(
                {"confirm_password_error": "Les mots de passe doivent correspondre."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = serializers.PasswordUpdateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()

            return Response({"message": "Mot de passe mis à jour avec succès."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
