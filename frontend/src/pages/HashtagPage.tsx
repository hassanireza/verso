import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "../components/Icon";
import { TweetCard } from "../components/TweetCard";
import { EmptyState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";
import { fetchHashtag } from "../api/endpoints";

export function HashtagPage() {
  const { tag = "" } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["hashtag", tag],
    queryFn: () => fetchHashtag(tag),
  });

  return (
    <div className="column">
      <header className="column__header">
        <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Back">
          <Icon name="back" size={20} />
        </button>
        <h1>#{tag}</h1>
      </header>
      {isLoading && <Spinner />}
      {!isLoading && !data?.results.length && (
        <EmptyState title="Nothing tagged yet" body={`No verses carry #${tag} yet. Be first.`} />
      )}
      <div className="tweet-list">
        {data?.results.map((t) => (
          <TweetCard key={t.id} tweet={t} invalidateKeys={[["hashtag", tag]]} />
        ))}
      </div>
    </div>
  );
}
