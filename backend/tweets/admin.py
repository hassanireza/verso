from django.contrib import admin

from .models import Hashtag, Like, Tweet

admin.site.register(Tweet)
admin.site.register(Like)
admin.site.register(Hashtag)
