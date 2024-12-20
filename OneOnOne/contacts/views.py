from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.generic import TemplateView
from django.contrib.auth.models import User

from rest_framework.views import APIView, status
from rest_framework.response import Response
from accounts.models import Profile
from .models import Contacts
from .serializers import ContactSerializer, ContactRequestSerializer, ContactDeleteSerializer, FriendRequestListSerializer


class contactListView(APIView):
    """
    get:
    Obtain the list of username of friends of the user.

    ### Response
    #### `200` OK - Successful request

    ### Output Format when successful
    ```
    {
        "friends": [<username1>, <username2>, ...]
    }
    ```
    """
    def get(self, request):
        user = request.user
        friends_as_requester = Contacts.objects.filter(requester=user, accepted=True).values_list('requested', flat=True)
        friends_as_requested = Contacts.objects.filter(requested=user, accepted=True).values_list('requester', flat=True)
        friends_id = set(friends_as_requester) | set(friends_as_requested)

        friends_info = []
        for friend_id in friends_id:
            # Fetching user info
            user_info = User.objects.filter(id=friend_id).values('id', 'username', 'first_name', 'last_name', 'email').first()
            
            if user_info:
                # Attempt to fetch the profile picture
                profile_picture = Profile.objects.filter(user__id=friend_id).values_list('profile_picture', flat=True).first()
                
                # Append the friend info to the list, use profile picture if available, else None
                friends_info.append({
                    "id": user_info['id'],
                    "username": user_info['username'],
                    "first_name": user_info['first_name'],
                    "last_name": user_info['last_name'],
                    "email": user_info['email'],
                    "profile_picture": profile_picture if profile_picture else None
                })
        
        return Response({"friends": friends_info})
        # friends_id_list = list(friends_id)
        # friend_usernames = User.objects.filter(id__in=friends_id).values_list('username', flat=True)
        # friend_first_names = User.objects.filter(id__in=friends_id).values_list('first_name', flat=True)
        # friend_last_names = User.objects.filter(id__in=friends_id).values_list('last_name', flat=True)
        # friend_emails = User.objects.filter(id__in=friends_id).values_list('email', flat=True)
        # friend_profile_pics = Profile.objects.filter(user__id__in=friends_id).values_list('profile_picture', flat=True)
        # friends_info = []
        # for i in range(len(friend_usernames)):
        #     friends_info.append({
        #         "id": friends_id_list[i],
        #         "username": friend_usernames[i],
        #         "first_name": friend_first_names[i],
        #         "last_name": friend_last_names[i],
        #         "email": friend_emails[i],
        #         "profile_picture": friend_profile_pics[i]
        #     })
        # return Response({"friends": friends_info})


class friendRequestsView(APIView):
    """
    get:
    Obtain the list of friend requests that the user has received but not accepted yet.

    ### Response
    #### `200` OK - Successful request

    ### Output Format when successful
    ```
    {
        "requester_username": <requester-username>,
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
    Send a friend request to the user with the username specified. 

    ### Input Format
    ```
    {
        "requested": "<requested-username>"
    }
    ```

    ### Response
    #### `201` Created - Successfully created
    #### `400` Bad Request - Any error is encountered, shown below

    ### Output Format when successful
    ```
    {
        "message": "Friend request sent to <requested-username>"
    }
    ```

    ### Output Format when unsuccessful
    ```
    {
        "error": <error-message>
    }
    ```

    With the following error messages:

    - You cannot add yourself to your contacts
    - User does not exist
    - You have already sent a request to this user
    - This user has already sent you a request

    delete:
    Delete a friend from user's contact list.

    ### Input Format
    ```
    {
        "username": <username>
    }
    ```

    ### Response
    #### `204` No Content - Successfully deleted
    #### `400` Bad Request - Any error is encountered, shown below

    ### Output Format when successful
    ```
    {
        "message": "Friend <username> deleted"
    }
    ```

    ### Output Format when unsuccessful
    ```
    {
        "error": <error-message>
    }
    ```

    With the following error messages:

    - User does not exist
    - You are not friends with this user
    """
    def post(self, request):
        serializer = ContactSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            success_message = {
                "message": f'Friend request sent to {request.data["requested"]}'
            }
            serializer.save()
            return Response(success_message, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    def delete(self, request):
        serializer = ContactDeleteSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            success_message = {
                "message": f'Friend {request.data["username"]} deleted'
            }
            serializer.delete()
            return Response(success_message, status=status.HTTP_204_NO_CONTENT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
       
        
class respondToFriendRequestView(APIView):
    """
    post:
    Accept or reject a friend request.
    ### Input Format
    ```
    {
        "username": <username>,
        "action": <True/False>
    }
    ```

    ### Response
    #### `200` OK - Successful request
    #### `400` Bad Request - Any error is encountered, shown below

    ### Output Format when successful
    ```
    {
        "message": "User with username: <username> has been <accepted/rejected>"
    }
    ```

    ### Output Format when unsuccessful
    ```
    {
        "error": <error-message>
    }
    ```

    With the following error messages:

    - User does not exist
    - No friend request from this user
    """
    def post(self, request):
        serializer = ContactRequestSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            action = 'accepted' if serializer.data['action'] else 'rejected'
            success_message = { 
                "message": f'User with username: {request.data["username"]} has been {action}'
            }
            serializer.save()
            return Response(success_message, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)