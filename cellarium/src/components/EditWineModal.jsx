import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { updateWine, createWine } from "../api/wineApi";
import { getRegion } from "../api/regionApi";
import WineGlassRating from "./WineGlassRating";
import { WINE_COUNTRIES } from "../constants/countries";
import RegionAutocomplete from "./RegionAutocomplete";

export default function EditWineModal({ open, onClose, wine, onSave, mode = "edit" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    country: "",
    region: null, // Now stores region object {id, name, country} instead of string
    vintage: "",
    wine_type: "",
    grape_varieties: "",
    notes: "",
    rating: "",
  });

  // Pre-fill form with wine data when modal opens (edit mode)
  useEffect(() => {
    if (open) {
      if (mode === "edit" && wine) {
        // Load region object if region ID exists
        const loadRegion = async () => {
          let regionObj = null;
          if (wine.region) {
            try {
              // If wine.region is an ID, fetch the full region object
              if (typeof wine.region === "number") {
                regionObj = await getRegion(wine.region);
              } else if (typeof wine.region === "object" && wine.region.id) {
                // If it's already an object, use it directly
                regionObj = wine.region;
              }
            } catch (error) {
              console.error("Failed to load region:", error);
            }
          }

          setFormData({
            name: wine.name || "",
            country: wine.country || "",
            region: regionObj,
            vintage: wine.vintage || "",
            wine_type: wine.wine_type || "",
            grape_varieties: wine.grape_varieties || "",
            image: wine.image || "",
            notes: wine.notes || "",
            rating: wine.rating || "",
          });
        };
        loadRegion();
      } else if (mode === "create") {
        // Reset form for create mode
        setFormData({
          name: "",
          country: "",
          region: null,
          vintage: "",
          wine_type: "",
          grape_varieties: "",
          notes: "",
          rating: "",
        });
      }
      setImageFile(null);
      setError("");
    }
  }, [open, wine, mode]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Wijnnaam is verplicht");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Build FormData for file upload
      const payload = new FormData();
      if (formData.name) payload.append("name", formData.name);
      if (formData.country) payload.append("country", formData.country);
      if (formData.region?.id) payload.append("region", formData.region.id); // Send region ID
      if (formData.vintage) payload.append("vintage", formData.vintage);
      if (formData.wine_type) payload.append("wine_type", formData.wine_type);
      if (formData.grape_varieties) payload.append("grape_varieties", formData.grape_varieties);
      if (imageFile) payload.append("image", imageFile);
      if (formData.notes) payload.append("notes", formData.notes);
      if (formData.rating) payload.append("rating", formData.rating);

      if (mode === "create") {
        await createWine(payload);
      } else {
        await updateWine(wine.id, payload);
      }

      onSave?.(formData);
      onClose();
    } catch (e) {
      setError(e.message || `Failed to ${mode === "create" ? "create" : "update"} wine`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const isCreateMode = mode === "create";
  const title = isCreateMode ? "Wijn aanmaken" : "Wijn bewerken";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 800, flex: 1 }}>
          {title}
        </Typography>
        {loading && <CircularProgress size={18} />}
        <IconButton
          onClick={onClose}
          disabled={loading}
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
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          <TextField
            label="Wijnnaam *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            disabled={loading}
            placeholder="bijv. Château Margaux"
            autoFocus
          />

          <Autocomplete
            options={WINE_COUNTRIES}
            getOptionLabel={(option) => option.label || option}
            value={WINE_COUNTRIES.find((c) => c.code === formData.country) || null}
            onChange={(event, newValue) => {
              const newCountryCode = newValue ? newValue.code : "";
              setFormData((prev) => {
                // Clear region if country changes and region doesn't match new country
                const shouldClearRegion = 
                  prev.country !== newCountryCode && 
                  prev.region && 
                  prev.region.country !== newCountryCode;
                
                return {
                  ...prev,
                  country: newCountryCode,
                  region: shouldClearRegion ? null : prev.region,
                };
              });
            }}
            disabled={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Land"
                placeholder="Zoek een land..."
              />
            )}
            isOptionEqualToValue={(option, value) => option.code === value.code}
          />

          <RegionAutocomplete
            value={formData.region}
            onChange={(newRegion) => {
              setFormData((prev) => ({
                ...prev,
                region: newRegion,
              }));
            }}
            countryCode={formData.country}
            disabled={loading}
            label="Streek"
            placeholder="Zoek een streek..."
          />

          <TextField
            label="Jaar"
            name="vintage"
            value={formData.vintage}
            onChange={handleChange}
            fullWidth
            disabled={loading}
            placeholder="bijv. 2015"
            type="number"
          />

          <FormControl fullWidth disabled={loading}>
            <InputLabel id="wine-type-label">Wijntype</InputLabel>
            <Select
              labelId="wine-type-label"
              label="Wijntype"
              name="wine_type"
              value={formData.wine_type}
              onChange={handleChange}
            >
              <MenuItem value=""><em>Geen</em></MenuItem>
              <MenuItem value="red">Rood</MenuItem>
              <MenuItem value="white">Wit</MenuItem>
              <MenuItem value="rosé">Rosé</MenuItem>
              <MenuItem value="sparkling">Schuimwijn</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Druivensoorten"
            name="grape_varieties"
            value={formData.grape_varieties}
            onChange={handleChange}
            fullWidth
            disabled={loading}
            multiline
            rows={2}
            placeholder="bijv. Cabernet Sauvignon, Merlot"
          />
        <WineGlassRating readOnly={false} value={formData.rating || 0} onChange={(val) => setFormData((prev) => ({ ...prev, rating: val }))} />
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
              Wijnfoto (optioneel)
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
              style={{
                display: "block",
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid rgba(255, 255, 255, 0.23)",
                backgroundColor: "transparent",
                color: "rgba(255, 255, 255, 0.7)",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1,
              }}
            />
            {imageFile && (
              <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: "block" }}>
                ✓ {imageFile.name}
              </Typography>
            )}
          </Box>

          <TextField
            label="Notities"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            fullWidth
            disabled={loading}
            multiline
            rows={3}
            placeholder="Voeg je proefnotities, indrukken, aanbevelingen toe…"
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={loading}>
          Annuleren
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.name.trim()}
        >
          {loading ? "Opslaan…" : isCreateMode ? "Wijn aanmaken" : "Wijzigingen opslaan"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
