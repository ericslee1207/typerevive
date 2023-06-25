from django.urls import path

from . import views


urlpatterns = [
    path("create/", views.textboxViewSet.createTextbox),
    path("edit/", views.textboxViewSet.editTextbox),
    path("delete/<str:url>/<str:pcid>/", views.textboxViewSet.deleteTextboxes),
    path("createweb/", views.websiteViewSet.createWebsite),
    path("getwebs/<str:pcid>/", views.websiteViewSet.getWebsites),
    path("getwebs/<str:url>/<str:pcid>/", views.websiteViewSet.getWebsite),
    path("setstatus/", views.websiteViewSet.setWebsiteStatus),
    path("<str:pcid>/", views.textboxViewSet.getTextboxes),
    path("<str:url>/<str:pcid>/", views.textboxViewSet.getTextboxesByURL),
]
