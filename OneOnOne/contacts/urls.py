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

from contacts.views import contactListView, friendRequestsView, manageContactView, respondToFriendRequestView

app_name = 'contacts'

urlpatterns = [
    # Endpoint for list user with <user_id>'s friends list (accepted friend request)
    path('', contactListView.as_view(), name='contact-list'),

    # Endpoint for listing all pending friend requests current user received (accepted = False)
    path('friendRequests/', friendRequestsView.as_view(), name='friend-requests'),
    
    # Endpoint for sending friend request to user with <user_id>
    path('friendRequests/user/', manageContactView.as_view(), name='invite-contact'),

    # Endpoint for accepting or rejecting friend request with <request_id>
    path('friendRequests/request/', respondToFriendRequestView.as_view(), name='respond-to-friend-request')
]
