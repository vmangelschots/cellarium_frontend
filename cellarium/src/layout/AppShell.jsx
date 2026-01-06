import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Container, Box, Tabs, Tab } from "@mui/material";

function routeToTab(pathname) {
  if (pathname.startsWith("/stores")) return "/stores";
  return "/wines";
}

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const value = routeToTab(location.pathname);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar position="sticky" elevation={0} color="transparent">
        <Toolbar sx={{ borderBottom: "1px solid", borderColor: "divider", gap: 2 }}>
          <Typography
            component={Link}
            to="/wines"
            variant="h6"
            sx={{ textDecoration: "none", color: "text.primary", fontWeight: 800 }}
          >
            Cellarium
          </Typography>

          <Tabs
            value={value}
            onChange={(_, v) => navigate(v)}
            textColor="inherit"
            indicatorColor="primary"
            sx={{ minHeight: 40 }}
          >
            <Tab label="Wines" value="/wines" sx={{ minHeight: 40 }} />
            <Tab label="Stores" value="/stores" sx={{ minHeight: 40 }} />
          </Tabs>

          <Box sx={{ flex: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Wine inventory
          </Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
