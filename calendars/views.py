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
    
class calendarView(TemplateView):
    def get(self, request, calendar_id):
        # TDOO: Add logic to this
        return render(request, 'calendar/calendar_view.html')
    
    def post(self, request):
        # TODO: Add logic to this
        return HttpResponse('POST request')