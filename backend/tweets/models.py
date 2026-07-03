import re
import uuid

from django.conf import settings
from django.db import models

TWEET_MAX_LENGTH = 160
HASHTAG_RE = re.compile(r"(?<!\w)#(\w{1,32})")


def tweet_image_path(instance, filename):
    ext = filename.split(".")[-1]
    return f"tweets/{instance.author_id}/{uuid.uuid4().hex}.{ext}"


class Hashtag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=32, unique=True)

    def __str__(self):
        return f"#{self.name}"


class Tweet(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="tweets", on_delete=models.CASCADE
    )
    content = models.CharField(max_length=TWEET_MAX_LENGTH)
    image = models.ImageField(upload_to=tweet_image_path, null=True, blank=True)
    parent = models.ForeignKey(
        "self", null=True, blank=True, related_name="replies", on_delete=models.CASCADE
    )
    repost_of = models.ForeignKey(
        "self", null=True, blank=True, related_name="reposts", on_delete=models.CASCADE
    )
    hashtags = models.ManyToManyField(Hashtag, related_name="tweets", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["-created_at"])]

    def __str__(self):
        return f"{self.author}: {self.content[:40]}"

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new and self.content:
            tags = {t.lower() for t in HASHTAG_RE.findall(self.content)}
            if tags:
                objs = []
                for tag in tags:
                    obj, _ = Hashtag.objects.get_or_create(name=tag)
                    objs.append(obj)
                self.hashtags.set(objs)

    def like_count(self):
        return self.likes.count()

    def reply_count(self):
        return self.replies.count()

    def repost_count(self):
        return self.reposts.count()


class Like(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="likes", on_delete=models.CASCADE
    )
    tweet = models.ForeignKey(Tweet, related_name="likes", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "tweet"], name="unique_like")
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} likes {self.tweet_id}"
