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
  Collapse,
  IconButton,
  Chip,
  Badge,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SearchIcon from "@mui/icons-material/Search";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";

const WINE_PLACEHOLDER = "/images/generic_red_wine.png";
const HERO_IMG = "/images/wine-cellar-hero.jpg";

const WINE_TYPES = [
  { key: "red", label: "Red" },
  { key: "white", label: "White" },
  { key: "rosé", label: "Rosé" },
  { key: "sparkling", label: "Sparkling" },
];

export default function WinesPage() {
  const [wines, setWines] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);

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
    let result = wines;
    
    // Filter by search query
    if (q) {
      result = result.filter((w) => w.name.toLowerCase().includes(q));
    }
    
    // Filter by wine type
    if (selectedTypes.length > 0) {
      result = result.filter((w) => selectedTypes.includes(w.wine_type));
    }
    
    return result;
  }, [wines, searchQuery, selectedTypes]);

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

          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <TextField
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search wines…"
              fullWidth
              sx={{
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
            
            <IconButton
              onClick={() => setFilterOpen(!filterOpen)}
              sx={{
                width: 56,
                height: 56,
                backgroundColor: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "white",
                transition: "all 120ms ease",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.25)",
                  borderColor: "rgba(255,255,255,0.4)",
                },
              }}
            >
              <Badge
                badgeContent={selectedTypes.length}
                color="primary"
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: "#cbb994",
                    color: "#000",
                    fontWeight: 700,
                  },
                }}
              >
                <FilterListIcon />
              </Badge>
            </IconButton>
          </Stack>

          {/* Collapsible filter panel */}
          <Collapse in={filterOpen}>
            <Card
              variant="outlined"
              sx={{
                mt: 1.5,
                borderRadius: 2,
                bgcolor: "rgba(255,255,255,0.18)",
                borderColor: "rgba(255,255,255,0.25)",
                backdropFilter: "blur(10px)",
              }}
            >
              <CardContent sx={{ py: 1.5 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {WINE_TYPES.map((type) => (
                    <Chip
                      key={type.key}
                      label={type.label}
                      onClick={() => {
                        setSelectedTypes((prev) =>
                          prev.includes(type.key)
                            ? prev.filter((t) => t !== type.key)
                            : [...prev, type.key]
                        );
                      }}
                      sx={{
                        backgroundColor: selectedTypes.includes(type.key)
                          ? "#cbb994"
                          : "rgba(255,255,255,0.12)",
                        color: selectedTypes.includes(type.key)
                          ? "#000"
                          : "rgba(255,255,255,0.88)",
                        borderColor: selectedTypes.includes(type.key)
                          ? "#cbb994"
                          : "rgba(255,255,255,0.25)",
                        fontWeight: selectedTypes.includes(type.key) ? 700 : 500,
                        transition: "all 120ms ease",
                        "&:hover": {
                          backgroundColor: selectedTypes.includes(type.key)
                            ? "#d4c6a5"
                            : "rgba(255,255,255,0.2)",
                        },
                      }}
                      variant="outlined"
                    />
                  ))}
                  
                  {selectedTypes.length > 0 && (
                    <Chip
                      label="Clear filters"
                      onClick={() => setSelectedTypes([])}
                      onDelete={() => setSelectedTypes([])}
                      deleteIcon={<CloseIcon />}
                      sx={{
                        backgroundColor: "rgba(255,255,255,0.12)",
                        color: "rgba(255,255,255,0.88)",
                        borderColor: "rgba(255,255,255,0.25)",
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.2)",
                        },
                      }}
                      variant="outlined"
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Collapse>

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





      {filtered.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            color: "text.secondary",
          }}
        >
          <LocalBarIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            No wines match your filters
          </Typography>
          <Typography variant="body2">
            {selectedTypes.length > 0 || searchQuery
              ? "Try adjusting your search or filters"
              : "Add your first wine to get started"}
          </Typography>
        </Box>
      ) : (
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
                    src={wine.image || WINE_PLACEHOLDER}
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
      )}
    </Stack>
  );
}
