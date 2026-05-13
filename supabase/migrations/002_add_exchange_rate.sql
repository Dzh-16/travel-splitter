-- 为 expenses 表添加 exchange_rate 列
-- 用于锁定支出添加时的汇率（外币 → CNY），避免结算时汇率波动

ALTER TABLE expenses
ADD COLUMN exchange_rate DOUBLE PRECISION NULL;

COMMENT ON COLUMN expenses.exchange_rate IS '该币种 → CNY 的汇率，添加支出时锁定；CNY 币种为 NULL';
