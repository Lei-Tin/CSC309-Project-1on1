from django.contrib.auth.models import User

from .models import *
from rest_framework import serializers
from datetime import datetime

from contacts.models import *

class CalendarSerializer(serializers.ModelSerializer):
    name = serializers.CharField(help_text="A name for the calendar")
    start_date = serializers.CharField(help_text="The starting date for the calendar")
    end_date = serializers.CharField(help_text="The ending date for the calendar")

    class Meta:
        model = Calendar
        fields = '__all__'
        read_only_fields = ['owner', 'finalized']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request') if self.context else None

        if request and request.method in ['PUT', 'PATCH']:
            # Restrict fields to 'name' only for update operations
            allowed = {'name'}
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class AvailabilitySerializer(serializers.ModelSerializer):
    user = serializers.CharField(help_text="The user id of the user that created this availability")
    start_period = serializers.CharField(help_text="The start time for the availability")
    end_period = serializers.CharField(help_text="The ending time for the availability")
    preference = serializers.CharField(help_text="The preference level for this availability")

    class Meta:
        model = Availability
        fields = '__all__'
        read_only_fields = ['user', 'calendar']


class InviteeSerializer(serializers.ModelSerializer):
    invitee = serializers.CharField(help_text="The user id of the invited user to the calendar")
    deadline = serializers.CharField(help_text="The last time that the invitee can add an availability")

    class Meta:
        model = Invitee
        fields = '__all__'
        read_only_fields = ['calendar']

    def validate_invitee_id(self, invitee):
        request = self.context.get('request')
        if request and request.method in ['POST']:
            calendar_id = self.initial_data.get('calendar')
            calendar = Calendar.objects.get(pk=calendar_id)
            owner = calendar.owner

            # Check if the invitee is in the calendar owner's confirmed contacts
            if not Contacts.objects.filter(requester=owner, requested=invitee, accepted=True).exists() \
                    or Contacts.objects.filter(requester=invitee, requested=owner, accepted=True).exists():
                raise serializers.ValidationError("The invitee is not a confirmed contact of the calendar owner.")

    def create(self, validated_data):
        """
        Create an Invitee instance.
        """
        invitee_id = validated_data.pop('invitee')
        try:
            invitee = User.objects.get(pk=invitee_id)
        except User.DoesNotExist:
            raise serializers.ValidationError({"invitee_id": "No user found with the given ID."})
        validated_data['invitee'] = invitee
        return super().create(validated_data)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request') if self.context else None

        if request and request.method in ['PUT', 'PATCH']:
            # Restrict fields to 'name' only for update operations
            allowed = {'deadline'}
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class ScheduleSerializer(serializers.ModelSerializer):
    calendar = serializers.CharField(help_text="The calendar id that the meeting is scheduled under")
    start_period = serializers.CharField(help_text="The start time for the availability")
    end_period = serializers.CharField(help_text="The ending time for the availability")
    meeter = serializers.CharField(help_text="The user id of the user that the owner is meeting with")

    class Meta:
        model = Meets
        fields = '__all__'
        read_only_fields = ['calendar', 'meeter', 'start_period', 'end_period']

