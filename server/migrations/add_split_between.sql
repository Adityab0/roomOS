-- Add split_between column to transactions table to store who the expense was split between
ALTER TABLE transactions ADD COLUMN split_between TEXT;
