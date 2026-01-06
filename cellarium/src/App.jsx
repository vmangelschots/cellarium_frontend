
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./layout/AppShell";
import WinesPage from "./pages/WinesPage";
import WineDetailPage from "./pages/WineDetailPage";
import LoginPage from "./pages/LoginPage";
import StoresPage from "./pages/StoresPage";
import AuthListener from "./components/AuthListener";

export default function App() {
  return (


    <BrowserRouter>
      <AuthListener />
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/wines" replace />} />
          <Route path="/wines" element={<WinesPage />} />
          <Route path="/wines/:id" element={<WineDetailPage />} />
          <Route path="/stores" element={<StoresPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>
      </Routes>
    </BrowserRouter>

  );
}
