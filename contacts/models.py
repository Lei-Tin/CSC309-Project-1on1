from django.db import models


# Create your models here.
class Contacts(models.Model):
    """
    Requester (user) - foreign key of user, user wants to request another user
    Requested (user) - foreign key of user, the user that the requester wants to add to their contacts
    Accepted (bool) - a boolean for whether the requested user accepts to add the requester to their contacts
    """
    requester = models.OneToOneField("auth.user", on_delete=models.CASCADE)
    requested = models.OneToOneField("auth.user", on_delete=models.CASCADE)
    accepted = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['requester', 'requested'], name='membership')
        ]
