# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('controlPanel', '0003_output_output_server'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Port',
        ),
    ]
