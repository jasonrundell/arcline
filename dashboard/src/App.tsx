import { useState } from "react";
import LogsTable from "./components/LogsTable";
import ScrappyMessagesTable from "./components/ScrappyMessagesTable";
import IntelTable from "./components/IntelTable";

function App() {
  const [activeTab, setActiveTab] = useState<"logs" | "scrappy" | "intel">(
    "logs"
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">
            ARC Line Dashboard
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "logs"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Logs
          </button>
          <button
            onClick={() => setActiveTab("scrappy")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "scrappy"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Scrappy Messages
          </button>
          <button
            onClick={() => setActiveTab("intel")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "intel"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Intel
          </button>
        </div>

        <div className="mt-6">
          {activeTab === "logs" && <LogsTable />}
          {activeTab === "scrappy" && <ScrappyMessagesTable />}
          {activeTab === "intel" && <IntelTable />}
        </div>
      </main>
    </div>
  );
}

export default App;

