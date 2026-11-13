begin;

alter table public.item_submissions
  add column pickup_latitude double precision,
  add column pickup_longitude double precision,
  add column pickup_address text,
  add column pickup_instructions text not null default '';

-- Keep existing submissions; enforce complete locations on every new insert/update.
alter table public.item_submissions add constraint pickup_location_required check (
  pickup_latitude is not null and pickup_latitude between -90 and 90
  and pickup_longitude is not null and pickup_longitude between -180 and 180
  and pickup_address is not null and length(trim(pickup_address)) between 5 and 500
  and length(pickup_instructions) <= 500
) not valid;

commit;
