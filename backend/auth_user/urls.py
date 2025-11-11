from django.urls import path
from .views import (
    UserRegisterView,
    UserLoginView,
    UserProfileView,
    UpdateUserInfoView,
    UpdatePasswordView,
    ForgotPasswordView,
    UpdateUserInfoView,
    UserLogoutView
    
)

urlpatterns = [
    path('register/', UserRegisterView.as_view(), name='user-register'),
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('logout/', UserLogoutView, name='user-logout'),
    path('info/', UserProfileView.as_view(), name='user-profile'),
    path('update/', UpdateUserInfoView.as_view(), name='update-user-info'),
    path('password/forgot/', ForgotPasswordView.as_view(), name='password-forgot'),
    path('update-password/', UpdatePasswordView.as_view(), name='update-password'),
]
