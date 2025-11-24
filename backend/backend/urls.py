from django.contrib import admin
from django.urls import include, path, include, re_path
from django.conf import settings
from backend.views import FrontendAppView
from django.conf.urls.static import static
from auth_user.views import UserActivationView, UserCustomUpdatePasswordView
from rest_framework_simplejwt.views import TokenRefreshView  
from . import views

urlpatterns = [
    path('admin-user/', admin.site.urls),
    path('user/', include('auth_user.urls')),
    path('api/', include('gestion_camions.urls')),
    path('api/', include('franchise.urls')),
    path('api/', include('payment.urls')),
    path('api_user/', include('franchise_user.urls')),
    path('activate/<uidb64>/<token>/', UserActivationView.as_view(), name='activate'),
    path('user/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('password/reset/<uidb64>/<token>/', UserCustomUpdatePasswordView.as_view(), name='password-reset'), 
    path('user/csrf/', views.get_csrf_token, name='csrf_token'),
    # re_path(r'^.*$', FrontendAppView.as_view()),   
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)