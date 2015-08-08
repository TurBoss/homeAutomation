from __future__ import unicode_literals

from django.db import models

# Create your models here.

class Output(models.Model):

    output_name = models.CharField(max_length=200)
    output_state = models.IntegerField(default=0)
