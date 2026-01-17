import React, { useState, useRef, useEffect } from "react";
import { ContactInquiry } from "@/api/apiClient";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, CheckCircle, Truck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Whiteboard from "../components/Whiteboard";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    quantity: "0",
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: ""
    }
  });
  const [submitted, setSubmitted] = useState(false);
  const whiteboardRef = useRef(null);

  // Read quantity and style from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const quantityParam = urlParams.get('quantity');
    const styleParam = urlParams.get('style');
    
    setFormData((prev) => ({
      ...prev,
      ...(quantityParam && { quantity: quantityParam }),
      ...(styleParam && { subject: styleParam })
    }));

    return () => {
      // Cleanup to prevent any DOM issues
    };
  }, []);
  const createInquiry = useMutation({
    mutationFn: async (data) => {
      return ContactInquiry.create({
        name: data.name,
        email: data.email,
        phone: data.phone,
        event_type: data.subject,
        message: data.message,
        quantity: data.quantity,
        whiteboard_image: data.whiteboardData,
        shipping_address: data.shippingAddress
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        quantity: "0",
        shippingAddress: { street: "", city: "", state: "", zipCode: "" }
      });
      if (whiteboardRef.current && whiteboardRef.current.clearCanvas) {
        whiteboardRef.current.clearCanvas();
      }
      setTimeout(() => setSubmitted(false), 5000);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields before proceeding
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      return; // Let HTML5 validation handle the error display
    }

    let exportedWhiteboardData = null;
    if (whiteboardRef.current && whiteboardRef.current.exportCanvas) {
      try {
        exportedWhiteboardData = whiteboardRef.current.exportCanvas();
      } catch (error) {
        console.error('Whiteboard export failed:', error);
      }
    }

    createInquiry.mutate({
      ...formData,
      whiteboardData: exportedWhiteboardData
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        [name]: value
      }
    }));
  };

  return (
    <div>
      {/* Hero Section - More Compact */}
      <section className="relative h-40 sm:h-48 lg:h-60 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=2070)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
          <div className="absolute inset-0 bg-[var(--navy)]/70" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-blue-950 mb-2 sm:mb-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">Let's Create Together</h1>
          <div className="w-12 sm:w-16 lg:w-20 h-0.5 sm:h-1 bg-[var(--orange)] mx-auto mb-2 sm:mb-3" />
          <p className="text-sky-950 mx-auto text-sm sm:text-base lg:text-lg max-w-2xl">Ready to start your custom hat project? Get in touch today.</p>
        </div>
      </section>

      {/* Contact Section - Compact */}
      <section className="py-6 sm:py-8 lg:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Contact Info - Compact */}
            <div className="lg:col-span-1">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--black)] mb-3 sm:mb-4">
                Contact Information
              </h2>
              <div className="w-12 sm:w-16 h-0.5 sm:h-1 bg-[var(--orange)] mb-4 sm:mb-6" />
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-[var(--orange)]/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[var(--orange)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--black)] mb-1 text-sm">Address</h3>
                    <p className="text-[var(--gray-medium)] text-sm">Houston, Texas


                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-[var(--navy)]/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-[var(--navy)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--black)] mb-1 text-sm">Phone</h3>
                    <a href="tel:+12818148024" className="text-[var(--gray-medium)] hover:text-[var(--orange)] transition-colors text-sm">
                      (281) 814 8024
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-[var(--orange)]/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[var(--orange)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--black)] mb-1 text-sm">Email</h3>
                    <a href="mailto:info@casparyhatco.com" className="text-[var(--gray-medium)] hover:text-[var(--orange)] transition-colors text-sm">sales@casparyhats.com

                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-[var(--navy)]/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[var(--navy)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--black)] mb-1 text-sm">Business Hours</h3>
                    <p className="text-[var(--gray-medium)] text-sm">
                      Mon - Fri: 9am - 6pm<br />
                      Sat: 10am - 4pm<br />
                      Sun: Closed
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-[var(--black)] mb-3 text-sm">Follow Us</h3>
                <div className="flex space-x-3">
                  <a href="#" className="w-9 h-9 bg-[var(--navy)] rounded-full flex items-center justify-center text-white hover:bg-[var(--orange)] transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  </a>
                  <a href="#" className="w-9 h-9 bg-[var(--navy)] rounded-full flex items-center justify-center text-white hover:bg-[var(--orange)] transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                  </a>
                  <a href="#" className="w-9 h-9 bg-[var(--navy)] rounded-full flex items-center justify-center text-white hover:bg-[var(--orange)] transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" /></svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form - Compact */}
            <div className="lg:col-span-2">
              <div className="bg-[var(--gray-light)] rounded-lg p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--black)] mb-3 sm:mb-4">
                  Request a Custom Quote
                </h2>
                <div className="w-12 sm:w-16 h-0.5 sm:h-1 bg-[var(--orange)] mb-4 sm:mb-6" />

                {submitted &&
                <Alert className="mb-4 bg-green-50 border-green-200">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-800 text-sm">
                      Thank you! Your inquiry has been submitted. We'll contact you soon.
                    </AlertDescription>
                  </Alert>
                }

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--black)] mb-1">
                        Name *
                      </label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Your name"
                        className="w-full h-9" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--black)] mb-1">
                        Email *
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="your@email.com"
                        className="w-full h-9" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--black)] mb-1">
                        Phone
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(555) 123-4567"
                        className="w-full h-9" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--black)] mb-1">
                        Quantity
                      </label>
                      <Input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        className="w-full h-9" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--black)] mb-1">
                        Style
                      </label>
                      <Input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="e.g., Classic Trucker, Rope Hat, Corduroy"
                        className="w-full h-9" />
                    </div>
                  </div>

                  {/* Shipping Address Section */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center gap-2 mb-3">
                      <Truck className="w-5 h-5 text-[var(--orange)]" />
                      <h3 className="text-sm font-semibold text-[var(--black)]">Shipping Address</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-[var(--black)] mb-1">
                          Street Address
                        </label>
                        <Input
                          type="text"
                          name="street"
                          value={formData.shippingAddress.street}
                          onChange={handleShippingChange}
                          placeholder="123 Main St"
                          autoComplete="street-address"
                          className="w-full h-9"
                        />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-[var(--black)] mb-1">
                            City
                          </label>
                          <Input
                            type="text"
                            name="city"
                            value={formData.shippingAddress.city}
                            onChange={handleShippingChange}
                            placeholder="City"
                            autoComplete="address-level2"
                            className="w-full h-9" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[var(--black)] mb-1">
                            State
                          </label>
                          <Input
                            type="text"
                            name="state"
                            value={formData.shippingAddress.state}
                            onChange={handleShippingChange}
                            placeholder="TX"
                            autoComplete="address-level1"
                            className="w-full h-9" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[var(--black)] mb-1">
                            ZIP Code
                          </label>
                          <Input
                            type="text"
                            name="zipCode"
                            value={formData.shippingAddress.zipCode}
                            onChange={handleShippingChange}
                            placeholder="77001"
                            autoComplete="postal-code"
                            className="w-full h-9" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--black)] mb-1">
                      Tell us about your custom cap project *
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Include details like quantity, design ideas, embroidery needs, colors, timeline, etc."
                      rows={4}
                      className="w-full" />
                  </div>

                  {/* Whiteboard Section - Compact */}
                  <div>
                    <label className="text-[var(--accent)] mb-3 text-base font-medium block">
                      Add your logo and ideas below — we'll create custom designs for you
                    </label>
                    <p className="text-xs text-[var(--gray-medium)] mb-3">
                      Sketch your design, add text, or drag and drop your logo directly onto the canvas.
                    </p>
                    <Whiteboard ref={whiteboardRef} />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="bg-[var(--orange)] text-slate-950 px-6 h-10 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow w-full hover:bg-[var(--orange)]/90"
                    disabled={createInquiry.isPending}>
                    {createInquiry.isPending ? 'Sending...' : 'Request Quote'}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section - Compact */}
      <section className="h-48 sm:h-64 lg:h-80 bg-gray-200">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3445.158953145983!2d-97.74306368488257!3d30.26715908180756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644b5a71e0a3fa9%3A0x8f0a6f5f6e4e2b9c!2sAustin%2C%20TX!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Caspary Hat Co. Location" />
      </section>
    </div>);

}