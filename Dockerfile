# Stage 1: Build the React + Vite application
FROM node:18-alpine AS builder

# Set working directory to the cellarium subdirectory
WORKDIR /app/cellarium

# Copy package files
COPY cellarium/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY cellarium/ ./

# Build the application (VITE_ env vars are optional now, runtime config takes precedence)
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/cellarium/dist /usr/share/nginx/html

# Copy entrypoint script for runtime config generation
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port 80
EXPOSE 80

# Use entrypoint script to generate config.js from environment variable
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
