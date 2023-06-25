from django.db import models
from datetime import date


# Create your models here.
class website(models.Model):
    url = models.CharField()
    status = models.BooleanField(default=False)
    pcid = models.UUIDField()


class textbox(models.Model):
    website = models.ForeignKey(
        website, on_delete=models.CASCADE
    )  # many to one : website can have many textboxes
    index = models.IntegerField()
    content = models.TextField()
    pcid = models.UUIDField()
    doa = models.DateField(default=date.today)
