
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Gift, TrendingUp } from "lucide-react";

interface AirdropFinishedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AirdropFinishedModal({ isOpen, onClose }: AirdropFinishedModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl backdrop-blur-xl border-yellow-400/30 text-center"
                     style={{ background: 'linear-gradient(135deg, #4A148C 0%, #7B1FA2 100%)' }}>
        <div className="py-8 space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-green-400" />
              </div>
              <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white">
              Pre-Registration Successful! 🎉
            </h2>
            <p className="text-xl text-yellow-400 font-semibold">
              You've registered for 10,00,000 PI Airdrop
            </p>
            <p className="text-sm text-white/70 max-w-sm mx-auto">
              Your wallet has been verified! Airdrop will be sent randomly to registered wallets within 7 days after distribution starts.
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-yellow-400/20">
            <Gift className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <p className="text-white/90 leading-relaxed text-sm">
              Thank you for participating in the Pi Network Airdrop. You will be notified when the distribution begins.
            </p>
          </div>

          {/* Next Steps */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-start gap-3 text-left">
              <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">What's Next?</h4>
                <p className="text-xs text-white/70">
                  Stay tuned for updates on the official distribution timeline. Keep an eye on your registered wallet.
                </p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="pt-4">
            <Button
              size="lg"
              onClick={onClose}
              className="w-full max-w-xs rounded-xl bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold"
              data-testid="button-close-finished"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
