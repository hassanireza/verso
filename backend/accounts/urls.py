from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", views.MeView.as_view(), name="me"),
    path("search/", views.UserSearchView.as_view(), name="user-search"),
    path("<str:username>/", views.UserDetailView.as_view(), name="user-detail"),
    path("<str:username>/follow/", views.ToggleFollowView.as_view(), name="toggle-follow"),
    path("<str:username>/followers/", views.FollowersListView.as_view(), name="followers"),
    path("<str:username>/following/", views.FollowingListView.as_view(), name="following"),
]
