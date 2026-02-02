import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  Fab,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import AddFlowModal from "../components/AddFlowModal";

function routeToTab(pathname) {
  if (pathname.startsWith("/stores")) return "/stores";
  return "/wines";
}

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const value = routeToTab(location.pathname);

  const [addOpen, setAddOpen] = useState(false);

  // Extract wine ID if on detail page
  const wineIdMatch = location.pathname.match(/^\/wines\/(\d+)$/);
  const currentWineId = wineIdMatch ? wineIdMatch[1] : null;

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >

        <Toolbar sx={{ borderBottom: "1px solid", borderColor: "divider", gap: 2 }}>
          <Stack
            component={Link}
            to="/wines"
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ textDecoration: "none" }}
          >
            <Box
              component="img"
              src="/images/logo.png"
              alt="Cellarium"
              sx={{
                width: 24,
                height: 24,
                display: "block",
              }}
            />

            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: "rgba(255,255,255,0.88)", // option one
                letterSpacing: 0.3,
              }}
            >
              Cellarium
            </Typography>
          </Stack>


          <Tabs
            value={value}
            onChange={(_, v) => navigate(v)}
            textColor="inherit"
            indicatorColor="primary"
            sx={{ minHeight: 40 }}
          >
            <Tab label="Wijnen" value="/wines" sx={{ minHeight: 40 }} />
            <Tab label="Winkels" value="/stores" sx={{ minHeight: 40 }} />
          </Tabs>

        </Toolbar>
      </AppBar>

      <Container sx={{ py: 3 }}>
        <Outlet />
      </Container>

      {/* Floating + button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => setAddOpen(true)}
        sx={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: (theme) => theme.zIndex.modal + 1,
        }}
      >
        <AddIcon />
      </Fab>

      {/* Guided add flow modal */}
      <AddFlowModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onDone={() => {
          // MVP: refresh the current route so lists update
          navigate(0);
        }}
        initialWineId={currentWineId}
      />
    </Box>
  );
}
