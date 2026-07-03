import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./Avatar";
import { SealRing } from "./SealRing";
import { Icon } from "./Icon";
import { createTweet } from "../api/endpoints";

const MAX = 160;

interface ComposerProps {
  parentId?: string;
  placeholder?: string;
  onPosted?: () => void;
  autoFocus?: boolean;
}

export function Composer({ parentId, placeholder, onPosted, autoFocus }: ComposerProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => createTweet({ content, parent: parentId, image }),
    onSuccess: () => {
      setContent("");
      setImage(null);
      setImagePreview(null);
      qc.invalidateQueries({ queryKey: ["feed"] });
      qc.invalidateQueries({ queryKey: ["explore"] });
      if (parentId) qc.invalidateQueries({ queryKey: ["replies", parentId] });
      onPosted?.();
    },
  });

  if (!user) return null;

  const remaining = MAX - content.length;
  const canPost = (content.trim().length > 0 || !!image) && remaining >= 0 && !mutation.isPending;

  const onPickImage = (file: File | null) => {
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  return (
    <form
      className="composer"
      onSubmit={(e) => {
        e.preventDefault();
        if (canPost) mutation.mutate();
      }}
    >
      <Avatar src={user.avatar} name={user.name} size={44} ring />
      <div className="composer__body">
        <textarea
          className="composer__input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder ?? "What's the verse?"}
          rows={parentId ? 2 : 3}
          autoFocus={autoFocus}
          maxLength={MAX + 20}
        />
        {imagePreview && (
          <div className="composer__image-preview">
            <img src={imagePreview} alt="" />
            <button
              type="button"
              className="composer__image-remove"
              onClick={() => onPickImage(null)}
              aria-label="Remove image"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        )}
        <div className="composer__footer">
          <button
            type="button"
            className="composer__attach"
            onClick={() => fileRef.current?.click()}
            aria-label="Attach image"
          >
            <Icon name="image" size={19} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
          />
          <div className="composer__actions">
            <SealRing value={content.length} max={MAX} size={30} />
            <button type="submit" className="btn btn--primary" disabled={!canPost}>
              {parentId ? "Reply" : "Stamp it"}
            </button>
          </div>
        </div>
        {mutation.isError && (
          <p className="composer__error">Couldn't post that verse. Try again.</p>
        )}
      </div>
    </form>
  );
}
