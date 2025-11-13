import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClaimSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all claims (Admin panel)
  app.get("/api/claims", async (req, res) => {
    try {
      const allClaims = await storage.getAllClaims();
      return res.json(allClaims);
    } catch (error) {
      console.error("Error fetching claims:", error);
      return res.status(500).json({ 
        message: "Failed to fetch claims",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get claim by wallet address
  app.get("/api/claims/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const claim = await storage.getClaim(walletAddress);

      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }

      return res.json(claim);
    } catch (error) {
      console.error("Error fetching claim:", error);
      return res.status(500).json({ 
        message: "Failed to fetch claim",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create new claim
  app.post("/api/claims", async (req, res) => {
    try {
      const validatedData = insertClaimSchema.parse(req.body);

      const existingClaim = await storage.getClaim(validatedData.walletAddress);
      if (existingClaim) {
        const updatedClaim = await storage.updateClaim(
          validatedData.walletAddress,
          validatedData
        );
        return res.json(updatedClaim);
      }

      const newClaim = await storage.createClaim(validatedData);
      return res.status(201).json(newClaim);
    } catch (error) {
      console.error("Error creating claim:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid claim data",
          errors: error.errors 
        });
      }

      return res.status(500).json({ 
        message: "Failed to create claim",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update existing claim
  app.patch("/api/claims/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const updateData = req.body;

      const updatedClaim = await storage.updateClaim(walletAddress, updateData);

      if (!updatedClaim) {
        return res.status(404).json({ message: "Claim not found" });
      }

      return res.json(updatedClaim);
    } catch (error) {
      console.error("Error updating claim:", error);
      return res.status(500).json({ 
        message: "Failed to update claim",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Delete all claims (Admin panel)
  app.delete("/api/claims/all", async (req, res) => {
    try {
      await storage.deleteAllClaims();
      return res.json({ message: "All claims deleted successfully." });
    } catch (error) {
      console.error("Error deleting all claims:", error);
      return res.status(500).json({ 
        message: "Failed to delete all claims",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Verify payment transaction
  app.post("/api/verify-payment", async (req, res) => {
    try {
      const { transactionId, walletType, userEmail } = req.body;

      if (!transactionId || !walletType || !userEmail) {
        return res.status(400).json({ 
          message: "Missing required fields: transactionId, walletType, userEmail" 
        });
      }

      // Check if transaction ID already used
      const existingPurchase = await storage.getModWalletPurchase(transactionId);
      if (existingPurchase) {
        return res.status(400).json({ 
          message: "This transaction ID has already been used" 
        });
      }

      // Import verification function
      const { verifyTransaction } = await import("./moralis-verify");
      
      // Verify the transaction
      const result = await verifyTransaction({
        transactionHash: transactionId,
        walletType,
        userEmail
      });

      if (!result.success) {
        return res.status(400).json({ 
          message: result.message 
        });
      }

      // Save verified purchase to database
      const purchase = await storage.createModWalletPurchase({
        transactionId,
        userEmail,
        walletType,
        amount: result.amount || 0,
        verifiedAt: new Date()
      });

      return res.json({ 
        success: true,
        message: "Payment verified successfully",
        purchase
      });

    } catch (error) {
      console.error("Error verifying payment:", error);
      return res.status(500).json({ 
        message: "Failed to verify payment",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}