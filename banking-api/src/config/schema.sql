-- =====================================================================
-- Banking API - Database Schema (MySQL / MariaDB)
-- =====================================================================
-- Run this once to create the database structure, or use `npm run migrate`
-- which executes this file programmatically.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS banking_api
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE banking_api;

-- ---------------------------------------------------------------------
-- USERS
-- Stores both regular customers and admins (role-based access control)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  status ENUM('active', 'suspended', 'closed') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- ACCOUNTS
-- Each user can hold multiple accounts (checking, savings, etc.)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) NOT NULL UNIQUE,
  account_number VARCHAR(20) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  account_type ENUM('checking', 'savings') NOT NULL DEFAULT 'checking',
  balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  currency CHAR(3) NOT NULL DEFAULT 'XAF',
  status ENUM('active', 'frozen', 'closed') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_balance_non_negative CHECK (balance >= 0),
  INDEX idx_accounts_user (user_id),
  INDEX idx_accounts_number (account_number)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- TRANSACTIONS
-- A unified ledger for deposits, withdrawals, and transfers.
-- For transfers, two rows are written (debit on source, credit on destination)
-- linked by `transfer_group_id` so the full picture can be reconstructed.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) NOT NULL UNIQUE,
  account_id INT NOT NULL,
  type ENUM('deposit', 'withdrawal', 'transfer_in', 'transfer_out') NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  balance_after DECIMAL(15,2) NOT NULL,
  description VARCHAR(255),
  transfer_group_id CHAR(36) NULL, -- links the two legs of a transfer
  related_account_id INT NULL,     -- the counterparty account in a transfer
  status ENUM('pending', 'completed', 'failed', 'reversed') NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transactions_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  CONSTRAINT fk_transactions_related_account FOREIGN KEY (related_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
  CONSTRAINT chk_amount_positive CHECK (amount > 0),
  INDEX idx_transactions_account (account_id),
  INDEX idx_transactions_group (transfer_group_id),
  INDEX idx_transactions_created (created_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- AUDIT_LOGS
-- Tracks sensitive admin actions (account freezes, status changes, etc.)
-- for accountability and traceability - common requirement in banking systems.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actor_user_id INT NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id VARCHAR(50),
  details JSON NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_actor (actor_user_id),
  INDEX idx_audit_action (action)
) ENGINE=InnoDB;
