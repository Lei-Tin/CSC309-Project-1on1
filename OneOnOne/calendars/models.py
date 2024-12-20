from django.db import models
from rest_framework import serializers


# Create your models here.
class Calendar(models.Model):
    """
    Owner (user) - stores the user id of the user that created the calendar
    Name (char) - the name of the calendar
    Start_date (Date) - the starting date of the calendar
    End_date (Date) - the ending date of the calendar
    Finalized (bool) - whether or not the schedule for the calendar is finalized
    """
    owner = models.ForeignKey("auth.user", on_delete=models.CASCADE)
    name = models.CharField(max_length=50, blank=False, null=False)
    start_date = models.DateField(blank=False, null=False)
    end_date = models.DateField(blank=False, null=False)
    finalized = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class Availability(models.Model):
    """
    Calendar (Calendar) - a foreign key of the calendar table
    User (user) - a foreign key of the user table
    Start_period (DateTime) - a starting date and time within the calendar
    End_period (DateTime) - an ending date and time within the calendar
    Preference (int) - a level specifying the users willingness to meet at a time (default medium preference)
    """
    PREFERENCE_LEVELS = [
        (1, 'Not preferred'),
        (2, 'Preferred'),
        (3, 'Highly preferred')]
    calendar = models.ForeignKey(Calendar, on_delete=models.CASCADE)
    user = models.ForeignKey("auth.user", on_delete=models.CASCADE)
    start_period = models.DateTimeField(blank=False, null=False)
    end_period = models.DateTimeField(blank=False, null=False)
    preference = models.IntegerField(choices=PREFERENCE_LEVELS, default=2)

    def __str__(self):
        return f"{self.user} - {self.start_period} to {self.end_period}"


class Invitee(models.Model):
    """
    Calendar (Calendar) - a foreign key of the calendar table
    Invitee (user) - a foreign key of the user table, users that are invited to the calendar by the owner
    """
    # Note, we need to enforce that the invitee is in the contacts list of the calendar owner in python (not in models)
    calendar = models.ForeignKey(Calendar, on_delete=models.CASCADE)
    invitee = models.ForeignKey("auth.user", on_delete=models.CASCADE)

    # We denote an invitee as accepted if they have provided at least one availability

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['calendar', 'invitee'], name='invitation')
        ]

    def __str__(self):
        return f"{self.invitee} - {self.calendar}"


class Meets(models.Model):
    """
    Calendar (Calendar) - a foreign key of the calendar table
    Meeter (user) - a foreign key of the user table, users that are assigned to meet the owner
    Start_period (DateTime) - the date and time start for the meeting to occur
    End_period (DateTime) - the date and time end for the meeting
    """
    calendar = models.ForeignKey(Calendar, on_delete=models.CASCADE)
    meeter = models.ForeignKey("auth.user", on_delete=models.CASCADE)
    start_period = models.DateTimeField(blank=False, null=False)
    end_period = models.DateTimeField(blank=False, null=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['calendar', 'meeter'], name='meeting')
            # Should there be added constraint for meeter and start_period so that the same person cannot be
            # suggested to meet two people at the same time
        ]

    def __str__(self):
        return f"{self.meeter} - {self.calendar}"
