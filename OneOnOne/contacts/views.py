from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.generic import TemplateView
from django.contrib.auth.models import User

from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Contacts
from .serializers import ContactSerializer, ContactRequestSerializer, ContactDeleteSerializer, FriendRequestListSerializer


class contactListView(APIView):
    """
    get:
    Obtain the list of username of friends of the user. In the following format:
    ```
    {
        "friends": ["username1", "username2", ...]
    }
    ```
    """
    def get(self, request):
        user = request.user
        friends_as_requester = Contacts.objects.filter(requester=user, accepted=True).values_list('requested', flat=True)
        friends_as_requested = Contacts.objects.filter(requested=user, accepted=True).values_list('requester', flat=True)
        friends_id = set(friends_as_requester) | set(friends_as_requested)
        friend_usernames = User.objects.filter(id__in=friends_id).values_list('username', flat=True)
        return Response({"friends": friend_usernames})


class friendRequestsView(APIView):
    """
    get:
    Obtain the list of friend requests that the user has received but not accepted yet. In the following format:
    ```
    {
        'id': <request-id>,
        'requester_username': "<requester-username>",
    }
    ```
    """
    def get(self, request):
        user = request.user
        friend_requests = Contacts.objects.filter(requested=user, accepted=False)
        serializer = FriendRequestListSerializer(friend_requests, many=True)
        return Response(serializer.data)


class manageContactView(APIView):
    """
    post:
    Send a friend request to the user with the username specified. Input should be in the following format:
    ```
    {
        "requested": "<requested-username>"
    }
    ```

    ## Validation Errors
    - You cannot add yourself to your contacts
    - User does not exist
    - You have already sent a request to this user
    - This user has already sent you a request

    delete:
    Delete a friend from user's contact list. Input should be in the following format:
    ```
    {
        "username": "<username>"
    }

    ## Validation Errors
    - User does not exist
    - You are not friends with this user
    """
    def post(self, request):
        serializer = ContactSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(status=201)
        return Response(serializer.errors, status=400)
    

    def delete(self, request):
        serializer = ContactDeleteSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.delete()
            return Response(status=204)
        return Response(serializer.errors, status=400)
       
        
class respondToFriendRequestView(APIView):
    """
    post:
    Accept or reject a friend request. Input should be in the following format:
    ```
    {
        "request_id": <request-id>,
        "accepted": <accept/reject>
    }
    ```

    ## Validation Errors
    - Request does not exist
    - You are not the requested user of this request
    - Invalid action
    """
    def post(self, request):
        serializer = ContactRequestSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(status=200)
        return Response(serializer.errors, status=400)