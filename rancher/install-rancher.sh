#!/bin/bash
# Script para instalar Rancher no cluster Kind
# UniFIAP Pay SPB - RM556786

set -e

echo "🐮 Instalando Rancher no cluster Kind..."

# 1. Adicionar repositório Helm do Rancher
echo "📦 Adicionando repositório Helm do Rancher..."
helm repo add rancher-latest https://releases.rancher.com/server-charts/latest
helm repo update

# 2. Criar namespace para o Rancher
echo "📂 Criando namespace cattle-system..."
kubectl create namespace cattle-system --dry-run=client -o yaml | kubectl apply -f -

# 3. Instalar cert-manager (necessário para HTTPS)
echo "🔐 Instalando cert-manager..."
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml

# Aguardar cert-manager estar pronto
echo "⏳ Aguardando cert-manager ficar pronto..."
kubectl wait --for=condition=Available --timeout=300s -n cert-manager deployment/cert-manager
kubectl wait --for=condition=Available --timeout=300s -n cert-manager deployment/cert-manager-webhook
kubectl wait --for=condition=Available --timeout=300s -n cert-manager deployment/cert-manager-cainjector

# 4. Instalar Rancher
echo "🚀 Instalando Rancher Server..."
helm install rancher rancher-latest/rancher \
  --namespace cattle-system \
  --set hostname=rancher.localhost \
  --set replicas=1 \
  --set bootstrapPassword=admin123 \
  --set ingress.tls.source=rancher \
  --wait

# 5. Aguardar Rancher estar pronto
echo "⏳ Aguardando Rancher ficar pronto (pode levar alguns minutos)..."
kubectl -n cattle-system rollout status deploy/rancher

# 6. Obter URL de acesso
echo ""
echo "✅ Rancher instalado com sucesso!"
echo ""
echo "📍 Acesse o Rancher em: https://rancher.localhost"
echo "👤 Usuário: admin"
echo "🔑 Senha: admin123"
echo ""
echo "🔧 Para acessar, adicione ao /etc/hosts:"
echo "   127.0.0.1 rancher.localhost"
echo ""
echo "🌐 Ou use port-forward:"
echo "   kubectl port-forward -n cattle-system svc/rancher 8443:443"
echo "   Acesse: https://localhost:8443"
echo ""
