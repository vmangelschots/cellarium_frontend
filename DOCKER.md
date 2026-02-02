# Cellarium Frontend - Docker Quick Reference

## Build the Docker Image

```bash
docker build -t cellarium-frontend .
```

## Run the Container

### With default backend URL (http://localhost:8000)
```bash
docker run -p 8080:80 cellarium-frontend
```

### With custom backend URL (runtime configuration)
```bash
docker run -p 8080:80 \
  -e API_BASE_URL=http://your-backend-api:8000 \
  cellarium-frontend
```

### Examples for different environments

**Development:**
```bash
docker run -p 8080:80 -e API_BASE_URL=http://localhost:8000 cellarium-frontend
```

**Staging:**
```bash
docker run -p 8080:80 -e API_BASE_URL=https://api-staging.example.com cellarium-frontend
```

**Production:**
```bash
docker run -p 8080:80 -e API_BASE_URL=https://api.example.com cellarium-frontend
```

## Access the Application

Open your browser to: http://localhost:8080

## Health Check

Check container health: http://localhost:8080/health

## How It Works

1. The app is built during the Docker image build process
2. At container startup, `entrypoint.sh` generates `/usr/share/nginx/html/config.js` with the `API_BASE_URL` from the environment variable
3. The app loads this runtime config before initializing, allowing the same image to work in different environments
4. Nginx serves the static files with SPA routing enabled

## Environment Variables

- `API_BASE_URL` - Backend API base URL (default: `http://localhost:8000`)

## Notes

- The same Docker image can be used across dev/staging/prod by setting different `API_BASE_URL` values at runtime
- No rebuild required when changing the backend URL
- Local development still works with `npm run dev` using the default `public/config.js` or `.env.local` file
