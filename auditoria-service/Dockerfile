# ---- Estágio 1: Builder ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./

# Roda o npm ci
RUN npm ci --only=production

# Copia o código-fonte
COPY src/ ./src/

# ---- Estágio 2: Final ----
FROM node:20-alpine
WORKDIR /app

# ---- CORREÇÃO AQUI ----
# Agora copiamos a pasta inteira do 'builder'
# Se 'node_modules' não existir, ele não dá erro,
# apenas não será copiado, junto com o resto.
COPY --from=builder /app ./

# --- Segurança ---
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Comando para rodar o script
CMD ["node", "src/index.js"]