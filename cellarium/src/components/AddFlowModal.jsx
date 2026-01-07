import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Typography,
  TextField,
  Button,
  Divider,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  Paper,
} from "@mui/material";
import WineGlassRating from "./WineGlassRating";
import { createBottle, createWine, searchWines, updateWine } from "../api/wineApi";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function AddFlowModal({ open, onClose, onDone }) {
  const navigate = useNavigate();

  const [step, setStep] = useState("identify"); // identify | intent | bought | drank
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedWine, setSelectedWine] = useState(null);
  const [isNewWine, setIsNewWine] = useState(false);

  const [newWineDraft, setNewWineDraft] = useState({
    name: "",
    country: "",
    region: "",
    vintage: "",
    wine_type: "",
    grape_varieties: "",
    notes: "",
    rating: null,
  });

  const [bottleDraft, setBottleDraft] = useState({
    purchase_date: todayISO(),
    price: "",
    store: null, // later
  });

  const [memoryDraft, setMemoryDraft] = useState({
    rating: 0,
    notes: "",
  });

  // Reset when opening
  useEffect(() => {
    if (!open) return;

    setStep("identify");
    setQuery("");
    setResults([]);
    setSelectedWine(null);
    setIsNewWine(false);
    setLoading(false);

    setNewWineDraft({
      name: "",
      country: "",
      region: "",
      vintage: "",
      wine_type: "",
      grape_varieties: "",
      notes: "",
      rating: null,
    });

    setBottleDraft({ purchase_date: todayISO(), price: "", store: null });
    setMemoryDraft({ rating: 0, notes: "" });
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!open) return;

    const q = query.trim();
    if (q.length === 0) {
      setResults([]);
      return;
    }

    const t = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await searchWines(q);
        setResults(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [query, open]);

  const canCreateFromQuery = useMemo(() => query.trim().length > 0, [query]);

  function pickExistingWine(wine) {
    setSelectedWine(wine);
    setIsNewWine(false);
    setStep("intent");
  }

  async function createWineFromQuery() {
    const name = query.trim();
    if (!name) return;

    try {
      setLoading(true);
      const payload = { ...newWineDraft, name };
      if (payload.vintage === "") payload.vintage = null;

      const created = await createWine(payload);
      setSelectedWine(created);
      setIsNewWine(true);
      setStep("intent");
    } catch (e) {
      console.error(e);
      alert(`Could not create wine: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function finishJustSave() {
    onDone?.();
    onClose();
  }

  async function submitBought() {
    if (!selectedWine?.id) return;

    try {
      setLoading(true);
      const payload = {
        wine: selectedWine.id,
        purchase_date: bottleDraft.purchase_date || todayISO(),
        price: bottleDraft.price === "" ? null : bottleDraft.price,
        store: bottleDraft.store,
      };
      await createBottle(payload);
      onDone?.();
      onClose();
    } catch (e) {
      console.error(e);
      alert(`Could not add bottle: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function submitDrank() {
    if (!selectedWine?.id) return;

    try {
      setLoading(true);
      await updateWine(selectedWine.id, {
        rating: memoryDraft.rating,
        notes: memoryDraft.notes,
      });
      onDone?.();
      onClose();
    } catch (e) {
      console.error(e);
      alert(`Could not save memory: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  const title =
    step === "identify"
      ? "Add wine"
      : step === "intent"
      ? "What do you want to do?"
      : step === "bought"
      ? "Add bottle"
      : "Save memory";

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        // Optional: prevent closing while saving
        if (loading) return;
        // Keep backdrop click and escape enabled:
        if (reason === "backdropClick" || reason === "escapeKeyDown") onClose();
        else onClose();
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 800, flex: 1 }}>
          {title}
        </Typography>

        {loading && <CircularProgress size={18} />}
        <Button onClick={onClose} disabled={loading} size="small">
          Close
        </Button>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {selectedWine?.name && step !== "identify" && (
            <Typography variant="body2" color="text.secondary">
              Selected: <strong>{selectedWine.name}</strong>
            </Typography>
          )}

          {step === "identify" && (
            <Stack spacing={2}>
              <TextField
                label="Search your wines (or create a new one)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a wine name…"
                autoFocus
                fullWidth
              />

              {loading && (
                <Typography variant="body2" color="text.secondary">
                  Searching…
                </Typography>
              )}

              {!loading && results.length > 0 && (
                <Paper variant="outlined">
                  <List disablePadding>
                    {results.slice(0, 8).map((w, idx) => {
                      const secondary = [w.country, w.region, w.vintage]
                        .filter(Boolean)
                        .join(" • ");
                      const meta =
                        typeof w.in_stock_count === "number"
                          ? `In stock: ${w.in_stock_count} • Total bottles: ${w.bottle_count}`
                          : null;

                      return (
                        <div key={w.id}>
                          <ListItemButton onClick={() => pickExistingWine(w)}>
                            <ListItemText
                              primary={w.name}
                              secondary={
                                <span>
                                  {secondary || "—"}
                                  {meta ? (
                                    <>
                                      <br />
                                      {meta}
                                    </>
                                  ) : null}
                                </span>
                              }
                            />
                          </ListItemButton>
                          {idx !== Math.min(results.length, 8) - 1 && <Divider />}
                        </div>
                      );
                    })}
                  </List>
                </Paper>
              )}

              {canCreateFromQuery && (
                <Stack spacing={1.5}>
                  <Divider />
                  <Typography variant="body2" color="text.secondary">
                    Not seeing it? Create a new wine:
                  </Typography>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <TextField
                      label="Country (optional)"
                      value={newWineDraft.country}
                      onChange={(e) =>
                        setNewWineDraft((d) => ({ ...d, country: e.target.value }))
                      }
                      fullWidth
                    />
                    <TextField
                      label="Vintage (optional)"
                      value={newWineDraft.vintage}
                      onChange={(e) =>
                        setNewWineDraft((d) => ({ ...d, vintage: e.target.value }))
                      }
                      fullWidth
                    />
                  </Stack>

                  <Button
                    variant="contained"
                    onClick={createWineFromQuery}
                    disabled={loading}
                    sx={{ fontWeight: 800 }}
                  >
                    Create “{query.trim()}”
                  </Button>
                </Stack>
              )}
            </Stack>
          )}

          {step === "intent" && (
            <Stack spacing={1.5}>
              <Button
                variant="outlined"
                onClick={() => setStep("bought")}
                sx={{ justifyContent: "flex-start", textAlign: "left", py: 1.25 }}
              >
                <Stack>
                  <Typography sx={{ fontWeight: 800 }}>🍾 I bought it</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add a bottle to your inventory
                  </Typography>
                </Stack>
              </Button>

              <Button
                variant="outlined"
                onClick={() => setStep("drank")}
                sx={{ justifyContent: "flex-start", textAlign: "left", py: 1.25 }}
              >
                <Stack>
                  <Typography sx={{ fontWeight: 800 }}>⭐ I drank it</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Save rating + notes (no bottle)
                  </Typography>
                </Stack>
              </Button>

              {isNewWine ? (
                <Button
                  variant="outlined"
                  onClick={finishJustSave}
                  sx={{ justifyContent: "flex-start", textAlign: "left", py: 1.25 }}
                >
                  <Stack>
                    <Typography sx={{ fontWeight: 800 }}>📖 Just save it</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Keep it in your collection without extras
                    </Typography>
                  </Stack>
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => {
                    onClose();
                    navigate(`/wines/${selectedWine.id}`);
                  }}
                  sx={{ fontWeight: 800 }}
                >
                  ✅ Open wine
                </Button>
              )}

              <Button
                variant="text"
                onClick={() => setStep("identify")}
                sx={{ justifyContent: "flex-start" }}
              >
                ← Back
              </Button>
            </Stack>
          )}

          {step === "bought" && (
            <Stack spacing={1.5}>
              <TextField
                label="Purchase date"
                type="date"
                value={bottleDraft.purchase_date}
                onChange={(e) =>
                  setBottleDraft((d) => ({ ...d, purchase_date: e.target.value }))
                }
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Price (optional)"
                value={bottleDraft.price}
                onChange={(e) =>
                  setBottleDraft((d) => ({ ...d, price: e.target.value }))
                }
                placeholder="e.g. 12.50"
              />

              <Button
                variant="contained"
                onClick={submitBought}
                disabled={loading}
                sx={{ fontWeight: 800 }}
              >
                Add bottle
              </Button>

              <Button
                variant="text"
                onClick={() => setStep("intent")}
                sx={{ justifyContent: "flex-start" }}
              >
                ← Back
              </Button>
            </Stack>
          )}

          {step === "drank" && (
            <Stack spacing={2}>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Rating
                </Typography>
                <WineGlassRating
                  value={memoryDraft.rating}
                  onChange={(r) => setMemoryDraft((d) => ({ ...d, rating: r }))}
                />
              </Stack>

              <TextField
                label="Notes"
                value={memoryDraft.notes}
                onChange={(e) =>
                  setMemoryDraft((d) => ({ ...d, notes: e.target.value }))
                }
                placeholder="What did you like about it?"
                multiline
                minRows={4}
                fullWidth
              />

              <Button
                variant="contained"
                onClick={submitDrank}
                disabled={loading}
                sx={{ fontWeight: 800 }}
              >
                Save
              </Button>

              <Button
                variant="text"
                onClick={() => setStep("intent")}
                sx={{ justifyContent: "flex-start" }}
              >
                ← Back
              </Button>
            </Stack>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
