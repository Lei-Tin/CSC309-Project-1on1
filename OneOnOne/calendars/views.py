from django.shortcuts import render
from django.http import HttpResponse
from django.views.generic import TemplateView
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status, viewsets

from .models import Calendar, Availability, Invitee, Meets
from .permissions import IsOwnerOrInvitee

from .serializers import CalendarSerializer, AvailabilitySerializer, InviteeSerializer


# Create your views here.
class AvailabilityViewSet(viewsets.ModelViewSet):
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer
    permission_classes = [IsAuthenticated, IsOwnerOrInvitee]

    def get_queryset(self):
        calendar_id = self.kwargs.get('calendar_id')
        calendar = get_object_or_404(Calendar, pk=calendar_id)
        return self.queryset.filter(calendar=calendar)

    def perform_create(self, serializer):
        # Extract `calendar_id` from the URL
        calendar_id = self.kwargs.get('calendar_id')
        # Retrieve the Calendar instance corresponding to `calendar_id`
        calendar = get_object_or_404(Calendar, pk=calendar_id)
        # Save the new Availability instance with `calendar` and `user` manually
        serializer.save(user=self.request.user, calendar=calendar)

    def get_object(self):
        """
        Override the default to apply custom permission checks.
        """
        obj = super().get_object()
        self.check_object_permissions(self.request, obj)
        return obj

# class calendarListView(TemplateView):
#     def get(self, request):
#         # TDOO: Add logic to this
#         return render(request, 'calendar/calendar.html')
#
#     def post(self, request):
#         # TODO: Add logic to this
#         return HttpResponse('POST request')
#
# class createCalendarView(TemplateView):
#     def get(self, request):
#         # TDOO: Add logic to this
#         return render(request, 'calendar/calendar_create.html')
#
#     def post(self, request):
#         # TODO: Add logic to this, from the post request from the form
#         return HttpResponse('POST request')
#
# class calendarSelectionView(TemplateView):
#     def get(self, request, calendar_id):
#         # TDOO: Add logic to this
#
#         # TODO: Distinguish between the page that is shown to the user who created the calendar
#         # and the user who was invited to the calendar
#         return render(request, 'calendar/calendar_view.html')
#
#     def post(self, request):
#         # TODO: Add logic to this
#         return HttpResponse('POST request')


# API Views for Status
# Calls for obtaining the status of the current calendar's availbility situation

# For RESTFUL API, need to handle
# get, post, put, patch, delete
class CalendarStatus(APIView):
    """
    This API Call is used to obtain information about the current calendar's filled information

    Currently POST is not supported, only GET
    """

    def get(self, request, calendar_id):
        """
        It should return all of the users' filled information given a calendar_id
        """
        # Check if the calendar_id passed in the URL is valid
        # If it is not valid, return a 404
        if not Calendar.objects.filter(id=calendar_id).exists():
            return Response(status=status.HTTP_404_NOT_FOUND)

        # It should return a dict of the following structure: 
        """
        {
            'owner': owner_id, 
            'name': name_of_calendar,
            'start_date': start_date,
            'end_date': end_date
        }
        """
        # Using the serializer
        calendar = Calendar.objects.get(id=calendar_id)
        serializer = CalendarSerializer(calendar)
        return Response(serializer.data)


# class AvailabilityStatus(APIView):
#     def get(self, request, calendar_id):
#         """Obtains all availability status given a calendar_id"""
#
#         # Check if the calendar_id passed in the URL is valid
#         # If it is not valid, return a 404
#         if not Calendar.objects.filter(id=calendar_id).exists():
#             return Response(status=status.HTTP_404_NOT_FOUND)
#
#         # It should return a dict of the following structure:
#         """
#         {
#             'availabilities': [
#                 # A list of dictionaries containing all users' availabilities within this calendar
#                 {
#                     'user_id': id,
#                     'start_period': start_time,
#                     'end_period': end_time,
#                     'preference': preference
#                 },
#                 ...
#             ]
#         }
#         """
#         # Using list serializer
#         availabilities = Availability.objects.filter(calendar_id=calendar_id)
#         serializer = AvailabilitySerializer(availabilities, many=True)
#         return Response(serializer.data)


class InviteeStatus(APIView):
    def get(self, request, calendar_id):
        """Obtains all invitee status given a calendar_id"""

        # Check if the calendar_id passed in the URL is valid
        # If it is not valid, return a 404
        if not Calendar.objects.filter(id=calendar_id).exists():
            return Response(status=status.HTTP_404_NOT_FOUND)

        # It should return a dict of the following structure: 
        """
        {
            'invitees': [
                # A list of dictionaries containing all users' invitee status within this calendar
                {
                    'user_id': id,
                    'deadline': deadline
                },
                ...
            ]
        }
        """
        # Using list serializer
        invitees = Invitee.objects.filter(calendar_id=calendar_id)
        serializer = InviteeSerializer(invitees, many=True)

        return Response(serializer.data)


class MeetingStatus(APIView):
    """
    This API Call is used to obtain information about the current calendar's meeting status
    Already finalized meeting times for everyone in the calendar

    Currently POST is not supported, only GET
    """

    def get(self, request, calendar_id):
        # Check if the calendar_id passed in the URL is valid
        # If it is not valid, return a 404
        if not Calendar.objects.filter(id=calendar_id).exists():
            return Response(status=status.HTTP_404_NOT_FOUND)

        # It should return a dict of the following structure: 
        """
        {
            'meets': [
                # A list of dictionaries containing all users' meets within this calendar
                {
                    'user_id': id,
                    'start_period': start_time,
                    'end_period': end_time
                },
                ...
            ]
        }
        """

        # Using serializers
        meets = Meets.objects.filter(calendar_id=calendar_id)
        serializer = AvailabilitySerializer(meets, many=True)
        return Response(serializer.data)

# TODO: Maybe consider adding views that are used as API endpoints to fetch information like:
# Invited user's statuses with the calendar
# Fetching the suggested schedule's API
