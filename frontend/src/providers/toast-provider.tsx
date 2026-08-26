"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: "#FFFFFF",
          color: "#0F172A",
          border: "1px solid #E2E8F0",
          borderRadius: "16px",
          padding: "12px 16px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
          fontSize: "13px",
          fontWeight: 600,
          maxWidth: "420px",
        },
        success: {
          style: {
            border: "1px solid #A7F3D0",
          },
          iconTheme: {
            primary: "#047857",
            secondary: "#ECFDF5",
          },
        },
        error: {
          style: {
            border: "1px solid #FECACA",
          },
          iconTheme: {
            primary: "#B91C1C",
            secondary: "#FEF2F2",
          },
        },
      }}
    />
  );
}
