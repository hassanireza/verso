# Verso

Short verses, out loud. A microblogging platform where every post is
capped at 160 characters, the length of a telegram or a proverb.

Backend: Django + Django REST Framework.
Frontend: React + TypeScript + Vite, installable as a PWA on mobile and desktop.

## Design direction

The visual identity is meant to read like the joint work of a small studio,
not a template. A few decisions carry that through:

- **The seal ring.** A hanko-style stamped circle is the signature mark. It
  fills in vermillion ink as a post approaches its 160-character limit and
  closes into a solid stamp at the limit. The same ring frames every avatar
  in the app, so the motif repeats without being decorative filler.
- **Three accents, one job each.** Vermillion is reserved for primary
  actions and the ring. Jade marks confirmation (follows, reposts). Brass is
  structural only: hairlines, timestamps, quiet labels. No single default
  accent color is reused for everything, which is what makes most AI-built
  UIs look interchangeable.
- **Type pairing.** Fraunces (a warm optical-size serif) carries headings
  and the wordmark. Inter carries UI and body copy. IBM Plex Mono is used
  for anything numeric: character counts, timestamps, follower counts.
- **Ink-wash ground.** The default surface is a warm near-black rather than
  pure black or the cream-and-terracotta combination that shows up
  everywhere. A light "paper" mode is available from the theme toggle in
  the nav rail.

## Features

- Email/password auth with JWT access and refresh tokens
- Profiles: avatar, banner, bio, location, website, follower/following counts
- Posts ("verses") capped at 160 characters, optional image, hashtags and
  @mentions parsed automatically
- Home feed (people you follow), Explore feed, hashtag pages, full-text
  search across posts and people
- Replies (threaded), likes, reposts ("restamps")
- Follow / unfollow, followers and following lists
- Direct messages, one-to-one conversations with unread counts
- Notifications for follows, likes, replies, reposts, mentions, and messages
- Installable PWA with offline app-shell caching, works on mobile and
  desktop, responsive three-column desktop layout collapsing to a bottom
  tab bar on mobile

## Project layout

```
verso/
  backend/     Django + DRF API (accounts, tweets, messaging, notifications)
  frontend/    React + TypeScript + Vite PWA
  docker-compose.yml   local full-stack dev environment
```

## Local development

### Option A: Docker Compose (recommended)

```bash
docker compose up --build
```

This starts Postgres, the Django API on `:8000`, and the frontend on
`:5173`. Once it's up, run migrations once (compose runs `migrate` on
container start already, but the very first boot may need it explicitly):

```bash
docker compose exec backend python manage.py createsuperuser
```

Visit `http://localhost:5173`.

### Option B: run each side natively

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit as needed; sqlite works out of the box
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API is now on `http://localhost:8000`. Admin is at `/admin/`.

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

The dev server on `http://localhost:5173` proxies `/api` to
`http://localhost:8000`, so no env var is needed locally.

## Deploying to Railway

Verso deploys as two Railway services from this one repository, plus a
managed Postgres addon.

### 1. Backend service

1. In Railway, create a new project and add a **Postgres** database.
2. Add a new service from this repo, set its root directory to `backend`.
   Railway will detect the `Dockerfile` and `railway.json` automatically.
3. Set environment variables on the backend service:
   - `SECRET_KEY`: a long random string
   - `DEBUG`: `False`
   - `DATABASE_URL`: reference the Postgres plugin's `DATABASE_URL`
   - `ALLOWED_HOSTS`: `*` (or your exact domain once known)
   - `CORS_ALLOWED_ORIGINS`: the frontend's public URL, e.g.
     `https://verso.up.railway.app`
   - `FRONTEND_URL`: same as above
4. Deploy. The `Dockerfile` runs migrations and starts gunicorn
   automatically. Health check: `GET /api/health/`.
5. Note the backend's public domain, e.g. `https://verso-api.up.railway.app`.

### 2. Frontend service

1. Add a second service from this repo, root directory `frontend`.
2. Set a build argument (Railway calls these "Build Variables" or you can
   set them under the service's Variables tab as `VITE_API_BASE_URL`,
   which the Dockerfile picks up as a build ARG):
   - `VITE_API_BASE_URL`: `https://verso-api.up.railway.app/api`
     (your backend domain from step above, with `/api` appended)
3. Deploy. Nginx serves the built static app and listens on Railway's
   `$PORT` automatically.
4. Once you have the frontend's public domain, go back to the backend
   service and update `CORS_ALLOWED_ORIGINS` / `FRONTEND_URL` to match it
   exactly, then redeploy the backend.

### Notes on production media storage

Both Dockerfiles use local filesystem storage for uploaded avatars, banners,
and post images. Railway's filesystem is ephemeral between deploys, so for
a real production launch, swap in object storage (S3, Cloudflare R2, or
Railway's volume storage) behind `django-storages`. The model fields
(`ImageField`) do not need to change, only `DEFAULT_FILE_STORAGE` in
`settings.py`.

## API overview

All endpoints are namespaced under `/api/`.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register/`, `POST /auth/login/`, `POST /auth/token/refresh/`, `GET/PATCH /auth/me/` |
| Profiles | `GET /auth/<username>/`, `GET /auth/search/?q=`, `POST /auth/<username>/follow/`, `GET /auth/<username>/followers/`, `GET /auth/<username>/following/` |
| Verses | `GET/POST /tweets/feed/`, `GET /tweets/explore/`, `GET /tweets/search/?q=`, `GET /tweets/trending/`, `GET /tweets/hashtag/<tag>/`, `GET /tweets/user/<username>/`, `GET /tweets/user/<username>/replies/`, `GET /tweets/user/<username>/likes/`, `GET/DELETE /tweets/<id>/`, `GET /tweets/<id>/replies/`, `POST /tweets/<id>/like/`, `POST /tweets/<id>/repost/` |
| Messages | `GET /messages/`, `POST /messages/start/`, `GET/POST /messages/<id>/messages/`, `POST /messages/<id>/read/` |
| Notifications | `GET /notifications/`, `POST /notifications/mark-read/`, `GET /notifications/unread-count/` |

## Tech stack

- Django 6, Django REST Framework, SimpleJWT, django-cors-headers,
  WhiteNoise, Gunicorn, Postgres (SQLite for local dev fallback)
- React 19, TypeScript, Vite, React Router, TanStack Query, Axios,
  vite-plugin-pwa
