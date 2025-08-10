# Simple Node-based static server for the Monopoly MVP
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy source
COPY public ./public
COPY server.js ./server.js

# Expose port
EXPOSE 8080

# Run
CMD ["npm", "start"]
