import re

from django.db.models.signals import post_save
from django.dispatch import receiver

from accounts.models import User
from notifications.utils import notify
from .models import Tweet

MENTION_RE = re.compile(r"(?<!\w)@(\w{1,32})")


@receiver(post_save, sender=Tweet)
def notify_on_tweet(sender, instance, created, **kwargs):
    if not created:
        return
    if instance.parent and instance.parent.author != instance.author:
        notify(
            recipient=instance.parent.author,
            actor=instance.author,
            verb="reply",
            target=instance,
        )
    for handle in {h.lower() for h in MENTION_RE.findall(instance.content)}:
        mentioned = User.objects.filter(username__iexact=handle).first()
        if mentioned and mentioned != instance.author:
            notify(recipient=mentioned, actor=instance.author, verb="mention", target=instance)
