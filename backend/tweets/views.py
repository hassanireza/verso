from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.pagination import CursorPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import Follow
from notifications.utils import notify
from .models import Hashtag, Like, Tweet
from .serializers import CreateTweetSerializer, TweetSerializer


class TweetCursorPagination(CursorPagination):
    page_size = 20
    ordering = "-created_at"


class FeedView(generics.ListCreateAPIView):
    pagination_class = TweetCursorPagination
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        base = Tweet.objects.filter(parent__isnull=True).select_related(
            "author", "repost_of", "repost_of__author"
        )
        if user.is_authenticated:
            following_ids = Follow.objects.filter(follower=user).values_list(
                "following_id", flat=True
            )
            return base.filter(Q(author=user) | Q(author_id__in=following_ids))
        return base

    def get_serializer_class(self):
        return CreateTweetSerializer if self.request.method == "POST" else TweetSerializer

    def get_serializer_context(self):
        return {"request": self.request}

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class ExploreView(generics.ListAPIView):
    serializer_class = TweetSerializer
    pagination_class = TweetCursorPagination
    permission_classes = [permissions.AllowAny]
    queryset = Tweet.objects.filter(parent__isnull=True).select_related(
        "author", "repost_of", "repost_of__author"
    )

    def get_serializer_context(self):
        return {"request": self.request}


class UserTweetsView(generics.ListAPIView):
    serializer_class = TweetSerializer
    pagination_class = TweetCursorPagination
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Tweet.objects.filter(
            author__username=self.kwargs["username"], parent__isnull=True
        ).select_related("author", "repost_of", "repost_of__author")

    def get_serializer_context(self):
        return {"request": self.request}


class UserRepliesView(generics.ListAPIView):
    serializer_class = TweetSerializer
    pagination_class = TweetCursorPagination
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Tweet.objects.filter(
            author__username=self.kwargs["username"], parent__isnull=False
        ).select_related("author", "parent", "parent__author")

    def get_serializer_context(self):
        return {"request": self.request}


class UserLikesView(generics.ListAPIView):
    serializer_class = TweetSerializer
    pagination_class = TweetCursorPagination
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Tweet.objects.filter(
            likes__user__username=self.kwargs["username"]
        ).select_related("author", "repost_of", "repost_of__author").order_by("-likes__created_at")

    def get_serializer_context(self):
        return {"request": self.request}


class TweetDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = TweetSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    queryset = Tweet.objects.all()

    def get_serializer_context(self):
        return {"request": self.request}

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            raise permissions.PermissionDenied("You can only delete your own tweets.")
        instance.delete()


class RepliesView(generics.ListAPIView):
    serializer_class = TweetSerializer
    pagination_class = TweetCursorPagination
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Tweet.objects.filter(parent_id=self.kwargs["pk"]).select_related(
            "author", "repost_of", "repost_of__author"
        )

    def get_serializer_context(self):
        return {"request": self.request}


class ToggleLikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        tweet = get_object_or_404(Tweet, pk=pk)
        existing = Like.objects.filter(user=request.user, tweet=tweet)
        if existing.exists():
            existing.delete()
            liked = False
        else:
            Like.objects.create(user=request.user, tweet=tweet)
            if tweet.author != request.user:
                notify(recipient=tweet.author, actor=request.user, verb="like", target=tweet)
            liked = True
        return Response({"liked": liked, "like_count": tweet.like_count()})


class ToggleRepostView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        original = Tweet.objects.get(pk=pk)
        existing = Tweet.objects.filter(author=request.user, repost_of=original)
        if existing.exists():
            existing.delete()
            reposted = False
        else:
            Tweet.objects.create(author=request.user, content="", repost_of=original)
            if original.author != request.user:
                notify(recipient=original.author, actor=request.user, verb="repost", target=original)
            reposted = True
        return Response({"reposted": reposted, "repost_count": original.repost_count()})


class HashtagTweetsView(generics.ListAPIView):
    serializer_class = TweetSerializer
    pagination_class = TweetCursorPagination
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Tweet.objects.filter(
            hashtags__name=self.kwargs["tag"].lower()
        ).select_related("author")

    def get_serializer_context(self):
        return {"request": self.request}


class TrendingHashtagsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from django.db.models import Count

        tags = (
            Hashtag.objects.annotate(count=Count("tweets"))
            .filter(count__gt=0)
            .order_by("-count")[:10]
        )
        return Response(
            [{"name": t.name, "count": t.count} for t in tags]
        )


class SearchTweetsView(generics.ListAPIView):
    serializer_class = TweetSerializer
    pagination_class = TweetCursorPagination
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        q = self.request.query_params.get("q", "").strip()
        if not q:
            return Tweet.objects.none()
        return Tweet.objects.filter(content__icontains=q).select_related("author")

    def get_serializer_context(self):
        return {"request": self.request}
