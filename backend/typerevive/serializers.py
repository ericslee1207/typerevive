from . import models
from rest_framework import serializers


class textboxSerializer(serializers.ModelSerializer):
    content = serializers.CharField(required=True)
    index = serializers.IntegerField(required=True)
    website = serializers.PrimaryKeyRelatedField(queryset=models.website.objects.all())
    pcid = serializers.UUIDField(required=True)
    doa = serializers.DateField(required=True)

    class Meta:
        model = models.textbox
        fields = ("content", "index", "website", "pcid", "doa")


class websiteSerializer(serializers.ModelSerializer):
    url = serializers.CharField(required=True)
    status = serializers.BooleanField(required=True)
    pcid = serializers.CharField(required=True)

    class Meta:
        model = models.website
        fields = ("url", "status", "pcid")
