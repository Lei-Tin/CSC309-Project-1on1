from django.db import transaction, IntegrityError
from django.db.models import Q
from rest_framework.decorators import action
from rest_framework.exceptions import *
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated

from rest_framework.response import Response
from rest_framework import status, viewsets

from .permissions import *
from .serializers import *
from accounts.serializers import UserSerializer
from contacts.models import Contacts


# Create your views here.
class CalendarViewSet(viewsets.ModelViewSet):
    """
    list:
    Obtain the list of all calendars created by the currently authenticated user

    ### Response
    #### `200` OK - Success
    #### `401` Unauthorized - Not authenticated

    read:
    Obtain calendar details

    ### Response
    #### `200` OK - Success
    #### `401` Unauthorized - Not authenticated
    #### `403` Forbidden - Not owner
    #### `404` Not Found - Invalid calendar

    create:
    Create a new calendar

    ### Input Format
    ```
    {
        "name": "<calendar-name>",
        "start_date": "<start-date>",
        "end_date": "<end-date>"
    }
    ```

    ### Response
    #### `200` OK - Success
    #### `400` Bad Request - Invalid input
    #### `401` Unauthorized - Not authenticated

    ### Output Format when successful
    ```
    {
        "id": <calendar-id>,
        "name": <calendar-name>,
        "start_date": <start-date>,
        "end_date": <end-date>,
        "finalized": <true/false>,
        "owner": <owner-userid>
    }
    ```

    ### Output Format when unsuccessful
    ```
    {
        "<field-name>": "<error-message>"   
    }
    ```

    With the following error messages:
    
    - This field is required
    
    update:
    Updates the name of a calendar, which is defined by the serializer.

    Users cannot modify a start or end date once the calendar has been created.

    The calendar is identified by the API endpoint's parameter `pk`.

    ### Input Format
    ```
    {
        "name": "<new-calendar-name>"
    }
    ```

    ### Response
    #### `200` OK - Success
    #### `401` Unauthorized - Not authenticated
    #### `403` Forbidden - Not owner
    #### `404` Not Found - Invalid calendar

    ### Output Format when successful
    ```
    {
        "name": "<new-calendar-name>"
    }
    ```

    ### Output Format when unsuccessful
    ```
    {
        "name": "<error-message>"
    }
    ```

    With the following error messages:

    - This field is required

    delete:
    Deletes the calendar, and removes all associated content with the calendar

    The calendar is identified by the API endpoint's parameter `pk`
    
    It does not return any message upon successful in the JSON response

    ### Response
    #### `200` OK - Success
    #### `401` Unauthorized - Not authenticated
    #### `403` Forbidden - Not owner
    #### `404` Not Found - Invalid calendar

    finalize:
    Finalizes the calendar, preventing any further changes to the calendar

    Does not require any input

    ### Reponses
    #### `200` OK - Success
    #### `400` Bad Request - Already finalized
    #### `401` Unauthorized - Not authenticated
    #### `403` Forbidden - Not owner
    #### `404` Not Found - Invalid calendar

    ### Response when successful
    ```
    {
        "detail": "Calendar has been successfully finalized."
    }
    ```
    """
    queryset = Calendar.objects.all()
    serializer_class = CalendarSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='owned')
    def owned_calendars(self, request):
        queryset = Calendar.objects.filter(owner=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='invited')
    def invited_calendars(self, request):
        invitees = Invitee.objects.filter(invitee=request.user)
        calendar_id = [invitee.calendar for invitee in invitees]
        # queryset = Calendar.objects.filter(id__in=calendar_id)
        serializer = self.get_serializer(calendar_id, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user, finalized=False)

    def update(self, request, *args, **kwargs):
        # TODO: change the success response to be the calendar details (currently only the name change is seen)
        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=['put'])
    def finalize(self, request, pk=None):
        calendar = get_object_or_404(Calendar, pk=pk)

        # Check if the calendar is already finalized
        if calendar.finalized:
            return Response({'detail': 'This calendar is already finalized.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            calendar.finalized = True
            calendar.save()

        return Response({'detail': 'Calendar has been successfully finalized.'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def send_email(self, request, pk=None, username=None):
        calendar_id = self.kwargs.get('pk')
        user = get_object_or_404(User, username=username)

        email = user.email
        return Response({'detail': 'Email sent to ' + email}, status=status.HTTP_200_OK)
        # TODO: Send emali
        pass


class InviteeViewSet(viewsets.ModelViewSet):
    """
    list:
    Obtain the list of all invitees of a calendar.

    ### Responses
    #### `200` OK - Success
    #### `401` Unauthorized - Not authenticated
    #### `403` Forbidden - Not owner
    #### `404` Not Found - Invalid calendar

    read:
    Obtain details of a specific invitee

    ### Responses
    #### `200` OK - Success
    #### `401` Unauthorized - Not authenticated
    #### `403` Forbidden - Not owner
    #### `404` Not Found - Invalid calendar or invite

    create:
    Invite a new user to be in a calendar

    ### Input Format
    ```
    {
        "invitee": <invitee-userid>,
        "deadline": <deadline>
    }
    ```

    ### Responses
    #### `200` OK - Success
    #### `401` Unauthorized - Not authenticated
    #### `403` Forbidden - Not owner
    #### `404` Not Found - Invalid calendar
    #### `410` Gone - Finalized

    ### Output Format when successful
    ```
    {
        "id": <invitee-id>,
        "calendar": <calendar-id>,
        "invitee": <invitee-userid>,
        "deadline": <deadline>,
        "has_availability": <true/false>
    }
    ```

    ### Output Format when unsuccessful (404, when user is not invited)
    ```
    {
        "detail": "Not found."
    }
    ```

    update:
    Updates the deadline for the invitee to add an availability (no other fields can be modified)

    ### Input Format
    ```
    {
        "deadline": <new-deadline>
    }
    ```

    ### Responses
    #### `200` OK - Success
    #### `401` Unauthorized - Not authenticated
    #### `403` Forbidden - Not owner
    #### `404` Not Found - Invalid calendar or invite
    #### `410` Gone - Finalized

    ### Output Format when successful
    ```
    {
        "id": <invitee-id>,
        "calendar": <calendar-id>,
        "invitee": <invitee-userid>,
        "deadline": <deadline>,
        "has_availability": <true/false>
    }
    ```

    delete:
    Deletes the invite, and removes all associated content with the invitee

    The calendar is identified by the API endpoint's parameter `pk`
    
    It does not return any message upon successful in the JSON response

    ### Responses
    #### `200` OK - Success
    #### `401` Unauthorized - Not authenticated
    #### `403` Forbidden - Not owner
    #### `404` Not Found - Invalid calendar or invite
    #### `410` Gone - Finalized
    """
    queryset = Invitee.objects.all()
    serializer_class = InviteeSerializer
    permission_classes = [IsAuthenticated, IsOwner, IsNotFinalized]

    def get_queryset(self):
        calendar_id = self.kwargs.get('calendar_id')
        calendar = get_object_or_404(Calendar, pk=calendar_id)
        return self.queryset.filter(calendar=calendar)
    
    @action(detail=True, methods=['get'], url_path='uninvited')
    def uninvited(self, request, calendar_id=None):
        calendar = get_object_or_404(Calendar, pk=calendar_id)
        contacts = User.objects.filter(
            Q(request_sent__requested=calendar.owner, request_sent__accepted=True) | 
            Q(request_received__requester=calendar.owner, request_received__accepted=True)
        ).distinct()

        # Get all users already invited to the calendar
        invited_users = User.objects.filter(
            invitee__calendar=calendar
        )

        # Filter out contacts who are already invited
        uninvited_contacts = contacts.exclude(id__in=invited_users)

        # Serialize and return the queryset of uninvited contacts
        serializer = UserSerializer(uninvited_contacts, many=True, context={'request': request})
        return Response(serializer.data)

    def perform_create(self, serializer):
        calendar_id = self.kwargs.get('calendar_id')
        calendar = get_object_or_404(Calendar, pk=calendar_id)
        invitee_id = serializer.validated_data.get('invitee')
        try:
            invitee = User.objects.get(pk=invitee_id)
        except User.DoesNotExist:
            raise ValidationError({'invitee_id': 'The user with this id does not exist.'})
        if not Contacts.objects.filter(requester=invitee, requested=calendar.owner, accepted=True).exists() and \
                not Contacts.objects.filter(requester=calendar.owner, requested=invitee, accepted=True).exists():
            raise ValidationError({'contacts': 'The calendar owner must be an accepted contact of the invitee.'})

        try:
            # Attempt to save the invitee, which might violate the unique constraint
            serializer.save(calendar=calendar, invitee=invitee)
        except IntegrityError:
            # If an IntegrityError is caught, raise a ValidationError
            # DRF will handle this exception and return a 400 Bad Request response
            raise ValidationError("An invitee with these details already exists.")


class AvailabilityViewSet(viewsets.ModelViewSet):
    """
    list:
    Obtain the list of all availabilities provided for a calendar.

    ### Responses
    #### `200` OK - Success
    #### `401` Unauthorized - Not authenticated
    #### `403` Forbidden - Not owner or invitee
    #### `404` Not Found - Invalid calendar

    read:
    Obtain details of a specific availability provided by a user

    ### Responses
    #### `200` OK - Success
    #### `401` Unauthorized - Not authenticated
    #### `403` Forbidden - Not owner or invitee
    #### `404` Not Found - Invalid calendar or availability

    create:
    Create a new availability for a calendar

    ### Input Format
    ```
    {
        "start_period": "<start-period>",
        "end_period": "<end-period>",
        "preference": "<preference>"
    }
    ```

    ### Responses
    #### `200` OK - Success
    #### `401` Unauthorized - Not authenticated
    #### `403` Forbidden - Not owner or invitee
    #### `404` Not Found - Invalid calendar
    #### `410` Gone - Deadline passed

    ### Output Format when successful
    ```
    {
        "id": <availability-id>,
        "start_period": "<start-period>",
        "end_period": "<end-period>",
        "preference": "<preference>",
        "calendar": <calendar-id>,
        "user": <user-id>
    }
    ```

    ### Output Format when unsuccessful
    ```
    {
        "detail": "<error-message>"
    }
    ```

    With the following error messages:
    - You do not have permission to perform this action.
    - Deadline has passed
    - This field is required
    - Not owner or invitee

    update:
    Updates the time period or preference level for a specific availability

    ### Input Format
    ```
    {
        "start_period": "<new-start-period>",
        "end_period": "<new-end-period>",
        "preference": "<new-preference>"
    }
    ```

    ### Responses
    #### `200` OK - Success
    #### `401` Unauthorized - Not authenticated
    #### `403` Forbidden - Not owner or invitee
    #### `404` Not Found - Invalid calendar or availability
    #### `410` Gone - Deadline passed

    ### Output Format when successful
    ```
    {
        "id": <availability-id>,
        "start_period": "<new-start-period>",
        "end_period": "<new-end-period>",
        "preference": "<new-preference>",
        "calendar": <calendar-id>,
        "user": <user-id>
    }
    ```

    ### Output Format when unsuccessful
    ```
    {
        "detail": "<error-message>"
    }
    ```

    With the following error messages:
    - You do not have permission to perform this action.
    - Deadline has passed
    - This field is required
    - Not owner or invitee

    delete:
    Deletes the availability period
    ### Responses
    #### `200` OK - Success
    #### `401` Unauthorized - Not authenticated
    #### `403` Forbidden - Not owner or invitee
    #### `404` Not Found - Invalid calendar or availability
    #### `410` Gone - Deadline passed
    """
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer
    permission_classes = [IsAuthenticated, IsOwnerOrInvitee, IsNotFinalized]

    def get_queryset(self):
        calendar_id = self.kwargs.get('calendar_id')
        calendar = get_object_or_404(Calendar, pk=calendar_id)
        return self.queryset.filter(user=self.request.user, calendar=calendar)

    def perform_create(self, serializer):
        # Extract `calendar_id` from the URL
        calendar_id = self.kwargs.get('calendar_id')
        # Retrieve the Calendar instance corresponding to `calendar_id`
        calendar = get_object_or_404(Calendar, pk=calendar_id)
        # Save the new Availability instance with `calendar` and `user` manually
        serializer.save(user=self.request.user, calendar=calendar)
        # TODO: what about `410`

    def get_object(self):
        """
        Override the default to apply custom permission checks.
        """
        obj = super().get_object()
        self.check_object_permissions(self.request, obj)
        return obj

    @action(detail=False, methods=['delete'], url_path='bulk-delete')
    def bulk_delete(self, request, calendar_id=None):
        calendar = get_object_or_404(Calendar, pk=calendar_id)
        Availability.objects.filter(calendar=calendar, user=request.user).delete()
        return Response(status=status.HTTP_200_OK)


class ScheduleViewSet(viewsets.ModelViewSet):
    """
    list:
    Obtain the list of meets that make up a schedule for the calendar

    ### Responses
    #### `200` OK - Success
    #### `401` Unauthorized - Not authenticated
    #### `403` Forbidden - Not owner
    #### `404` Not Found - Invalid calendar

    create:
    DELETES OLD SCHEDULE IF EXISTS, then generates a new suggested schedule
    
    Calendar is identified by the API endpoint's parameter `calendar_id`

    ### Responses
    #### `200` OK - Success
    #### `401` Unauthorized - Not authenticated
    #### `403` Forbidden - Not owner
    #### `404` Not Found - Invalid calendar

    delete:
    Deletes the meeting period for a schedule

    Returns a 200 OK response if the deletion is successful, with empty JSON response

    ### Responses
    #### `200` OK - Success
    #### `401` Unauthorized - Not authenticated
    #### `403` Forbidden - Not owner
    #### `404` Not Found - Invalid calendar
    #### `410` Gone - Finalized
    """
    queryset = Meets.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [IsAuthenticated, IsOwner, IsNotFinalized]

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
            # Delete all existing meetings for the calendar first
            Meets.objects.filter(calendar=calendar).delete()

            for meeting in potential_meetings:
                Meets.objects.create(
                    calendar=calendar,
                    meeter=meeting['meeter'],
                    start_period=meeting['start_period'],
                    end_period=meeting['end_period']
                )

        # TODO: remember to redirect to the get_queryset on success
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

