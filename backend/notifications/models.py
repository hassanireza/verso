import uuid

from django.conf import settings
from django.db import models


class Notification(models.Model):
    VERB_CHOICES = [
        ("follow", "follow"),
        ("like", "like"),
        ("reply", "reply"),
        ("repost", "repost"),
        ("mention", "mention"),
        ("message", "message"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="notifications", on_delete=models.CASCADE
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="+", on_delete=models.CASCADE
    )
    verb = models.CharField(max_length=16, choices=VERB_CHOICES)
    tweet_id = models.UUIDField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.actor} {self.verb} -> {self.recipient}"
