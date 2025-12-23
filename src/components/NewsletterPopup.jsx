import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
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
      const existing = await base44.entities.NewsletterSubscriber.filter({ email: data.email });
      
      if (existing.length > 0) {
        throw new Error("DUPLICATE_EMAIL");
      }

      const code = generateDiscountCode();
      const subscriber = await base44.entities.NewsletterSubscriber.create({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || "",
        discount_code: code,
        code_used: false
      });

      await base44.integrations.Core.SendEmail({
        to: data.email,
        subject: "Your 20% Off Discount Code from Caspary Hat Co! 🧢",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #172C63;">Welcome to Caspary Hat Co., ${data.first_name}!</h1>
            <p style="font-size: 16px; color: #333;">Thank you for signing up! Here's your exclusive discount code:</p>
            
            <div style="background: #f8f9fa; border: 2px dashed #D18F63; padding: 20px; text-align: center; margin: 20px 0;">
              <h2 style="color: #172C63; font-size: 32px; margin: 0;">${code}</h2>
              <p style="color: #D18F63; font-size: 18px; font-weight: bold; margin: 10px 0 0 0;">20% OFF Your First Order!</p>
            </div>

            <p style="font-size: 16px; color: #333;">Use this code when ordering your custom hats to receive 20% off your entire first order.</p>
            
            <p style="font-size: 14px; color: #666;"><strong>Important:</strong> Our minimum order quantity is 144 hats (12 dozen). Perfect for events, corporate gifts, weddings, and team gear!</p>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="${window.location.origin}/Contact" style="background: #172C63; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Start Designing Your Custom Hats</a>
            </div>

            <p style="font-size: 14px; color: #666; margin-top: 30px;">Questions? Reply to this email or contact us at sales@casparyhats.com or (281) 814-8024.</p>
            
            <p style="font-size: 14px; color: #999; margin-top: 20px;">Caspary Hat Co. | Houston, TX | Custom Hats Made with Texas Pride</p>
          </div>
        `
      });

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

    try {
      const existing = await base44.entities.NewsletterSubscriber.filter({ email: formData.email });
      if (existing.length === 0) {
        setError("Email not found. Please sign up first.");
        return;
      }

      const subscriber = existing[0];
      await base44.integrations.Core.SendEmail({
        to: formData.email,
        subject: "Your Caspary Hat Co. Discount Code 🧢",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #172C63;">Hi ${subscriber.first_name}!</h1>
            <p style="font-size: 16px; color: #333;">Here's your exclusive discount code again:</p>
            
            <div style="background: #f8f9fa; border: 2px dashed #D18F63; padding: 20px; text-align: center; margin: 20px 0;">
              <h2 style="color: #172C63; font-size: 32px; margin: 0;">${subscriber.discount_code}</h2>
              <p style="color: #D18F63; font-size: 18px; font-weight: bold; margin: 10px 0 0 0;">20% OFF Your First Order!</p>
            </div>

            <p style="font-size: 16px; color: #333;">${subscriber.code_used ? 'This code has already been used.' : 'Use this code when ordering your custom hats!'}</p>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="${window.location.origin}/Contact" style="background: #172C63; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Contact Us</a>
            </div>
          </div>
        `
      });

      setError("");
      setDiscountCode(subscriber.discount_code);
      setShowSuccess(true);
    } catch (err) {
      setError("Failed to resend code. Please try again.");
    }
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