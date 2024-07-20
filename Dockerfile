ARG NODE_VERSION=20.15.0

# Node slim base image
FROM node:${NODE_VERSION}-slim AS slim

# Setup pnpm and turbo on the node slim base image
FROM slim as base
RUN npm install pnpm turbo --global
RUN pnpm config set store-dir ~/.pnpm-store

# Prune project
FROM base AS pruner
ARG APP

WORKDIR /app
COPY . .
RUN turbo prune --scope=${APP} --docker

# Build the project
FROM base AS builder
ARG APP

WORKDIR /app

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/json/ .

# First install the dependencies (as they change less often)
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm install --frozen-lockfile

# Copy source code of isolated subworkspace
COPY --from=pruner /app/out/full/ .

RUN turbo build --filter=${APP}
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm prune --prod --no-optional
RUN rm -rf ./**/*/src

# Final image
FROM slim AS runner
ARG PORT=3000
ARG APP_DIR

WORKDIR /app
COPY --from=builder /app .
WORKDIR /app/apps/${APP_DIR}

ENV PORT=${PORT}
ENV NODE_ENV=production

EXPOSE ${PORT}

CMD ["npm", "start"]