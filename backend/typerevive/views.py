from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
from rest_framework.views import APIView
from django.http import HttpResponse
from datetime import date

from .serializers import textboxSerializer, websiteSerializer
from .models import textbox, website


# Create your views here.
class textboxViewSet(APIView):
    serializer_class = textboxSerializer

    @api_view(["GET"])
    def getTextboxes(self, pcid=None):
        textboxes = textbox.objects.filter(pcid=pcid)
        serializer = textboxSerializer(textboxes, many=True)
        return Response(serializer.data)

    @api_view(["GET"])
    def getTextboxesByURL(self, url=None, pcid=None):
        print(url)
        textboxes = textbox.objects.filter(website__url=url, website__pcid=pcid)
        serializer = textboxSerializer(textboxes, many=True)
        return Response(serializer.data)

    @api_view(["POST"])
    def createTextbox(request, pk=None):
        url = request.data["url"]
        index = request.data["index"]
        content = request.data["content"]
        pcid = request.data["pcid"]

        web = website.objects.filter(url=url, pcid=pcid).first()
        if web == None:
            print("here")
            webSerializer = websiteSerializer(
                data={"url": url, "status": False, "pcid": pcid}
            )
            if webSerializer.is_valid():
                print("here3")
                webSerializer.save()
                web = website.objects.filter(url=url, pcid=pcid).first()
        print("here2")
        data = {
            "website": web.pk,
            "content": content,
            "index": index,
            "pcid": pcid,
            "doa": date.today(),
        }

        serializer = textboxSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @api_view(["PUT"])
    def editTextbox(request, pk=None):
        tb = textbox.objects.filter(
            website__url=request.data["url"],
            index=request.data["index"],
            website__pcid=request.data["pcid"],
        ).first()
        data = {
            "content": request.data["content"],
            "index": request.data["index"],
            "pcid": request.data["pcid"],
            "doa": date.today(),
        }
        serializer = textboxSerializer(tb, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @api_view(["POST"])
    def deleteTextboxes(request, url=None, pcid=None):
        textboxes = textbox.objects.filter(website__url=url, website__pcid=pcid)
        textboxes.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class websiteViewSet(APIView):
    serializer_class = websiteSerializer

    @api_view(["GET"])
    def getWebsites(self, pcid=None):
        websites = website.objects.filter(pcid=pcid)
        serializer = websiteSerializer(websites, many=True)
        return Response(serializer.data)

    @api_view(["GET"])
    def getWebsite(self, url=None, pcid=None):
        print(url)
        curWeb = website.objects.filter(url=url, pcid=pcid)
        serializer = websiteSerializer(curWeb, many=True)
        return Response(serializer.data)

    @api_view(["POST"])
    def createWebsite(request, pk=None):
        serializer = websiteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @api_view(["PUT"])
    def setWebsiteStatus(request, pk=None):
        web = website.objects.filter(
            url=request.data["url"], pcid=request.data["pcid"]
        ).first()
        serializer = websiteSerializer(web, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
