from django.urls import path

from . import views

urlpatterns = [
    path("feed/", views.FeedView.as_view(), name="feed"),
    path("explore/", views.ExploreView.as_view(), name="explore"),
    path("search/", views.SearchTweetsView.as_view(), name="tweet-search"),
    path("trending/", views.TrendingHashtagsView.as_view(), name="trending"),
    path("hashtag/<str:tag>/", views.HashtagTweetsView.as_view(), name="hashtag"),
    path("user/<str:username>/", views.UserTweetsView.as_view(), name="user-tweets"),
    path("user/<str:username>/replies/", views.UserRepliesView.as_view(), name="user-replies"),
    path("user/<str:username>/likes/", views.UserLikesView.as_view(), name="user-likes"),
    path("<uuid:pk>/", views.TweetDetailView.as_view(), name="tweet-detail"),
    path("<uuid:pk>/replies/", views.RepliesView.as_view(), name="tweet-replies"),
    path("<uuid:pk>/like/", views.ToggleLikeView.as_view(), name="tweet-like"),
    path("<uuid:pk>/repost/", views.ToggleRepostView.as_view(), name="tweet-repost"),
]
