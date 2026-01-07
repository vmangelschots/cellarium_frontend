import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listWines, createWine } from "../api/wineApi";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SearchIcon from "@mui/icons-material/Search";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LocalBarIcon from "@mui/icons-material/LocalBar";

const WINE_PLACEHOLDER = "/images/generic_red_wine.png";
const HERO_IMG = "/images/wine-cellar-hero.jpg";

export default function WinesPage() {
  const [wines, setWines] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setWines(await listWines());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const totalWines = wines.length;

    const totalInStock = wines.reduce(
      (sum, w) => sum + (typeof w.in_stock_count === "number" ? w.in_stock_count : 0),
      0
    );

    const totalBottles = wines.reduce(
      (sum, w) => sum + (typeof w.bottle_count === "number" ? w.bottle_count : 0),
      0
    );

    const totalConsumed = Math.max(0, totalBottles - totalInStock);

    return { totalWines, totalInStock, totalConsumed, totalBottles };
  }, [wines]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return wines;
    return wines.filter((w) => w.name.toLowerCase().includes(q));
  }, [wines, searchQuery]);

  async function onAdd(e) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    await createWine({ name: n });
    setName("");
    await load();
  }

  return (
    <Stack spacing={2.5}>
      <Box
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
          minHeight: { xs: 220, sm: 260 },
          backgroundImage: `url(${HERO_IMG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.15) 100%)",
          }}
        />

        <Box sx={{ position: "relative", p: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: "rgba(255,255,255,0.88)", // same as Cellarium
            }}
          >

            My Wine Collection
          </Typography>

          <Typography sx={{ mt: 0.5, color: "rgba(255,255,255,0.88)" }}>
            Curate and manage your personal wine cellar.
          </Typography>

          <TextField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search wines…"
            fullWidth
            sx={{
              mt: 2,

              "& .MuiOutlinedInput-root": {
                borderRadius: 999,
                color: "white",
                backgroundColor: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(10px)",

                "& fieldset": {
                  border: "1px solid rgba(255,255,255,0.25)",
                },

                "&:hover fieldset": {
                  borderColor: "rgba(255,255,255,0.4)",
                },

                "&.Mui-focused fieldset": {
                  borderColor: "rgba(255,255,255,0.6)",
                  boxShadow: "0 0 0 2px rgba(255,255,255,0.15)",
                },
              },

              "& input::placeholder": {
                color: "rgba(255,255,255,0.7)",
                opacity: 1,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "rgba(255,255,255,0.75)" }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Stats inside hero */}
          <Card
            variant="outlined"
            sx={{
              mt: 2.5,
              borderRadius: 2,
              bgcolor: "rgba(0,0,0,0.35)",
              borderColor: "rgba(255,255,255,0.18)",
              color: "common.white",
              backdropFilter: "blur(6px)",
            }}
          >
            <CardContent sx={{ py: 1.75 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.7)" }}>
                    Wines
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    {stats.totalWines}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.7)" }}>
                    In stock
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    {stats.totalInStock}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.7)" }}>
                    Consumed
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    {stats.totalConsumed}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.7)" }}>
                    Total bottles
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    {stats.totalBottles}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Box>





      <Grid container spacing={2}>
        {filtered.map((wine) => (
          <Grid key={wine.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                borderRadius: 2,
                overflow: "hidden",
                transition: "transform 120ms ease, box-shadow 120ms ease",
                "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
              }}
            >
              <CardActionArea
                component={Link}
                to={`/wines/${wine.id}`}
                sx={{ height: "100%", display: "flex", alignItems: "stretch" }}
              >
                <Box
                  sx={{
                    width: 110,
                    flexShrink: 0,
                    bgcolor: "action.hover",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 1,
                  }}
                >
                  <Box
                    component="img"
                    src={WINE_PLACEHOLDER}
                    alt=""
                    sx={{
                      height: 140,
                      width: "auto",
                      borderRadius: 1.5,
                      objectFit: "cover",
                      boxShadow: 1,
                    }}
                  />
                </Box>

                <CardContent
                  sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800 }} noWrap>
                      {wine.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      noWrap
                      sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                    >
                      <LocalBarIcon fontSize="inherit" />
                      {wine.in_stock_count ?? 0} in stock
                    </Typography>
                  </Box>

                  <ChevronRightIcon color="action" />
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
