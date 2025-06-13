from django.urls import path, include
from bell_scheduler import views
from bell_scheduler.models import Lesson
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r"lessons", views.LessonProtectedViewSet, basename="lesson")
router.register(r"tracks", views.TrackProtectedViewSet, basename="track")
router.register(r"libraries", views.LibraryProtectedViewSet, basename="library")
router.register(r"songs",views.SongProtectedViewSet, basename="song")

urlpatterns = [
    path("api/v1/", include(router.urls)),      
]