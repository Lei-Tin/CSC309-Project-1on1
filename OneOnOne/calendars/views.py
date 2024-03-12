from django.db import transaction
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated

from rest_framework.response import Response
from rest_framework import status, viewsets

from .permissions import *
from .serializers import *


# Create your views here.
class CalendarViewSet(viewsets.ModelViewSet):
    """
    list:
    Obtain the list of all calendars created by the currently authenticated user
    ### Response
    #### Success - 200 OK
    #### Not authenticated - 401 Unauthorized
    read:
    Obtain calendar details
    ### Response
    #### Success - 200 OK
    #### Not authenticated - 401 Unauthorized
    #### Not owner - 403 Forbidden
    #### Invalid calendar - 404 Not Found
    create:
    Create a new calendar
    ### Response
    #### Success - 200 OK
    #### Not authenticated - 401 Unauthorized
    update:
    Updates the name of a calendar, which is defined by the serializer.
    Users cannot modify a start or end date once the calendar has been created
    ### Response
    #### Success - 200 OK
    #### Not authenticated - 401 Unauthorized
    #### Not owner - 403 Forbidden
    #### Invalid calendar - 404 Not Found
    delete:
    Deletes the calendar, and removes all associated content with the calendar
    ### Response
    #### Success - 200 OK
    #### Not authenticated - 401 Unauthorized
    #### Not owner - 403 Forbidden
    #### Invalid calendar - 404 Not Found
    """
    queryset = Calendar.objects.all()
    serializer_class = CalendarSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Calendar.objects.filter(owner=user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def update(self, request, *args, **kwargs):
        # TODO: change the success response to be the calendar details (currently only the name change is seen)
        return super().update(request, *args, **kwargs)


class InviteeViewSet(viewsets.ModelViewSet):
    """
        list:
        Obtain the list of all invitees of a calendar.
        ### Response
        #### Success - 200 OK
        #### Not authenticated - 401 Unauthorized
        #### Not owner - 403 Forbidden
        #### Invalid calendar - 404 Not Found
        read:
        Obtain details of a specific invitee
        ### Response
        #### Success - 200 OK
        #### Not authenticated - 401 Unauthorized
        #### Not owner - 403 Forbidden
        #### Invalid calendar - 404 Not Found
        create:
        Invite a new user to be in a calendar
        ### Response
        #### Success - 200 OK
        #### Not authenticated - 401 Unauthorized
        #### Not owner - 403 Forbidden
        #### Invalid calendar - 404 Not Found
        #### Finalized - 410 Gone
        update:
        Updates the deadline for the invitee to add an availability (no other fields can be modified)
        ### Response
        #### Success - 200 OK
        #### Not authenticated - 401 Unauthorized
        #### Not owner - 403 Forbidden
        #### Invalid calendar - 404 Not Found
        #### Finalized - 410 Gone
        delete:
        Deletes the invite, and removes all associated content with the invitee
        ### Response
        #### Success - 200 OK
        #### Not authenticated - 401 Unauthorized
        #### Not owner - 403 Forbidden
        #### Invalid calendar - 404 Not Found
        #### Finalized - 410 Gone
    """
    queryset = Invitee.objects.all()
    serializer_class = InviteeSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        # TODO: what about getting the list of invitees that have no updated info yet
        calendar_id = self.kwargs.get('calendar_id')
        calendar = get_object_or_404(Calendar, pk=calendar_id)
        return self.queryset.filter(calendar=calendar)

    def perform_create(self, serializer):
        calendar_id = self.kwargs.get('calendar_id')
        calendar = get_object_or_404(Calendar, pk=calendar_id)
        serializer.save(calendar=calendar)


class AvailabilityViewSet(viewsets.ModelViewSet):
    """
        list:
        Obtain the list of all availabilities provided for a calendar.
        ### Response
        #### Success - 200 OK
        #### Not authenticated - 401 Unauthorized
        #### Not owner or invitee - 403 Forbidden
        #### Invalid calendar - 404 Not Found
        read:
        Obtain details of a specific availability provided by a user
        ### Response
        #### Success - 200 OK
        #### Not authenticated - 401 Unauthorized
        #### Not owner or invitee - 403 Forbidden
        #### Invalid calendar - 404 Not Found
        create:
        Create a new availability for a calendar
        ### Response
        #### Success - 200 OK
        #### Not authenticated - 401 Unauthorized
        #### Not owner or invitee - 403 Forbidden
        #### Invalid calendar - 404 Not Found
        #### Deadline passed - 410 Gone
        update:
        Updates the time period or preference level for a specific availability
        ### Response
        #### Success - 200 OK
        #### Not authenticated - 401 Unauthorized
        #### Not owner or invitee - 403 Forbidden
        #### Invalid calendar - 404 Not Found
        #### Deadline passed - 410 Gone
        delete:
        Deletes the availability period
        ### Response
        #### Success - 200 OK
        #### Not authenticated - 401 Unauthorized
        #### Not owner or invitee - 403 Forbidden
        #### Invalid calendar - 404 Not Found
        #### Deadline passed - 410 Gone
    """
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
        # TODO: what about 410

    def get_object(self):
        """
        Override the default to apply custom permission checks.
        """
        obj = super().get_object()
        self.check_object_permissions(self.request, obj)
        return obj

    # TODO: non creators of an availability may be able to delete others
    # How to modify so that there are method specific permissions


class ScheduleViewSet(viewsets.ModelViewSet):
    """
        list:
        Obtain the list of meets that make up a schedule for the calendar
        ### Response
        #### Success - 200 OK
        #### Not authenticated - 401 Unauthorized
        #### Not owner - 403 Forbidden
        #### Invalid calendar - 404 Not Found
        create:
        DELETES OLD SCHEDULE IF EXISTS, then generates a new suggested schedule
        ### Response
        #### Success - 200 OK
        #### Not authenticated - 401 Unauthorized
        #### Not owner - 403 Forbidden
        #### Invalid calendar - 404 Not Found
        update:
        Updates the time period or preference level for a specific availability
        ### Response
        #### Success - 200 OK
        #### Not authenticated - 401 Unauthorized
        #### Not owner - 403 Forbidden
        #### Invalid calendar - 404 Not Found
        #### Finalized - 410 Gone
        delete:
        Deletes the meeting period for a schedule
        ### Response
        #### Success - 200 OK
        #### Not authenticated - 401 Unauthorized
        #### Not owner - 403 Forbidden
        #### Invalid calendar - 404 Not Found
        #### Finalized - 410 Gone
    """
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
        # TODO: remember to not return an error if creating a second time
        return Response({'detail': 'Schedule created successfully.'})
    # TODO: how to custom handle edit


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


# TODO: Maybe consider adding views that are used as API endpoints to fetch information like:
# Invited user's statuses with the calendar
# Fetching the suggested schedule's API
