import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import { Avatar } from "../components/Avatar";
import { Icon } from "../components/Icon";
import { EmptyState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";
import { fetchConversations, searchUsers, startConversation } from "../api/endpoints";

export function MessagesList() {
  const [composing, setComposing] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
  });

  const { data: results } = useQuery({
    queryKey: ["dm-user-search", q],
    queryFn: () => searchUsers(q),
    enabled: composing && q.length > 0,
  });

  const startMutation = useMutation({
    mutationFn: (username: string) => startConversation(username),
    onSuccess: (c) => navigate(`/messages/${c.id}`),
  });

  const conversations = Array.isArray(data) ? data : data?.results ?? [];

  return (
    <div className="column">
      <header className="column__header">
        <h1>Messages</h1>
        <button className="icon-btn icon-btn--bordered" onClick={() => setComposing(true)} aria-label="New message">
          <Icon name="mail" size={18} />
        </button>
      </header>

      {composing && (
        <div className="dm-compose">
          <input
            autoFocus
            placeholder="Search a handle to message"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <ul className="dm-compose__results">
            {results?.map((u) => (
              <li key={u.id}>
                <button onClick={() => startMutation.mutate(u.username)}>
                  <Avatar src={u.avatar} name={u.name} size={32} />
                  <span>{u.name} <span className="dm-compose__handle">@{u.username}</span></span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isLoading && <Spinner />}
      {!isLoading && !conversations.length && (
        <EmptyState title="No messages yet" body="Start a private thread with anyone on Verso." />
      )}
      <ul className="conversation-list">
        {conversations.map((c) => (
          <li key={c.id}>
            <Link to={`/messages/${c.id}`} className={`conversation-row ${c.unread_count ? "conversation-row--unread" : ""}`}>
              <Avatar src={c.other_participant?.avatar} name={c.other_participant?.name ?? "?"} size={48} />
              <div className="conversation-row__meta">
                <div className="conversation-row__top">
                  <span className="conversation-row__name">{c.other_participant?.name}</span>
                  {c.last_message && (
                    <time>{formatDistanceToNowStrict(new Date(c.last_message.created_at))}</time>
                  )}
                </div>
                <p className="conversation-row__preview">
                  {c.last_message ? c.last_message.body : "Say hello"}
                </p>
              </div>
              {!!c.unread_count && <span className="conversation-row__dot" />}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
