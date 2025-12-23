import React, { useState, useEffect } from "react";
import { NewsletterSubscriber } from "@/api/apiClient";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Gift, Mail, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem("newsletter_popup_shown");
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem("newsletter_popup_shown", "true");
      }, 2000);
      return () => clearTimeout(timer);
    }

    // Listen for custom event to manually open popup
    const handleOpenPopup = () => {
      setIsOpen(true);
      setShowSuccess(false);
    };
    window.addEventListener("openNewsletterPopup", handleOpenPopup);
    return () => window.removeEventListener("openNewsletterPopup", handleOpenPopup);
  }, []);

  const generateDiscountCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "WELCOME";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const signupMutation = useMutation({
    mutationFn: async (data) => {
      await NewsletterSubscriber.subscribe(data.email);
      const code = generateDiscountCode();
      return { code };
    },
    onSuccess: (data) => {
      setDiscountCode(data.code);
      setShowSuccess(true);
      setError("");
    },
    onError: (error) => {
      if (error.message === "DUPLICATE_EMAIL") {
        setError("You're already subscribed! Check your email for your discount code.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.first_name || !formData.last_name || !formData.email) {
      setError("Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    signupMutation.mutate(formData);
  };

  const handleResendCode = async () => {
    if (!formData.email) {
      setError("Please enter your email address.");
      return;
    }
    setError("Please sign up again to get a new discount code.");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {!showSuccess ? (
          <div className="relative bg-white p-8">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-[var(--primary)] transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--accent)] rounded-full mb-4">
                <Gift size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-[var(--primary)] mb-2">Get 20% Off Your First Order!</h2>
              <p className="text-[var(--gray-medium)] text-sm">
                Sign up for our newsletter and receive an exclusive discount code for your first bulk hat order.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="text"
                  name="first_name"
                  placeholder="First Name *"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="text"
                  name="last_name"
                  placeholder="Last Name *"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <Input
                type="email"
                name="email"
                placeholder="Email Address *"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <Input
                type="tel"
                name="phone"
                placeholder="Phone Number (optional)"
                value={formData.phone}
                onChange={handleChange}
              />

              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-800 text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-[var(--primary)] hover:bg-[var(--accent)] text-white font-bold py-6 text-lg"
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending ? "Processing..." : "Get My 20% Off Code"}
              </Button>

              <button
                type="button"
                onClick={handleResendCode}
                className="w-full text-sm text-[var(--primary)] hover:text-[var(--accent)] underline"
              >
                Already subscribed? Resend my code
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle size={40} className="text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-[var(--primary)] mb-2">You're In! 🎉</h2>
            <p className="text-[var(--gray-medium)] mb-6">
              Your exclusive discount code has been sent to your email, but here it is again:
            </p>

            <div className="bg-[var(--primary)]/5 border-2 border-dashed border-[var(--accent)] rounded-lg p-6 mb-6">
              <p className="text-sm text-[var(--gray-medium)] mb-2">Your Discount Code:</p>
              <p className="text-4xl font-black text-[var(--primary)] mb-2">{discountCode}</p>
              <p className="text-lg font-bold text-[var(--accent)]">20% OFF</p>
            </div>

            <p className="text-sm text-[var(--gray-medium)] mb-6">
              Use this code on your first order of 144+ custom hats!
            </p>

            <Button
              onClick={() => setIsOpen(false)}
              className="w-full bg-[var(--primary)] hover:bg-[var(--accent)] text-white font-bold"
            >
              Start Designing My Hats
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}