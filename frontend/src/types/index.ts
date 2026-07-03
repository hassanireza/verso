export interface User {
  id: string;
  username: string;
  name: string;
  display_name: string;
  bio: string;
  location: string;
  website: string;
  avatar: string | null;
  banner: string | null;
  is_verified: boolean;
  created_at: string;
  follower_count: number;
  following_count: number;
  is_following: boolean;
  followed_by: boolean;
}

export interface TweetMini {
  id: string;
  author: User;
  content: string;
  image: string | null;
  created_at: string;
  like_count: number;
  reply_count: number;
  repost_count: number;
}

export interface Tweet extends TweetMini {
  parent: string | null;
  repost_of: TweetMini | null;
  hashtags: string[];
  is_liked: boolean;
  is_reposted: boolean;
}

export interface Paginated<T> {
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AppNotification {
  id: string;
  actor: User;
  verb: "follow" | "like" | "reply" | "repost" | "mention" | "message";
  tweet_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface ConversationMessage {
  id: string;
  conversation: string;
  sender: User;
  body: string;
  created_at: string;
  read_at: string | null;
}

export interface Conversation {
  id: string;
  other_participant: User | null;
  last_message: ConversationMessage | null;
  unread_count: number;
  updated_at: string;
}
