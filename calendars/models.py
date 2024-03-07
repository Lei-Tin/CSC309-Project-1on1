from django.db import models


# Create your models here.
class Calendar(models.Model):
    owner = models.ForeignKey("auth.user", on_delete=models.CASCADE)
    name = models.CharField(max_length=50, blank=False, null=False)
    start_date = models.DateField(blank=False, null=False)
    end_date = models.DateField(blank=False, null=False)


class OwnerAvailability(models.Model):
    PREFERENCE_LEVELS = [
        (1, 'Not preferred'),
        (2, 'Preferred'),
        (3, 'Highly preferred')]
    calendar = models.ForeignKey(Calendar, on_delete=models.CASCADE)
    start_period = models.DateTimeField(blank=False, null=False)
    end_period = models.DateTimeField(blank=False, null=False)
    preference = models.IntegerField(choices=PREFERENCE_LEVELS, default=2)


class Schedule(models.Model):
    calendar = models.OneToOneField(Calendar, on_delete=models.CASCADE)


class InviteeAvailability(models.Model):
    PREFERENCE_LEVELS = [
        (1, 'Not preferred'),
        (2, 'Preferred'),
        (3, 'Highly preferred')]
    start_period = models.DateTimeField(blank=False, null=False)
    end_period = models.DateTimeField(blank=False, null=False)
    preference = models.IntegerField(choices=PREFERENCE_LEVELS, default=2)


class Invitee(models.Model):
    # Note, we need to enforce that the invitee is in the contacts list of the calendar owner in python (not in models)
    calendar = models.ForeignKey(Calendar, on_delete=models.CASCADE)
    invitee = models.ForeignKey("auth.user", on_delete=models.CASCADE)
    deadline = models.DateTimeField(blank=False, null=False)
    # If availability is null, that means the invitee has not accepted the invitation yet
    availability = models.OneToOneField(InviteeAvailability, on_delete=models.CASCADE, null=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['calendar', 'invitee'])
        ]


class Meets(models.Model):
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE)
    accepted = models.ForeignKey("auth.user", on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['schedule', 'accepted'])
        ]
