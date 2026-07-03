from rest_framework import serializers

from accounts.serializers import PublicUserSerializer
from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    sender = PublicUserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ["id", "conversation", "sender", "body", "created_at", "read_at"]
        read_only_fields = ["id", "sender", "created_at", "read_at", "conversation"]


class ConversationSerializer(serializers.ModelSerializer):
    other_participant = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ["id", "other_participant", "last_message", "unread_count", "updated_at"]

    def get_other_participant(self, obj):
        request = self.context.get("request")
        other = obj.other_participant(request.user)
        if not other:
            return None
        return PublicUserSerializer(other, context=self.context).data

    def get_last_message(self, obj):
        last = obj.messages.order_by("-created_at").first()
        if not last:
            return None
        return MessageSerializer(last).data

    def get_unread_count(self, obj):
        request = self.context.get("request")
        return obj.messages.filter(read_at__isnull=True).exclude(
            sender=request.user
        ).count()
