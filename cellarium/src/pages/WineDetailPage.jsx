import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
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
import EditIcon from "@mui/icons-material/Edit";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import UndoIcon from "@mui/icons-material/Undo";
import WineGlassRating from "../components/WineGlassRating.jsx";
import EditWineModal from "../components/EditWineModal.jsx";

import {
  getWine,
  addBottles,
  consumeBottle,
  undoConsumeBottle,
  updateWine,
} from "../api/wineApi";

import { listStores } from "../api/storeApi";
import { todayISODate } from "../utils/date";
const WINE_PLACEHOLDER = "/images/generic_red_wine.png";
function Stat({ label, value }) {
  return (
    <Box>
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 800 }}>{value}</Typography>
    </Box>
  );
}

export default function WineDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wine, setWine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [count, setCount] = useState(1);
  const [stores, setStores] = useState([]);
  const [storeId, setStoreId] = useState(""); // string for Select
  const [price, setPrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(todayISODate());
  const [editOpen, setEditOpen] = useState(false);


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
      <Box
      onClick={() => navigate(-1)}
        sx={{
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <IconButton
          size="small"
          disableRipple
          sx={{
            color: "text.secondary",
            "&:hover": { bgcolor: "transparent" },
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>

        <Typography variant="subtitle1" color="text.secondary">
          Wine details
        </Typography>
      </Box>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          mb: 2.5,
        }}
      >
        <Box sx={{ display: "flex", gap: 2, p: 2 }}>
          <Box
            component="img"
            src={wine.image || WINE_PLACEHOLDER}
            alt=""
            sx={{
              height: 160,
              width: 70,
              objectFit: "cover",
              borderRadius: 1.5,
              boxShadow: 2,
              flexShrink: 0,
            }}
          />

          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>

              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                {wine.name}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setEditOpen(true)}
                sx={{
                  color: "primary.main",
                  "&:hover": { bgcolor: "rgba(139, 21, 56, 0.1)" },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {wine.country ?? "Unknown country"}
              {wine.vintage ? ` · ${wine.vintage}` : ""}
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
              <Stat label="In stock" value={wine.in_stock_count ?? 0} />
              <Stat label="Total" value={wine.bottle_count ?? 0} />
            </Stack>
            <WineGlassRating readOnly={true} value={wine.rating ?? 0} />
          </Box>
        </Box>
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
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">
            Notes
          </Typography>

          {wine.notes ? (
            <Typography sx={{ mt: 0.5 }}>{wine.notes}</Typography>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontStyle: "italic" }}
            >
              No tasting notes yet.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Edit Wine Modal */}
      <EditWineModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        wine={wine}
        onSave={load}
      />
    </Stack>
  );
}
