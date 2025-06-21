from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from bell_scheduler.models import Lesson, Track, Library, Song, Config
from bell_scheduler.serializers import LessonSerializer, TrackSerializer, LibrarySerializer, SongSerializer, ConfigSerializer
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
#from django_filters.rest_framework import DjangoFilterBackend



class LessonProtectedViewSet(viewsets.ModelViewSet):
    """
    A viewset that requires login to access.
    """
    ##@method_decorator(login_required)
    #def dispatch(self, *args, **kwargs):
    #    return super().dispatch(*args, **kwargs)
    
    permission_classes=[IsAuthenticatedOrReadOnly]
    serializer_class = LessonSerializer
    queryset = Lesson.objects.all().order_by('time')

    
class TrackProtectedViewSet(viewsets.ModelViewSet):
    """
    A viewset that requires login to access.
    """
    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    serializer_class = TrackSerializer  # Assuming you have a TrackSerializer
    queryset = Track.objects.filter(bell=False)  # Assuming you have a Track model
    


class LibraryProtectedViewSet(viewsets.ModelViewSet):
    """
    A viewset that requires login to access.
    """
    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    serializer_class = LibrarySerializer  # Assuming you have a LibrarySerializer
    queryset = Library.objects.all()  # Assuming you have a Library model

class SongProtectedViewSet(viewsets.ModelViewSet):
    
    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    serializer_class = SongSerializer  # Assuming you have a LibrarySerializer
    queryset = Song.objects.all()  # Assuming you have a Library model

class ConfigProtectedViewSet(viewsets.ModelViewSet):

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    serializer_class = ConfigSerializer  # Assuming you have a LibrarySerializer
    queryset = Config.objects.all()  # Assuming you have a Library model
