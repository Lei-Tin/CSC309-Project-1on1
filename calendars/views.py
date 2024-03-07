from django.shortcuts import render
from django.http import HttpResponse
from django.views.generic import TemplateView

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
    
# TODO: Maybe consider adding views that are used as API endpoints to fetch information like:
# Invited user's statuses with the calendar
# Fetching the suggested schedule's API