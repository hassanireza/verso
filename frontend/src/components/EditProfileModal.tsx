import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "./Icon";
import { Avatar } from "./Avatar";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../api/endpoints";
import type { User } from "../types";

export function EditProfileModal({ user, onClose }: { user: User; onClose: () => void }) {
  const { refreshUser } = useAuth();
  const qc = useQueryClient();
  const [displayName, setDisplayName] = useState(user.display_name);
  const [bio, setBio] = useState(user.bio);
  const [location, setLocation] = useState(user.location);
  const [website, setWebsite] = useState(user.website);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (avatarFile) {
        const form = new FormData();
        form.append("display_name", displayName);
        form.append("bio", bio);
        form.append("location", location);
        form.append("website", website);
        form.append("avatar", avatarFile);
        return updateProfile(form);
      }
      return updateProfile({ display_name: displayName, bio, location, website });
    },
    onSuccess: async () => {
      await refreshUser();
      qc.invalidateQueries({ queryKey: ["user", user.username] });
      onClose();
    },
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal__head">
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
          <h2>Edit profile</h2>
          <button
            className="btn btn--primary btn--small"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            Save
          </button>
        </header>
        <div className="modal__body">
          <div className="modal__avatar-row">
            <Avatar src={avatarPreview ?? user.avatar} name={user.name} size={72} ring />
            <label className="btn btn--ghost btn--small">
              Change photo
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setAvatarFile(f);
                  setAvatarPreview(f ? URL.createObjectURL(f) : null);
                }}
              />
            </label>
          </div>
          <label className="field">
            <span>Name</span>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={50} />
          </label>
          <label className="field">
            <span>Bio</span>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={160} rows={3} />
          </label>
          <label className="field">
            <span>Location</span>
            <input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={64} />
          </label>
          <label className="field">
            <span>Website</span>
            <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
          </label>
        </div>
      </div>
    </div>
  );
}
