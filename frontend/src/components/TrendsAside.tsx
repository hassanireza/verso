import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "./Icon";
import { fetchTrending } from "../api/endpoints";

export function TrendsAside() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { data: trends } = useQuery({ queryKey: ["trending"], queryFn: fetchTrending });

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/explore?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="trends">
      <form className="trends__search" onSubmit={submitSearch}>
        <Icon name="search" size={17} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search verses and people"
          aria-label="Search"
        />
      </form>

      <div className="trends__card">
        <h2 className="trends__title">Under the seal today</h2>
        {!trends?.length && <p className="trends__empty">Nothing trending yet. Be first to stamp a tag.</p>}
        <ul className="trends__list">
          {trends?.map((t, i) => (
            <li key={t.name}>
              <button className="trends__item" onClick={() => navigate(`/tag/${t.name}`)}>
                <span className="trends__rank">{String(i + 1).padStart(2, "0")}</span>
                <span className="trends__tag">#{t.name}</span>
                <span className="trends__count">{t.count} verse{t.count === 1 ? "" : "s"}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="trends__footer">
        Verso: a shared studio piece from designers in Tokyo, Isfahan,
        Berlin, Shanghai and San Francisco.
      </p>
    </div>
  );
}
