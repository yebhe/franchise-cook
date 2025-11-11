from django.views.generic import View
from django.http import HttpResponse
import os
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie

class FrontendAppView(View):
    def get(self, request):
        try:
            with open(os.path.join(os.path.dirname(__file__), '..', 'build', 'index.html')) as f:
                return HttpResponse(f.read())
        except FileNotFoundError:
            return HttpResponse("index.html non trouvé. As-tu bien lancé 'npm run build' ?", status=501)



@ensure_csrf_cookie
@require_http_methods(["GET"])
def get_csrf_token(request):
    """
    Endpoint pour récupérer le token CSRF
    """
    return JsonResponse({
        'csrfToken': get_token(request)
    })