-- Roles infrastructure for admin access
do $$ 
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'moderator', 'user');
  end if;
end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique(user_id, role)
);

alter table public.user_roles enable row level security;

-- Allow users to read their own roles
drop policy if exists "Users can view their own roles" on public.user_roles;
create policy "Users can view their own roles"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

-- Security definer function to check roles (bypasses RLS safely)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = _user_id and ur.role = _role
  );
$$;

-- Ensure admin role if the logged-in user's email matches the fixed admin email
create or replace function public.ensure_admin_role()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_user_id uuid;
  v_exists boolean;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return false;
  end if;
  select email into v_email from auth.users where id = v_user_id;
  if v_email = 'admin@mincbh.com.br' then
    select exists(select 1 from public.user_roles where user_id = v_user_id and role = 'admin') into v_exists;
    if not v_exists then
      insert into public.user_roles(user_id, role) values (v_user_id, 'admin');
    end if;
    return true;
  end if;
  return false;
end;
$$;

-- Simple function to check if current user is admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(auth.uid(), 'admin');
$$;

-- Admins can SELECT all data across core tables
drop policy if exists "Admins can view all casas_fe" on public.casas_fe;
create policy "Admins can view all casas_fe"
  on public.casas_fe for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can view all membros" on public.membros;
create policy "Admins can view all membros"
  on public.membros for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can view all presencas" on public.presencas;
create policy "Admins can view all presencas"
  on public.presencas for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));
