-- PJ // SOCIAL HUB — Supabase migration
-- Adds social features around the existing PJ Lounge without changing private-room encryption.

create extension if not exists pgcrypto;

create table if not exists public.social_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default '',
  accent text not null default 'red',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint social_status_len check (char_length(status) <= 80),
  constraint social_accent_valid check (accent in ('red','cyan','violet','mono','gold'))
);

create table if not exists public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);

create table if not exists public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  avatar text not null default '◈',
  body text not null,
  created_at timestamptz not null default now(),
  constraint guestbook_name_len check (char_length(display_name) between 1 and 32),
  constraint guestbook_avatar_len check (char_length(avatar) between 1 and 8),
  constraint guestbook_body_len check (char_length(body) between 1 and 280)
);

create table if not exists public.user_badges (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_key text not null,
  awarded_at timestamptz not null default now(),
  primary key (user_id, badge_key),
  constraint badge_key_valid check (badge_key in ('FIRST_CONTACT','PROJECT_EXPLORER','LOUNGE_REGULAR','SOCIALIZER','ARCHIVE_SCOUT','XYPHER_CLEARANCE','VOICE_DROP','POLL_VOTER'))
);

create table if not exists public.project_reactions (
  user_id uuid not null references auth.users(id) on delete cascade,
  project_key text not null,
  emoji text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, project_key, emoji),
  constraint project_key_len check (char_length(project_key) between 1 and 80),
  constraint project_emoji_valid check (emoji in ('🔥','❤️','👀','👍'))
);

create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  options jsonb not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  constraint poll_question_len check (char_length(question) between 1 and 180),
  constraint poll_options_array check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) between 2 and 6)
);

create table if not exists public.poll_votes (
  poll_id uuid not null references public.polls(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  option_index integer not null,
  created_at timestamptz not null default now(),
  primary key (poll_id, user_id),
  constraint poll_option_nonnegative check (option_index >= 0 and option_index <= 5)
);

create table if not exists public.shoutouts (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint shoutout_len check (char_length(message) between 1 and 220)
);

create table if not exists public.social_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  summary text not null,
  created_at timestamptz not null default now(),
  constraint event_type_valid check (event_type in ('joined','follow','guestbook','reaction','badge','voice','poll','status')),
  constraint event_summary_len check (char_length(summary) between 1 and 180)
);

create table if not exists public.topic_room_messages (
  id uuid primary key default gen_random_uuid(),
  room text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  avatar text not null default '◈',
  body text,
  voice_path text,
  created_at timestamptz not null default now(),
  constraint topic_room_valid check (room in ('general','tech','gaming','projects','archive')),
  constraint topic_name_len check (char_length(display_name) between 1 and 32),
  constraint topic_avatar_len check (char_length(avatar) between 1 and 8),
  constraint topic_body_len check (body is null or char_length(body) <= 500),
  constraint topic_has_content check (coalesce(char_length(body),0) > 0 or voice_path is not null),
  constraint topic_voice_path_len check (voice_path is null or char_length(voice_path) <= 240)
);

create table if not exists public.daily_answers (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_key text not null,
  answer text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, question_key),
  constraint daily_key_len check (char_length(question_key) between 1 and 40),
  constraint daily_answer_len check (char_length(answer) between 1 and 300)
);

create table if not exists public.developer_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  contact text not null default '',
  subject text not null,
  message text not null,
  created_at timestamptz not null default now(),
  constraint developer_name_len check (char_length(display_name) between 1 and 32),
  constraint developer_contact_len check (char_length(contact) <= 120),
  constraint developer_subject_len check (char_length(subject) between 1 and 100),
  constraint developer_message_len check (char_length(message) between 1 and 1500)
);

-- Seed a starter poll and shoutout once.
insert into public.polls (question, options)
select 'Which part of Pete''s portfolio should get the next major upgrade?', '["More social features","New project","More XYPHER secrets","Better AI","More visuals"]'::jsonb
where not exists (select 1 from public.polls);

insert into public.shoutouts (message)
select 'Welcome to PJ // SOCIAL. Explore, react, leave a note, meet people and keep an eye out for hidden systems.'
where not exists (select 1 from public.shoutouts);

-- Enable RLS.
alter table public.social_profiles enable row level security;
alter table public.follows enable row level security;
alter table public.guestbook_entries enable row level security;
alter table public.user_badges enable row level security;
alter table public.project_reactions enable row level security;
alter table public.polls enable row level security;
alter table public.poll_votes enable row level security;
alter table public.shoutouts enable row level security;
alter table public.social_events enable row level security;
alter table public.topic_room_messages enable row level security;
alter table public.daily_answers enable row level security;
alter table public.developer_messages enable row level security;

-- Social profiles.
drop policy if exists "social profiles readable" on public.social_profiles;
create policy "social profiles readable" on public.social_profiles for select to authenticated using (true);
drop policy if exists "users manage own social profile" on public.social_profiles;
create policy "users manage own social profile" on public.social_profiles for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Follows.
drop policy if exists "follows readable" on public.follows;
create policy "follows readable" on public.follows for select to authenticated using (true);
drop policy if exists "users create own follows" on public.follows;
create policy "users create own follows" on public.follows for insert to authenticated with check ((select auth.uid()) = follower_id);
drop policy if exists "users delete own follows" on public.follows;
create policy "users delete own follows" on public.follows for delete to authenticated using ((select auth.uid()) = follower_id);

-- Guestbook.
drop policy if exists "guestbook readable" on public.guestbook_entries;
create policy "guestbook readable" on public.guestbook_entries for select to authenticated using (true);
drop policy if exists "users write guestbook" on public.guestbook_entries;
create policy "users write guestbook" on public.guestbook_entries for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "users delete own guestbook" on public.guestbook_entries;
create policy "users delete own guestbook" on public.guestbook_entries for delete to authenticated using ((select auth.uid()) = user_id);

-- Badges.
drop policy if exists "badges readable" on public.user_badges;
create policy "badges readable" on public.user_badges for select to authenticated using (true);
drop policy if exists "users claim own badges" on public.user_badges;
create policy "users claim own badges" on public.user_badges for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "users remove own badges" on public.user_badges;
create policy "users remove own badges" on public.user_badges for delete to authenticated using ((select auth.uid()) = user_id);

-- Project reactions.
drop policy if exists "project reactions readable" on public.project_reactions;
create policy "project reactions readable" on public.project_reactions for select to authenticated using (true);
drop policy if exists "users add project reactions" on public.project_reactions;
create policy "users add project reactions" on public.project_reactions for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "users remove project reactions" on public.project_reactions;
create policy "users remove project reactions" on public.project_reactions for delete to authenticated using ((select auth.uid()) = user_id);

-- Polls are read-only from the browser; votes belong to each user.
drop policy if exists "polls readable" on public.polls;
create policy "polls readable" on public.polls for select to authenticated using (true);
drop policy if exists "poll votes readable" on public.poll_votes;
create policy "poll votes readable" on public.poll_votes for select to authenticated using (true);
drop policy if exists "users vote" on public.poll_votes;
create policy "users vote" on public.poll_votes for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "users change vote" on public.poll_votes;
create policy "users change vote" on public.poll_votes for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Shoutouts read-only from browser.
drop policy if exists "shoutouts readable" on public.shoutouts;
create policy "shoutouts readable" on public.shoutouts for select to authenticated using (true);

-- Activity feed.
drop policy if exists "social events readable" on public.social_events;
create policy "social events readable" on public.social_events for select to authenticated using (true);
drop policy if exists "users add own social events" on public.social_events;
create policy "users add own social events" on public.social_events for insert to authenticated with check ((select auth.uid()) = actor_id);

-- Topic rooms.
drop policy if exists "topic rooms readable" on public.topic_room_messages;
create policy "topic rooms readable" on public.topic_room_messages for select to authenticated using (true);
drop policy if exists "users post topic messages" on public.topic_room_messages;
create policy "users post topic messages" on public.topic_room_messages for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "users delete own topic messages" on public.topic_room_messages;
create policy "users delete own topic messages" on public.topic_room_messages for delete to authenticated using ((select auth.uid()) = user_id);

-- Daily question answers.
drop policy if exists "daily answers readable" on public.daily_answers;
create policy "daily answers readable" on public.daily_answers for select to authenticated using (true);
drop policy if exists "users create daily answer" on public.daily_answers;
create policy "users create daily answer" on public.daily_answers for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "users update daily answer" on public.daily_answers;
create policy "users update daily answer" on public.daily_answers for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Contact developer: each sender can create and read only their own saved submissions.
drop policy if exists "users send developer messages" on public.developer_messages;
create policy "users send developer messages" on public.developer_messages for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "users read own developer messages" on public.developer_messages;
create policy "users read own developer messages" on public.developer_messages for select to authenticated using ((select auth.uid()) = user_id);

-- Voice-note storage bucket. Public social rooms only; XYPHER private rooms remain text-E2EE.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pj-lounge-voice','pj-lounge-voice',false,2097152,array['audio/webm','audio/ogg','audio/mp4','audio/mpeg'])
on conflict (id) do update set public=false, file_size_limit=2097152, allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "authenticated read lounge voice" on storage.objects;
create policy "authenticated read lounge voice" on storage.objects for select to authenticated using (bucket_id = 'pj-lounge-voice');
drop policy if exists "users upload own lounge voice" on storage.objects;
create policy "users upload own lounge voice" on storage.objects for insert to authenticated with check (bucket_id = 'pj-lounge-voice' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "users delete own lounge voice" on storage.objects;
create policy "users delete own lounge voice" on storage.objects for delete to authenticated using (bucket_id = 'pj-lounge-voice' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Add live social tables to Realtime only when not already present.
do $$
declare t text;
begin
  foreach t in array array['social_profiles','follows','guestbook_entries','user_badges','project_reactions','poll_votes','social_events','topic_room_messages','daily_answers'] loop
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

select 'PJ SOCIAL HUB READY' as status;