from rest_framework import serializers
from django.contrib.auth.models import User  # This is the model we are using
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
import re

from .models import Profile


def is_valid_email(email):
    """
    Helper function to validate email address
    """
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    # Match the email against the pattern
    if re.match(email_regex, email):
        return True
    else:
        return False


class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True, style={'input_type': 'password'}, required=True)

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'password', 'confirm_password']
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'password': {'write_only': True, 'min_length': 8, 'style': {'input_type': 'password'}, 'required': True}
        }

    def validate(self, data):
        """
        Validate the user's registration (raw) data
        """
        # Usernames are unique
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError('User with username already exists')

        # Email is in the valid form
        if is_valid_email(data['email']) is False:
            raise serializers.ValidationError('Email is invalid')

        # Passwords must be at least 8 characters long
        if len(data['password']) < 8:
            raise serializers.ValidationError('Password must contain at least 8 characters')

        # Passwords must match
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError('Passwords must match')

        return data

    def create(self, validated_data):
        """
        Create a new user with the validated data (Registration)
        """
        validated_data.pop('confirm_password', None)
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    def validate(self, data):
        """
        Validate the user's credentials'
        """
        username = data['username']
        password = data['password']

        if username and password:
            # Attempt to log the user in
            user = authenticate(username=username, password=password)
            if user:
                if user.is_active:
                    data['user'] = user
                    return data
                else:
                    raise serializers.ValidationError('User not activated')
            else:
                raise serializers.ValidationError('Username and password do not match')
        else:
            raise serializers.ValidationError('Both fields are required')

    @staticmethod
    def get_token(user):
        """
        Get a refresh token for the given user
        """
        if user is None or not hasattr(user, 'id'):
            return serializers.ValidationError()

        refresh = RefreshToken.for_user(user)
        return {'refresh': str(refresh), 'token': str(refresh.access_token)}


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class ProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    user = UserSerializer(read_only=True)
    profile_picture = serializers.ImageField(allow_null=True, required=False)

    class Meta:
        model = Profile
        fields = ['user', 'profile_picture', 'first_name', 'last_name', 'email']

    def validate(self, data):
        user = self.instance.user

        current_password = data.get('current_password')
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')

        if current_password and new_password and confirm_password:
            if not user.check_password(current_password):
                raise serializers.ValidationError({'current_password': 'Current password is incorrect'})
            if new_password != confirm_password:
                raise serializers.ValidationError({'new_password': 'Passwords must match'})

        return data

    def update(self, instance, validated_data):
        user = instance.user

        user.first_name = validated_data.get('first_name', user.first_name)
        user.last_name = validated_data.get('last_name', user.last_name)
        user.email = validated_data.get('email', user.email)

        if 'new_password' in validated_data and validated_data.get('new_password'):
            user.set_password(validated_data['new_password'])
        user.save()

        instance.profile_picture = validated_data.get('profile_picture', instance.profile_picture)
        instance.save()

        return instance
