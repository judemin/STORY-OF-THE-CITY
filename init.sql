  create table daily_focus (                                                                                                                                               
    id          uuid        default gen_random_uuid() primary key,
    user_id     uuid        references auth.users not null,
    date        date        not null,
    total_secs  integer     not null default 0,
    updated_at  timestamptz default now(),
    unique(user_id, date)
  );

  alter table daily_focus enable row level security;

  create policy "users manage own rows"
    on daily_focus
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);