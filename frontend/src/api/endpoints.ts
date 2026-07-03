import { api } from "./client";
import type {
  AppNotification,
  Conversation,
  ConversationMessage,
  Paginated,
  Tweet,
  User,
} from "../types";

// -- auth / accounts --
export const registerUser = (payload: {
  username: string;
  email: string;
  password: string;
  display_name?: string;
}) => api.post("/auth/register/", payload).then((r) => r.data);

export const loginUser = (payload: { username: string; password: string }) =>
  api.post("/auth/login/", payload).then((r) => r.data);

export const fetchMe = () => api.get<User>("/auth/me/").then((r) => r.data);

export const updateProfile = (payload: Partial<User> | FormData) =>
  api.patch<User>("/auth/me/", payload, {
    headers: payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
  }).then((r) => r.data);

export const fetchUser = (username: string) =>
  api.get<User>(`/auth/${username}/`).then((r) => r.data);

export const searchUsers = (q: string) =>
  api.get<User[]>("/auth/search/", { params: { q } }).then((r) => r.data);

export const toggleFollow = (username: string) =>
  api.post<{ following: boolean; follower_count: number }>(`/auth/${username}/follow/`).then((r) => r.data);

export const fetchFollowers = (username: string) =>
  api.get<User[]>(`/auth/${username}/followers/`).then((r) => r.data);

export const fetchFollowing = (username: string) =>
  api.get<User[]>(`/auth/${username}/following/`).then((r) => r.data);

// -- tweets --
export const fetchFeed = (cursor?: string | null) =>
  api.get<Paginated<Tweet>>(cursor ?? "/tweets/feed/").then((r) => r.data);

export const fetchExplore = (cursor?: string | null) =>
  api.get<Paginated<Tweet>>(cursor ?? "/tweets/explore/").then((r) => r.data);

export const searchTweets = (q: string) =>
  api.get<Paginated<Tweet>>("/tweets/search/", { params: { q } }).then((r) => r.data);

export const fetchTrending = () =>
  api.get<{ name: string; count: number }[]>("/tweets/trending/").then((r) => r.data);

export const fetchHashtag = (tag: string) =>
  api.get<Paginated<Tweet>>(`/tweets/hashtag/${tag}/`).then((r) => r.data);

export const fetchUserTweets = (username: string, cursor?: string | null) =>
  api.get<Paginated<Tweet>>(cursor ?? `/tweets/user/${username}/`).then((r) => r.data);

export const fetchUserReplies = (username: string, cursor?: string | null) =>
  api.get<Paginated<Tweet>>(cursor ?? `/tweets/user/${username}/replies/`).then((r) => r.data);

export const fetchUserLikes = (username: string, cursor?: string | null) =>
  api.get<Paginated<Tweet>>(cursor ?? `/tweets/user/${username}/likes/`).then((r) => r.data);

export const fetchTweet = (id: string) => api.get<Tweet>(`/tweets/${id}/`).then((r) => r.data);

export const fetchReplies = (id: string) =>
  api.get<Paginated<Tweet>>(`/tweets/${id}/replies/`).then((r) => r.data);

export const createTweet = (payload: { content: string; parent?: string | null; image?: File | null }) => {
  if (payload.image) {
    const form = new FormData();
    form.append("content", payload.content);
    if (payload.parent) form.append("parent", payload.parent);
    form.append("image", payload.image);
    return api.post<Tweet>("/tweets/feed/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  }
  return api.post<Tweet>("/tweets/feed/", {
    content: payload.content,
    parent: payload.parent ?? null,
  }).then((r) => r.data);
};

export const deleteTweet = (id: string) => api.delete(`/tweets/${id}/`);

export const toggleLike = (id: string) =>
  api.post<{ liked: boolean; like_count: number }>(`/tweets/${id}/like/`).then((r) => r.data);

export const toggleRepost = (id: string) =>
  api.post<{ reposted: boolean; repost_count: number }>(`/tweets/${id}/repost/`).then((r) => r.data);

// -- notifications --
export const fetchNotifications = () =>
  api.get<Paginated<AppNotification> | AppNotification[]>("/notifications/").then((r) => r.data);

export const markNotificationsRead = () => api.post("/notifications/mark-read/");

export const fetchUnreadCount = () =>
  api.get<{ count: number }>("/notifications/unread-count/").then((r) => r.data);

// -- messaging --
export const fetchConversations = () =>
  api.get<Conversation[] | Paginated<Conversation>>("/messages/").then((r) => r.data);

export const startConversation = (username: string) =>
  api.post<Conversation>("/messages/start/", { username }).then((r) => r.data);

export const fetchMessages = (conversationId: string) =>
  api.get<ConversationMessage[] | Paginated<ConversationMessage>>(
    `/messages/${conversationId}/messages/`
  ).then((r) => r.data);

export const sendMessage = (conversationId: string, body: string) =>
  api.post<ConversationMessage>(`/messages/${conversationId}/messages/`, { body }).then((r) => r.data);

export const markConversationRead = (conversationId: string) =>
  api.post(`/messages/${conversationId}/read/`);
