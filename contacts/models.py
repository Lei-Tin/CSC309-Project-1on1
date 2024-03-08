from django.db import models


# Create your models here.
class Contacts(models.Model):
    requester = models.OneToOneField("auth.user", on_delete=models.CASCADE)
    requested = models.OneToOneField("auth.user", on_delete=models.CASCADE)
    accepted = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['requester', 'requested'], name='membership')
        ]
