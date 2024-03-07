from django.db import models


# Create your models here.
class ContactList(models.Model):
    owner = models.OneToOneField("auth.user", on_delete=models.CASCADE)


class Contains(models.Model):
    member = models.ManyToManyField("auth.user", on_delete=models.CASCADE, related_name='member_of')
    contact_list = models.ForeignKey(ContactList, on_delete=models.CASCADE)
    accepted = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['contact_list', 'member'], name='membership')
        ]
