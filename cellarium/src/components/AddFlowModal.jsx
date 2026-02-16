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
import EditWineModal from "./EditWineModal";
import { analyzeWineLabel, createBottle, getWine, searchWines, updateWine } from "../api/wineApi";
import { todayISODate } from "../utils/date";
import { WINE_COUNTRIES } from "../constants/countries";

import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";

function getCountryName(isoCode) {
  if (!isoCode) return null;
  const country = WINE_COUNTRIES.find((c) => c.code === isoCode);
  return country ? country.label : isoCode; // Fall back to ISO code if not found
}

export default function AddFlowModal({ open, onClose, onDone, initialWineId }) {
  const navigate = useNavigate();

  const [step, setStep] = useState("identify"); // identify | analyzing | intent | bought | drank
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedWine, setSelectedWine] = useState(null);
  const [isNewWine, setIsNewWine] = useState(false);
  const [createWineOpen, setCreateWineOpen] = useState(false);
  const [initialPhoto, setInitialPhoto] = useState(null);
  const [analyzedData, setAnalyzedData] = useState(null);
  const [analyzeError, setAnalyzeError] = useState(null);

  const [bottleDraft, setBottleDraft] = useState({
    purchase_date: todayISODate(),
    price: "",
    store: null,
  });

  const [memoryDraft, setMemoryDraft] = useState({
    rating: 0,
    notes: "",
  });

  // Reset when opening
  useEffect(() => {
    if (!open) return;

    // If initialWineId provided, load that wine and skip to 'bought' step
    if (initialWineId) {
      setLoading(true);
      getWine(initialWineId)
        .then((wine) => {
          setSelectedWine(wine);
          setIsNewWine(false);
          setStep("bought");
        })
        .catch((e) => {
          console.error("Failed to load wine:", e);
          // Fall back to normal flow
          setStep("identify");
        })
        .finally(() => setLoading(false));

      setQuery("");
      setResults([]);
      setCreateWineOpen(false);
      setBottleDraft({ purchase_date: todayISODate(), price: "", store: null });
      setMemoryDraft({ rating: 0, notes: "" });
      return;
    }

    // Normal reset
    setStep("identify");
    setQuery("");
    setResults([]);
    setSelectedWine(null);
    setIsNewWine(false);
    setLoading(false);
    setCreateWineOpen(false);
    setInitialPhoto(null);
    setAnalyzedData(null);
    setAnalyzeError(null);

    setBottleDraft({ purchase_date: todayISODate(), price: "", store: null });
    setMemoryDraft({ rating: 0, notes: "" });
  }, [open, initialWineId]);

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

  function openCreateWineModal() {
    setCreateWineOpen(true);
  }

  async function handlePhotoSelect(e) {
    const file = e.target.files?.[0];
    if (file) {
      setInitialPhoto(file);
      setStep("analyzing");
      setAnalyzeError(null);
      setAnalyzedData(null);

      try {
        const result = await analyzeWineLabel(file);
        if (result.success && result.data) {
          setAnalyzedData(result.data);
        }
        // Open the wine modal with the analyzed data (or empty if analysis failed)
        setCreateWineOpen(true);
        setStep("identify");
      } catch (err) {
        console.error("Wine label analysis failed:", err);
        setAnalyzeError(err.message || "Analyse mislukt");
        // Still allow user to continue with manual entry
        setCreateWineOpen(true);
        setStep("identify");
      }
    }
  }

  function skipAnalysis() {
    // User wants to skip analysis and enter data manually
    setCreateWineOpen(true);
    setStep("identify");
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
        purchase_date: bottleDraft.purchase_date || todayISODate(),
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
      ? "Wijn toevoegen"
      : step === "analyzing"
        ? "Label analyseren..."
        : step === "intent"
          ? "Wat wil je doen?"
          : step === "bought"
            ? "Fles toevoegen"
            : "Herinnering opslaan";

  return (
    <>
      <Dialog
        open={open}
        onClose={(_, reason) => {
          if (loading) return;
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
          <IconButton
            onClick={onClose}
            sx={{
              color: "rgba(255,255,255,0.65)",
              "&:hover": {
                color: "rgba(255,255,255,0.9)",
                bgcolor: "rgba(255,255,255,0.08)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            {selectedWine?.name && step !== "identify" && step !== "analyzing" && (
              <Typography variant="body2" color="text.secondary">
                Geselecteerd: <strong>{selectedWine.name}</strong>
              </Typography>
            )}

            {step === "analyzing" && (
              <Stack spacing={3} sx={{ py: 4 }} alignItems="center">
                <AutoAwesomeIcon sx={{ fontSize: 48, color: "primary.main" }} />
                <Stack spacing={1} alignItems="center">
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Wijnlabel wordt geanalyseerd
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Even geduld, de AI leest de informatie van het etiket...
                  </Typography>
                </Stack>
                <Box sx={{ width: "100%", maxWidth: 300 }}>
                  <LinearProgress />
                </Box>
                <Button
                  variant="text"
                  size="small"
                  onClick={skipAnalysis}
                  sx={{ mt: 2 }}
                >
                  Overslaan en handmatig invullen
                </Button>
              </Stack>
            )}

            {step === "identify" && (
              <Stack spacing={2}>
                <TextField
                  label="Zoek je wijnen (of maak een nieuwe aan)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Typ een wijnnaam…"
                  autoFocus
                  fullWidth
                />

                <Divider>
                  <Typography variant="body2" color="text.secondary">
                    OF
                  </Typography>
                </Divider>

                <Box>
                  <input
                    accept="image/*"
                    capture="environment"
                    style={{ display: 'none' }}
                    id="photo-upload-button"
                    type="file"
                    onChange={handlePhotoSelect}
                  />
                  <label htmlFor="photo-upload-button">
                    <Button
                      variant="outlined"
                      component="span"
                      fullWidth
                      startIcon={<PhotoCameraIcon />}
                      sx={{ py: 1.5 }}
                    >
                      Maak een foto
                    </Button>
                  </label>
                </Box>

                {loading && (
                  <Typography variant="body2" color="text.secondary">
                    Zoeken…
                  </Typography>
                )}

                {!loading && results.length > 0 && (
                  <Paper variant="outlined">
                    <List disablePadding>
                      {results.slice(0, 8).map((w, idx) => {
                        // Handle region as either object or string for backward compatibility
                        const regionDisplay = typeof w.region === 'object' && w.region?.name 
                          ? w.region.name 
                          : w.region;
                        const secondary = [getCountryName(w.country), regionDisplay, w.vintage]
                          .filter(Boolean)
                          .join(" • ");
                        const meta =
                          typeof w.in_stock_count === "number"
                            ? `Op voorraad: ${w.in_stock_count} · Totaal flessen: ${w.bottle_count}`
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
                      Niet gevonden? Maak een nieuwe wijn aan:
                    </Typography>

                    <Button
                      variant="contained"
                      onClick={openCreateWineModal}
                      disabled={loading}
                      sx={{ fontWeight: 800 }}
                    >
                      Maak "{query.trim()}" aan
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
                    <Typography sx={{ fontWeight: 800 }}>🍾 Ik heb het gekocht</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Voeg een fles toe aan je voorraad
                    </Typography>
                  </Stack>
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => setStep("drank")}
                  sx={{ justifyContent: "flex-start", textAlign: "left", py: 1.25 }}
                >
                  <Stack>
                    <Typography sx={{ fontWeight: 800 }}>⭐ Ik heb het gedronken</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bewaar beoordeling + notities (geen fles)
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
                      <Typography sx={{ fontWeight: 800 }}>📖 Gewoon opslaan</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Bewaar in je collectie zonder extra's
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
                    ✅ Wijn openen
                  </Button>
                )}

                <Button
                  variant="text"
                  onClick={() => setStep("identify")}
                  sx={{ justifyContent: "flex-start" }}
                >
                  ← Terug
                </Button>
              </Stack>
            )}

            {step === "bought" && (
              <Stack spacing={1.5}>
                <TextField
                  label="Aankoopdatum"
                  type="date"
                  value={bottleDraft.purchase_date}
                  onChange={(e) =>
                    setBottleDraft((d) => ({ ...d, purchase_date: e.target.value }))
                  }
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="Prijs (optioneel)"
                  value={bottleDraft.price}
                  onChange={(e) =>
                    setBottleDraft((d) => ({ ...d, price: e.target.value }))
                  }
                  placeholder="bijv. 12.50"
                />

                <Button
                  variant="contained"
                  onClick={submitBought}
                  disabled={loading}
                  sx={{ fontWeight: 800 }}
                >
                  Fles toevoegen
                </Button>

                <Button
                  variant="text"
                  onClick={() => setStep("intent")}
                  sx={{ justifyContent: "flex-start" }}
                >
                  ← Terug
                </Button>
              </Stack>
            )}

            {step === "drank" && (
              <Stack spacing={2}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Beoordeling
                  </Typography>
                  <WineGlassRating
                    value={memoryDraft.rating}
                    onChange={(r) => setMemoryDraft((d) => ({ ...d, rating: r }))}
                  />
                </Stack>

                <TextField
                  label="Notities"
                  value={memoryDraft.notes}
                  onChange={(e) =>
                    setMemoryDraft((d) => ({ ...d, notes: e.target.value }))
                  }
                  placeholder="Wat vond je ervan?"
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
                  Opslaan
                </Button>

                <Button
                  variant="text"
                  onClick={() => setStep("intent")}
                  sx={{ justifyContent: "flex-start" }}
                >
                  ← Terug
                </Button>
              </Stack>
            )}
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Wine Creation Modal - uses shared EditWineModal in create mode */}
      <EditWineModal
        open={createWineOpen}
        onClose={() => {
          setCreateWineOpen(false);
          setInitialPhoto(null);
          setAnalyzedData(null);
        }}
        mode="create"
        initialData={analyzedData ? {
          name: analyzedData.name || query.trim(),
          country: analyzedData.country || "",
          region: analyzedData.matched_region || null,
          vintage: analyzedData.vintage || "",
          wine_type: analyzedData.wine_type || "",
          grape_varieties: analyzedData.grape_varieties || "",
          alcohol_percentage: analyzedData.alcohol_percentage ?? "",
        } : { name: query.trim() }}
        initialPhoto={initialPhoto}
        onSave={(createdWineData) => {
          // After wine is successfully created, set it as selected and move to intent
          setIsNewWine(true);
          setSelectedWine({ ...createdWineData });
          setStep("intent");
          setInitialPhoto(null);
          setAnalyzedData(null);
        }}
      />
    </>
  );
}
