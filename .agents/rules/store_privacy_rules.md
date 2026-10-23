# 🛡️ Planto Business Rule: Store & Nursery Privacy (No Public Live Map)

> **Core Principle**: Planto operates on a managed hyperlocal quick-commerce model (similar to Blinkit / Zepto / Swiggy Instamart). We **DO NOT** display direct physical store locations, exact nursery GPS coordinates, or public store map views to end customers.

---

## 🚫 1. Absolute Rule: No Public Map (`/map`)
* **Live Map Disabled**: The public `/map` route, map view buttons, and all store pin navigators on customer-facing pages are disabled and removed.
* **Navigation**:
  * "Live Map" must **NEVER** appear in the customer header navigation bar, footer, or homepage buttons.
  * Direct URL access to `/map` must automatically redirect to `/nurseries` or `/`.

---

## 🏬 2. Business Justification & Rationale
1. **Prevent Offline Disintermediation**:
   * If customers can see exact nursery street locations, phone numbers, and physical stall pins, they may bypass the platform and transact directly in cash offline.
2. **Managed Delivery Experience**:
   * Planto provides curated 10-20 minute doorstep delivery with plant packaging crates and dedicated riders.
   * Customers order online; our vetted delivery fleet picks up plants from partner nurseries and delivers them safely.
3. **Vendor Security & Privacy**:
   * Partner nurseries are inventory fulfillment hubs (Dark Stores / Partner Supply Hubs).
   * Exact physical addresses and storekeeper contact details are only shared securely with the **assigned Delivery Partner** for an active order via pickup PIN verification (`mobile-delivery`).

---

## 🧭 3. Permitted Map Usages
* **Customer Doorstep Address Picker**: The map picker used when a customer is entering or pinning their *own* delivery address (`AddressMapPicker.jsx`) is permitted.
* **Delivery Hero Navigation**: Turn-by-turn routing inside the Delivery Partner mobile app (`mobile-delivery/`) is permitted strictly for active orders.
* **Live Order Delivery Tracker**: Showing the rider moving towards the customer's home after pickup is permitted (showing only the delivery progress to the doorstep).
