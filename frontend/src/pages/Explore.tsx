import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { TweetCard } from "../components/TweetCard";
import { UserRow } from "../components/UserRow";
import { EmptyState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";
import { Icon } from "../components/Icon";
import { fetchExplore, searchTweets, searchUsers } from "../api/endpoints";

export function Explore() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const [draft, setDraft] = useState(q);

  const tweetsQuery = useQuery({
    queryKey: ["explore-search", q],
    queryFn: () => (q ? searchTweets(q) : fetchExplore()),
  });

  const usersQuery = useQuery({
    queryKey: ["user-search", q],
    queryFn: () => searchUsers(q),
    enabled: !!q,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setParams(draft ? { q: draft } : {});
  };

  return (
    <div className="column">
      <header className="column__header column__header--search">
        <form className="page-search" onSubmit={submit}>
          <Icon name="search" size={18} />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Search verses and people"
          />
        </form>
      </header>

      {q && !!usersQuery.data?.length && (
        <div className="explore__people">
          <h2 className="explore__subhead">People</h2>
          {usersQuery.data.slice(0, 4).map((u) => (
            <UserRow key={u.id} user={u} />
          ))}
        </div>
      )}

      <h2 className="explore__subhead">{q ? "Verses" : "Fresh across Verso"}</h2>
      {tweetsQuery.isLoading && <Spinner />}
      {!tweetsQuery.isLoading && !tweetsQuery.data?.results.length && (
        <EmptyState title="No verses found" body="Try another word, or a #tag." />
      )}
      <div className="tweet-list">
        {tweetsQuery.data?.results.map((tweet) => (
          <TweetCard key={tweet.id} tweet={tweet} invalidateKeys={[["explore-search", q]]} />
        ))}
      </div>
    </div>
  );
}
