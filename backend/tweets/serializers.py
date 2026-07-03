from rest_framework import serializers

from accounts.serializers import PublicUserSerializer
from .models import TWEET_MAX_LENGTH, Like, Tweet


class TweetSerializer(serializers.ModelSerializer):
    author = PublicUserSerializer(read_only=True)
    like_count = serializers.SerializerMethodField()
    reply_count = serializers.SerializerMethodField()
    repost_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_reposted = serializers.SerializerMethodField()
    hashtags = serializers.SlugRelatedField(
        slug_field="name", many=True, read_only=True
    )
    repost_of = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Tweet
        fields = [
            "id", "author", "content", "image", "parent", "repost_of",
            "hashtags", "created_at", "like_count", "reply_count",
            "repost_count", "is_liked", "is_reposted",
        ]
        read_only_fields = ["id", "created_at"]

    def get_image(self, obj):
        if not obj.image:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.image.url) if request else obj.image.url

    def get_like_count(self, obj):
        return obj.like_count()

    def get_reply_count(self, obj):
        return obj.reply_count()

    def get_repost_count(self, obj):
        return obj.repost_count()

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.likes.filter(user=request.user).exists()

    def get_is_reposted(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.reposts.filter(author=request.user).exists()

    def get_repost_of(self, obj):
        if not obj.repost_of:
            return None
        return TweetMiniSerializer(obj.repost_of, context=self.context).data


class TweetMiniSerializer(serializers.ModelSerializer):
    """A shallow serializer to avoid infinite recursion on reposts."""

    author = PublicUserSerializer(read_only=True)
    like_count = serializers.SerializerMethodField()
    reply_count = serializers.SerializerMethodField()
    repost_count = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Tweet
        fields = [
            "id", "author", "content", "image", "created_at",
            "like_count", "reply_count", "repost_count",
        ]

    def get_image(self, obj):
        if not obj.image:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.image.url) if request else obj.image.url

    def get_like_count(self, obj):
        return obj.like_count()

    def get_reply_count(self, obj):
        return obj.reply_count()

    def get_repost_count(self, obj):
        return obj.repost_count()


class CreateTweetSerializer(serializers.ModelSerializer):
    content = serializers.CharField(max_length=TWEET_MAX_LENGTH, allow_blank=True)

    class Meta:
        model = Tweet
        fields = ["content", "image", "parent"]

    def validate(self, attrs):
        content = attrs.get("content", "").strip()
        image = attrs.get("image")
        if not content and not image:
            raise serializers.ValidationError("Say something, or attach an image.")
        attrs["content"] = content
        return attrs
