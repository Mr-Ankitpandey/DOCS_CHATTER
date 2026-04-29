import { QueryClientProvider } from "@tanstack/react-query"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import { Toaster } from "sonner"

import App from "./App"
import { queryClient } from "./app/queryClient"
import { store } from "./app/store"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster theme="dark" position="bottom-right" richColors />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
)
