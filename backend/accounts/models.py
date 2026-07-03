import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


def avatar_upload_path(instance, filename):
    ext = filename.split(".")[-1]
    return f"avatars/{instance.id}/{uuid.uuid4().hex}.{ext}"


def banner_upload_path(instance, filename):
    ext = filename.split(".")[-1]
    return f"banners/{instance.id}/{uuid.uuid4().hex}.{ext}"


class User(AbstractUser):
    """Custom user model extended with public-profile fields."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_("email address"), unique=True)
    display_name = models.CharField(max_length=50, blank=True)
    bio = models.CharField(max_length=160, blank=True)
    location = models.CharField(max_length=64, blank=True)
    website = models.URLField(blank=True)
    birth_date = models.DateField(null=True, blank=True)
    avatar = models.ImageField(upload_to=avatar_upload_path, null=True, blank=True)
    banner = models.ImageField(upload_to=banner_upload_path, null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.username

    @property
    def name(self):
        return self.display_name or self.username

    def follower_count(self):
        return self.followers.count()

    def following_count(self):
        return self.following.count()


class Follow(models.Model):
    """follower -> following relationship (a 'thread' between two verses)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    follower = models.ForeignKey(
        User, related_name="following", on_delete=models.CASCADE
    )
    following = models.ForeignKey(
        User, related_name="followers", on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["follower", "following"], name="unique_follow"
            ),
            models.CheckConstraint(
                condition=~models.Q(follower=models.F("following")),
                name="no_self_follow",
            ),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.follower} -> {self.following}"
