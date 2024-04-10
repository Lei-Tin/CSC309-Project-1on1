from rest_framework import serializers
from .models import Contacts
from django.contrib.auth.models import User


class FriendRequestListSerializer(serializers.ModelSerializer):
    requester_username = serializers.SerializerMethodField()
    class Meta:
        model = Contacts
        fields = ['requester_username']
        read_only_fields = ['requester_username']
    
    def get_requester_username(self, obj):
        return obj.requester.username


class ContactSerializer(serializers.ModelSerializer):
    requested = serializers.CharField()
    requester_username = serializers.SerializerMethodField()
    class Meta:
        model = Contacts
        fields = '__all__'
        read_only_fields = ['requester', 'accepted']

    def get_requester_username(self, obj):
        return obj.requester.username

    def validate_requested(self, value):
        requester = self.context['request'].user
        requested_username = value
        if requester.username == requested_username:
            raise serializers.ValidationError('You cannot add yourself to your contacts')
        try:
            requested = User.objects.get(username=requested_username)
        except User.DoesNotExist:
            raise serializers.ValidationError('User does not exist')
        if Contacts.objects.filter(requester=requester, requested=requested).exists():
            raise serializers.ValidationError('You have already sent a request to this user')
        if Contacts.objects.filter(requester=requested, requested=requester).exists():
            raise serializers.ValidationError('This user has already sent you a request')
        return value

    def create(self, validated_data):
        requester = self.context['request'].user
        requested_username = validated_data['requested']
        requested = User.objects.get(username=requested_username)
        contact = Contacts.objects.create(requester=requester, requested=requested)
        return contact


class ContactDeleteSerializer(serializers.Serializer):
    username = serializers.CharField()

    def validate_username(self, value):
        requester = self.context['request'].user
        requested_username = value
        try:
            requested = User.objects.get(username=requested_username)
        except User.DoesNotExist:
            raise serializers.ValidationError('User does not exist')
        as_requested = Contacts.objects.filter(requested=requested, requester=requester).exists()
        as_requester = Contacts.objects.filter(requested=requester, requester=requested).exists()
        if not as_requested and not as_requester:
            raise serializers.ValidationError('You are not friends with this user')
        return value

    def delete(self, **kwargs):
        requester = self.context['request'].user
        requested_username = self.validated_data['username']
        deleted_user = User.objects.get(username=requested_username)
        try:
            contact = Contacts.objects.get(requester=requester, requested=deleted_user)
        except Contacts.DoesNotExist:
            contact = Contacts.objects.get(requester=deleted_user, requested=requester)
        contact.delete()
        return contact


class ContactRequestSerializer(serializers.Serializer):
    username = serializers.CharField()
    action = serializers.BooleanField()
    
    def validate_username(self, value):
        try: 
            requester = User.objects.get(username=value)
        except User.DoesNotExist:
            raise serializers.ValidationError('User does not exist')
        if not Contacts.objects.filter(requested=self.context['request'].user, requester=requester).exists():
            raise serializers.ValidationError('No friend request from this user')
        return value

    def save(self, **kwargs):
        requester = User.objects.get(username=self.validated_data['username'])
        requested = self.context['request'].user
        contact = Contacts.objects.get(requested=requested, requester=requester)
        if self.validated_data['action']:
            contact.accepted = True
            contact.save()
        else:
            contact.delete()
        return contact