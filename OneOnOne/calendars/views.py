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
from accounts.models import Profile

# Including email features
from django.core.mail import EmailMessage, get_connection
from django.conf import settings


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
    
    @action(detail=False, methods=['get'], url_path='owned/unfinalized')
    def owned_calendars_unfinalized(self, request):
        queryset = Calendar.objects.filter(owner=request.user, finalized=False)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='invited')
    def invited_calendars(self, request):
        invitees = Invitee.objects.filter(invitee=request.user)
        calendar_id = [invitee.calendar for invitee in invitees]
        # queryset = Calendar.objects.filter(id__in=calendar_id)
        serializer = self.get_serializer(calendar_id, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='status')
    def status(self, request):
        invitees = Invitee.objects.filter(invitee=request.user)
        calendar_id = [invitee.calendar for invitee in invitees if not Availability.objects.filter(calendar=invitee.calendar, user=invitee.invitee).exists()]
        serializer = self.get_serializer(calendar_id, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user, finalized=False)

    def update(self, request, *args, **kwargs):
        # Update calendar info
        calendar = self.get_object()

        serializer = self.get_serializer(calendar, data=request.data, partial=True)

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

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
    
    @action(detail=True, methods=['post'], url_path='send-email')
    def send_email(self, request, pk=None, username=None):
        calendar_id = pk
        user = get_object_or_404(User, username=username)

        # Obtain calendar details
        calendar = get_object_or_404(Calendar, pk=calendar_id)

        # Look up owner of calendar and details about the owner
        owner = calendar.owner

        email_addr = user.email

        # TODO: Send email
        with get_connection(
                host=settings.EMAIL_HOST, 
                port=settings.EMAIL_PORT,  
                username=settings.EMAIL_HOST_USER, 
                password=settings.EMAIL_HOST_PASSWORD, 
                use_tls=settings.EMAIL_USE_TLS  
            ) as connection:  
                subject = f'OneOnOne Calendar Availability Request to "{calendar.name}"'

                email_from = settings.EMAIL_HOST_USER

                recipient_list = [email_addr]
                message = f'''
You have been requested to fill in your availabilities to the calendar named "{calendar.name}" by "{owner.first_name} {owner.last_name} ({owner.username})".

Please log in to your OneOnOne account to view the calendar and provide your availabilities. 
                '''

                EmailMessage(subject, message, email_from, recipient_list, connection=connection).send()

        return Response({'detail': 'Email sent successfully.'}, status=status.HTTP_200_OK)


    @action(detail=True, methods=['post'], url_path='send_non_schedule_email')
    def send_non_schedule_email(self, request, pk=None):
        calendar_id = pk
        # Obtain calendar details
        calendar = get_object_or_404(Calendar, pk=calendar_id)
        # Look up owner of calendar and details about the owner
        owner = calendar.owner
        invitees = Invitee.objects.filter(calendar=calendar)
        emails = [owner.email]
        for invitee in invitees:
            email_addr = invitee.invitee.email
            emails.append(email_addr)

        for email in emails:
            with get_connection(
                    host=settings.EMAIL_HOST, 
                    port=settings.EMAIL_PORT,  
                    username=settings.EMAIL_HOST_USER, 
                    password=settings.EMAIL_HOST_PASSWORD, 
                    use_tls=settings.EMAIL_USE_TLS  
                ) as connection:  
                    subject = f'OneOnOne Calendar Availability Request to "{calendar.name}"'

                    email_from = settings.EMAIL_HOST_USER

                    recipient_list = [email]
                    message = f'''
We are unable to find a schedule for the calendar named "{calendar.name}" by "{owner.first_name} {owner.last_name} ({owner.username})" based on the availabilities provided.
Please login to your OneOnOne account to provide more availabilities if possible. 
                    '''

                    EmailMessage(subject, message, email_from, recipient_list, connection=connection).send()

        return Response({'detail': 'Email sent successfully.'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='send_finalize_emails_update')
    def send_finalize_emails_update(self, request, pk=None):
        calendar_id = pk
        calendar = get_object_or_404(Calendar, pk=calendar_id)
        owner = calendar.owner
        responses = {}
        for info in request.data:
            meeter_id = info['meeter']
            meeter_username = User.objects.filter(id=meeter_id).first().username
            start_time = info['start_period']
            responses[start_time] = meeter_username
            with get_connection(
                    host=settings.EMAIL_HOST, 
                    port=settings.EMAIL_PORT,  
                    username=settings.EMAIL_HOST_USER, 
                    password=settings.EMAIL_HOST_PASSWORD, 
                    use_tls=settings.EMAIL_USE_TLS  
                ) as connection:  
                    subject = f'OneOnOne Calendar Finalized'
                    email_from = settings.EMAIL_HOST_USER
                    meeter_email = User.objects.filter(id=meeter_id).first().email
                    recipient_list = [meeter_email]
                    message = f'''
Your meeting with "{owner.username}" for the calendar "{calendar.name}" has been finalized.
The meeting will be held on "{start_time}" with a duration of 1 hour.
                    '''
                    EmailMessage(subject, message, email_from, recipient_list, connection=connection).send()

        # Send email to owner about all information of the finalized meeting
        owner = calendar.owner
        message = f'Your calendar named "{calendar.name}" has been finalized. The following meetings have been scheduled: \n'
        for key, value in responses.items():
            message += f'\t Meeting with {value} on {key} for 1hr.\n'
        with get_connection(
                host=settings.EMAIL_HOST, 
                port=settings.EMAIL_PORT,  
                username=settings.EMAIL_HOST_USER, 
                password=settings.EMAIL_HOST_PASSWORD, 
                use_tls=settings.EMAIL_USE_TLS  
            ) as connection:  
                subject = f'OneOnOne Calendar Finalized'
                email_from = settings.EMAIL_HOST_USER
                recipient_list = [owner.email]
                EmailMessage(subject, message, email_from, recipient_list, connection=connection).send()
        
        return Response(responses, status=status.HTTP_200_OK)

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
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'remove_invitation':
            permission_classes = [IsAuthenticated, IsOwnerOrInvitee, IsNotFinalized]
        elif self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated, IsOwner]
        else:
            permission_classes = [IsAuthenticated, IsOwner, IsNotFinalized]
        return [permission() for permission in permission_classes]

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
    
    @action(detail=False, methods=['delete'], url_path='remove-invitation')
    def remove_invitation(self, request, calendar_id=None):
        calendar = get_object_or_404(Calendar, pk=calendar_id)
        invitee = request.user
        Invitee.objects.filter(calendar=calendar, invitee=invitee).delete()
        return Response(status=status.HTTP_200_OK)


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

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated, IsOwnerOrInvitee]
        else:
            permission_classes = [IsAuthenticated, IsOwnerOrInvitee, IsNotFinalized]

        return [permission() for permission in permission_classes]

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
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated, IsOwnerOrInvitee]
        else:
            permission_classes = [IsAuthenticated, IsOwner, IsNotFinalized]

        return [permission() for permission in permission_classes]

    def get_queryset(self):
        calendar_id = self.kwargs.get('calendar_id')
        calendar = get_object_or_404(Calendar, pk=calendar_id)

        if self.request.user == calendar.owner:
            return self.queryset.filter(calendar=calendar)
        else:
            return self.queryset.filter(calendar=calendar, meeter=self.request.user)

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

    # Schedule only one meeting for each invitee
    invitees_scheduled = set()


    for owner_availability in owner_availabilities:
        # Find overlapping availabilities with invitees for this owner availability
        overlapping_availabilities = invitee_availabilities.filter(
            start_period__lte=owner_availability.end_period,
            end_period__gte=owner_availability.start_period
        ).exclude(user__in=invitees_scheduled).order_by('-preference', 'user_id')

        # If there are overlaps, take the one with the highest preference (or lowest user ID in case of a tie)
        if overlapping_availabilities.exists() and overlapping_availabilities.first().user not in invitees_scheduled:
            chosen_availability = overlapping_availabilities.first()
            meetings_to_schedule.append({
                'calendar': calendar,
                'meeter': chosen_availability.user,
                'start_period': max(owner_availability.start_period, chosen_availability.start_period),
                'end_period': min(owner_availability.end_period, chosen_availability.end_period),
            })
            invitees_scheduled.add(chosen_availability.user)

    print(meetings_to_schedule)

    # Obtain all possible unique invitees
    invitees = set(invitee_availabilities.values_list('user', flat=True))

    # Only return a schedule if all invitees have been scheduled
    if len(invitees_scheduled) < len(invitees):
        return []

    return meetings_to_schedule

