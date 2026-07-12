# TransitOps Database Documentation

## Overview

This database is designed for a fleet management system and now includes stronger integrity rules, better normalization, audit tracking, and more secure seed data.

## Database Details

- Database name: `transitops_db`
- Character set: `utf8mb4`
- Collation: `utf8mb4_unicode_ci`
- Storage engine: `InnoDB`

## What Changed

The schema now includes:

- `CHECK` constraints for non-negative values and trip/odometer logic
- A `locations` table to normalize trip start and end locations
- An optional `user_id` link from `drivers` to `users`
- Soft-delete support using `deleted_at`
- Audit columns (`created_by`, `updated_by`) on operational tables
- Hashed passwords in the seed data
- Date/time fields stored as `DATETIME` for clearer application-level timezone handling
- Extra indexes for date-based reporting

## Table Summary

| Table              | Purpose                                                        |
| ------------------ | -------------------------------------------------------------- |
| `roles`            | Stores available user roles                                    |
| `users`            | Stores application users, credentials, and profile information |
| `locations`        | Stores normalized trip locations                               |
| `vehicles`         | Stores fleet vehicle records                                   |
| `drivers`          | Stores driver details and optional login linkage               |
| `trips`            | Stores trip planning and execution records                     |
| `maintenance_logs` | Tracks vehicle maintenance work                                |
| `fuel_logs`        | Stores fuel consumption entries                                |
| `expenses`         | Stores vehicle operating expenses                              |

---

## 1. Roles

- `id`: Primary key
- `name`: Unique role name

## 2. Users

- `id`: Primary key
- `name`: User full name
- `email`: Unique login email
- `password`: Hashed password value
- `profile`: Optional profile-picture link or file path
- `role_id`: FK to `roles.id`
- `created_at` / `updated_at`: Audit timestamps

## 3. Locations

Used to normalize trip locations instead of storing free-form strings.

- `id`: Primary key
- `name`: Unique location name

## 4. Vehicles

- `registration_number`: Unique vehicle identifier
- `model`, `type`: Vehicle details
- `max_load_capacity`, `odometer`, `acquisition_cost`: Numeric values protected by `CHECK` constraints
- `status`: Vehicle availability state
- `deleted_at`: Soft-delete marker

## 5. Drivers

- `license_number`: Unique license identifier
- `license_category`, `license_expiry_date`, `contact_number`
- `safety_score`: Validated between 0 and 100
- `user_id`: Optional FK to `users.id`
- `deleted_at`: Soft-delete marker

## 6. Trips

Trips now use location IDs instead of plain strings.

- `source_location_id` / `destination_location_id`: FKs to `locations.id`
- `cargo_weight`, `planned_distance`, `actual_distance`, `fuel_consumed`, `revenue`: Positive-value checks
- `start_odometer`, `end_odometer`: Enforced so `end_odometer >= start_odometer` when both exist
- `dispatched_at`, `completed_at`: Enforced so completion cannot happen before dispatch
- `created_by`, `updated_by`: Audit columns
- `deleted_at`: Soft-delete marker

## 7. Maintenance Logs

- Stores maintenance work for a vehicle
- Includes `created_by`, `updated_by`, and `deleted_at`
- `cost` is validated as non-negative

## 8. Fuel Logs

- Stores fuel usage for a vehicle and optional trip link
- Includes `created_by`, `updated_by`, and `deleted_at`
- `liters` and `cost` are validated as non-negative

## 9. Expenses

- Stores expenses related to vehicles
- Includes `created_by`, `updated_by`, and `deleted_at`
- `cost` is validated as non-negative

---

## Integrity Rules Added

- Numeric values such as cargo weight, distance, cost, liters, and odometer must be `>= 0`
- Trip odometer values must not go backward
- A trip cannot be completed before it is dispatched
- Optional audit and soft-delete fields reduce accidental data loss

---

## Seed Data Notes

Seed data now includes:

- Five roles
- Five users with hashed passwords and profile values
- Six named locations
- Five vehicles
- Five drivers
- Four trips with normalized location references
- Maintenance, fuel, and expense entries tied to the main entities

---

## Recommended Next Step

When the application is ready, use the seeded users for login testing and then replace the seed values with real production-ready credentials and profile paths.
