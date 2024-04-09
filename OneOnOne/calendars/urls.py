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
from django.urls import path

from .views import *

app_name = 'calendars'

calendar_list = CalendarViewSet.as_view({
    'post': 'create'
})
calendar_detail = CalendarViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'delete': 'destroy'
})
calendar_finalize = CalendarViewSet.as_view({
    'put': 'finalize'
})
owned_calendars = CalendarViewSet.as_view({
    'get': 'owned_calendars'
})
owned_calendars_unfinalized = CalendarViewSet.as_view({
    'get': 'owned_calendars_unfinalized'
})
invited_calendars = CalendarViewSet.as_view({
    'get': 'invited_calendars'
})
status = CalendarViewSet.as_view({
    'get': 'status'
})
send_email = CalendarViewSet.as_view({
    'post': 'send_email'
})
send_non_schedule_email = CalendarViewSet.as_view({
    'post': 'send_non_schedule_email'
})
invitee_list = InviteeViewSet.as_view({
    'get': 'list',
    'post': 'create',
})
invitee_detail = InviteeViewSet.as_view({
    'get': 'retrieve',
})
invitee_not = InviteeViewSet.as_view({
    'get': 'uninvited'
})
remove_invitation = InviteeViewSet.as_view({
    'delete': 'remove_invitation'
})

availability_list = AvailabilityViewSet.as_view({
    'get': 'list',
    'post': 'create',
})
availability_detail = AvailabilityViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
})
availability_delete = AvailabilityViewSet.as_view({
    'delete': 'bulk_delete'
})

schedule_ops = ScheduleViewSet.as_view({
    'get': 'list',
    'post': 'create',
    'delete': 'destroy'
})

schedule_detail = ScheduleViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'delete': 'destroy'
})


urlpatterns = [
    # The following are API calls
    path('', calendar_list, name='calendar-list'),
    path('<int:pk>', calendar_detail, name='calendar-detail'),
    path('<int:pk>/finalize/', calendar_finalize, name='finalize'),
    path('<int:pk>/email/<str:username>/', send_email, name='send-email'),
    path('<int:pk>/email/', send_non_schedule_email, name='send-email'),
    path('owned', owned_calendars, name='owned-calendars'),
    path('owned/unfinalized', owned_calendars_unfinalized, name='unfinalized-calendars'),
    path('invited', invited_calendars, name='invited-calendars'),
    path('status', status, name='status'),
    path('<int:calendar_id>/invitee/', invitee_list, name='invitee-list'),
    path('<int:calendar_id>/invitee/remove-invitation', remove_invitation, name='remove-invitation'),
    path('<int:calendar_id>/invitee/uninvited', invitee_not, name='uninvited'),
    path('<int:calendar_id>/invitee/<int:pk>', invitee_detail, name='invitee-detail'),
    path('<int:calendar_id>/availabilities/', availability_list, name='availability-list'),
    path('<int:calendar_id>/availabilities/bulk-delete/', availability_delete, name='availability-delete'),
    path('<int:calendar_id>/availabilities/<int:pk>/', availability_detail, name='availability-detail'),
    path('<int:calendar_id>/schedule/', schedule_ops, name='schedule-ops'),
    path('<int:calendar_id>/schedule/<int:pk>/', schedule_detail, name='schedule-detail'),
]
