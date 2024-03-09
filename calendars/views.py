from django.shortcuts import render
from django.http import HttpResponse
from django.views.generic import TemplateView

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from .models import Calendar, Availability, Invitee, Meets

# Create your views here.
class calendarListView(TemplateView):
    def get(self, request):
        # TDOO: Add logic to this
        return render(request, 'calendar/calendar.html')
    
    def post(self, request):
        # TODO: Add logic to this
        return HttpResponse('POST request')

class createCalendarView(TemplateView):
    def get(self, request):
        # TDOO: Add logic to this
        return render(request, 'calendar/calendar_create.html')
    
    def post(self, request):
        # TODO: Add logic to this, from the post request from the form
        return HttpResponse('POST request')
    
class calendarSelectionView(TemplateView):
    def get(self, request, calendar_id):
        # TDOO: Add logic to this

        # TODO: Distinguish between the page that is shown to the user who created the calendar
        # and the user who was invited to the calendar
        return render(request, 'calendar/calendar_view.html')
    
    def post(self, request):
        # TODO: Add logic to this
        return HttpResponse('POST request')
    

# API Views for Status
# Calls for obtaining the status of the current calendar's availbility situation
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
            'availiability': [
                # A list of dictionaries containing all users' availabilities within this calendar
                {
                    'user_id': id,
                    'start_period': start_time,
                    'end_period': end_time,
                    'preference': preference
                },
                ...
            ],
            'invitees': [
                # A list of dictionaries containing all users that are invited to the calendar, 
                # including their current acceptance statuses
                {
                    'user_id': id,
                    'deadline': deadline
                    'status': status  # We compute the status by checking if the user is in the availability list
                },
                ...
            ],
            'owner': owner_id
        }
        """

        d = {
            'owner': Calendar.objects.get(id=calendar_id).owner.id, 
             'availiability': [], 
             'invitees': []
             }
        
        # Convert every entry in the queryset to a dictionary
        for availability in Availability.objects.filter(calendar_id=calendar_id):
            d['availiability'].append({
                'user_id': availability.user.id,
                'start_period': availability.start_period,
                'end_period': availability.end_period,
                'preference': availability.preference
            })

        accepted_users = set()
        for availability in Availability.objects.filter(calendar_id=calendar_id):
            accepted_users.add(availability.user.id)

        for invitee in Invitee.objects.filter(calendar_id=calendar_id):
            d['invitees'].append({
                'user_id': invitee.invitee.id,
                'deadline': invitee.deadline,
                'status': invitee.invitee in accepted_users
            })

        return Response(d)


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

        d = {'meets': []}

        # Convert every entry in the queryset to a dictionary
        for meet in Meets.objects.filter(calendar_id=calendar_id):
            d['meets'].append({
                'user_id': meet.meeter.id,
                'start_period': meet.start_period,
                'end_period': meet.end_period
            })

        return Response(d)


    
# TODO: Maybe consider adding views that are used as API endpoints to fetch information like:
# Invited user's statuses with the calendar
# Fetching the suggested schedule's API