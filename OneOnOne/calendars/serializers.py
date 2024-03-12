from .models import *
from rest_framework import serializers
from datetime import datetime


class CalendarSerializer(serializers.ModelSerializer):
    name = serializers.CharField(help_text="A name for the calendar")
    start_date = serializers.CharField(help_text="The starting date for the calendar")
    end_date = serializers.CharField(help_text="The ending date for the calendar")
    finalized = serializers.CharField(help_text="Whether a schedule has been finalized for this calendar")

    class Meta:
        model = Calendar
        fields = '__all__'
        read_only_fields = ['owner']

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

