import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "../components/Icon";
import { TweetCard } from "../components/TweetCard";
import { Composer } from "../components/Composer";
import { EmptyState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";
import { fetchReplies, fetchTweet } from "../api/endpoints";

export function TweetDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: tweet, isLoading } = useQuery({
    queryKey: ["tweet", id],
    queryFn: () => fetchTweet(id),
  });

  const { data: replies, isLoading: repliesLoading } = useQuery({
    queryKey: ["replies", id],
    queryFn: () => fetchReplies(id),
    enabled: !!tweet,
  });

  return (
    <div className="column">
      <header className="column__header">
        <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Back">
          <Icon name="back" size={20} />
        </button>
        <h1>Verse</h1>
      </header>

      {isLoading && <Spinner />}
      {!isLoading && !tweet && <EmptyState title="Gone" body="This verse was removed." />}

      {tweet && (
        <>
          <TweetCard tweet={tweet} invalidateKeys={[["tweet", id], ["replies", id]]} />
          <div className="thread-composer">
            <Composer
              parentId={tweet.id}
              placeholder={`Reply to @${tweet.author.username}`}
              onPosted={() => qc.invalidateQueries({ queryKey: ["replies", id] })}
            />
          </div>
          {repliesLoading && <Spinner />}
          {!repliesLoading && !replies?.results.length && (
            <EmptyState title="No replies yet" body="Be the first to answer this verse." />
          )}
          <div className="tweet-list">
            {replies?.results.map((r) => (
              <TweetCard key={r.id} tweet={r} invalidateKeys={[["replies", id]]} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
