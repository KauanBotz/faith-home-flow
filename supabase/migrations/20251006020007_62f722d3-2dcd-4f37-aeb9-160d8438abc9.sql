-- Fix search_path for ensure_admin_role function to resolve security warning
CREATE OR REPLACE FUNCTION public.ensure_admin_role()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;