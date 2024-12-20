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
from django.urls import path

from .views import RegisterView, LoginView, ProfileView, ProfileSearchView, ProfileSearchWithIDView, ProfileSearchWithPartialView

app_name = 'accounts'

urlpatterns = [
    # Frontend, might be replaced by React
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/<str:username>/', ProfileSearchView.as_view(), name='profile-search'),
    path('profile/id/<int:user_id>/', ProfileSearchWithIDView.as_view(), name='profile-search-id'),
    path('profile/partial/<str:username>/', ProfileSearchWithPartialView.as_view(), name='profile-search-partial')

    # The following are API Calls
]
