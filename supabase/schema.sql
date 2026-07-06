-- AquaFlow — Supabase schema for the water refilling station platform.
-- Run in the Supabase SQL editor (or `supabase db push`) to create the backend
-- that replaces the demo data in lib/data/*.

-- ============================== ENUMS ==============================
create type water_type as enum ('Purified', 'Alkaline', 'Mineral', 'Distilled');
create type container_size as enum ('5 Gallon', '10L', '6L', '1L', 'Custom');
create type order_status as enum ('Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Ready for Pickup', 'Completed', 'Cancelled');
create type fulfillment_type as enum ('Delivery', 'Pickup');
create type payment_method as enum ('GCash', 'Maya', 'Stripe', 'PayPal', 'Cash on Delivery');
create type payment_status as enum ('Paid', 'Unpaid', 'Refunded');
create type subscription_plan as enum ('Weekly', 'Biweekly', 'Monthly');
create type employee_role as enum ('Driver', 'Cashier', 'Production Staff', 'Technician');
create type alert_kind as enum ('Quality', 'Leak', 'Fraud', 'Maintenance', 'Inventory');
create type alert_severity as enum ('Info', 'Warning', 'Critical');

-- ============================== CORE ==============================
create table products (
  id uuid primary key default gen_random_uuid(),
  water_type water_type not null,
  size container_size not null,
  refill_price numeric(10,2) not null,
  new_container_price numeric(10,2) not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (water_type, size)
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  qr_id text not null unique,                    -- printed / scannable customer ID
  full_name text not null,
  phone text not null,
  email text,
  loyalty_points integer not null default 0,
  sentiment text check (sentiment in ('Happy','Neutral','Angry')),
  created_at timestamptz not null default now()
);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  label text not null default 'Home',
  line text not null,
  barangay text,
  city text,
  lat double precision,
  lng double precision,
  is_default boolean not null default false
);

create table favorites (
  customer_id uuid not null references customers(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  primary key (customer_id, product_id)
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  product_id uuid not null references products(id),
  plan subscription_plan not null,
  quantity integer not null check (quantity > 0),
  next_delivery date not null,
  status text not null default 'Active' check (status in ('Active','Paused','Cancelled')),
  created_at timestamptz not null default now()
);

-- ============================== ORDERS ==============================
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_no text generated always as ('ORD-' || substr(id::text, 1, 8)) stored,
  customer_id uuid not null references customers(id),
  address_id uuid references addresses(id),
  fulfillment fulfillment_type not null default 'Delivery',
  express boolean not null default false,
  status order_status not null default 'Pending',
  payment_method payment_method not null,
  payment_status payment_status not null default 'Unpaid',
  payment_ref text,                              -- Stripe/PayPal/GCash/Maya reference
  total numeric(10,2) not null default 0,
  scheduled_for timestamptz,
  driver_id uuid,                                -- set by AI scheduling
  eta_minutes integer,
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null
);

create table loyalty_ledger (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  points integer not null,                       -- positive = earned, negative = redeemed
  reason text,
  created_at timestamptz not null default now()
);

-- ============================== INVENTORY ==============================
create table suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  price_score integer check (price_score between 0 and 100),
  quality_score integer check (quality_score between 0 and 100),
  speed_score integer check (speed_score between 0 and 100),
  lead_time_days integer,
  created_at timestamptz not null default now()
);

create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  stock numeric(12,2) not null default 0,
  unit text not null default 'pcs',
  daily_usage numeric(12,2) not null default 0,  -- refreshed nightly by the forecast job
  reorder_point numeric(12,2) not null default 0,
  supplier_id uuid references suppliers(id)
);

create table inventory_movements (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references inventory_items(id) on delete cascade,
  delta numeric(12,2) not null,                  -- +receive / -consume
  reason text not null,                          -- production, sale, adjustment, spoilage
  employee_id uuid,
  created_at timestamptz not null default now()
);

create table production_logs (
  id uuid primary key default gen_random_uuid(),
  produced_on date not null default current_date,
  containers_refilled integer not null,
  line text,
  employee_id uuid
);

-- ============================== TEAM ==============================
create table employees (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  role employee_role not null,
  phone text,
  monthly_salary numeric(10,2),
  hired_at date,
  active boolean not null default true
);

alter table orders
  add constraint orders_driver_fk foreign key (driver_id) references employees(id);

create table attendance (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  clock_in timestamptz not null,
  clock_out timestamptz,
  late boolean not null default false
);

-- ============================== DELIVERY ==============================
create table delivery_routes (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references employees(id),
  route_date date not null default current_date,
  vehicle text,
  total_km numeric(8,2),
  optimized_savings_km numeric(8,2),             -- vs naive ordering, from the optimizer
  status text not null default 'Scheduled' check (status in ('Scheduled','In Progress','Completed'))
);

create table delivery_stops (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references delivery_routes(id) on delete cascade,
  order_id uuid not null references orders(id),
  seq integer not null,
  eta_minutes integer,
  distance_km numeric(8,2),
  status text not null default 'Pending' check (status in ('Pending','En Route','Arrived','Delivered')),
  delivered_at timestamptz,
  gps_lat double precision,
  gps_lng double precision
);

create table driver_locations (
  driver_id uuid primary key references employees(id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  heading double precision,
  updated_at timestamptz not null default now()
);

-- ============================== MACHINES & SENSORS ==============================
create table machines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,                            -- Reverse Osmosis, UV Sterilizer, Pump, Filter Bank
  health_score integer check (health_score between 0 and 100),
  runtime_hours numeric(12,1) not null default 0,
  last_service_at date,
  prediction text,                               -- latest AI maintenance note
  predicted_failure_in_days integer
);

create table sensor_readings (
  id bigint generated always as identity primary key,
  recorded_at timestamptz not null default now(),
  tds numeric(8,2),
  ph numeric(4,2),
  temperature numeric(5,2),
  turbidity numeric(6,3),
  pressure numeric(6,2),
  flow_rate numeric(6,2)
);
create index sensor_readings_time_idx on sensor_readings (recorded_at desc);

create table energy_readings (
  id bigint generated always as identity primary key,
  device text not null,
  recorded_at timestamptz not null default now(),
  kwh numeric(10,3) not null,
  runtime_minutes integer
);

-- ============================== AI OUTPUTS ==============================
create table alerts (
  id uuid primary key default gen_random_uuid(),
  kind alert_kind not null,
  severity alert_severity not null,
  title text not null,
  detail text,
  acknowledged boolean not null default false,
  created_at timestamptz not null default now()
);

create table demand_forecasts (
  id uuid primary key default gen_random_uuid(),
  month date not null,
  water_type water_type not null,
  expected_orders integer not null,
  drivers jsonb,                                 -- ["hot weather", "fiesta", ...]
  created_at timestamptz not null default now(),
  unique (month, water_type)
);

create table reorder_predictions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity integer not null,
  confidence numeric(5,2),
  message text,
  status text not null default 'Suggested' check (status in ('Suggested','Message Sent','Confirmed','Declined')),
  created_at timestamptz not null default now()
);

create table promotions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  trigger_reason text,
  offer text not null,
  channel text check (channel in ('SMS','Email','WhatsApp','Push')),
  status text not null default 'Scheduled' check (status in ('Scheduled','Sent','Redeemed')),
  sent_at timestamptz
);

create table fraud_cases (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  description text,
  amount_at_risk numeric(10,2),
  confidence numeric(5,2),
  involved text,
  status text not null default 'Open' check (status in ('Open','Investigating','Resolved','Dismissed')),
  detected_at timestamptz not null default now()
);

create table invoices_ocr (
  id uuid primary key default gen_random_uuid(),
  invoice_number text,
  vendor text,
  invoice_date date,
  amount numeric(12,2),
  items jsonb,
  ocr_confidence numeric(5,2),
  file_path text,                                -- Supabase Storage path of the upload
  status text not null default 'Needs Review' check (status in ('Recorded','Needs Review')),
  created_at timestamptz not null default now()
);

create table sentiment_items (
  id uuid primary key default gen_random_uuid(),
  source text check (source in ('Review','Chat','Facebook','SMS')),
  customer_id uuid references customers(id) on delete set null,
  content text not null,
  sentiment text check (sentiment in ('Happy','Neutral','Angry')),
  score numeric(4,3),                            -- -1 .. 1
  created_at timestamptz not null default now()
);

-- ============================== ROW LEVEL SECURITY ==============================
-- Staff-facing tables: only authenticated staff can read; writes go through
-- Edge Functions using the service role. Customers can see their own rows.

alter table customers enable row level security;
alter table addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table subscriptions enable row level security;
alter table loyalty_ledger enable row level security;
alter table favorites enable row level security;

-- Helper: is the current user a staff member?
create or replace function is_staff() returns boolean
language sql stable security definer as $$
  select exists (select 1 from employees where auth_user_id = auth.uid() and active);
$$;

create policy "customers read own profile" on customers
  for select using (auth_user_id = auth.uid() or is_staff());

create policy "customers read own addresses" on addresses
  for select using (
    customer_id in (select id from customers where auth_user_id = auth.uid()) or is_staff()
  );

create policy "customers read own orders" on orders
  for select using (
    customer_id in (select id from customers where auth_user_id = auth.uid()) or is_staff()
  );

create policy "customers read own order items" on order_items
  for select using (
    order_id in (
      select o.id from orders o
      join customers c on c.id = o.customer_id
      where c.auth_user_id = auth.uid()
    ) or is_staff()
  );

create policy "customers read own subscriptions" on subscriptions
  for select using (
    customer_id in (select id from customers where auth_user_id = auth.uid()) or is_staff()
  );

create policy "customers read own loyalty" on loyalty_ledger
  for select using (
    customer_id in (select id from customers where auth_user_id = auth.uid()) or is_staff()
  );

create policy "customers manage own favorites" on favorites
  for all using (
    customer_id in (select id from customers where auth_user_id = auth.uid()) or is_staff()
  );

-- Staff-only operational tables
do $$
declare t text;
begin
  foreach t in array array[
    'suppliers','inventory_items','inventory_movements','production_logs',
    'employees','attendance','delivery_routes','delivery_stops','driver_locations',
    'machines','sensor_readings','energy_readings','alerts','demand_forecasts',
    'reorder_predictions','promotions','fraud_cases','invoices_ocr','sentiment_items','products'
  ]
  loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "staff read" on %I for select using (is_staff())', t);
  end loop;
end $$;

-- Products are also publicly readable so the ordering UI can show the price list.
create policy "public read products" on products for select using (true);
