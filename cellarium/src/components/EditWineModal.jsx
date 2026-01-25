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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { updateWine, createWine } from "../api/wineApi";
import WineGlassRating from "./WineGlassRating";

export default function EditWineModal({ open, onClose, wine, onSave, mode = "edit" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    country: "",
    region: "",
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
        setFormData({
          name: wine.name || "",
          country: wine.country || "",
          region: wine.region || "",
          vintage: wine.vintage || "",
          wine_type: wine.wine_type || "",
          grape_varieties: wine.grape_varieties || "",
          image: wine.image || "",
          notes: wine.notes || "",
          rating: wine.rating || "",
        });
      } else if (mode === "create") {
        // Reset form for create mode
        setFormData({
          name: "",
          country: "",
          region: "",
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
      setError("Wine name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Build FormData for file upload
      const payload = new FormData();
      if (formData.name) payload.append("name", formData.name);
      if (formData.country) payload.append("country", formData.country);
      if (formData.region) payload.append("region", formData.region);
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
  const title = isCreateMode ? "Create Wine" : "Edit Wine";

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
            label="Wine Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            disabled={loading}
            placeholder="e.g., Château Margaux"
            autoFocus
          />

          <TextField
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            fullWidth
            disabled={loading}
            placeholder="e.g., France"
          />

          <TextField
            label="Region"
            name="region"
            value={formData.region}
            onChange={handleChange}
            fullWidth
            disabled={loading}
            placeholder="e.g., Bordeaux"
          />

          <TextField
            label="Vintage"
            name="vintage"
            value={formData.vintage}
            onChange={handleChange}
            fullWidth
            disabled={loading}
            placeholder="e.g., 2015"
            type="number"
          />

          <FormControl fullWidth disabled={loading}>
            <InputLabel id="wine-type-label">Wine Type</InputLabel>
            <Select
              labelId="wine-type-label"
              label="Wine Type"
              name="wine_type"
              value={formData.wine_type}
              onChange={handleChange}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              <MenuItem value="red">Rood</MenuItem>
              <MenuItem value="white">Wit</MenuItem>
              <MenuItem value="rosé">Rosé</MenuItem>
              <MenuItem value="sparkling">Schuimwijn</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Grape Varieties"
            name="grape_varieties"
            value={formData.grape_varieties}
            onChange={handleChange}
            fullWidth
            disabled={loading}
            multiline
            rows={2}
            placeholder="e.g., Cabernet Sauvignon, Merlot"
          />
        <WineGlassRating readOnly={false} value={formData.rating || 0} onChange={(val) => setFormData((prev) => ({ ...prev, rating: val }))} />
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
              Wine Image (optional)
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
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            fullWidth
            disabled={loading}
            multiline
            rows={3}
            placeholder="Add your tasting notes, impressions, recommendations..."
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.name.trim()}
        >
          {loading ? "Saving..." : isCreateMode ? "Create Wine" : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
