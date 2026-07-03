import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Avatar } from "../components/Avatar";
import { Icon } from "../components/Icon";
import { Spinner } from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { fetchConversations, fetchMessages, markConversationRead, sendMessage } from "../api/endpoints";

export function MessageThread() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: conversations } = useQuery({ queryKey: ["conversations"], queryFn: fetchConversations });
  const list = Array.isArray(conversations) ? conversations : conversations?.results ?? [];
  const conversation = list.find((c) => c.id === id);

  const { data, isLoading } = useQuery({
    queryKey: ["messages", id],
    queryFn: () => fetchMessages(id),
    refetchInterval: 5000,
  });

  const messages = Array.isArray(data) ? data : data?.results ?? [];

  const sendMutation = useMutation({
    mutationFn: (text: string) => sendMessage(id, text),
    onSuccess: () => {
      setBody("");
      qc.invalidateQueries({ queryKey: ["messages", id] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  useEffect(() => {
    markConversationRead(id).then(() => qc.invalidateQueries({ queryKey: ["conversations"] }));
  }, [id, qc]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  return (
    <div className="column column--thread">
      <header className="column__header">
        <button className="icon-btn" onClick={() => navigate("/messages")} aria-label="Back">
          <Icon name="back" size={20} />
        </button>
        {conversation?.other_participant && (
          <div className="thread-head">
            <Avatar src={conversation.other_participant.avatar} name={conversation.other_participant.name} size={32} />
            <h1>{conversation.other_participant.name}</h1>
          </div>
        )}
      </header>

      <div className="dm-scroll">
        {isLoading && <Spinner />}
        {messages.map((m) => {
          const mine = m.sender.username === user?.username;
          return (
            <div key={m.id} className={`dm-bubble-row ${mine ? "dm-bubble-row--mine" : ""}`}>
              {!mine && <Avatar src={m.sender.avatar} name={m.sender.name} size={28} />}
              <div className={`dm-bubble ${mine ? "dm-bubble--mine" : ""}`}>
                <p>{m.body}</p>
                <time>{format(new Date(m.created_at), "HH:mm")}</time>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        className="dm-input-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (body.trim()) sendMutation.mutate(body.trim());
        }}
      >
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a message"
          maxLength={1000}
        />
        <button className="icon-btn icon-btn--vermillion" type="submit" disabled={!body.trim()} aria-label="Send">
          <Icon name="send" size={18} />
        </button>
      </form>
    </div>
  );
}
