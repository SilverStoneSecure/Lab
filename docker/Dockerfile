FROM node:22-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

RUN mkdir -p /app/data && chmod +x docker/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker/docker-entrypoint.sh"]
