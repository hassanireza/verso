import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Avatar } from "../components/Avatar";
import { Icon } from "../components/Icon";
import { TweetCard } from "../components/TweetCard";
import { EmptyState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";
import { EditProfileModal } from "../components/EditProfileModal";
import { useAuth } from "../context/AuthContext";
import {
  fetchUser,
  fetchUserTweets,
  fetchUserReplies,
  fetchUserLikes,
  toggleFollow,
  startConversation,
} from "../api/endpoints";
import { useNavigate } from "react-router-dom";

type Tab = "verses" | "replies" | "likes";

export function Profile() {
  const { username = "" } = useParams();
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("verses");
  const [editing, setEditing] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", username],
    queryFn: () => fetchUser(username),
  });

  const { data: tweets, isLoading: tweetsLoading } = useQuery({
    queryKey: ["user-tweets", username, tab],
    queryFn: () => {
      if (tab === "replies") return fetchUserReplies(username);
      if (tab === "likes") return fetchUserLikes(username);
      return fetchUserTweets(username);
    },
    enabled: !!user,
  });

  const followMutation = useMutation({
    mutationFn: () => toggleFollow(username),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user", username] }),
  });

  const messageMutation = useMutation({
    mutationFn: () => startConversation(username),
    onSuccess: (conversation) => navigate(`/messages/${conversation.id}`),
  });

  if (isLoading) return <div className="column"><Spinner /></div>;
  if (!user) return <div className="column"><EmptyState title="No one here" body="That handle isn't on Verso." /></div>;

  const isMe = me?.username === user.username;
  const filtered = tweets?.results ?? [];

  return (
    <div className="column">
      <header className="column__header column__header--profile">
        <button className="icon-btn" onClick={() => history.back()} aria-label="Back">
          <Icon name="back" size={20} />
        </button>
        <div>
          <h1>{user.name}</h1>
          <span className="column__subtitle">{user.follower_count} followers</span>
        </div>
      </header>

      <div className="profile-banner" style={user.banner ? { backgroundImage: `url(${user.banner})` } : undefined} />

      <div className="profile-head">
        <Avatar src={user.avatar} name={user.name} size={92} ring />
        <div className="profile-head__actions">
          {isMe ? (
            <button className="btn btn--ghost" onClick={() => setEditing(true)}>Edit profile</button>
          ) : (
            <>
              <button className="icon-btn icon-btn--bordered" onClick={() => messageMutation.mutate()} aria-label="Message">
                <Icon name="mail" size={18} />
              </button>
              <button
                className={`btn ${user.is_following ? "btn--ghost" : "btn--primary"}`}
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
              >
                {user.is_following ? "Following" : user.followed_by ? "Follow back" : "Follow"}
              </button>
            </>
          )}
        </div>

        <div className="profile-head__identity">
          <h2>{user.name}</h2>
          <span className="profile-head__handle">@{user.username}</span>
        </div>

        {user.bio && <p className="profile-head__bio">{user.bio}</p>}

        <div className="profile-head__meta">
          {user.location && (
            <span><Icon name="explore" size={14} /> {user.location}</span>
          )}
          <span>Joined {format(new Date(user.created_at), "MMMM yyyy")}</span>
        </div>

        <div className="profile-head__stats">
          <span><strong>{user.following_count}</strong> Following</span>
          <span><strong>{user.follower_count}</strong> Followers</span>
        </div>
      </div>

      <div className="tabs">
        {(["verses", "replies", "likes"] as Tab[]).map((t) => (
          <button
            key={t}
            className={`tabs__item ${tab === t ? "tabs__item--active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "verses" ? "Verses" : t === "replies" ? "Replies" : "Liked"}
          </button>
        ))}
      </div>

      {tweetsLoading && <Spinner />}
      {!tweetsLoading && !filtered.length && (
        <EmptyState
          title={tab === "verses" ? "No verses yet" : tab === "replies" ? "No replies yet" : "Nothing liked yet"}
          body={isMe ? "Whatever you post will appear here." : `${user.name} hasn't posted here yet.`}
        />
      )}
      <div className="tweet-list">
        {filtered.map((t) => (
          <TweetCard key={t.id} tweet={t} invalidateKeys={[["user-tweets", username, tab]]} />
        ))}
      </div>

      {editing && <EditProfileModal user={user} onClose={() => setEditing(false)} />}
    </div>
  );
}
