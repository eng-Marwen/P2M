# ========================================
# BUILD STAGE - Compiles React/TypeScript app
# ========================================
# Use lightweight Node.js 20 Alpine image as builder
FROM node:20-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package files first (for better Docker layer caching)(* for any file packagexxxx.json)
# If package.json hasn't changed, Docker reuses cached layers
COPY package*.json ./

# Install ALL dependencies (including devDependencies like Vite, TypeScript)
# npm ci: Clean install - faster and more reliable than npm install
RUN npm ci

# Copy all source code and config files
COPY . .

# Build the React app for production
# Creates optimized static files in dist/ folder(html css js)
RUN npm run build

# ========================================
# PRODUCTION STAGE - Serves the built app with Nginx
# ========================================
# Use lightweight nginx Alpine image to serve static files
FROM nginx:alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built React app from builder stage to nginx html directory
# nginx will serve these static files (HTML, CSS, JS)
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (default HTTP port for nginx)
EXPOSE 80

# Start nginx in foreground mode
# "daemon off" keeps the container running
CMD ["nginx", "-g", "daemon off;"]


