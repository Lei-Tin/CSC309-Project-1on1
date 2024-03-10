from django.db import transaction
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.generic import TemplateView
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status, viewsets

from .permissions import IsOwnerOrInvitee

from .serializers import *


# Create your views here.
# class calendarListView(APIView):
#     # Return a JsonResponse of all the calendars
#     def get(self, request):
#         serializer = CalendarSerializer(Calendar.objects.all(), many=True)
#         return JsonResponse(serializer.data, safe=False)
#
#     # Create a new calendar
#     def post(self, request):
#         serializer = CalendarSerializer(data=request.data, context={'request': request})
#         if serializer.is_valid():
#             serializer.save(owner=request.user)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#
#
# class calendarSelectionView(TemplateView):
#     def get(self, request, calendar_id):
#         # TDOO: Add logic to this
#         # TODO: Distinguish between the page that is shown to the user who created the calendar
#         # and the user who was invited to the calendar
#         return render(request, 'calendar/calendar_view.html')
#
#     def post(self, request):
#         # TODO: Add logic to this
#         return HttpResponse('POST request')


class CalendarViewSet(viewsets.ModelViewSet):
    queryset = Calendar.objects.all()
    serializer_class = CalendarSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        This view should return a list of all calendars created by the currently authenticated user
        """
        user = self.request.user
        return Calendar.objects.filter(owner=user)

    def perform_create(self, serializer):
        """
        This view should return the calendar details once successfully created
        """
        serializer.save(owner=self.request.user)

    def update(self, request, *args, **kwargs):
        """
        This view handles updates to the name of a calendar, which is defined by the serializer
        Users cannot modify a start or end date once the calendar has been created
        """
        # TODO: change the success response to be the calendar details (currently only the name change is seen)
        return super().update(request, *args, **kwargs)


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


class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Meets.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        calendar_id = self.kwargs.get('calendar_id')
        calendar = get_object_or_404(Calendar, pk=calendar_id)
        return self.queryset.filter(calendar=calendar)

    def perform_create(self, serializer):
        calendar_id = self.kwargs.get('calendar_id')
        calendar = get_object_or_404(Calendar, pk=calendar_id)

        # Ensure the user creating the schedule is the owner of the calendar
        if self.request.user != calendar.owner:
            return Response({'detail': 'You are not authorized to create a schedule for this calendar.'}, status=403)

        potential_meetings = calculate_meetings(calendar)

        with transaction.atomic():
            for meeting in potential_meetings:
                Meets.objects.create(
                    calendar=calendar,
                    meeter=meeting['meeter'],
                    start_period=meeting['start_period'],
                    end_period=meeting['end_period']
                )

        # TODO: remember to redirect to the get_queryset on success
        return Response({'detail': 'Schedule created successfully.'})


def calculate_meetings(calendar):
    owner_availabilities = Availability.objects.filter(calendar=calendar, user=calendar.owner)
    invitee_availabilities = Availability.objects.filter(calendar=calendar).exclude(user=calendar.owner)
    meetings_to_schedule = []

    for owner_availability in owner_availabilities:
        # Find overlapping availabilities with invitees for this owner availability
        overlapping_availabilities = invitee_availabilities.filter(
            start_period__lt=owner_availability.end_period,
            end_period__gt=owner_availability.start_period
        ).order_by('-preference', 'user_id')

        # If there are overlaps, take the one with the highest preference (or lowest user ID in case of a tie)
        if overlapping_availabilities.exists():
            chosen_availability = overlapping_availabilities.first()
            meetings_to_schedule.append({
                'calendar': calendar,
                'meeter': chosen_availability.user,
                'start_period': max(owner_availability.start_period, chosen_availability.start_period),
                'end_period': min(owner_availability.end_period, chosen_availability.end_period),
            })

    return meetings_to_schedule


# API Views for Status
# Calls for obtaining the status of the current calendar's availbility situation

# For RESTFUL API, need to handle
# get, post, put, patch, delete
# class CalendarStatus(APIView):
#     """
#     This API Call is used to obtain information about the current calendar's filled information
#
#     Currently POST is not supported, only GET
#     """
#
#     def get(self, request, calendar_id):
#         """
#         It should return all of the users' filled information given a calendar_id
#         """
#         # Check if the calendar_id passed in the URL is valid
#         # If it is not valid, return a 404
#         if not Calendar.objects.filter(id=calendar_id).exists():
#             return Response(status=status.HTTP_404_NOT_FOUND)
#
#         # It should return a dict of the following structure:
#         """
#         {
#             'owner': owner_id,
#             'name': name_of_calendar,
#             'start_date': start_date,
#             'end_date': end_date
#         }
#         """
#         # Using the serializer
#         calendar = Calendar.objects.get(id=calendar_id)
#         serializer = CalendarSerializer(calendar)
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


# class MeetingStatus(APIView):
#     """
#     This API Call is used to obtain information about the current calendar's meeting status
#     Already finalized meeting times for everyone in the calendar
#
#     Currently POST is not supported, only GET
#     """
#
#     def get(self, request, calendar_id):
#         # Check if the calendar_id passed in the URL is valid
#         # If it is not valid, return a 404
#         if not Calendar.objects.filter(id=calendar_id).exists():
#             return Response(status=status.HTTP_404_NOT_FOUND)
#
#         # It should return a dict of the following structure:
#         """
#         {
#             'meets': [
#                 # A list of dictionaries containing all users' meets within this calendar
#                 {
#                     'user_id': id,
#                     'start_period': start_time,
#                     'end_period': end_time
#                 },
#                 ...
#             ]
#         }
#         """
#
#         # Using serializers
#         meets = Meets.objects.filter(calendar_id=calendar_id)
#         serializer = AvailabilitySerializer(meets, many=True)
#         return Response(serializer.data)

# TODO: Maybe consider adding views that are used as API endpoints to fetch information like:
# Invited user's statuses with the calendar
# Fetching the suggested schedule's API
