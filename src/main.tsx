import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router";
import { App } from "./App";
import { Provider } from "./components/ui/provider";
import { AuthProvider } from "./context";
import { NotifyProvider } from "./context/notify";
import { SocketProvider } from "./context/socket";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider>
    <NotifyProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </NotifyProvider>
  </Provider>
);
