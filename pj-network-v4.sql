-- PJ // NETWORK v4 — Supabase migration
-- Notifications, DMs, threads/comments, saves, profile links, XP, challenges,
-- events, build requests, changelog, moderation/admin and network settings.
-- Run after the base Lounge migration. It can also run if PJ Social is installed later.

create extension if not exists pgcrypto;
create schema if not exists private;

create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.net_profile_ext (
  user_id uuid primary key references auth.users(id) on delete cascade,
  availability text not null default 'online',
  github_url text not null default '',
  website_url text not null default '',
  spotify_url text not null default '',
  gamer_tag text not null default '',
  sound_theme text not null default 'pulse',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint net_availability_valid check (availability in ('online','busy','coding','gaming','invisible')),
  constraint net_sound_theme_valid check (sound_theme in ('pulse','soft','arcade','off')),
  constraint net_github_len check (char_length(github_url) <= 300),
  constraint net_website_len check (char_length(website_url) <= 300),
  constraint net_spotify_len check (char_length(spotify_url) <= 300),
  constraint net_gamer_len check (char_length(gamer_tag) <= 80)
);

create table if not exists public.net_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  kind text not null,
  entity_type text not null default '',
  entity_key text not null default '',
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  constraint net_notif_kind_len check (char_length(kind) between 1 and 40),
  constraint net_notif_entity_type_len check (char_length(entity_type) <= 40),
  constraint net_notif_entity_key_len check (char_length(entity_key) <= 160),
  constraint net_notif_body_len check (char_length(body) between 1 and 220)
);

create table if not exists public.net_blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint net_no_self_block check (blocker_id <> blocked_id)
);

create table if not exists public.net_dm_threads (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.net_dm_members (
  thread_id uuid not null references public.net_dm_threads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);

create table if not exists public.net_dm_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.net_dm_threads(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  reply_to uuid references public.net_dm_messages(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint net_dm_body_len check (char_length(body) between 1 and 1500)
);

create table if not exists public.net_comments (
  id uuid primary key default gen_random_uuid(),
  context_type text not null,
  context_key text not null,
  parent_id uuid references public.net_comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint net_comment_context_type check (context_type in ('project','build','post','event','changelog')),
  constraint net_comment_context_key_len check (char_length(context_key) between 1 and 160),
  constraint net_comment_body_len check (char_length(body) between 1 and 1000)
);

create table if not exists public.net_saves (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null,
  item_key text not null,
  label text not null default '',
  created_at timestamptz not null default now(),
  primary key (user_id, item_type, item_key),
  constraint net_save_type_len check (char_length(item_type) between 1 and 40),
  constraint net_save_key_len check (char_length(item_key) between 1 and 180),
  constraint net_save_label_len check (char_length(label) <= 160)
);

create table if not exists public.net_challenges (
  id text primary key,
  title text not null,
  description text not null,
  xp integer not null default 20,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint net_challenge_id_len check (char_length(id) between 1 and 50),
  constraint net_challenge_title_len check (char_length(title) between 1 and 100),
  constraint net_challenge_desc_len check (char_length(description) between 1 and 240),
  constraint net_challenge_xp_range check (xp between 1 and 500)
);

create table if not exists public.net_challenge_completions (
  challenge_id text not null references public.net_challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

create table if not exists public.net_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  starts_at timestamptz not null,
  location_label text not null default 'PJ // NETWORK',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint net_event_title_len check (char_length(title) between 1 and 120),
  constraint net_event_desc_len check (char_length(description) <= 600),
  constraint net_event_location_len check (char_length(location_label) <= 100)
);

create table if not exists public.net_event_rsvps (
  event_id uuid not null references public.net_events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'going',
  created_at timestamptz not null default now(),
  primary key (event_id, user_id),
  constraint net_rsvp_status check (status in ('going','interested'))
);

create table if not exists public.net_build_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null default '',
  status text not null default 'suggested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint net_build_title_len check (char_length(title) between 1 and 120),
  constraint net_build_body_len check (char_length(body) <= 900),
  constraint net_build_status check (status in ('suggested','planned','building','shipped','rejected'))
);

create table if not exists public.net_build_votes (
  request_id uuid not null references public.net_build_requests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (request_id, user_id)
);

create table if not exists public.net_changelog (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  title text not null,
  body text not null,
  published_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  constraint net_changelog_version_len check (char_length(version) between 1 and 40),
  constraint net_changelog_title_len check (char_length(title) between 1 and 120),
  constraint net_changelog_body_len check (char_length(body) between 1 and 1200)
);

create table if not exists public.net_pins (
  id uuid primary key default gen_random_uuid(),
  item_type text not null,
  item_key text not null,
  title text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (item_type, item_key),
  constraint net_pin_type_len check (char_length(item_type) between 1 and 40),
  constraint net_pin_key_len check (char_length(item_key) between 1 and 180),
  constraint net_pin_title_len check (char_length(title) <= 160)
);

create table if not exists public.net_user_sanctions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  muted_until timestamptz,
  banned_until timestamptz,
  reason text not null default '',
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint net_sanction_reason_len check (char_length(reason) <= 240)
);

create table if not exists public.net_xp (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint net_xp_nonnegative check (xp >= 0)
);

create table if not exists public.net_developer_inbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  contact text not null default '',
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  constraint net_inbox_subject_len check (char_length(subject) between 1 and 100),
  constraint net_inbox_contact_len check (char_length(contact) <= 120),
  constraint net_inbox_message_len check (char_length(message) between 1 and 1500),
  constraint net_inbox_status check (status in ('new','seen','replied','closed'))
);

-- Admin + membership helpers. These are deliberately server-side and do not trust handles/names.
create or replace function private.pj_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists(select 1 from public.site_admins a where a.user_id = (select auth.uid()));
$$;

create or replace function private.pj_dm_member(target_thread uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists(
    select 1 from public.net_dm_members m
    where m.thread_id = target_thread and m.user_id = (select auth.uid())
  );
$$;

create or replace function private.pj_dm_creator(target_thread uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists(
    select 1 from public.net_dm_threads t
    where t.id = target_thread and t.created_by = (select auth.uid())
  );
$$;

create or replace function private.pj_can_post()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists(
    select 1 from public.net_user_sanctions s
    where s.user_id = (select auth.uid())
      and (
        (s.banned_until is not null and s.banned_until > now())
        or (s.muted_until is not null and s.muted_until > now())
      )
  );
$$;

revoke all on function private.pj_is_admin() from public;
revoke all on function private.pj_dm_member(uuid) from public;
revoke all on function private.pj_dm_creator(uuid) from public;
revoke all on function private.pj_can_post() from public;
grant execute on function private.pj_is_admin() to authenticated;
grant execute on function private.pj_dm_member(uuid) to authenticated;
grant execute on function private.pj_dm_creator(uuid) to authenticated;
grant execute on function private.pj_can_post() to authenticated;

-- XP is awarded by database triggers, not writable from the browser.
create or replace function private.pj_xp_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare target_uid uuid; points integer;
begin
  target_uid := (to_jsonb(new)->>TG_ARGV[0])::uuid;
  points := TG_ARGV[1]::integer;
  insert into public.net_xp(user_id,xp,updated_at)
  values(target_uid,points,now())
  on conflict(user_id) do update
  set xp = public.net_xp.xp + excluded.xp, updated_at = now();
  return new;
end;
$$;

-- Seed evergreen challenges + this release changelog.
insert into public.net_challenges(id,title,description,xp) values
  ('explore-project','Project Explorer','Open a project and leave a useful comment.',20),
  ('meet-community','Meet the Network','Follow or message someone respectfully.',20),
  ('build-idea','Pitch a Build','Submit one useful idea to the Build Requests board.',25),
  ('archive-scout','Archive Scout','Find the Archive 04.5 signal without sharing any access key.',30)
on conflict(id) do nothing;

insert into public.net_changelog(version,title,body)
select 'v4.0','PJ // NETWORK','Notifications, DMs, search, threads, saves, levels, challenges, events, build requests, admin controls, PWA support and PJ ID Card 2.0.'
where not exists(select 1 from public.net_changelog where version='v4.0');

-- RLS
alter table public.site_admins enable row level security;
alter table public.net_profile_ext enable row level security;
alter table public.net_notifications enable row level security;
alter table public.net_blocks enable row level security;
alter table public.net_dm_threads enable row level security;
alter table public.net_dm_members enable row level security;
alter table public.net_dm_messages enable row level security;
alter table public.net_comments enable row level security;
alter table public.net_saves enable row level security;
alter table public.net_challenges enable row level security;
alter table public.net_challenge_completions enable row level security;
alter table public.net_events enable row level security;
alter table public.net_event_rsvps enable row level security;
alter table public.net_build_requests enable row level security;
alter table public.net_build_votes enable row level security;
alter table public.net_changelog enable row level security;
alter table public.net_pins enable row level security;
alter table public.net_user_sanctions enable row level security;
alter table public.net_xp enable row level security;
alter table public.net_developer_inbox enable row level security;

-- site_admins: users may only see whether they themselves are registered. No browser write policy.
drop policy if exists "admin self check" on public.site_admins;
create policy "admin self check" on public.site_admins for select to authenticated using (user_id = (select auth.uid()));

-- extended profiles
drop policy if exists "network profiles readable" on public.net_profile_ext;
create policy "network profiles readable" on public.net_profile_ext for select to authenticated using (true);
drop policy if exists "users create network profile" on public.net_profile_ext;
create policy "users create network profile" on public.net_profile_ext for insert to authenticated with check (user_id=(select auth.uid()));
drop policy if exists "users update network profile" on public.net_profile_ext;
create policy "users update network profile" on public.net_profile_ext for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));

-- notifications
drop policy if exists "users read own notifications" on public.net_notifications;
create policy "users read own notifications" on public.net_notifications for select to authenticated using (recipient_id=(select auth.uid()));
drop policy if exists "users create notifications" on public.net_notifications;
create policy "users create notifications" on public.net_notifications for insert to authenticated with check (actor_id=(select auth.uid()) and recipient_id<>actor_id and private.pj_can_post());
drop policy if exists "users update own notifications" on public.net_notifications;
create policy "users update own notifications" on public.net_notifications for update to authenticated using (recipient_id=(select auth.uid())) with check (recipient_id=(select auth.uid()));
drop policy if exists "users delete own notifications" on public.net_notifications;
create policy "users delete own notifications" on public.net_notifications for delete to authenticated using (recipient_id=(select auth.uid()));

-- blocks
drop policy if exists "users read own blocks" on public.net_blocks;
create policy "users read own blocks" on public.net_blocks for select to authenticated using (blocker_id=(select auth.uid()));
drop policy if exists "users add own blocks" on public.net_blocks;
create policy "users add own blocks" on public.net_blocks for insert to authenticated with check (blocker_id=(select auth.uid()));
drop policy if exists "users remove own blocks" on public.net_blocks;
create policy "users remove own blocks" on public.net_blocks for delete to authenticated using (blocker_id=(select auth.uid()));

-- DMs
drop policy if exists "members read dm threads" on public.net_dm_threads;
create policy "members read dm threads" on public.net_dm_threads for select to authenticated using (created_by=(select auth.uid()) or private.pj_dm_member(id));
drop policy if exists "users create dm threads" on public.net_dm_threads;
create policy "users create dm threads" on public.net_dm_threads for insert to authenticated with check (created_by=(select auth.uid()) and private.pj_can_post());
drop policy if exists "members read dm memberships" on public.net_dm_members;
create policy "members read dm memberships" on public.net_dm_members for select to authenticated using (private.pj_dm_member(thread_id) or private.pj_dm_creator(thread_id));
drop policy if exists "thread creators add dm members" on public.net_dm_members;
create policy "thread creators add dm members" on public.net_dm_members for insert to authenticated with check ((user_id=(select auth.uid()) or private.pj_dm_creator(thread_id)) and private.pj_can_post());
drop policy if exists "users leave dm threads" on public.net_dm_members;
create policy "users leave dm threads" on public.net_dm_members for delete to authenticated using (user_id=(select auth.uid()));
drop policy if exists "members read dm messages" on public.net_dm_messages;
create policy "members read dm messages" on public.net_dm_messages for select to authenticated using (private.pj_dm_member(thread_id));
drop policy if exists "members send dm messages" on public.net_dm_messages;
create policy "members send dm messages" on public.net_dm_messages for insert to authenticated with check (sender_id=(select auth.uid()) and private.pj_dm_member(thread_id) and private.pj_can_post());
drop policy if exists "senders delete dm messages" on public.net_dm_messages;
create policy "senders delete dm messages" on public.net_dm_messages for delete to authenticated using (sender_id=(select auth.uid()));

-- public threaded comments
drop policy if exists "network comments readable" on public.net_comments;
create policy "network comments readable" on public.net_comments for select to authenticated using (true);
drop policy if exists "users create network comments" on public.net_comments;
create policy "users create network comments" on public.net_comments for insert to authenticated with check (user_id=(select auth.uid()) and private.pj_can_post());
drop policy if exists "users update own network comments" on public.net_comments;
create policy "users update own network comments" on public.net_comments for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
drop policy if exists "users or admins delete network comments" on public.net_comments;
create policy "users or admins delete network comments" on public.net_comments for delete to authenticated using (user_id=(select auth.uid()) or private.pj_is_admin());

-- saves/favorites
drop policy if exists "users manage own saves" on public.net_saves;
create policy "users manage own saves" on public.net_saves for all to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));

-- challenges/completions
drop policy if exists "challenges readable" on public.net_challenges;
create policy "challenges readable" on public.net_challenges for select to authenticated using (true);
drop policy if exists "admins manage challenges" on public.net_challenges;
create policy "admins manage challenges" on public.net_challenges for all to authenticated using (private.pj_is_admin()) with check (private.pj_is_admin());
drop policy if exists "challenge completions readable" on public.net_challenge_completions;
create policy "challenge completions readable" on public.net_challenge_completions for select to authenticated using (true);
drop policy if exists "users complete challenges" on public.net_challenge_completions;
create policy "users complete challenges" on public.net_challenge_completions for insert to authenticated with check (user_id=(select auth.uid()) and private.pj_can_post());

-- events/rsvps
drop policy if exists "events readable" on public.net_events;
create policy "events readable" on public.net_events for select to authenticated using (true);
drop policy if exists "admins manage events" on public.net_events;
create policy "admins manage events" on public.net_events for all to authenticated using (private.pj_is_admin()) with check (private.pj_is_admin());
drop policy if exists "rsvps readable" on public.net_event_rsvps;
create policy "rsvps readable" on public.net_event_rsvps for select to authenticated using (true);
drop policy if exists "users manage own rsvp" on public.net_event_rsvps;
create policy "users manage own rsvp" on public.net_event_rsvps for all to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()) and private.pj_can_post());

-- build requests/votes
drop policy if exists "build requests readable" on public.net_build_requests;
create policy "build requests readable" on public.net_build_requests for select to authenticated using (true);
drop policy if exists "users create build requests" on public.net_build_requests;
create policy "users create build requests" on public.net_build_requests for insert to authenticated with check (user_id=(select auth.uid()) and private.pj_can_post());
drop policy if exists "admins update build requests" on public.net_build_requests;
create policy "admins update build requests" on public.net_build_requests for update to authenticated using (private.pj_is_admin()) with check (private.pj_is_admin());
drop policy if exists "users or admins delete build requests" on public.net_build_requests;
create policy "users or admins delete build requests" on public.net_build_requests for delete to authenticated using (user_id=(select auth.uid()) or private.pj_is_admin());
drop policy if exists "build votes readable" on public.net_build_votes;
create policy "build votes readable" on public.net_build_votes for select to authenticated using (true);
drop policy if exists "users add build vote" on public.net_build_votes;
create policy "users add build vote" on public.net_build_votes for insert to authenticated with check (user_id=(select auth.uid()) and private.pj_can_post());
drop policy if exists "users remove build vote" on public.net_build_votes;
create policy "users remove build vote" on public.net_build_votes for delete to authenticated using (user_id=(select auth.uid()));

-- changelog/pins
drop policy if exists "changelog readable" on public.net_changelog;
create policy "changelog readable" on public.net_changelog for select to authenticated using (true);
drop policy if exists "admins manage changelog" on public.net_changelog;
create policy "admins manage changelog" on public.net_changelog for all to authenticated using (private.pj_is_admin()) with check (private.pj_is_admin());
drop policy if exists "pins readable" on public.net_pins;
create policy "pins readable" on public.net_pins for select to authenticated using (true);
drop policy if exists "admins manage pins" on public.net_pins;
create policy "admins manage pins" on public.net_pins for all to authenticated using (private.pj_is_admin()) with check (private.pj_is_admin());

-- sanctions + XP
drop policy if exists "users read own sanctions" on public.net_user_sanctions;
create policy "users read own sanctions" on public.net_user_sanctions for select to authenticated using (user_id=(select auth.uid()) or private.pj_is_admin());
drop policy if exists "admins manage sanctions" on public.net_user_sanctions;
create policy "admins manage sanctions" on public.net_user_sanctions for all to authenticated using (private.pj_is_admin()) with check (private.pj_is_admin());
drop policy if exists "xp readable" on public.net_xp;
create policy "xp readable" on public.net_xp for select to authenticated using (true);

-- private developer inbox
drop policy if exists "users send network developer messages" on public.net_developer_inbox;
create policy "users send network developer messages" on public.net_developer_inbox for insert to authenticated with check (user_id=(select auth.uid()) and private.pj_can_post());
drop policy if exists "users read own network developer messages" on public.net_developer_inbox;
create policy "users read own network developer messages" on public.net_developer_inbox for select to authenticated using (user_id=(select auth.uid()) or private.pj_is_admin());
drop policy if exists "admins manage network developer messages" on public.net_developer_inbox;
create policy "admins manage network developer messages" on public.net_developer_inbox for update to authenticated using (private.pj_is_admin()) with check (private.pj_is_admin());
drop policy if exists "admins delete network developer messages" on public.net_developer_inbox;
create policy "admins delete network developer messages" on public.net_developer_inbox for delete to authenticated using (private.pj_is_admin());

-- XP triggers: intentionally modest values; community rank is social, not a security credential.
drop trigger if exists net_xp_comment on public.net_comments;
create trigger net_xp_comment after insert on public.net_comments for each row execute function private.pj_xp_trigger('user_id','3');
drop trigger if exists net_xp_build on public.net_build_requests;
create trigger net_xp_build after insert on public.net_build_requests for each row execute function private.pj_xp_trigger('user_id','8');
drop trigger if exists net_xp_vote on public.net_build_votes;
create trigger net_xp_vote after insert on public.net_build_votes for each row execute function private.pj_xp_trigger('user_id','1');
drop trigger if exists net_xp_challenge on public.net_challenge_completions;
create trigger net_xp_challenge after insert on public.net_challenge_completions for each row execute function private.pj_xp_trigger('user_id','20');
drop trigger if exists net_xp_rsvp on public.net_event_rsvps;
create trigger net_xp_rsvp after insert on public.net_event_rsvps for each row execute function private.pj_xp_trigger('user_id','2');

-- If PJ Social already exists, extend its admin controls without weakening ordinary user policies.
do $$
begin
  if to_regclass('public.polls') is not null then
    execute 'drop policy if exists "admins manage polls" on public.polls';
    execute 'create policy "admins manage polls" on public.polls for all to authenticated using (private.pj_is_admin()) with check (private.pj_is_admin())';
  end if;
  if to_regclass('public.shoutouts') is not null then
    execute 'drop policy if exists "admins manage shoutouts" on public.shoutouts';
    execute 'create policy "admins manage shoutouts" on public.shoutouts for all to authenticated using (private.pj_is_admin()) with check (private.pj_is_admin())';
  end if;
  if to_regclass('public.developer_messages') is not null then
    execute 'drop policy if exists "admins read developer messages" on public.developer_messages';
    execute 'create policy "admins read developer messages" on public.developer_messages for select to authenticated using (private.pj_is_admin())';
    execute 'drop policy if exists "admins delete developer messages" on public.developer_messages';
    execute 'create policy "admins delete developer messages" on public.developer_messages for delete to authenticated using (private.pj_is_admin())';
  end if;
  if to_regclass('public.reports') is not null then
    execute 'drop policy if exists "admins read reports" on public.reports';
    execute 'create policy "admins read reports" on public.reports for select to authenticated using (private.pj_is_admin())';
    execute 'drop policy if exists "admins delete reports" on public.reports';
    execute 'create policy "admins delete reports" on public.reports for delete to authenticated using (private.pj_is_admin())';
  end if;
  if to_regclass('public.guestbook_entries') is not null then
    execute 'drop policy if exists "admins delete guestbook" on public.guestbook_entries';
    execute 'create policy "admins delete guestbook" on public.guestbook_entries for delete to authenticated using (private.pj_is_admin())';
  end if;
  if to_regclass('public.topic_room_messages') is not null then
    execute 'drop policy if exists "admins delete topic messages" on public.topic_room_messages';
    execute 'create policy "admins delete topic messages" on public.topic_room_messages for delete to authenticated using (private.pj_is_admin())';
  end if;
end $$;

-- Realtime for network state.
do $$
declare t text;
begin
  foreach t in array array[
    'net_notifications','net_dm_members','net_dm_messages','net_comments','net_challenge_completions',
    'net_events','net_event_rsvps','net_build_requests','net_build_votes','net_changelog','net_pins','net_xp'
  ] loop
    if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t) then
      execute format('alter publication supabase_realtime add table public.%I',t);
    end if;
  end loop;
end $$;

select 'PJ NETWORK V4 READY' as status;