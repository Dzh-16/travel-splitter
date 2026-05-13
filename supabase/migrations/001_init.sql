-- Travel Splitter v2 数据库迁移脚本
-- 在 Supabase SQL Editor 中执行

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. trips 表
-- ============================================================
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  default_currency TEXT NOT NULL DEFAULT 'CNY',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. members 表
-- ============================================================
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_members_trip_id ON members(trip_id);

-- ============================================================
-- 3. expenses 表
-- ============================================================
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount INTEGER NOT NULL,          -- 金额，单位：分（原始币种）
  currency TEXT NOT NULL DEFAULT 'CNY',
  paid_by_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_expenses_trip_id ON expenses(trip_id);

-- ============================================================
-- 4. expense_participants 表
-- ============================================================
CREATE TABLE expense_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  share_amount INTEGER NOT NULL      -- 分摊金额，单位：分（原始币种）
);

CREATE INDEX idx_expense_participants_expense_id ON expense_participants(expense_id);
CREATE INDEX idx_expense_participants_member_id ON expense_participants(member_id);

-- ============================================================
-- 5. Row Level Security (无认证，完全公开)
-- ============================================================
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_access" ON trips FOR ALL USING (true);
CREATE POLICY "public_access" ON members FOR ALL USING (true);
CREATE POLICY "public_access" ON expenses FOR ALL USING (true);
CREATE POLICY "public_access" ON expense_participants FOR ALL USING (true);

-- ============================================================
-- 6. 启用 Realtime（仅订阅需要的表）
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE members;
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
