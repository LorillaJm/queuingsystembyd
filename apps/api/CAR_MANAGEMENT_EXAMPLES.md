# Car/Model Management API Examples

Complete examples for managing car models in the queue system.

---

## Authentication

All car management endpoints require staff PIN authentication via the `x-staff-pin` header.

```bash
# Default PIN for testing
PIN="1234"
```

---

## Create Car Model

**Endpoint:** `POST /api/staff/cars`

**Required Fields:**
- `branch` - Branch code (e.g., "MAIN", "NORTH")
- `model` - Car model name (1-60 characters)

**Optional Fields:**
- `capacity` - Number of available units (1-10, default: 1)
- `displayOrder` - Display order (1-999, default: 1)
- `imageUrl` - Image URL (max 500 characters)

###