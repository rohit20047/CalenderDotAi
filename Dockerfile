# === 1. Builder Stage ===
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
RUN npm install

# Copy the rest of the app
COPY . .

# Build the app
RUN npm run build

# === 2. Runner Stage ===
FROM node:18-alpine AS runner

ENV NODE_ENV=production
WORKDIR /app

# Copy package files again
COPY --from=builder /app/package*.json ./

# Install ONLY production dependencies (no devDependencies)
RUN npm install --production

# Copy built assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# (Optional) Copy other required files

COPY --from=builder /app/tsconfig.json ./

EXPOSE 3000
CMD ["npm", "start"]