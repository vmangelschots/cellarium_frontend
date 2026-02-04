import { useState, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { searchRegions, createRegion } from "../api/regionApi";
import { WINE_COUNTRIES } from "../constants/countries";

/**
 * RegionAutocomplete - A searchable dropdown for selecting regions with the ability to create new ones
 * 
 * @param {Object} props
 * @param {Object|null} props.value - Currently selected region object {id, name, country}
 * @param {Function} props.onChange - Callback when region is selected (newValue) => void
 * @param {string} props.countryCode - ISO country code to filter regions (e.g., "FR", "IT")
 * @param {boolean} props.disabled - Whether the input is disabled
 * @param {string} props.label - Label for the input field
 * @param {string} props.placeholder - Placeholder text
 */
export default function RegionAutocomplete({
  value,
  onChange,
  countryCode = null,
  disabled = false,
  label = "Streek",
  placeholder = "Zoek een streek...",
}) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newRegionName, setNewRegionName] = useState("");
  const [newRegionCountry, setNewRegionCountry] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // Fetch regions when the autocomplete opens or search text changes
  useEffect(() => {
    let active = true;

    if (!open) {
      return undefined;
    }

    (async () => {
      setLoading(true);
      try {
        const regions = await searchRegions(inputValue, countryCode);
        if (active) {
          setOptions(regions);
        }
      } catch (error) {
        console.error("Failed to fetch regions:", error);
        if (active) {
          setOptions([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [open, inputValue, countryCode]);

  // Reset options when closing
  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  const handleCreateNew = () => {
    setNewRegionName(inputValue);
    // Pre-fill country if one is selected in the parent form
    setNewRegionCountry(countryCode || "");
    setCreateDialogOpen(true);
    setOpen(false);
  };

  const handleCreateSubmit = async () => {
    if (!newRegionName.trim()) {
      setCreateError("Naam is verplicht");
      return;
    }

    if (!newRegionCountry) {
      setCreateError("Land is verplicht");
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError("");
      const newRegion = await createRegion({
        name: newRegionName.trim(),
        country: newRegionCountry,
      });
      
      // Set the newly created region as the selected value
      onChange(newRegion);
      setCreateDialogOpen(false);
      setNewRegionName("");
      setNewRegionCountry("");
    } catch (error) {
      console.error("Failed to create region:", error);
      setCreateError(error.message || "Fout bij aanmaken streek");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateCancel = () => {
    setCreateDialogOpen(false);
    setNewRegionName("");
    setNewRegionCountry("");
    setCreateError("");
  };

  return (
    <>
      <Autocomplete
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        value={value}
        onChange={(event, newValue) => {
          // If the special "create new" option is selected
          if (newValue && newValue.isCreateNew) {
            handleCreateNew();
          } else {
            onChange(newValue);
          }
        }}
        inputValue={inputValue}
        onInputChange={(event, newInputValue, reason) => {
          // Only update input value if user is typing (not when selecting)
          if (reason === "input") {
            setInputValue(newInputValue);
          }
        }}
        options={[
          ...options,
          // Add "Create new" option if there's input text
          ...(inputValue.trim() ? [{ id: "create-new", name: inputValue, isCreateNew: true }] : []),
        ]}
        getOptionLabel={(option) => {
          if (option.isCreateNew) {
            return `"${option.name}" aanmaken`;
          }
          return option.name || "";
        }}
        renderOption={(props, option) => {
          if (option.isCreateNew) {
            return (
              <Box
                component="li"
                {...props}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontWeight: 600,
                  color: "primary.main",
                  borderTop: "1px solid rgba(255, 255, 255, 0.12)",
                }}
              >
                <AddIcon fontSize="small" />
                <span>"{option.name}" aanmaken</span>
              </Box>
            );
          }

          return (
            <Box component="li" {...props}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {option.name}
                </Typography>
                {option.country && (
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {option.country}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        }}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        filterOptions={(x) => x} // We do server-side filtering
        loading={loading}
        disabled={disabled}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={countryCode ? placeholder : "Selecteer eerst een land"}
            helperText={!countryCode ? "Selecteer eerst een land om streken te filteren" : ""}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      {/* Create New Region Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCreateCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nieuwe streek aanmaken</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {createError && (
              <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                {createError}
              </Typography>
            )}
            
            <TextField
              autoFocus
              label="Streeknaam *"
              fullWidth
              value={newRegionName}
              onChange={(e) => setNewRegionName(e.target.value)}
              disabled={createLoading}
              placeholder="bijv. Bordeaux"
              sx={{ mb: 2 }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreateSubmit();
                }
              }}
            />

            <FormControl fullWidth disabled={createLoading}>
              <InputLabel id="new-region-country-label">Land *</InputLabel>
              <Select
                labelId="new-region-country-label"
                label="Land *"
                value={newRegionCountry}
                onChange={(e) => setNewRegionCountry(e.target.value)}
              >
                <MenuItem value="">
                  <em>Selecteer een land</em>
                </MenuItem>
                {WINE_COUNTRIES.map((country) => (
                  <MenuItem key={country.code} value={country.code}>
                    {country.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
              De streek wordt aangemaakt en direct geselecteerd voor deze wijn.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateCancel} disabled={createLoading}>
            Annuleren
          </Button>
          <Button
            onClick={handleCreateSubmit}
            variant="contained"
            disabled={createLoading || !newRegionName.trim() || !newRegionCountry}
          >
            {createLoading ? "Aanmaken..." : "Aanmaken"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
