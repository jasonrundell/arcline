import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AppError, ERROR_CODES } from "./lib/errors";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new AppError(
    "Root element not found. Make sure index.html has a #root element.",
    ERROR_CODES.VALIDATION_ERROR,
    500
  );
}

createRoot(rootElement).render(<App />);
