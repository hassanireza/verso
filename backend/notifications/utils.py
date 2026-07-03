from .models import Notification


def notify(*, recipient, actor, verb, target=None):
    if recipient == actor:
        return None
    tweet_id = None
    if target is not None and hasattr(target, "content"):
        tweet_id = target.id
    return Notification.objects.create(
        recipient=recipient, actor=actor, verb=verb, tweet_id=tweet_id
    )
