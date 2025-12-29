import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HatDesigner from "@/components/designer/HatDesigner";
import { HatConfig } from "@/api/apiClient";
import { HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";

const designerStyles = `
  :root {
    --primary: rgb(23, 44, 99);
    --accent: rgb(209, 143, 99);
    --navy: rgb(23, 44, 99);
    --black: #000000;
    --white: #ffffff;
    --gray-light: #f8f9fa;
    --gray-medium: #6b7280;
    --gray-dark: #1f2937;
  }
`;

export default function Designer() {
  const [isEnabled, setIsEnabled] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await HatConfig.getSettings();
        setIsEnabled(settings?.enabled !== false);
      } catch (error) {
        // Default to enabled if fetch fails
        setIsEnabled(true);
      }
    };
    fetchSettings();
  }, []);

  // Show loading state while checking
  if (isEnabled === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <style>{designerStyles}</style>
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Show message when designer is disabled
  if (!isEnabled) {
    return (
      <div className="min-h-screen bg-gray-50">
        <style>{designerStyles}</style>
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <HardHat className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Hat Designer Coming Soon
          </h1>
          <p className="text-gray-600 mb-8">
            Our hat designer tool is currently unavailable. Please contact us directly to discuss your custom hat needs.
          </p>
          <Link to="/contact">
            <Button className="bg-[var(--primary)] hover:bg-[var(--accent)] text-white font-semibold px-8 py-3 rounded-lg">
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{designerStyles}</style>
      <HatDesigner />
    </div>
  );
}
