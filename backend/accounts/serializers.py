from django.contrib.auth import authenticate, password_validation
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import Follow, User


class PublicUserSerializer(serializers.ModelSerializer):
    name = serializers.ReadOnlyField()
    follower_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    followed_by = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    banner = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "name", "display_name", "bio", "location",
            "website", "avatar", "banner", "is_verified", "created_at",
            "follower_count", "following_count", "is_following", "followed_by",
        ]

    def get_avatar(self, obj):
        if not obj.avatar:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url

    def get_banner(self, obj):
        if not obj.banner:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.banner.url) if request else obj.banner.url

    def get_follower_count(self, obj):
        return obj.follower_count()

    def get_following_count(self, obj):
        return obj.following_count()

    def get_is_following(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return Follow.objects.filter(follower=request.user, following=obj).exists()

    def get_followed_by(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return Follow.objects.filter(follower=obj, following=request.user).exists()


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["display_name", "bio", "location", "website", "avatar", "banner"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["username", "email", "password", "display_name"]

    def validate_username(self, value):
        value = value.strip().lower()
        if not value.replace("_", "").isalnum():
            raise serializers.ValidationError(
                "Handles use letters, numbers, and underscores only."
            )
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("That handle is already taken.")
        return value

    def validate_password(self, value):
        try:
            password_validation.validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            username=attrs["username"].strip().lower(), password=attrs["password"]
        )
        if not user:
            raise serializers.ValidationError("Those credentials don't match.")
        attrs["user"] = user
        return attrs
