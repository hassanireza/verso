import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Avatar } from "./Avatar";
import { useAuth } from "../context/AuthContext";
import { toggleFollow } from "../api/endpoints";
import type { User } from "../types";

export function UserRow({ user, onToggled }: { user: User; onToggled?: () => void }) {
  const { user: me } = useAuth();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => toggleFollow(user.username),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user", user.username] });
      qc.invalidateQueries({ queryKey: ["user-search"] });
      onToggled?.();
    },
  });

  return (
    <div className="user-row">
      <Link to={`/${user.username}`} className="user-row__link">
        <Avatar src={user.avatar} name={user.name} size={44} />
        <div className="user-row__meta">
          <span className="user-row__name">{user.name}</span>
          <span className="user-row__handle">@{user.username}</span>
          {user.bio && <span className="user-row__bio">{user.bio}</span>}
        </div>
      </Link>
      {me && me.username !== user.username && (
        <button
          className={`btn ${user.is_following ? "btn--ghost" : "btn--primary"} btn--small`}
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {user.is_following ? "Following" : "Follow"}
        </button>
      )}
    </div>
  );
}
