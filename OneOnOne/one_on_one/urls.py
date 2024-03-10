"""
URL configuration for one_on_one project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf.urls.static import static
from django.conf import settings

from .views import indexView

# Import include
from django.urls import include

from django.shortcuts import redirect

# Link to simplejwt's documentation
# https://django-rest-framework-simplejwt.readthedocs.io/en/latest/
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from rest_framework.documentation import include_docs_urls

urlpatterns = [
    # Administrative interface
    path('admin/', admin.site.urls),

    # JWT token views
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Index view, might be removed as we are using React later
    # path('index/', indexView.as_view(), name='index'),
    # path('', lambda request: redirect('index/', permanent=False)),  # Redirect to root when no path is given

    # Conections to other apps
    path('accounts/', include('accounts.urls'), name='accounts'),
    path('calendars/', include('calendars.urls'), name='calendars'),
    path('contacts/', include('contacts.urls'), name='contacts'),
    path(r'docs/', include_docs_urls(title='OneOnOne API', public=True)),
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
