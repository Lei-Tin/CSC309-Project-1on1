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

from calendars.views import calendarListView, createCalendarView, calendarView

urlpatterns = [
    path('list/', calendarListView.as_view(), name='calendar-list'),
    path('create/', createCalendarView.as_view(), name='calendar-create'),
    path('<int:calendar_id>/', calendarView.as_view(), name='calendar-view'),
]
