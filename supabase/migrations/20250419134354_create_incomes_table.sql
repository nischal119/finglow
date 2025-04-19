create table if not exists public.incomes (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    description text not null,
    amount decimal(12,2) not null check (amount >= 0),
    source text not null,
    date date not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Create an RLS policy to ensure users can only access their own income records
alter table public.incomes enable row level security;

create policy "Users can view their own income records"
    on public.incomes
    for select
    using (auth.uid() = user_id);

create policy "Users can insert their own income records"
    on public.incomes
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own income records"
    on public.incomes
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own income records"
    on public.incomes
    for delete
    using (auth.uid() = user_id);

-- Create an index on user_id for better query performance
create index incomes_user_id_idx on public.incomes(user_id);

-- Create a trigger to automatically update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger handle_incomes_updated_at
    before update on public.incomes
    for each row
    execute function public.handle_updated_at();
