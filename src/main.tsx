import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router";
import { App } from "./App";
import { Provider } from "./components/ui/provider";
import { AuthProvider } from "./context";
import { NotifyProvider } from "./context/notify";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider>
    <NotifyProvider>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </NotifyProvider>
  </Provider>
);
