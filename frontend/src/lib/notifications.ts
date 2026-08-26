import toastOriginal, { ToastOptions } from "react-hot-toast";

export interface NotifyOptions extends ToastOptions {
  description?: string;
}

/**
 * Standard enterprise toast notification wrapper
 */
export const notify = {
  success(message: string, options?: NotifyOptions) {
    return toastOriginal.success(message, {
      ...options,
      style: {
        background: "#FFFFFF",
        color: "#0F172A",
        border: "1px solid #A7F3D0",
        borderRadius: "16px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
        fontSize: "13px",
        fontWeight: 600,
        ...options?.style,
      },
      iconTheme: {
        primary: "#047857",
        secondary: "#ECFDF5",
      },
    });
  },

  error(message: string, options?: NotifyOptions) {
    // Sanitize technical messages
    let cleanMessage = message;
    if (
      message.includes("AxiosError") ||
      message.includes("SQLSTATE") ||
      message.includes("undefined") ||
      message.includes("Network Error")
    ) {
      cleanMessage = "Unable to complete this action. Please try again.";
    }

    return toastOriginal.error(cleanMessage, {
      ...options,
      style: {
        background: "#FFFFFF",
        color: "#0F172A",
        border: "1px solid #FECACA",
        borderRadius: "16px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
        fontSize: "13px",
        fontWeight: 600,
        ...options?.style,
      },
      iconTheme: {
        primary: "#B91C1C",
        secondary: "#FEF2F2",
      },
    });
  },

  loading(message: string, options?: NotifyOptions) {
    return toastOriginal.loading(message, {
      ...options,
      style: {
        background: "#FFFFFF",
        color: "#0F172A",
        border: "1px solid #E2E8F0",
        borderRadius: "16px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
        fontSize: "13px",
        fontWeight: 600,
        ...options?.style,
      },
    });
  },

  promise<T>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: any) => string);
    },
    options?: NotifyOptions
  ) {
    return toastOriginal.promise(
      promise,
      {
        loading: msgs.loading,
        success: msgs.success,
        error: (err) => {
          if (typeof msgs.error === "function") {
            return msgs.error(err);
          }
          return msgs.error || "Unable to complete action. Please try again.";
        },
      },
      {
        ...options,
        style: {
          background: "#FFFFFF",
          color: "#0F172A",
          border: "1px solid #E2E8F0",
          borderRadius: "16px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
          fontSize: "13px",
          fontWeight: 600,
          ...options?.style,
        },
      }
    );
  },

  dismiss(toastId?: string) {
    return toastOriginal.dismiss(toastId);
  },
};

export const toast = toastOriginal;
export default notify;
