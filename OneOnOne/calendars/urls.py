"""
URL configuration for one_on_one project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from calendars.views import calendarListView, calendarSelectionView
from calendars.views import CalendarStatus, MeetingStatus, AvailabilityStatus, InviteeStatus

app_name = 'calendars'

urlpatterns = [
    # Front end views
    # path('list/', calendarListView.as_view(), name='calendar-list'),
    # path('create/', createCalendarView.as_view(), name='calendar-create'),
    # path('<int:calendar_id>/', calendarSelectionView.as_view(), name='calendar-view'),

    # The following are API calls
    path('', calendarListView.as_view(), name='calendar-list'),
    path('<int:calendar_id>/status/', CalendarStatus.as_view(), name='calendar-status'),
    path('<int:calendar_id>/meetings/', MeetingStatus.as_view(), name='meeting-status'),
    path('<int:calendar_id>/invitees/', InviteeStatus.as_view(), name='invitee-status'),
    path('<int:calendar_id>/availabilities/', AvailabilityStatus.as_view(), name='availability-status'),
]
