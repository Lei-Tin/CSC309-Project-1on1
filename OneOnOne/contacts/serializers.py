from rest_framework import serializers
from .models import Contacts
from django.contrib.auth.models import User


class FriendRequestListSerializer(serializers.ModelSerializer):
    requester_username = serializers.SerializerMethodField()
    request_id = serializers.IntegerField(source='id', read_only=True)
    class Meta:
        model = Contacts
        fields = ['request_id', 'requester_username']
        read_only_fields = ['request_id', 'requester_username']
    
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
    request_id = serializers.IntegerField()
    action = serializers.CharField()

    def validate_action(self, value):
        if value not in ['accept', 'reject']:
            raise serializers.ValidationError('Invalid action')
        return value
    
    def validate_request_id(self, value):
        try: 
            contact = Contacts.objects.get(id=value)
        except Contacts.DoesNotExist:
            raise serializers.ValidationError('Request does not exist')
        if contact.requested != self.context['request'].user:
            raise serializers.ValidationError('You are not the requested user of this request')
        return value

    def save(self, **kwargs):
        contact = Contacts.objects.get(id=self.validated_data['request_id'])
        if self.validated_data['action'] == 'accept':
            contact.accepted = True
            contact.save()
        else:
            contact.delete()
        return contact