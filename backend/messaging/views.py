from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from notifications.utils import notify
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


class ConversationListView(generics.ListAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user)

    def get_serializer_context(self):
        return {"request": self.request}


class StartConversationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        username = request.data.get("username")
        target = get_object_or_404(User, username=username)
        if target == request.user:
            return Response(
                {"detail": "You can't message yourself."}, status=status.HTTP_400_BAD_REQUEST
            )
        convo = Conversation.between(request.user, target)
        return Response(
            ConversationSerializer(convo, context={"request": request}).data
        )


class MessageListView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_conversation(self):
        return get_object_or_404(
            Conversation, pk=self.kwargs["pk"], participants=self.request.user
        )

    def get_queryset(self):
        return self.get_conversation().messages.select_related("sender")

    def perform_create(self, serializer):
        convo = self.get_conversation()
        message = serializer.save(conversation=convo, sender=self.request.user)
        convo.save()  # bump updated_at
        other = convo.other_participant(self.request.user)
        if other:
            notify(recipient=other, actor=self.request.user, verb="message")


class MarkConversationReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        convo = get_object_or_404(Conversation, pk=pk, participants=request.user)
        convo.messages.filter(read_at__isnull=True).exclude(sender=request.user).update(
            read_at=timezone.now()
        )
        return Response({"ok": True})
