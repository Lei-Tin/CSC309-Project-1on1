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
    start_period = serializers.CharField(help_text="The start time for the availability")
    end_period = serializers.CharField(help_text="The ending time for the availability")
    preference = serializers.CharField(help_text="The preference level for this availability")

    class Meta:
        model = Availability
        fields = '__all__'
        read_only_fields = ['user', 'calendar']


class InviteeSerializer(serializers.ModelSerializer):
    invitee = serializers.CharField(help_text="The user id of the invited user to the calendar")
    has_availability = serializers.SerializerMethodField()

    class Meta:
        model = Invitee
        fields = ['id', 'calendar', 'invitee', 'has_availability']
        read_only_fields = ['calendar']

    def get_has_availability(self, obj):
        request = self.context.get('request')
        calendar = request.parser_context['kwargs'].get('calendar_id')
        has_availability = Availability.objects.filter(calendar=calendar, user=obj.invitee).exists()
        return has_availability

    # def __init__(self, *args, **kwargs):
    #     super().__init__(*args, **kwargs)
    #     request = self.context.get('request') if self.context else None

    #     if request and request.method in ['PUT', 'PATCH']:
    #         # Restrict fields to 'name' only for update operations
    #         allowed = {'deadline'}
    #         existing = set(self.fields)
    #         for field_name in existing - allowed:
    #             self.fields.pop(field_name)


class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meets
        fields = '__all__'
        read_only_fields = ['calendar', 'meeter', 'start_period', 'end_period']
