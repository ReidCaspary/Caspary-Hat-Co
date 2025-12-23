import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { ContactInquiry } from "@/api/apiClient";

export default function SubmitForm({ design, designPreview, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Build design summary for the inquiry
      const designSummary = [
        `Hat Style: ${design.hatStyle === "classic" ? "The Classic (Trucker)" : "The Caddie (Rope Hat)"}`,
        `Colors - Front: ${design.colors.front}, Back: ${design.colors.back}, Brim: ${design.colors.brim}`,
        `Quantity: ${design.quantity}`,
        `Design Elements: ${design.elements.length} item(s)`,
        design.elements
          .map((el) =>
            el.type === "text"
              ? `  - Text: "${el.content}" (${el.font}, ${el.color})`
              : `  - Image: ${el.url}`
          )
          .join("\n"),
      ].join("\n");

      const message = `
HAT DESIGN QUOTE REQUEST

${designSummary}

Additional Notes:
${formData.notes || "None"}

Company: ${formData.company || "N/A"}
      `.trim();

      await ContactInquiry.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: "Hat Design Quote Request",
        message: message,
      });

      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Submit error:", err);
      setError("Failed to submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Quote Request Sent!</h3>
        <p className="text-gray-600">
          Thank you for your interest! We'll review your design and get back to
          you within 1-2 business days with a detailed quote.
        </p>
        <p className="text-sm text-gray-500">
          Check your email ({formData.email}) for a confirmation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900">Submit for Quote</h3>
      <p className="text-sm text-gray-600">
        Enter your details and we'll send you a custom quote for your design.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-sm text-gray-700">
            Full Name *
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="John Smith"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="email" className="text-sm text-gray-700">
            Email *
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="john@company.com"
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone" className="text-sm text-gray-700">
            Phone
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(555) 123-4567"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="company" className="text-sm text-gray-700">
            Company/Organization
          </Label>
          <Input
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Acme Corp"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes" className="text-sm text-gray-700">
          Additional Notes
        </Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any special requests or questions about your order..."
          rows={3}
          className="mt-1"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
      )}

      <Button
        type="submit"
        disabled={submitting || !formData.name || !formData.email}
        className="w-full bg-[var(--accent)] hover:bg-[var(--primary)] text-white font-bold py-3 text-lg"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-5 h-5 mr-2" />
            Submit Quote Request
          </>
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        By submitting, you agree to be contacted about your quote request.
      </p>
    </form>
  );
}
