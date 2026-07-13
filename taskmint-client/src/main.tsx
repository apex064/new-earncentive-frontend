import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import * as TanStackQueryProvider from "./integrations/tanstack-query/root-provider.tsx";
import "./styles.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "@/app.tsx";
import AuthProvider from "@/components/providers/auth-provider.tsx";
import { queryClient } from "@/lib/react-query.ts";
import "./router";
// import reportWebVitals from "./reportWebVitals.ts";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <GoogleOAuthProvider clientId={googleClientId}>
        <TanStackQueryProvider.Provider queryClient={queryClient}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </TanStackQueryProvider.Provider>
      </GoogleOAuthProvider>
    </StrictMode>,
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals()
