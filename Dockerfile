# Prodexa Backend - Dockerfile (Multi-stage build)
FROM node:20-alpine AS base
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production
COPY . .

FROM base AS development
ENV NODE_ENV=development
RUN cd server && npm install
EXPOSE 5000
CMD ["cd", "server", "&&", "npm", "run", "dev"]

FROM base AS production
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "server/index.js"]