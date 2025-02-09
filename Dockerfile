FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY pnpm-lock.yaml ./
COPY package*.json ./
COPY tsconfig*.json ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

FROM node:20-alpine AS production

RUN npm install -g pnpm

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist

RUN apk --no-cache add curl

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE ${PORT}

CMD ["pnpm", "run", "start:prod"]