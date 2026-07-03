import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Home } from "./pages/Home";
import { Explore } from "./pages/Explore";
import { Notifications } from "./pages/Notifications";
import { MessagesList } from "./pages/MessagesList";
import { MessageThread } from "./pages/MessageThread";
import { Profile } from "./pages/Profile";
import { TweetDetail } from "./pages/TweetDetail";
import { HashtagPage } from "./pages/HashtagPage";
import { NotFound } from "./pages/NotFound";
import { useAuth } from "./context/AuthContext";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthGate><Login /></AuthGate>} />
        <Route path="/register" element={<AuthGate><Register /></AuthGate>} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/messages" element={<MessagesList />} />
            <Route path="/messages/:id" element={<MessageThread />} />
            <Route path="/verse/:id" element={<TweetDetail />} />
            <Route path="/tag/:tag" element={<HashtagPage />} />
            <Route path="/:username" element={<Profile />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
