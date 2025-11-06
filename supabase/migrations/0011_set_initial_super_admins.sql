-- Promote initial super admins by email (idempotent)
update public.profiles set is_super_admin = true, role = 'super_admin'
where id in (
  select id from auth.users where email in ('romanroberts4@gmail.com','soya@myhoneybot.com')
);


