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
        "username":
        "first_name":
        "last_name":
        "email":
        "password":
        "confirm_password":
    }
    ```

    ### Responses
    #### Success
    Status `201` Created

    #### Errors
    Status `400` Bad Request
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
    '''
    {
        "username":
        "password":
    }

    ### Responses
    #### Success
    Status `200` Ok

    #### Errors
    Status `400` Bad Request
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
    Get the profile details for the logged-in user

    put:
    Update the profile with given data

    ### Responses
    #### Success
    Status '200' Ok

    #### Errors
    Status '401' Unauthorized

    ### Output Format
    {
        "user": {
            "id":
            "username":
            "first_name":
            "last_name":
            "email":
        },
        "profile_picture":
    }
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
        return Response(serializer.errors, status=400)
