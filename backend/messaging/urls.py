from django.urls import path

from . import views

urlpatterns = [
    path("", views.ConversationListView.as_view(), name="conversations"),
    path("start/", views.StartConversationView.as_view(), name="start-conversation"),
    path("<uuid:pk>/messages/", views.MessageListView.as_view(), name="messages"),
    path("<uuid:pk>/read/", views.MarkConversationReadView.as_view(), name="mark-read"),
]
