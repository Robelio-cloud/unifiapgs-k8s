# ---- Estágio 1: Builder ----
# Usamos a imagem Alpine (pequena) para o build
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os manifestos do projeto
COPY package.json package-lock.json* ./

# Instala dependências de produção de forma "limpa" (Clean Install)
RUN npm ci --only=production

# Copia o código-fonte
COPY src/ ./src/

# ---- Estágio 2: Final ----
# Começa de uma nova imagem limpa
FROM node:20-alpine

WORKDIR /app

# Copia os node_modules prontos do estágio 'builder'
COPY --from=builder /app/node_modules ./node_modules

# Copia o código-fonte e o package.json
COPY --from=builder /app/src ./src/
COPY --from=builder /app/package.json ./

# --- Segurança: Rodar como usuário não-root ---
# Cria um usuário e grupo 'appuser'
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# Define que o container rodará com esse usuário
USER appuser

# Expõe a porta que nosso index.js usa
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "src/index.js"]