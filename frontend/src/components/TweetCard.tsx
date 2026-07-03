import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import { Avatar } from "./Avatar";
import { Icon } from "./Icon";
import { useAuth } from "../context/AuthContext";
import { toggleLike, toggleRepost, deleteTweet } from "../api/endpoints";
import type { Tweet } from "../types";

function shortTime(iso: string) {
  return formatDistanceToNowStrict(new Date(iso), { addSuffix: false })
    .replace("seconds", "s")
    .replace("second", "s")
    .replace("minutes", "m")
    .replace("minute", "m")
    .replace("hours", "h")
    .replace("hour", "h")
    .replace("days", "d")
    .replace("day", "d")
    .replace("months", "mo")
    .replace("month", "mo")
    .replace("years", "y")
    .replace("year", "y")
    .replace(/\s/g, "");
}

function renderContent(content: string) {
  const parts = content.split(/(#\w+|@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("#")) {
      return (
        <Link key={i} to={`/tag/${part.slice(1).toLowerCase()}`} className="tweet__entity">
          {part}
        </Link>
      );
    }
    if (part.startsWith("@")) {
      return (
        <Link key={i} to={`/${part.slice(1)}`} className="tweet__entity">
          {part}
        </Link>
      );
    }
    return part;
  });
}

interface TweetCardProps {
  tweet: Tweet;
  invalidateKeys?: string[][];
}

export function TweetCard({ tweet, invalidateKeys }: TweetCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const invalidate = () => {
    (invalidateKeys ?? [["feed"], ["explore"]]).forEach((k) => qc.invalidateQueries({ queryKey: k }));
  };

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(tweet.id),
    onSuccess: invalidate,
  });

  const repostMutation = useMutation({
    mutationFn: () => toggleRepost(tweet.id),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTweet(tweet.id),
    onSuccess: invalidate,
  });

  const source = tweet.repost_of ?? tweet;
  const isRepost = !!tweet.repost_of;

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <article
      className="tweet"
      onClick={() => navigate(`/verse/${source.id}`)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/verse/${source.id}`)}
    >
      {isRepost && (
        <div className="tweet__repost-flag">
          <Icon name="repost" size={14} /> {tweet.author.name} restamped
        </div>
      )}
      <div className="tweet__row">
        <Avatar src={source.author.avatar} name={source.author.name} username={source.author.username} size={44} />
        <div className="tweet__main">
          <header className="tweet__head">
            <Link to={`/${source.author.username}`} className="tweet__name" onClick={stop}>
              {source.author.name}
              {source.author.is_verified && <span className="tweet__verified">&#10022;</span>}
            </Link>
            <span className="tweet__handle">@{source.author.username}</span>
            <span className="tweet__dot">&middot;</span>
            <time className="tweet__time">{shortTime(source.created_at)}</time>
            {user?.username === source.author.username && (
              <button
                className="tweet__delete"
                onClick={(e) => {
                  stop(e);
                  deleteMutation.mutate();
                }}
                aria-label="Delete verse"
              >
                <Icon name="trash" size={15} />
              </button>
            )}
          </header>
          <p className="tweet__content">{renderContent(source.content)}</p>
          {source.image && (
            <div className="tweet__image">
              <img src={source.image} alt="" loading="lazy" />
            </div>
          )}
          <div className="tweet__actions">
            <button className="tweet__action" onClick={(e) => { stop(e); navigate(`/verse/${source.id}`); }}>
              <Icon name="reply" size={17} />
              <span>{source.reply_count}</span>
            </button>
            <button
              className={`tweet__action ${tweet.is_reposted ? "tweet__action--jade" : ""}`}
              onClick={(e) => { stop(e); repostMutation.mutate(); }}
              disabled={!user}
            >
              <Icon name="repost" size={17} />
              <span>{source.repost_count}</span>
            </button>
            <button
              className={`tweet__action ${tweet.is_liked ? "tweet__action--vermillion" : ""}`}
              onClick={(e) => { stop(e); likeMutation.mutate(); }}
              disabled={!user}
            >
              <Icon name={tweet.is_liked ? "heart-fill" : "heart"} size={17} />
              <span>{source.like_count}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
