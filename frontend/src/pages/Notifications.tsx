import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar } from "../components/Avatar";
import { Icon } from "../components/Icon";
import { EmptyState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";
import { fetchNotifications, markNotificationsRead } from "../api/endpoints";
import type { AppNotification } from "../types";

const VERB_COPY: Record<AppNotification["verb"], string> = {
  follow: "started following you",
  like: "liked your verse",
  reply: "replied to your verse",
  repost: "restamped your verse",
  mention: "mentioned you in a verse",
  message: "sent you a message",
};

const VERB_ICON: Record<AppNotification["verb"], "heart-fill" | "reply" | "repost" | "user" | "mail"> = {
  follow: "user",
  like: "heart-fill",
  reply: "reply",
  repost: "repost",
  mention: "reply",
  message: "mail",
};

export function Notifications() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  useEffect(() => {
    markNotificationsRead().then(() => qc.invalidateQueries({ queryKey: ["unread-count"] }));
  }, [qc]);

  const items: AppNotification[] = Array.isArray(data) ? data : data?.results ?? [];

  return (
    <div className="column">
      <header className="column__header">
        <h1>Notifications</h1>
      </header>
      {isLoading && <Spinner />}
      {!isLoading && !items.length && (
        <EmptyState title="All quiet" body="Likes, follows, and replies will land here." />
      )}
      <ul className="notif-list">
        {items.map((n) => {
          const linkTo = n.verb === "follow" ? `/${n.actor.username}` : n.tweet_id ? `/verse/${n.tweet_id}` : `/${n.actor.username}`;
          return (
            <li key={n.id}>
              <Link to={linkTo} className={`notif-row ${!n.is_read ? "notif-row--unread" : ""}`}>
                <span className={`notif-row__icon notif-row__icon--${n.verb}`}>
                  <Icon name={VERB_ICON[n.verb]} size={16} />
                </span>
                <Avatar src={n.actor.avatar} name={n.actor.name} size={40} />
                <span className="notif-row__text">
                  <strong>{n.actor.name}</strong> {VERB_COPY[n.verb]}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
