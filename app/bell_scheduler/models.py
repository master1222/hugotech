from django.db import models
from django.conf import settings
import os


class Track(models.Model):
    ##id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=5, null=True)
    description = models.CharField(max_length=150)
    media = models.FileField(null=True,upload_to="tracks")
    bell = models.BooleanField()
    #file_path = models.FilePathField()

    def __str__(self):
        return self.name

def library_path():
    return os.path.join(settings.MEDIA_ROOT, "libraries")

class Library(models.Model):
    ##id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=5)
    description = models.CharField(max_length=30, null=True)
    path = models.FilePathField(path=os.path.join(settings.MEDIA_ROOT, "libraries"), allow_files=False, allow_folders=True, null=True)

    def __str__(self):
        return self.name if self.name else "Test"


class Lesson(models.Model):
    ##id = models.AutoField(primary_key=True)
    time = models.TimeField(null=False)
    track = models.ForeignKey(Track, on_delete=models.CASCADE, null=True)
    bell = models.BooleanField()
    library = models.ForeignKey(Library, on_delete=models.CASCADE, null=True)

class Song(models.Model):
    library = models.ForeignKey(Library, on_delete=models.CASCADE, null=False)
    media = models.FileField(null=True,upload_to="libraries")


