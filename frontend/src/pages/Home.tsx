import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Composer } from "../components/Composer";
import { TweetCard } from "../components/TweetCard";
import { fetchFeed } from "../api/endpoints";
import { EmptyState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";

export function Home() {
  const [cursor, setCursor] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["feed", cursor],
    queryFn: () => fetchFeed(cursor),
  });

  return (
    <div className="column">
      <header className="column__header">
        <h1>Home</h1>
      </header>
      <Composer onPosted={() => qc.invalidateQueries({ queryKey: ["feed"] })} />
      {isLoading && <Spinner />}
      {!isLoading && !data?.results.length && (
        <EmptyState
          title="Your thread is quiet"
          body="Follow a few people, or say the first verse yourself."
        />
      )}
      <div className="tweet-list">
        {data?.results.map((tweet) => (
          <TweetCard key={tweet.id} tweet={tweet} invalidateKeys={[["feed"]]} />
        ))}
      </div>
      {data?.next && (
        <button className="btn btn--ghost btn--block" onClick={() => setCursor(data.next)}>
          Load more
        </button>
      )}
    </div>
  );
}
