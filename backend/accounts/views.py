from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from notifications.utils import notify
from .models import Follow, User
from .serializers import (
    LoginSerializer,
    PublicUserSerializer,
    RegisterSerializer,
    UpdateProfileSerializer,
)


def tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "user": PublicUserSerializer(user, context={"request": request}).data,
                "tokens": tokens_for_user(user),
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        return Response(
            {
                "user": PublicUserSerializer(user, context={"request": request}).data,
                "tokens": tokens_for_user(user),
            }
        )


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return UpdateProfileSerializer
        return PublicUserSerializer

    def get_serializer_context(self):
        return {"request": self.request}


class UserDetailView(generics.RetrieveAPIView):
    serializer_class = PublicUserSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "username"
    queryset = User.objects.all()

    def get_serializer_context(self):
        return {"request": self.request}


class UserSearchView(generics.ListAPIView):
    serializer_class = PublicUserSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        q = self.request.query_params.get("q", "").strip()
        if not q:
            return User.objects.none()
        return User.objects.filter(
            Q(username__icontains=q) | Q(display_name__icontains=q)
        )[:20]

    def get_serializer_context(self):
        return {"request": self.request}


class FollowersListView(generics.ListAPIView):
    serializer_class = PublicUserSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        username = self.kwargs["username"]
        return User.objects.filter(following__following__username=username)

    def get_serializer_context(self):
        return {"request": self.request}


class FollowingListView(generics.ListAPIView):
    serializer_class = PublicUserSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        username = self.kwargs["username"]
        return User.objects.filter(followers__follower__username=username)

    def get_serializer_context(self):
        return {"request": self.request}


class ToggleFollowView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, username):
        target = get_object_or_404(User, username=username)
        if target == request.user:
            return Response(
                {"detail": "You can't follow yourself."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        existing = Follow.objects.filter(follower=request.user, following=target)
        if existing.exists():
            existing.delete()
            following = False
        else:
            Follow.objects.create(follower=request.user, following=target)
            notify(recipient=target, actor=request.user, verb="follow", target=target)
            following = True
        return Response(
            {
                "following": following,
                "follower_count": target.follower_count(),
            }
        )
