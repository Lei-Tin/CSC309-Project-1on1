from .models import Calendar, Availability, Invitee
from rest_framework import serializers
from datetime import datetime


class CalendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calendar
        fields = '__all__'
        read_only_fields = ['owner']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.context['request'].method in ['PUT', 'PATCH']:
            # Restrict fields to 'name' only for update operations
            allowed = {'name'}
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

    # def validate_name(self, value):
    #     owner = self.context['request'].user
    #     if Calendar.objects.filter(owner=owner, name=value).exists():
    #         raise serializers.ValidationError('Calendar with this name already exists')
    #     return value
    #
    # def validate_start_date(self, value):
    #     try:
    #         datetime.strptime(str(value), '%Y-%m-%d')
    #     except ValueError:
    #         raise serializers.ValidationError('This field expects a date in the format YYYY-MM-DD')
    #
    # def validate_end_date(self, value):
    #     try:
    #         datetime.strptime(str(value), '%Y-%m-%d')
    #     except ValueError:
    #         raise serializers.ValidationError('This field expects a date in the format YYYY-MM-DD')


class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = '__all__'
        read_only_fields = ['user', 'calendar']


class InviteeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invitee
        fields = '__all__'
