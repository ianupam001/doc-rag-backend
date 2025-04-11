# ----------------------
# Build Stage
# ----------------------
FROM node:20 AS builder

# Install dependencies for native modules
RUN apt-get update && apt-get install -y build-essential python3

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

# Install dependencies and rebuild bcrypt
RUN npm ci && npm rebuild bcrypt --build-from-source

COPY . .

# Build your app
RUN npm run build
RUN npx prisma generate

# ----------------------
# Production Stage
# ----------------------
FROM node:20

WORKDIR /app

# Copy built files from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "dist/src/main.js"]
