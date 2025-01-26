// NotifyContext.js
"use client";

import { toaster } from "@/components/ui/toaster";
import React, { createContext, useContext, useCallback } from "react";

const NotifyContext = createContext(null);

export const NotifyProvider = ({ children }) => {
  const notify = useCallback((type, message, title) => {
    toaster.create({
      type,
      title,
      description: message,
    });
  }, []);

  // Add promise-based notification
  const notifyPromise = useCallback((promise, messages) => {
    return toaster.promise(promise, messages);
  }, []);

  const notifySuccess = useCallback(
    (message, title = "Success") => {
      notify("success", message, title);
    },
    [notify]
  );

  const notifyError = useCallback(
    (message, title = "Error") => {
      notify("error", message, title);
    },
    [notify]
  );

  const notifyInfo = useCallback(
    (message, title = "Info") => {
      notify("info", message, title);
    },
    [notify]
  );

  const notifyLoading = useCallback(
    (message, title = "Loading") => {
      notify("loading", message, title);
    },
    [notify]
  );

  return (
    <NotifyContext.Provider
      value={{
        notifySuccess,
        notifyError,
        notifyInfo,
        notifyLoading,
        notifyPromise, // Add to context
      }}
    >
      {children}
    </NotifyContext.Provider>
  );
};

export const useNotify = () => {
  const context = useContext(NotifyContext);
  if (!context) {
    throw new Error("useNotify must be used within a NotifyProvider");
  }
  return context;
};
