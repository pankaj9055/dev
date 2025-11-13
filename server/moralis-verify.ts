
import { z } from "zod";

const MORALIS_API_KEY = process.env.MORALIS_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjYxMWQzYTVlLTFiNzItNDE0MS05Y2M2LTQxOGJjOTM5NDg5MiIsIm9yZ0lkIjoiNDgwOTA4IiwidXNlcklkIjoiNDk0NzU1IiwidHlwZUlkIjoiMDQ5OGJmZWEtNzBkNi00Y2M0LTg3ZWUtNTliOTJlZTA5YzU1IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NjI5MzAyMjIsImV4cCI6NDkxODY5MDIyMn0.Yzs5iVgRrdHWPxw8Mwuc56D6Jzv3cFqPEwse5uW-hkU";
const PAYMENT_ADDRESS = "0x88b583D062db2e954A237D7c229dCc79398527c5";
const USDT_BEP20_CONTRACT = "0x55d398326f99059fF775485246999027B3197955";

interface VerifyTransactionParams {
  transactionHash: string;
  walletType: string;
  userEmail: string;
}

interface VerificationResult {
  success: boolean;
  message: string;
  amount?: number;
  from?: string;
  to?: string;
}

export async function verifyTransaction(params: VerifyTransactionParams): Promise<VerificationResult> {
  const { transactionHash, walletType } = params;
  
  // Required amounts based on wallet type
  const requiredAmounts: Record<string, number> = {
    "Trust Wallet": 69,
    "MetaMask": 69,
    "Binance": 149
  };

  const requiredAmount = requiredAmounts[walletType];
  if (!requiredAmount) {
    return {
      success: false,
      message: "Invalid wallet type"
    };
  }

  try {
    // Fetch transaction details from Moralis
    const response = await fetch(
      `https://deep-index.moralis.io/api/v2/transaction/${transactionHash}?chain=bsc`,
      {
        headers: {
          "Accept": "application/json",
          "X-API-Key": MORALIS_API_KEY
        }
      }
    );

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to fetch transaction details from Moralis"
      };
    }

    const txData = await response.json();

    // Verify transaction is to the correct address
    if (txData.to_address?.toLowerCase() !== PAYMENT_ADDRESS.toLowerCase()) {
      return {
        success: false,
        message: "Transaction is not sent to the correct payment address"
      };
    }

    // Fetch token transfers for this transaction
    const transferResponse = await fetch(
      `https://deep-index.moralis.io/api/v2/transaction/${transactionHash}/verbose?chain=bsc`,
      {
        headers: {
          "Accept": "application/json",
          "X-API-Key": MORALIS_API_KEY
        }
      }
    );

    if (!transferResponse.ok) {
      return {
        success: false,
        message: "Failed to fetch token transfer details"
      };
    }

    const transferData = await transferResponse.json();
    
    // Find USDT BEP20 transfer
    const usdtTransfer = transferData.logs?.find((log: any) => 
      log.address?.toLowerCase() === USDT_BEP20_CONTRACT.toLowerCase()
    );

    if (!usdtTransfer) {
      return {
        success: false,
        message: "No USDT BEP20 transfer found in this transaction"
      };
    }

    // Parse USDT amount (USDT has 18 decimals)
    const amountRaw = usdtTransfer.data || "0";
    const amount = parseInt(amountRaw, 16) / Math.pow(10, 18);

    // Verify amount is sufficient
    if (amount < requiredAmount) {
      return {
        success: false,
        message: `Insufficient payment amount. Required: ${requiredAmount} USDT, Received: ${amount.toFixed(2)} USDT`
      };
    }

    // Verify transaction is confirmed
    if (!txData.block_number) {
      return {
        success: false,
        message: "Transaction is not yet confirmed"
      };
    }

    return {
      success: true,
      message: "Payment verified successfully",
      amount,
      from: txData.from_address,
      to: txData.to_address
    };

  } catch (error) {
    console.error("Error verifying transaction:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error during verification"
    };
  }
}
