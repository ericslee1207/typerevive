# Generated by Django 4.2.1 on 2023-05-25 16:29

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("typerevive", "0002_textbox_index"),
    ]

    operations = [
        migrations.AddField(
            model_name="textbox",
            name="url",
            field=models.URLField(default="https://www.youtube.com/"),
            preserve_default=False,
        ),
    ]
