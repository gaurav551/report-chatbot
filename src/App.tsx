import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import NotFound from "./components/NotFound";
import Footer from "./components/Footer";
import ChatV2 from "./components/chat/Chat";
import { Forecasting } from "./components/forecasting/Forecasting";

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Direct route to NotFound page without layout */}
        <Route path="/not-found" element={<NotFound />} />

        {/* Layout wrapper route */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-white flex flex-col">
              <main className="flex-1 ">
                {" "}
                {/* pt-16 to account for fixed navbar */}
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* <Route path="/chat/" element={<Chat />} />
                    <Route path="/chat/user/:userName" element={<Chat />} /> */}
                    <Route path="/" element={<ChatV2 />} />

{/* User route with userName parameter (existing) */}
<Route path="/user/:userName" element={<ChatV2 />} />

{/* User route with userName and userId parameters (new) */}
<Route path="/user/:userName/:userId" element={<ChatV2 />} />
                    <Route path="/forecasting" element={<Forecasting />} />

                    {/* Catch-all route for 404 - redirects to styled NotFound */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
