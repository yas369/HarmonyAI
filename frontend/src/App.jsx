import { BrowserRouter, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import { CompositionProvider } from "./context/CompositionContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import AboutPage from "./pages/About.jsx";
import GenerationPage from "./pages/Generation.jsx";
import HistoryPage from "./pages/History.jsx";
import HomePage from "./pages/Home.jsx";
import ResultPage from "./pages/Result.jsx";
import SettingsPage from "./pages/Settings.jsx";

const App = () => (
  <ThemeProvider>
    <CompositionProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/generating" element={<GenerationPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CompositionProvider>
  </ThemeProvider>
);

export default App;
