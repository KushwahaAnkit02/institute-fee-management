import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </QueryProvider>,
);
