from django.urls import path

from . import views

urlpatterns = [
    path("", views.NotificationListView.as_view(), name="notifications"),
    path("mark-read/", views.MarkReadView.as_view(), name="notifications-mark-read"),
    path("unread-count/", views.UnreadCountView.as_view(), name="notifications-unread-count"),
]
