from django.contrib import admin
from bell_scheduler.models import Track, Lesson, Library, Song, Config


class LessonInline(admin.TabularInline):
    model = Lesson

class SongInline(admin.TabularInline):
    model = Song


class TrackAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "description", "media")
    inlines = [LessonInline]


class LibraryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "description","path")
    inlines = [LessonInline,SongInline]

class ConfifAdmin(admin.ModelAdmin):
    list_display = ("country","playWeekend","playHoliday","pin", "pinBeforeSeconds", "trackPlaySeconds", "bellPlaySeconds", "songPlaySeconds")


admin.site.register(Track, TrackAdmin)
admin.site.register(Library, LibraryAdmin)
admin.site.register(Lesson)
admin.site.register(Song)
admin.site.register(Config)
