import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiBitcoin, SiEthereum } from "react-icons/si";
import { Smartphone, Monitor, Wifi, Battery, Calendar } from "lucide-react";
import type { Claim } from "@shared/schema";

interface UserDetailModalProps {
  claim: Claim;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailModal({ claim, isOpen, onClose }: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState("balances");

  const coinIcons: Record<string, any> = {
    ETH: SiEthereum,
    BNB: SiBitcoin,
    BTC: SiBitcoin,
    SOL: SiEthereum,
    TRX: SiBitcoin,
    TON: SiEthereum,
    USDT_ERC20: SiBitcoin,
    USDT_BEP20: SiBitcoin,
    USDT_TRC20: SiBitcoin,
    USDC: SiBitcoin,
    MATIC: SiEthereum,
  };

  const coinColors: Record<string, string> = {
    ETH: "text-[#627EEA]",
    BNB: "text-[#F3BA2F]",
    BTC: "text-[#F7931A]",
    SOL: "text-[#14F195]",
    TRX: "text-[#FF060A]",
    TON: "text-[#0098EA]",
    USDT_ERC20: "text-[#26A17B]",
    USDT_BEP20: "text-[#26A17B]",
    USDT_TRC20: "text-[#26A17B]",
    USDC: "text-[#2775CA]",
    MATIC: "text-[#8247E5]",
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl rounded-2xl backdrop-blur-xl bg-card/95 border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">User Details</DialogTitle>
          <div className="pt-2">
            <code className="text-sm font-mono text-muted-foreground break-all">
              {claim.walletAddress}
            </code>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="pt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="balances" data-testid="tab-balances">Wallet Balances</TabsTrigger>
            <TabsTrigger value="device" data-testid="tab-device">Device Details</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">Connection History</TabsTrigger>
          </TabsList>

          <TabsContent value="balances" className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {claim.balances && Object.entries(claim.balances).map(([coin, balance]) => {
                if (!balance) return null;
                const Icon = coinIcons[coin] || SiBitcoin;
                const color = coinColors[coin] || "text-foreground";
                const displayName = coin.replace(/_/g, ' ');
                
                return (
                  <Card 
                    key={coin}
                    className="p-4 rounded-lg border-card-border"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={`w-6 h-6 ${color}`} />
                          <span className="text-sm font-medium text-muted-foreground">{displayName}</span>
                        </div>
                        <p className="text-2xl font-bold font-mono">{balance}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="device" className="pt-6">
            <div className="space-y-4">
              <Card className="p-6 rounded-lg border-card-border">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  Device Information
                </h3>
                <div className="space-y-3">
                  {claim.deviceBrowser && (
                    <div className="flex items-start gap-3">
                      <Monitor className="w-4 h-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <span className="text-sm text-muted-foreground">Browser:</span>
                        <p className="font-medium">{claim.deviceBrowser}</p>
                      </div>
                    </div>
                  )}
                  {claim.deviceOS && (
                    <div className="flex items-start gap-3">
                      <Smartphone className="w-4 h-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <span className="text-sm text-muted-foreground">Operating System:</span>
                        <p className="font-medium">{claim.deviceOS}</p>
                      </div>
                    </div>
                  )}
                  {claim.deviceNetwork && (
                    <div className="flex items-start gap-3">
                      <Wifi className="w-4 h-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <span className="text-sm text-muted-foreground">Network Type:</span>
                        <p className="font-medium">{claim.deviceNetwork}</p>
                      </div>
                    </div>
                  )}
                  {claim.deviceBattery && (
                    <div className="flex items-start gap-3">
                      <Battery className="w-4 h-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <span className="text-sm text-muted-foreground">Battery Level:</span>
                        <p className="font-medium">{claim.deviceBattery}</p>
                      </div>
                    </div>
                  )}
                  {claim.deviceScreen && (
                    <div className="flex items-start gap-3">
                      <Monitor className="w-4 h-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <span className="text-sm text-muted-foreground">Screen Resolution:</span>
                        <p className="font-medium">{claim.deviceScreen}</p>
                      </div>
                    </div>
                  )}
                  {claim.walletType && (
                    <div className="flex items-start gap-3">
                      <Smartphone className="w-4 h-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <span className="text-sm text-muted-foreground">Wallet Type:</span>
                        <p className="font-medium">{claim.walletType}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {claim.userAgent && (
                <Card className="p-6 rounded-lg border-card-border">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-primary" />
                    User Agent
                  </h3>
                  <code className="text-xs text-muted-foreground break-all block bg-muted/30 p-3 rounded">
                    {claim.userAgent}
                  </code>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="pt-6">
            <Card className="p-6 rounded-lg border-card-border">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        Connected
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(claim.claimedAt)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">
                      User connected wallet and claimed airdrop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Wallet: {claim.walletType || 'Unknown'} • Device: {claim.deviceBrowser || 'Unknown'}
                    </p>
                  </div>
                </div>

                {claim.updatedAt && claim.updatedAt !== claim.claimedAt && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">Updated</Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(claim.updatedAt)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">
                        Claim information updated
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
