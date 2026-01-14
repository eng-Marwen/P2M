# ========================================
# BUILD STAGE - Compiles TypeScript to JavaScript
# ========================================
# Use lightweight Node.js 20 Alpine image as builder
FROM node:20-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package files first (for better Docker layer caching)(*:any file that is packagexxx.json)
# If package.json hasn't changed, Docker reuses cached layers
COPY package*.json ./

# Install ALL dependencies (including devDependencies like TypeScript)
# npm ci: Clean install - faster and more reliable than npm install
RUN npm ci

# Copy TypeScript configuration
COPY tsconfig.json ./

# Copy all source code
COPY . .

# Compile TypeScript to JavaScript
# Output goes to dist/ folder as configured in tsconfig.json
RUN npm run build

# ========================================
# PRODUCTION STAGE - Runs the compiled app
# ========================================
# Start fresh with a new lightweight image (smaller final image)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set Node.js to production mode (disables dev warnings, optimizes performance)
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies (excludes devDependencies)
# --omit=dev skips TypeScript, @types/*, etc. to reduce image size
RUN npm ci --omit=dev

# Copy compiled JavaScript from build stage
# Only copy dist/ folder, not the TypeScript source code
COPY --from=builder /app/dist ./dist

# Expose port 4000 (informs Docker which port the app uses)
# Actual port mapping happens with docker run -p flag
EXPOSE 4000

# Start the application
# Run index.js (which loads dotenv then run the server) 
CMD ["node", "dist/index.js"]
