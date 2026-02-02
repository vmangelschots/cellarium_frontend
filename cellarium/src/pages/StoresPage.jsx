import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { listStores, createStore } from "../api/storeApi";

export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      setStores(await listStores());
    } catch (e) {
      setErr(e?.message || "Failed to load stores");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onAdd(e) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    await createStore({ name: n });
    setName("");
    await load();
  }

  return (
    <Stack spacing={2.5}>
      <BoxHeader />

      {err ? <Alert severity="error">{err}</Alert> : null}

      <Card variant="outlined">
        <CardContent>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Winkel toevoegen</Typography>
          <form onSubmit={onAdd} style={{ display: "flex", gap: 10 }}>
            <TextField
              fullWidth
              placeholder="bijv. Delhaize, Carrefour, wijnwinkel naam…"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button type="submit" variant="contained">
              Toevoegen
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Winkels</Typography>

          {loading ? (
            <Typography color="text.secondary">Laden…</Typography>
          ) : stores.length === 0 ? (
            <Typography color="text.secondary">Nog geen winkels.</Typography>
          ) : (
            <List dense>
              {stores.map((s) => (
                <ListItem key={s.id} disableGutters>
                  <ListItemText primary={s.name} />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}

function BoxHeader() {
  return (
    <div>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
        Winkels
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Waar je flessen koopt.
      </Typography>
    </div>
  );
}
