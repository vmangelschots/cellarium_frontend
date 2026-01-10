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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { updateWine, createWine } from "../api/wineApi";

export default function EditWineModal({ open, onClose, wine, onSave, mode = "edit" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    country: "",
    region: "",
    vintage: "",
    wine_type: "",
    grape_varieties: "",
    notes: "",
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
          notes: wine.notes || "",
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
        });
      }
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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Wine name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Only send fields that are not empty
      const payload = {};
      if (formData.name) payload.name = formData.name;
      if (formData.country) payload.country = formData.country;
      if (formData.region) payload.region = formData.region;
      if (formData.vintage) payload.vintage = formData.vintage;
      if (formData.wine_type) payload.wine_type = formData.wine_type;
      if (formData.grape_varieties) payload.grape_varieties = formData.grape_varieties;
      if (formData.notes) payload.notes = formData.notes;

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

          <TextField
            label="Wine Type"
            name="wine_type"
            value={formData.wine_type}
            onChange={handleChange}
            fullWidth
            disabled={loading}
            placeholder="e.g., Red, White, Rosé"
          />

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
