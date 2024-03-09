from django.contrib import admin

from .models import Calendar, Meets, Invitee, Availability

# Register your models here.
admin.site.register(Calendar)
admin.site.register(Meets)
admin.site.register(Invitee)
admin.site.register(Availability)