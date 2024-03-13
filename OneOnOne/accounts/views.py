from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import *


# Create your views here.
class RegisterView(generics.CreateAPIView):
    """
    post:
    Register a new user with given user data

    ### Input Format
    ```
    {
        "username": <username>, 
        "first_name": <first-name>, 
        "last_name": <last-name>, 
        "email": <email>, 
        "password": <password>,
        "confirm_password": <confirm-password>
    }
    ```

    ### Responses
    #### `201` Created - Successful creation
    #### `400` Bad Request - Any field is missing or invalid

    ### Output Format when successful
    ```
    {
        "username": <username>,
        "first_name": <first-name>,
        "last_name": <last-name>,
        "email": <email>
    }

    ### Output Format when unsuccessful
    ```
    {
        "<field-name>": <error_message>
    }

    With the following error messages:
    
    - This field is required
    - A user with username already exists
    ```
    """
    permission_classes = [AllowAny]
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                RegisterSerializer(user, context=self.get_serializer_context()).data,
                status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(generics.CreateAPIView):
    """
    post:
    Login the user with given credentials

    ### Input Format
    ```
    {
        "username": <username>,
        "password": <password>
    }
    ```
    ### Responses
    #### `200` OK - Successful login
    #### `400` Bad Request - Any field is missing or invalid

    ### Output Format when successful
    ```
    {
        "refresh": <refresh-token>,
        "access": <access-token>
    }

    ### Output Format when unsuccessful
    ```
    {
        "non_field_errors": <error_message>   
    }

    With the following error messages:

    - User not activated
    - Username and password do not match
    - Both fields are required
    """
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token = serializer.get_token(user)
            return Response(token, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    """
    get:
    Get the profile details for the logged-in user through the access token

    ### Responses
    #### `200` OK - Successul retrieval of profile
    #### `401` Unauthorized - Access token is invalid

    ### Output Format when successful
    ```
    {
        "user": {
            "id": <user-id>,
            "username": <username>,
            "first_name": <first-name>,
            "last_name": <last-name>,
            "email": <email>
        },
        "profile_picture": <profile-picture-path>,
    }
    ```

    put:
    Update the profile with given data shown below, only the fields that are given will be updated
    If a user wants to update the password, the `current_password`, `new_password` and `confirm_password` fields are required
    ### Input Format
    ```
    {
        "first_name": <first-name>, 
        "last_name": <last-name>, 
        "email": <email>, 
        "current_password": <password>,
        "new_password": <confirm-password>,
        "confirm_password": <confirm-password>,
        "profile_picture": <profile-picture-upload>
    }
    ```

    ### Responses
    #### `200` OK - Successful update to profile
    #### `401` Unauthorized - Access token is invalid, or certain fields are invalid

    ### Output Format when successful
    ```
    {
        "user": {
            "id": <user-id>,
            "username": <username>,
            "first_name": <first-name>,
            "last_name": <last-name>,
            "email": <email>
        },
        "profile_picture": <profile-picture-path>,
    }
    ```

    ### Output Format when unsuccessful
    ```
    {
        "non_field_errors": <error_message>
    }

    With the following error messages:

    - Enter current password first
    - Current password is incorrect
    - Password must match
    """
    permission_classes = [IsAuthenticated]

    @staticmethod
    def get(request, *args, **kwargs):
        profile, created = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

    @staticmethod
    def put(request, *args, **kwargs):
        profile, created = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)
