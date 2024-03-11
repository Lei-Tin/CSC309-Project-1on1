from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.generic import TemplateView
from django.contrib.auth.models import User

from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Contacts
from .serializers import ContactSerializer, ContactRequestSerializer, ContactDeleteSerializer, FriendRequestListSerializer


class contactListView(APIView):
    def get(self, request):
        """Obtain the list of username of friends of the user. In the following format:
        {
            "friends": ["username1", "username2", ...]
        }
        """
        user = request.user
        friends_as_requester = Contacts.objects.filter(requester=user, accepted=True).values_list('requested', flat=True)
        friends_as_requested = Contacts.objects.filter(requested=user, accepted=True).values_list('requester', flat=True)
        friends_id = set(friends_as_requester) | set(friends_as_requested)
        friend_usernames = User.objects.filter(id__in=friends_id).values_list('username', flat=True)
        return Response({"friends": friend_usernames})


class friendRequestsView(APIView):
    def get(self, request):
        """Obtain the list of friend requests that the user has received but not accepted yet. In the following format:
        {
            'id': <request-id>,
            'requester_username': "<requester-username>",
        }
        """
        user = request.user
        friend_requests = Contacts.objects.filter(requested=user, accepted=False)
        serializer = FriendRequestListSerializer(friend_requests, many=True)
        return Response(serializer.data)


class inviteContactView(APIView):
    def post(self, request):
        """
        Send a friend request to the user with the username specified. Input should be in the following format:
        {
            "requested": "<requested-username>"
        }
        """
        serializer = ContactSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        return JsonResponse(serializer.errors, status=400)
    

    def delete(self, request):
        """
        Delete a friend from user's contact list. Input should be in the following format:
        {
            "requested": "<requested-username>"
        }
        """
        serializer = ContactDeleteSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.delete()
            return Response(status=204)
        return JsonResponse(serializer.errors, status=400)
       
        
class respondToFriendRequestView(APIView):
    def post(self, request):
        """
        Accept or reject a friend request. Input should be in the following format:
        {
            "request_id": <request-id>,
            "accepted": <accept/reject>
        }
        """
        serializer = ContactRequestSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=200)
        return JsonResponse(serializer.errors, status=400)