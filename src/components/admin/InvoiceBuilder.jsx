import { useState, useCallback, useEffect } from "react";
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FileText, Upload, X } from "lucide-react";

const COMPANY_INFO = {
  name: "Caspary Hat Co",
  phone: "(281) 814-8024",
  email: "sales@casparyhats.com",
  website: "www.casparyhats.com",
};

const BRAND_COLORS = {
  navy: "#172C63",
  copper: "#D18F63",
  lightGray: "#F5F5F5",
};

const generateDefaultInvoiceNumber = () => {
  const dateStr = format(new Date(), "yyyyMMdd");
  return `INV-${dateStr}-001`;
};

export default function InvoiceBuilder({ inquiry, open, onClose }) {
  const [formData, setFormData] = useState({
    invoiceNumber: generateDefaultInvoiceNumber(),
    customerName: inquiry?.name || "",
    customerEmail: inquiry?.email || "",
    customerPhone: inquiry?.phone || "",
    customerCompany: inquiry?.company || "",
    shippingStreet: inquiry?.shipping_address?.street || "",
    shippingCity: inquiry?.shipping_address?.city || "",
    shippingState: inquiry?.shipping_address?.state || "",
    shippingZip: inquiry?.shipping_address?.zipCode || "",
    hatStyle: inquiry?.hat_style || inquiry?.event_type || "Custom Hat",
    quantity: inquiry?.quantity || 1,
    pricePerHat: "",
    notes: "",
  });

  const [mockupPreview, setMockupPreview] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Update form data when inquiry changes
  useEffect(() => {
    if (inquiry) {
      setFormData({
        invoiceNumber: generateDefaultInvoiceNumber(),
        customerName: inquiry.name || "",
        customerEmail: inquiry.email || "",
        customerPhone: inquiry.phone || "",
        customerCompany: inquiry.company || "",
        shippingStreet: inquiry.shipping_address?.street || "",
        shippingCity: inquiry.shipping_address?.city || "",
        shippingState: inquiry.shipping_address?.state || "",
        shippingZip: inquiry.shipping_address?.zipCode || "",
        hatStyle: inquiry.event_type || "Custom Hat",
        quantity: inquiry.quantity || 1,
        pricePerHat: "",
        notes: inquiry.message || "",
      });
    }
  }, [inquiry]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setMockupPreview(event.target.result);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => setMockupPreview(event.target.result);
      reader.readAsDataURL(file);
    }
  }, []);

  const removeImage = () => {
    setMockupPreview(null);
  };

  
  const subtotal = (parseFloat(formData.pricePerHat) || 0) * (parseInt(formData.quantity) || 0);

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = 20;

      // Load logo - wide horizontal logo
      let logoLoaded = false;
      try {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        await new Promise((resolve, reject) => {
          logoImg.onload = resolve;
          logoImg.onerror = reject;
          logoImg.src = "/logo.png";
        });
        // Logo is wide/horizontal, so use appropriate aspect ratio
        doc.addImage(logoImg, "PNG", margin, yPos, 70, 22);
        logoLoaded = true;
      } catch {
        console.log("Logo not loaded, using text header");
      }

      // Company header - below logo if loaded, otherwise at top
      if (logoLoaded) {
        yPos += 28;
      }

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(`${COMPANY_INFO.phone} | ${COMPANY_INFO.email}`, margin, yPos);

      // Invoice title and number - right aligned at top
      doc.setFontSize(28);
      doc.setTextColor(BRAND_COLORS.copper);
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE", pageWidth - margin, 25, { align: "right" });

      const invoiceDate = format(new Date(), "MMMM d, yyyy");

      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.setFont("helvetica", "normal");
      doc.text(`Invoice #: ${formData.invoiceNumber}`, pageWidth - margin, 35, { align: "right" });
      doc.text(`Date: ${invoiceDate}`, pageWidth - margin, 41, { align: "right" });

      yPos += 15;

      // Divider line
      doc.setDrawColor(BRAND_COLORS.copper);
      doc.setLineWidth(2);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 15;

      // Bill To / Ship To section
      const colWidth = (pageWidth - margin * 2) / 2;

      // Bill To
      doc.setFontSize(12);
      doc.setTextColor(BRAND_COLORS.navy);
      doc.setFont("helvetica", "bold");
      doc.text("BILL TO", margin, yPos);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60);
      yPos += 7;
      doc.text(formData.customerName, margin, yPos);
      if (formData.customerCompany) {
        yPos += 5;
        doc.text(formData.customerCompany, margin, yPos);
      }
      yPos += 5;
      doc.text(formData.customerEmail, margin, yPos);
      if (formData.customerPhone) {
        yPos += 5;
        doc.text(formData.customerPhone, margin, yPos);
      }

      // Ship To (if address exists)
      const hasShipping = formData.shippingStreet || formData.shippingCity;
      if (hasShipping) {
        let shipY = yPos - (formData.customerCompany ? 17 : 12) - (formData.customerPhone ? 5 : 0);
        doc.setFontSize(12);
        doc.setTextColor(BRAND_COLORS.navy);
        doc.setFont("helvetica", "bold");
        doc.text("SHIP TO", margin + colWidth, shipY);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60);
        shipY += 7;
        // Add name
        doc.text(formData.customerName, margin + colWidth, shipY);
        shipY += 5;
        // Add phone if exists
        if (formData.customerPhone) {
          doc.text(formData.customerPhone, margin + colWidth, shipY);
          shipY += 5;
        }
        // Add street address
        if (formData.shippingStreet) {
          doc.text(formData.shippingStreet, margin + colWidth, shipY);
          shipY += 5;
        }
        // Add city, state, zip
        const cityStateZip = [formData.shippingCity, formData.shippingState, formData.shippingZip]
          .filter(Boolean)
          .join(", ");
        if (cityStateZip) {
          doc.text(cityStateZip, margin + colWidth, shipY);
        }
      }

      yPos += 20;

      // Order table header
      doc.setFillColor(BRAND_COLORS.navy);
      doc.rect(margin, yPos, pageWidth - margin * 2, 10, "F");

      doc.setFontSize(10);
      doc.setTextColor(255);
      doc.setFont("helvetica", "bold");
      doc.text("DESCRIPTION", margin + 5, yPos + 7);
      doc.text("QTY", pageWidth - margin - 80, yPos + 7, { align: "center" });
      doc.text("PRICE", pageWidth - margin - 45, yPos + 7, { align: "center" });
      doc.text("TOTAL", pageWidth - margin - 10, yPos + 7, { align: "right" });

      yPos += 15;

      // Order row
      doc.setTextColor(60);
      doc.setFont("helvetica", "normal");
      doc.text(formData.hatStyle, margin + 5, yPos);
      doc.text(formData.quantity.toString(), pageWidth - margin - 80, yPos, { align: "center" });
      doc.text(`$${parseFloat(formData.pricePerHat || 0).toFixed(2)}`, pageWidth - margin - 45, yPos, {
        align: "center",
      });
      doc.text(`$${subtotal.toFixed(2)}`, pageWidth - margin - 10, yPos, { align: "right" });

      yPos += 10;

      // Subtotal line
      doc.setDrawColor(200);
      doc.setLineWidth(0.5);
      doc.line(pageWidth - margin - 100, yPos, pageWidth - margin, yPos);
      yPos += 8;

      // Total
      doc.setFontSize(12);
      doc.setTextColor(BRAND_COLORS.navy);
      doc.setFont("helvetica", "bold");
      doc.text("TOTAL:", pageWidth - margin - 50, yPos);
      doc.setTextColor(BRAND_COLORS.copper);
      doc.text(`$${subtotal.toFixed(2)}`, pageWidth - margin - 10, yPos, { align: "right" });

      yPos += 20;

      // Mockup image section - smaller size to fit on page
      if (mockupPreview) {
        doc.setFontSize(11);
        doc.setTextColor(BRAND_COLORS.navy);
        doc.setFont("helvetica", "bold");
        doc.text("HAT MOCKUP", margin, yPos);
        yPos += 3;

        try {
          const imgWidth = 50;
          const imgHeight = 38;
          doc.addImage(mockupPreview, "JPEG", margin, yPos, imgWidth, imgHeight);
          yPos += imgHeight + 8;
        } catch {
          console.log("Could not add mockup image to PDF");
          yPos += 3;
        }
      }

      // Calculate payment amounts
      const depositAmount = (subtotal * 0.5).toFixed(2);
      const deliveryAmount = (subtotal * 0.5).toFixed(2);

      // Payment terms
      doc.setFillColor(BRAND_COLORS.lightGray);
      doc.roundedRect(margin, yPos, pageWidth - margin * 2, 52, 3, 3, "F");

      doc.setFontSize(11);
      doc.setTextColor(BRAND_COLORS.navy);
      doc.setFont("helvetica", "bold");
      doc.text("Payment Terms", margin + 10, yPos + 9);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60);
      doc.text(`50% - $${depositAmount} deposit to start order`, margin + 10, yPos + 18);
      doc.text(`50% - $${deliveryAmount} due on delivery`, margin + 10, yPos + 26);

      // Payment options
      doc.setFontSize(11);
      doc.setTextColor(BRAND_COLORS.navy);
      doc.setFont("helvetica", "bold");
      doc.text("Payment Options", margin + 10, yPos + 38);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60);
      doc.text("Zelle: 281-814-8024    |    Venmo: @Reid-Caspary    |    Cashapp: $ReidCaspary", margin + 10, yPos + 47);

      yPos += 58;

      // Notes section (if any)
      if (formData.notes) {
        doc.setFontSize(11);
        doc.setTextColor(BRAND_COLORS.navy);
        doc.setFont("helvetica", "bold");
        doc.text("Notes", margin, yPos);
        yPos += 6;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60);
        const splitNotes = doc.splitTextToSize(formData.notes, pageWidth - margin * 2);
        doc.text(splitNotes, margin, yPos);
        yPos += splitNotes.length * 5 + 8;
      }

      // Footer - add spacing and draw at current position
      yPos += 5;

      doc.setDrawColor(BRAND_COLORS.copper);
      doc.setLineWidth(1);
      doc.line(margin, yPos, pageWidth - margin, yPos);

      yPos += 8;
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.setFont("helvetica", "italic");
      doc.text("Thank you for choosing Caspary Hat Co!", pageWidth / 2, yPos, { align: "center" });
      doc.text(COMPANY_INFO.website, pageWidth / 2, yPos + 5, { align: "center" });

      // Save the PDF
      const fileName = `Invoice-${formData.invoiceNumber}-${formData.customerName.replace(/\s+/g, "-")}.pdf`;
      doc.save(fileName);

      onClose();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating invoice. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[var(--primary)]">
            <FileText className="w-5 h-5" />
            Create Invoice
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Invoice Number */}
          <div>
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleInputChange}
              className="max-w-xs font-mono"
            />
          </div>

          {/* Customer Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Name</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="customerCompany">Company</Label>
                <Input
                  id="customerCompany"
                  name="customerCompany"
                  value={formData.customerCompany}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Shipping Address</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="shippingStreet">Street Address</Label>
                <Input
                  id="shippingStreet"
                  name="shippingStreet"
                  value={formData.shippingStreet}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="shippingCity">City</Label>
                <Input
                  id="shippingCity"
                  name="shippingCity"
                  value={formData.shippingCity}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="shippingState">State</Label>
                  <Input
                    id="shippingState"
                    name="shippingState"
                    value={formData.shippingState}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="shippingZip">ZIP</Label>
                  <Input
                    id="shippingZip"
                    name="shippingZip"
                    value={formData.shippingZip}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Details</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3 sm:col-span-1">
                <Label htmlFor="hatStyle">Hat Style / Description</Label>
                <Input
                  id="hatStyle"
                  name="hatStyle"
                  value={formData.hatStyle}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="pricePerHat">Price per Hat ($)</Label>
                <Input
                  id="pricePerHat"
                  name="pricePerHat"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.pricePerHat}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Total Preview */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-lg text-[var(--primary)]">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Mockup Image Upload */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Hat Mockup Image <span className="text-gray-400 font-normal">(Optional)</span>
            </h3>

            {!mockupPreview ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[var(--accent)] transition-colors"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById("mockupUpload").click()}
              >
                <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">Drag and drop an image or click to upload</p>
                <p className="text-sm text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                <input
                  id="mockupUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            ) : (
              <div className="relative">
                <img
                  src={mockupPreview}
                  alt="Hat mockup preview"
                  className="w-full max-h-48 object-contain rounded-lg border"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional notes for the invoice..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={generatePDF}
            disabled={!formData.pricePerHat || isGenerating}
            className="bg-[var(--primary)] hover:bg-[var(--primary)]/90"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate Invoice
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
