import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import UndoIcon from "@mui/icons-material/Undo";

import {
  getWine,
  addBottles,
  consumeBottle,
  undoConsumeBottle,
} from "../api/wineApi";

import { listStores } from "../api/storeApi";

function todayISODate() {
  // local date, YYYY-MM-DD (no timezone surprises)
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function WineDetailPage() {
  const { id } = useParams();
  const [wine, setWine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [count, setCount] = useState(1);
  const [stores, setStores] = useState([]);
  const [storeId, setStoreId] = useState(""); // string for Select
  const [price, setPrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(todayISODate());

  useEffect(() => {
    listStores()
      .then(setStores)
      .catch(() => setStores({}));
  }, []);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      setWine(await getWine(id));
    } catch (e) {
      setErr(e?.message || "Failed to load wine");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function onAdd(e) {
    e.preventDefault();
    await addBottles({
      wineId: Number(id),
      count: Number(count),
      storeId: storeId ? Number(storeId) : null,
      price: price === "" ? null : price,
      purchase_date: purchaseDate || null,
    });
    setCount(1);
    // keep store/date/price as-is for convenience, or clear price if you prefer:
    // setPrice("");
    await load();
  }
  async function onConsume(bottleId) {
    await consumeBottle(bottleId);
    await load();
  }

  async function onUndo(bottleId) {
    await undoConsumeBottle(bottleId);
    await load();
  }

  if (loading) return <Typography color="text.secondary">Loading…</Typography>;
  if (err) return <Alert severity="error">{err}</Alert>;
  if (!wine) return null;

  return (
    <Stack spacing={2.5}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton component={Link} to="/wines">
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {wine.name} - {wine.vintage}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Individual bottles
          </Typography>
        </Box>
        <Chip
          label={`${wine.total_quantity} in cellar`}
          color="primary"
          variant="outlined"
        />
      </Box>

      <Card variant="outlined">
        <CardContent>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>
            Add bottles
          </Typography>

          <Box component="form" onSubmit={onAdd}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 1 }}>
                <TextField
                  label="Count"
                  type="number"
                  inputProps={{ min: 1 }}
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel id="store-label">Store</InputLabel>
                  <Select
                    labelId="store-label"
                    label="Store"
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>No store</em>
                    </MenuItem>
                    {stores.map((s) => (
                      <MenuItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

               <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  label="Price"
                  type="number"
                  inputProps={{ min: 0, step: "0.01" }}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Purchase date"
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 12 }}>
                <Button type="submit" variant="contained" fullWidth sx={{ height: "100%" }}>
                  Add
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>
            Bottles
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {wine.bottles.length === 0 ? (
            <Typography color="text.secondary">
              No bottles yet.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {wine.bottles.map((bottle) => (
                <Box
                  key={bottle.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    opacity: bottle.consumed_at ? 0.6 : 1,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700 }}>
                      {bottle.purchase_date} - ${bottle.price || "N/A"} 
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {bottle.consumed_at
                        ? `Consumed on ${new Date(
                          bottle.consumed_at
                        ).toLocaleDateString()}`
                        : "In cellar"}
                    </Typography>
                  </Box>

                  {bottle.consumed_at ? (
                    <IconButton
                      aria-label="Undo consume"
                      onClick={() => onUndo(bottle.id)}
                    >
                      <UndoIcon />
                    </IconButton>
                  ) : (
                    <IconButton
                      aria-label="Consume bottle"
                      onClick={() => onConsume(bottle.id)}
                    >
                      <LocalBarIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
