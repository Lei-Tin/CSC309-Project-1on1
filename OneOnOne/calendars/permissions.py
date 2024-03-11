from rest_framework import permissions
from django.shortcuts import get_object_or_404
from .models import Calendar


class IsOwnerOrInvitee(permissions.BasePermission):
    def has_permission(self, request, view):
        # Check for the calendar_id in the URL
        calendar_id = view.kwargs.get('calendar_id')

        # Retrieve the Calendar instance corresponding to calendar_id
        calendar = Calendar.objects.get(pk=calendar_id)

        # Check if the request user is the owner or an invitee of the calendar
        if calendar.owner == request.user or calendar.invitees.filter(id=request.user.id).exists():
            return True

        # If none of the above conditions are met, deny permission
        return False

    def has_object_permission(self, request, view, obj):
        # Check if the request user is the one who created the availability
        # obj is an instance of Availability
        return obj.user == request.user
