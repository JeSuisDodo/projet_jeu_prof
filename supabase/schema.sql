-- Mathoria : comptes professeurs et élèves.
-- À coller une seule fois dans Supabase : SQL Editor → New query → Run (voir docs/comptes.md).
--
-- Principes de protection des données :
-- * un professeur ne voit que ses parties et ses élèves ;
-- * un élève ne voit que sa propre ligne, et seulement depuis un appareil où il s'est connecté ;
-- * les mots de passe des élèves sont chiffrés (bcrypt) dans une table que personne ne peut lire,
--   et 5 erreurs de suite bloquent le compte 5 minutes ;
-- * tout ce qui touche aux élèves passe par des fonctions qui vérifient ces règles.

create extension if not exists pgcrypto with schema extensions;

-- Professeurs : une ligne par compte (créée automatiquement à l'inscription).
create table public.teachers (
  id uuid primary key references auth.users on delete cascade,
  name text not null check (char_length(name) between 1 and 60)
);

-- Parties : un niveau, un nom, un code d'invitation.
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null default auth.uid() references public.teachers on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  grade text not null check (grade in ('6e', '5e', '4e', '3e', '2nde', '1re-spe', 'tle-spe', 'l1', 'l2', 'l3')),
  code text not null unique check (code ~ '^[A-HJKMNP-Z2-9]{6}$'),
  created_at timestamptz not null default now()
);
create index on public.classes (teacher_id);

-- Élèves listés par le professeur, avec leur progression (la sauvegarde du jeu).
create table public.students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  joined boolean not null default false,
  progress jsonb,
  updated_at timestamptz,
  unique (class_id, name)
);
create index on public.students (class_id);

-- Mots de passe des élèves : jamais lisibles depuis l'application.
create table public.student_secrets (
  student_id uuid primary key references public.students on delete cascade,
  password_hash text not null,
  failed int not null default 0,
  locked_until timestamptz
);

-- Appareils connectés : chaque session anonyme du navigateur est rattachée à un élève.
create table public.student_devices (
  auth_uid uuid primary key references auth.users on delete cascade,
  student_id uuid not null references public.students on delete cascade,
  created_at timestamptz not null default now()
);
create index on public.student_devices (student_id);

alter table public.teachers enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.student_secrets enable row level security;
alter table public.student_devices enable row level security;

-- Le rôle « anon » (personne de connecté) n'accède à aucune table directement.
revoke all on public.teachers, public.classes, public.students, public.student_secrets, public.student_devices from anon;
revoke all on public.teachers, public.classes, public.students, public.student_secrets, public.student_devices from authenticated;

-- Les colonnes modifiables sont limitées : un professeur ne peut pas écrire « joined » ou « progress ».
grant select, update (name) on public.teachers to authenticated;
grant select, insert (name, grade, code), update (name), delete on public.classes to authenticated;
grant select, insert (class_id, name), update (name), delete on public.students to authenticated;

-- Un compte anonyme (élève) n'est jamais professeur.
create function public.is_real_user() returns boolean
language sql stable set search_path = '' as $$
  select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
$$;

create policy "prof : son profil" on public.teachers
  for all to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "prof : ses parties" on public.classes
  for all to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid() and public.is_real_user());

create policy "prof : les élèves de ses parties" on public.students
  for all to authenticated
  using (exists (select 1 from public.classes c where c.id = class_id and c.teacher_id = auth.uid()))
  with check (exists (select 1 from public.classes c where c.id = class_id and c.teacher_id = auth.uid()));

-- Élève rattaché à la session (lecture de student_devices sans l'ouvrir aux utilisateurs).
create function public.my_student_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select student_id from public.student_devices where auth_uid = auth.uid()
$$;

create policy "élève : sa propre ligne" on public.students
  for select to authenticated
  using (id = public.my_student_id());

-- Aucune politique sur student_secrets ni student_devices : seules les fonctions ci-dessous y touchent.

-- Fiche professeur créée à l'inscription (le nom vient des métadonnées du compte).
create function public.on_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(new.is_anonymous, false) = false then
    insert into public.teachers (id, name)
    values (new.id, left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), 'Professeur'), 60))
    on conflict (id) do nothing;
  end if;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.on_new_user();

-- Crée une partie avec un code libre (vérifié parmi toutes les parties) et sa liste d'élèves.
create function public.create_class(p_name text, p_grade text, p_students text[]) returns public.classes
language plpgsql security definer set search_path = '' as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_code text;
  v_class public.classes;
begin
  if not public.is_real_user() or not exists (select 1 from public.teachers where id = auth.uid()) then
    raise exception 'Réservé aux professeurs.';
  end if;
  loop
    v_code := '';
    for i in 1..6 loop
      v_code := v_code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.classes where code = v_code);
  end loop;
  insert into public.classes (teacher_id, name, grade, code) values (auth.uid(), trim(p_name), p_grade, v_code) returning * into v_class;
  insert into public.students (class_id, name)
    select v_class.id, n from (select distinct trim(x) as n from unnest(p_students) x) s where n <> ''
    on conflict do nothing;
  return v_class;
end $$;

-- Invitation : la partie et la liste des noms, pour que l'élève choisisse le sien.
create function public.class_roster(p_code text) returns json
language sql stable security definer set search_path = '' as $$
  select json_build_object(
    'className', c.name,
    'grade', c.grade,
    'teacherName', t.name,
    'students', coalesce((
      select json_agg(json_build_object('id', s.id, 'name', s.name, 'joined', s.joined) order by s.name)
      from public.students s where s.class_id = c.id), '[]'::json))
  from public.classes c join public.teachers t on t.id = c.teacher_id
  where c.code = upper(p_code)
$$;

-- Session d'un élève sur cet appareil.
create function public.my_student() returns json
language sql stable security definer set search_path = '' as $$
  select json_build_object(
    'studentId', s.id, 'name', s.name, 'classId', c.id, 'className', c.name,
    'grade', c.grade, 'code', c.code, 'progress', s.progress)
  from public.student_devices d
  join public.students s on s.id = d.student_id
  join public.classes c on c.id = s.class_id
  where d.auth_uid = auth.uid()
$$;

-- L'élève rejoint la partie : la première fois il choisit son mot de passe, ensuite il le donne.
-- Les erreurs sont renvoyées ({"error": ...}) plutôt que levées, pour garder le compteur d'essais.
create function public.join_class(p_code text, p_student uuid, p_password text) returns json
language plpgsql security definer set search_path = '' as $$
declare
  v_student public.students;
  v_secret public.student_secrets;
begin
  if auth.uid() is null then return json_build_object('error', 'Session introuvable, recharge la page.'); end if;
  select s.* into v_student from public.students s join public.classes c on c.id = s.class_id
    where c.code = upper(p_code) and s.id = p_student;
  if not found then return json_build_object('error', 'Ce nom ne fait pas partie de la liste.'); end if;

  select * into v_secret from public.student_secrets where student_id = p_student for update;
  if not found then
    if char_length(coalesce(p_password, '')) < 4 then
      return json_build_object('error', 'Le mot de passe doit faire au moins 4 caractères.');
    end if;
    insert into public.student_secrets (student_id, password_hash)
      values (p_student, extensions.crypt(p_password, extensions.gen_salt('bf')));
    update public.students set joined = true where id = p_student;
  else
    if v_secret.locked_until is not null and v_secret.locked_until > now() then
      return json_build_object('error', 'Trop d’essais : attends quelques minutes ou demande à ton professeur.');
    end if;
    if extensions.crypt(p_password, v_secret.password_hash) <> v_secret.password_hash then
      update public.student_secrets
        set failed = case when failed + 1 >= 5 then 0 else failed + 1 end,
            locked_until = case when failed + 1 >= 5 then now() + interval '5 minutes' else locked_until end
        where student_id = p_student;
      return json_build_object('error', 'Mot de passe incorrect. Si tu l’as oublié, demande à ton professeur de le réinitialiser.');
    end if;
    update public.student_secrets set failed = 0, locked_until = null where student_id = p_student;
  end if;

  insert into public.student_devices (auth_uid, student_id) values (auth.uid(), p_student)
    on conflict (auth_uid) do update set student_id = excluded.student_id, created_at = now();
  return public.my_student();
end $$;

-- Sauvegarde de la progression de l'élève connecté sur cet appareil.
create function public.save_progress(p_progress jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if pg_column_size(p_progress) > 200000 then raise exception 'Sauvegarde trop grosse.'; end if;
  update public.students set progress = p_progress, updated_at = now()
    where id = (select student_id from public.student_devices where auth_uid = auth.uid());
end $$;

-- L'élève se déconnecte de cet appareil.
create function public.leave_class() returns void
language sql security definer set search_path = '' as $$
  delete from public.student_devices where auth_uid = auth.uid()
$$;

-- Mot de passe oublié : le professeur remet l'élève « en attente » ; ses appareils sont déconnectés.
create function public.reset_student(p_student uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.students s join public.classes c on c.id = s.class_id
                 where s.id = p_student and c.teacher_id = auth.uid()) then
    raise exception 'Élève introuvable.';
  end if;
  delete from public.student_secrets where student_id = p_student;
  delete from public.student_devices where student_id = p_student;
  update public.students set joined = false where id = p_student;
end $$;

revoke all on function public.create_class, public.class_roster, public.my_student, public.join_class,
  public.save_progress, public.leave_class, public.reset_student, public.on_new_user, public.is_real_user, public.my_student_id from public, anon, authenticated;
grant execute on function public.is_real_user, public.my_student_id to authenticated;
grant execute on function public.create_class to authenticated;
grant execute on function public.class_roster to anon, authenticated;
grant execute on function public.my_student, public.join_class, public.save_progress, public.leave_class, public.reset_student to authenticated;
