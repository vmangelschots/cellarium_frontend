import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
export default function AuthListener() {

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function onAuthRequired() {
      // avoid redirect loop if already on login
      if (location.pathname !== "/login") {
        navigate("/login", { replace: true, state: { from: location.pathname } });
      }
    }

    window.addEventListener("auth:required", onAuthRequired);
    return () => window.removeEventListener("auth:required", onAuthRequired);
  }, [navigate, location.pathname]);

  return null;
}