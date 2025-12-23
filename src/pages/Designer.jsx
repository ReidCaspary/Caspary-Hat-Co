import React from "react";
import HatDesigner from "@/components/designer/HatDesigner";

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
  return (
    <div className="min-h-screen bg-gray-50">
      <style>{designerStyles}</style>
      <HatDesigner />
    </div>
  );
}
