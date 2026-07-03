from rest_framework import serializers

from accounts.serializers import PublicUserSerializer
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    actor = PublicUserSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ["id", "actor", "verb", "tweet_id", "is_read", "created_at"]
