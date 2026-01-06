import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listWines, createWine } from "../api/wineApi";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import { Divider } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LocalBarIcon from "@mui/icons-material/LocalBar";

const WINE_PLACEHOLDER =
  "/images/generic_red_wine.png";

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
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          My Wine Collection
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Curate and manage your personal wine cellar.
        </Typography>
      </Box>
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent sx={{ py: 1.75 }}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="overline" color="text.secondary">
                Wines
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {stats.totalWines}
              </Typography>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Typography variant="overline" color="text.secondary">
                In stock
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {stats.totalInStock}
              </Typography>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Typography variant="overline" color="text.secondary">
                Consumed
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {stats.totalConsumed}
              </Typography>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Typography variant="overline" color="text.secondary">
                Total bottles
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {stats.totalBottles}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Grid container spacing={2}>
        {filtered.map((wine) => (
          <Grid item key={wine.id} xs={12} sm={6} md={4}>
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                borderRadius: 2,
                overflow: "hidden",
                transition: "transform 120ms ease, box-shadow 120ms ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 3,
                },
              }}
            >
              <CardActionArea
                component={Link}
                to={`/wines/${wine.id}`}
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "stretch",
                }}
              >
                {/* Left: “bottle image” */}
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

                {/* Right: label/content */}
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

                    <Typography variant="body2" color="text.secondary" noWrap sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
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
