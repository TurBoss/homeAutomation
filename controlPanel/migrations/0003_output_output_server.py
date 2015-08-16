# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('controlPanel', '0002_port'),
    ]

    operations = [
        migrations.AddField(
            model_name='output',
            name='output_server',
            field=models.CharField(default='192.168.8.21:1337', max_length=200),
            preserve_default=False,
        ),
    ]
