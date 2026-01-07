import { useState } from "react";
import { Box, IconButton, useTheme } from "@mui/material";
import { GiWineGlass } from "react-icons/gi";

export default function WineGlassRating({
  value = 0,
  onChange,
  size = 24,
  readOnly = false,
}) {
  const [hover, setHover] = useState(null);
  const theme = useTheme();

  return (
    <Box display="flex" gap={0.5}>
      {[1, 2, 3, 4, 5].map((glass) => {
        const filled = hover !== null ? glass <= hover : glass <= value;

        return (
          <IconButton
            key={glass}
            size="small"
            disabled={readOnly}
            onClick={() => !readOnly && onChange?.(glass)}
            onMouseEnter={() => !readOnly && setHover(glass)}
            onMouseLeave={() => setHover(null)}
            sx={{
              padding: 0.5,
            }}
          >
            <GiWineGlass
              size={size}
              color={
                filled
                  ? theme.palette.primary.main
                  : theme.palette.action.disabled
              }
            />
          </IconButton>
        );
      })}
    </Box>
  );
}
