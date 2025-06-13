from rest_framework import serializers
from .models import Lesson, Track, Library, Song


class TrackForNestingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Track
        fields = ("id","name", "language", "description")


class LibraryForNestingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Library
        fields = ("id","name", "description", "path")   


class LessonSerializer(serializers.ModelSerializer):
    track = TrackForNestingSerializer()
    library = LibraryForNestingSerializer()

    class Meta:
        model = Lesson
        fields = ("id","time", "track", "bell", "library")

    def create(self, validated_data):
        track_data = validated_data.pop('track')
        library_data = validated_data.pop('library')
        
        track, created = Track.objects.get_or_create(**track_data)
        library, created = Library.objects.get_or_create(**library_data)
        
        lesson = Lesson.objects.create(track=track, library=library, **validated_data)
        return lesson

    def update(self, instance, validated_data):
        track_data = validated_data.pop('track', None)
        library_data = validated_data.pop('library', None)  

        track, created = Track.objects.get_or_create(**track_data)
        library, created = Library.objects.get_or_create(**library_data)

        lesson = Lesson.objects.update_or_create(
            id=instance.id,
            defaults={
                'time': validated_data.get('time', instance.time),
                'bell': validated_data.get('bell', instance.bell),
                'track': track,
                'library': library
            }
        )[0]
        return lesson

        
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['track'] = TrackForNestingSerializer(instance.track).data
        representation['library'] = LibraryForNestingSerializer(instance.library).data
        return representation

class TrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Track
        fields = ("id", "name", "language", "description", "media")

class LibrarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Library
        fields = ("id","name", "description", "path")

class SongSerializer(serializers.ModelSerializer):
    class Meta:
        model = Song
        fields = ("id","library","media")
