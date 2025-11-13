import { claims, type Claim, type InsertClaim } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getClaim(walletAddress: string): Promise<Claim | undefined>;
  getAllClaims(): Promise<Claim[]>;
  createClaim(claim: InsertClaim): Promise<Claim>;
  updateClaim(walletAddress: string, claim: Partial<InsertClaim>): Promise<Claim | undefined>;
  deleteAllClaims(): Promise<void>;
  getModWalletPurchase(transactionId: string): Promise<any>;
  createModWalletPurchase(data: {
    transactionId: string;
    userEmail: string;
    walletType: string;
    amount: number;
    verifiedAt: Date;
  }): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getClaim(walletAddress: string): Promise<Claim | undefined> {
    const [claim] = await db
      .select()
      .from(claims)
      .where(eq(claims.walletAddress, walletAddress));
    return claim || undefined;
  }

  async getAllClaims(): Promise<Claim[]> {
    return await db.select().from(claims).orderBy(claims.claimedAt);
  }

  async createClaim(insertClaim: InsertClaim): Promise<Claim> {
    const [claim] = await db
      .insert(claims)
      .values(insertClaim)
      .returning();
    return claim;
  }

  async updateClaim(walletAddress: string, updateData: Partial<InsertClaim>): Promise<Claim | undefined> {
    const [claim] = await db
      .update(claims)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(claims.walletAddress, walletAddress))
      .returning();
    return claim || undefined;
  }

  async deleteAllClaims(): Promise<void> {
    await db.delete(claims);
  }

  async getModWalletPurchase(transactionId: string): Promise<any> {
    const result = await db
      .select()
      .from(claims)
      .where(eq(claims.walletAddress, transactionId))
      .limit(1);
    return result[0];
  }

  async createModWalletPurchase(data: {
    transactionId: string;
    userEmail: string;
    walletType: string;
    amount: number;
    verifiedAt: Date;
  }): Promise<any> {
    const result = await db
      .insert(claims)
      .values({
        walletAddress: data.transactionId,
        walletType: `MOD_${data.walletType}`,
        claimedAt: data.verifiedAt,
        balances: { payment_amount: data.amount.toString(), email: data.userEmail },
      })
      .returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();