# TransitOps — Fleet Management Database (PostgreSQL)

A normalized PostgreSQL schema for an 8-hour hackathon fleet-management app, built from
the provided design doc. Tested end-to-end on PostgreSQL 16.

## Files

| File | Purpose |
|---|---|
| `schema.sql` | Core tables, constraints, indexes, `updated_at` triggers, and dashboard views |
| `triggers_business_rules.sql` | Bonus automation: dispatch validation, status cascades, auto-expense generation |
| `seed.sql` | Sample data to test everything end-to-end |

## Setup

```bash
createdb transitops
psql -d transitops -f schema.sql
psql -d transitops -f triggers_business_rules.sql   # optional but recommended
psql -d transitops -f seed.sql                       # optional sample data
```

## What's in `schema.sql`

8 tables matching the ER diagram: `roles`, `users`, `vehicles`, `drivers`, `trips`,
`maintenance_logs`, `fuel_logs`, `expenses`.

- All status columns use `CHECK` constraints (e.g. vehicle status limited to
  `Available / On Trip / In Shop / Retired`) instead of free text.
- `registration_number`, `license_number`, `email` are `UNIQUE`.
- Sensible `CHECK`s on numeric fields (no negative costs, capacities, distances).
- Every table with an `updated_at` column gets it auto-maintained via a shared
  `set_updated_at()` trigger — no app-side bookkeeping needed.
- Foreign keys use `RESTRICT` where deleting would orphan history (vehicles/drivers on
  trips) and `CASCADE`/`SET NULL` where it's safe (a driver's user, a fuel log's trip).
- Indexes on every FK and every column you'd filter dashboards by (`status`, dates).

### Dashboard views (covers the KPI list from the doc)
`v_fleet_status_summary`, `v_trip_status_summary`, `v_drivers_on_duty`,
`v_fleet_utilization`, `v_cost_summary`, `v_vehicle_roi`, `v_license_alerts`
— query these directly instead of writing KPI SQL in the app layer.

## What's in `triggers_business_rules.sql` (bonus, optional)

Implements the "Business Rules" section from the doc as actual DB-level enforcement
rather than app-level checks that can be bypassed:

- **Trip dispatch**: setting a trip to `Dispatched` checks vehicle availability,
  driver availability, cargo ≤ capacity, and license not expired — raises an
  exception if any fail — then flips vehicle/driver to `On Trip`.
- **Trip completion/cancellation**: frees the vehicle and driver back to `Available`.
- **Maintenance**: creating a maintenance record puts the vehicle `In Shop`;
  marking it `Completed` frees the vehicle.
- **Fuel/maintenance → expenses**: fuel logs and completed maintenance automatically
  write a matching row into `expenses`, so `v_cost_summary` and `v_vehicle_roi` stay
  correct without any app-side double-entry.

If you'd rather enforce these rules in your app layer (simpler to debug in a
hackathon), just skip this file — `schema.sql` alone is a complete, valid schema.

## Notes / things to decide before you build the app

- IDs use `SERIAL` (auto-increment integers) for simplicity — swap for `UUID` if you
  need distributed ID generation, but it's unnecessary overhead for 8 hours.
- Password storage assumes you hash client-side/app-side (e.g. bcrypt) before insert —
  `password_hash` is just `TEXT`.
- `drivers.user_id` is `UNIQUE`, i.e. one driver profile per user — matches the 1:1
  relationship implied by the doc.
