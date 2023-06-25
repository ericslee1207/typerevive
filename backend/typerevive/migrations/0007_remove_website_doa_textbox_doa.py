# Generated by Django 4.2.1 on 2023-06-23 20:13

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('losslesstext', '0006_textbox_pcid_website_doa_website_pcid'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='website',
            name='doa',
        ),
        migrations.AddField(
            model_name='textbox',
            name='doa',
            field=models.DateField(default=datetime.date.today),
        ),
    ]
