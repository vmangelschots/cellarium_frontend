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
import WineGlassRating from "../components/WineGlassRating.jsx";

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
          <WineGlassRating value={wine.rating} onChange={() => {}} />
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
