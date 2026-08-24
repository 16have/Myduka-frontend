-- MyDuka database schema
--
-- Reverse-engineered from the frontend's data contracts:
--   - src/lib/api.js            (users, invitations, sessions)
--   - src/services/demoData.js  (products, stock transactions, spoilage, supply requests)
--
-- Portable across SQLite and PostgreSQL: no native ENUM types, just CHECK
-- constraints on TEXT columns, and INTEGER/NUMERIC/TEXT/TIMESTAMP types that
-- both engines understand. Swap AUTOINCREMENT-style ids for a SERIAL/IDENTITY
-- column if the backend targets Postgres directly.
--
-- Not wired up to any backend yet -- this is the design only.

-- ---------------------------------------------------------------------------
-- users
-- One flat table for all three roles (merchant, admin, clerk). The app is
-- single-store: exactly one merchant account "owns" every admin and clerk,
-- so no separate stores/tenants table is modeled.
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  role          TEXT NOT NULL CHECK (role IN ('merchant', 'admin', 'clerk')),
  password_hash TEXT NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users (role);

-- ---------------------------------------------------------------------------
-- invitations
-- Merchant-issued, expiring, single-use links that let a person register as
-- an admin (src/pages/RegisterAdmin.jsx). Clerks are not invited this way --
-- an admin creates a clerk account directly with a temporary password
-- (see users.password_hash being set straight from createClerk()).
-- ---------------------------------------------------------------------------
CREATE TABLE invitations (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL,
  token         TEXT NOT NULL UNIQUE,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired')),
  invited_by_id INTEGER NOT NULL REFERENCES users (id),
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at    TIMESTAMP NOT NULL
);

CREATE INDEX idx_invitations_email ON invitations (email);
CREATE INDEX idx_invitations_status ON invitations (status);

-- ---------------------------------------------------------------------------
-- products
-- The inventory catalog. current_stock is the running balance kept in sync
-- by stock_transactions (+) and spoilage_records (-). stock_status
-- ("In Stock" / "Low Stock" / "Out of Stock") is NOT stored -- it's derived
-- at query time from current_stock vs minimum_stock_level, exactly as
-- demoApi.getInventory() computes it on the frontend today.
-- ---------------------------------------------------------------------------
CREATE TABLE products (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  name                TEXT NOT NULL,
  category            TEXT,
  buying_price        NUMERIC(12, 2) NOT NULL CHECK (buying_price >= 0),
  selling_price       NUMERIC(12, 2) NOT NULL CHECK (selling_price >= 0),
  current_stock       INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  minimum_stock_level INTEGER NOT NULL DEFAULT 0 CHECK (minimum_stock_level >= 0),
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- stock_transactions
-- One row per "receive stock" event (src/pages/ReceiveStockPage.jsx). Prices
-- are captured at the time of receipt (not just read from products), because
-- a product's buying/selling price can change between deliveries and past
-- transactions must keep their original figures.
--
-- payment_status doubles as the "unpaid stock" list
-- (src/pages/AdminUnpaidStock.jsx filters this column directly) -- there is
-- no separate payments table because the app never models partial payments,
-- payment methods, or multiple payments against one delivery.
-- ---------------------------------------------------------------------------
CREATE TABLE stock_transactions (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  reference_number TEXT NOT NULL UNIQUE,
  product_id       INTEGER NOT NULL REFERENCES products (id),
  quantity         INTEGER NOT NULL CHECK (quantity > 0),
  buying_price     NUMERIC(12, 2) NOT NULL CHECK (buying_price >= 0),
  selling_price    NUMERIC(12, 2) NOT NULL CHECK (selling_price >= 0),
  total_amount     NUMERIC(14, 2) NOT NULL CHECK (total_amount >= 0),
  supplier         TEXT,
  payment_status   TEXT NOT NULL DEFAULT 'Not Paid' CHECK (payment_status IN ('Paid', 'Not Paid')),
  notes            TEXT,
  recorded_by_id   INTEGER NOT NULL REFERENCES users (id),
  date_received    DATE NOT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_transactions_product ON stock_transactions (product_id);
CREATE INDEX idx_stock_transactions_payment_status ON stock_transactions (payment_status);

-- ---------------------------------------------------------------------------
-- spoilage_records
-- One row per spoilage event (src/pages/SpoilagePage.jsx). Reduces the
-- related product's current_stock; the backend must reject a spoilage
-- quantity greater than the product's current stock (demoApi.recordSpoilage
-- already enforces this rule client-side).
-- ---------------------------------------------------------------------------
CREATE TABLE spoilage_records (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id     INTEGER NOT NULL REFERENCES products (id),
  quantity       INTEGER NOT NULL CHECK (quantity > 0),
  reason         TEXT NOT NULL,
  notes          TEXT,
  recorded_by_id INTEGER NOT NULL REFERENCES users (id),
  occurred_on    DATE NOT NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_spoilage_records_product ON spoilage_records (product_id);

-- ---------------------------------------------------------------------------
-- supply_requests
-- A clerk asks for more of a product; an admin approves/declines/progresses
-- it through the status pipeline used by AdminSupplyRequests.jsx.
-- decided_by_id is nullable (nobody has acted on a Pending request yet) and
-- is a value the current localStorage demo doesn't track, but a real backend
-- needs for an audit trail of who approved/declined what.
-- ---------------------------------------------------------------------------
CREATE TABLE supply_requests (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id      INTEGER NOT NULL REFERENCES products (id),
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  reason          TEXT NOT NULL,
  notes           TEXT,
  status          TEXT NOT NULL DEFAULT 'Pending'
                    CHECK (status IN ('Pending', 'Approved', 'Declined', 'Ordered', 'Received')),
  admin_response  TEXT,
  requested_by_id INTEGER NOT NULL REFERENCES users (id),
  decided_by_id   INTEGER REFERENCES users (id),
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_supply_requests_status ON supply_requests (status);
CREATE INDEX idx_supply_requests_requested_by ON supply_requests (requested_by_id);
