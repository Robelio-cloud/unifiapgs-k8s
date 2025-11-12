# 🐮 Rancher - Gerenciamento Kubernetes GUI

## 📋 Sobre o Rancher

O Rancher é uma plataforma completa de gerenciamento de clusters Kubernetes que oferece:

- 🎨 **Interface Web Intuitiva** - Gerenciar recursos visualmente
- 📊 **Monitoramento Integrado** - Métricas, logs e alertas
- 🔐 **Segurança Avançada** - RBAC, políticas de rede, scan de vulnerabilidades
- 📦 **Catálogo de Apps** - Deploy fácil com Helm Charts
- 🔄 **Multi-Cluster** - Gerenciar múltiplos clusters K8s

---

## 🚀 Instalação Rápida

### **Pré-requisitos**

```bash
# Instalar Helm (se não tiver)
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verificar
helm version
```

### **Método 1: Script Automatizado** ⭐ Recomendado

```bash
# Dar permissão de execução
chmod +x rancher/install-rancher.sh

# Executar instalação
./rancher/install-rancher.sh
```

### **Método 2: Instalação Manual**

```bash
# 1. Adicionar repositório Helm
helm repo add rancher-latest https://releases.rancher.com/server-charts/latest
helm repo update

# 2. Criar namespace
kubectl create namespace cattle-system

# 3. Instalar cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml

# Aguardar cert-manager
kubectl wait --for=condition=Available --timeout=300s -n cert-manager deployment/cert-manager

# 4. Instalar Rancher
helm install rancher rancher-latest/rancher \
  --namespace cattle-system \
  --set hostname=rancher.localhost \
  --set replicas=1 \
  --set bootstrapPassword=admin123 \
  --wait

# 5. Aguardar Rancher
kubectl -n cattle-system rollout status deploy/rancher
```

---

## 🌐 Acessando o Rancher

### **Opção 1: Port-Forward (Mais Simples)**

```bash
# Iniciar port-forward
kubectl port-forward -n cattle-system svc/rancher 8443:443

# Acessar no navegador (aceitar certificado autoassinado)
https://localhost:8443
```

### **Opção 2: Configurar /etc/hosts**

```bash
# Adicionar ao /etc/hosts
echo "127.0.0.1 rancher.localhost" | sudo tee -a /etc/hosts

# Criar port-forward para porta 443
sudo kubectl port-forward -n cattle-system svc/rancher 443:443

# Acessar
https://rancher.localhost
```

### **Credenciais Padrão**

- **Usuário**: `admin`
- **Senha**: `admin123`

⚠️ **Importante**: Ao fazer login pela primeira vez, o Rancher pedirá para alterar a senha!

---

## 📦 Gerenciando o Projeto UniFIAP Pay no Rancher

### **1. Acessar o Cluster**

1. Faça login no Rancher
2. Vá em **"Cluster Management"**
3. Clique no cluster **"local"** (seu Kind)

### **2. Visualizar Recursos**

#### **Namespaces:**
- Menu lateral → **"Namespaces"**
- Procure por: `unifiapay`

#### **Deployments:**
- Menu lateral → **"Workloads"** → **"Deployments"**
- Você verá: `api-pagamentos`

#### **Pods:**
- Menu lateral → **"Workloads"** → **"Pods"**
- Filtre por namespace: `unifiapay`

#### **PVCs:**
- Menu lateral → **"Storage"** → **"PersistentVolumeClaims"**
- Você verá: `livro-razao-pvc`

#### **CronJobs:**
- Menu lateral → **"Workloads"** → **"CronJobs"**
- Você verá: `auditoria-service`

### **3. Ações Disponíveis**

#### **Escalar Deployment:**
1. Vá em **Deployments** → `api-pagamentos`
2. Clique no **"⋮"** (três pontos)
3. Selecione **"Edit Config"**
4. Altere **"Replicas"** para 4
5. Clique em **"Save"**

#### **Ver Logs:**
1. Vá em **Pods**
2. Clique em um pod da `api-pagamentos`
3. Aba **"Logs"**
4. Veja os logs em tempo real! 📊

#### **Executar Shell no Pod:**
1. Vá em **Pods**
2. Clique em um pod
3. Clique em **"Execute Shell"** ⚡
4. Execute: `cat /var/logs/api/instrucoes.log`

#### **Monitorar Recursos:**
1. Vá em **Workloads** → **Deployments**
2. Clique em `api-pagamentos`
3. Aba **"Metrics"** → Veja CPU/Memory 📈

### **4. Deploy via Rancher UI**

Você pode fazer deploy de novas versões visualmente:

1. **Workloads** → **Deployments** → `api-pagamentos`
2. Clique em **"Redeploy"**
3. Ou edite a imagem Docker em **"Edit Config"**

---

## 🔧 Funcionalidades Avançadas

### **1. Instalar Prometheus + Grafana**

```bash
# Via Rancher UI:
# Apps & Marketplace → Charts → Monitoring
# Ou via kubectl:
kubectl apply -f rancher/monitoring-stack.yaml
```

### **2. Configurar Alertas**

1. **Cluster Tools** → **Monitoring**
2. Configurar alertas para:
   - CPU > 80%
   - Memory > 90%
   - Pods em CrashLoopBackOff

### **3. Backup e Restore**

1. **Cluster Tools** → **Backups**
2. Configurar backup automático do cluster

---

## 🎯 Comandos Úteis

### **Verificar Status do Rancher**

```bash
# Pods do Rancher
kubectl get pods -n cattle-system

# Logs do Rancher
kubectl logs -n cattle-system deployment/rancher -f

# Status do serviço
kubectl get svc -n cattle-system rancher
```

### **Reiniciar Rancher**

```bash
kubectl rollout restart deployment/rancher -n cattle-system
```

### **Desinstalar Rancher**

```bash
# Remover Rancher
helm uninstall rancher -n cattle-system

# Remover cert-manager
kubectl delete -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml

# Limpar namespaces
kubectl delete namespace cattle-system
kubectl delete namespace cert-manager
```

---

## 📸 Screenshots e Evidências

### **Para o Desafio UniFIAP:**

1. **Print da Dashboard** - Mostrando todos os recursos
2. **Print dos Pods** - 2 réplicas rodando
3. **Print dos Logs** - Logs da API no Rancher
4. **Print do Scale** - Escalando de 2 para 4 réplicas
5. **Print do CronJob** - Auditoria agendada

---

## 🔐 Segurança

### **Alterar Senha do Admin**

```bash
# Reset de senha via kubectl
kubectl -n cattle-system exec $(kubectl -n cattle-system get pods -l app=rancher --no-headers | head -1 | awk '{print $1}') -- reset-password
```

### **Criar Usuários Adicionais**

1. **Users & Authentication** → **Users**
2. Clique em **"Create"**
3. Defina permissões (Admin, Standard User, etc.)

---

## 📊 Monitoramento do UniFIAP Pay

### **Dashboards Recomendados:**

1. **Cluster Dashboard** - Visão geral do cluster
2. **Namespace Dashboard** - Foco no `unifiapay`
3. **Workload Dashboard** - Métricas da `api-pagamentos`
4. **Pod Dashboard** - Recursos de cada pod

### **Métricas Importantes:**

- ✅ CPU Usage (deve estar baixo ~5-10%)
- ✅ Memory Usage (~128Mi)
- ✅ Network I/O (tráfego das requisições PIX)
- ✅ Pod Restarts (deve ser 0)
- ✅ CronJob Success Rate (100%)

---

## 🎓 Recursos de Aprendizado

- [Documentação Oficial](https://rancher.com/docs/)
- [Rancher Academy](https://academy.rancher.com/)
- [Vídeos Tutoriais](https://www.youtube.com/c/Rancher)

---

## 🤝 Suporte

**Problemas comuns:**

### **Rancher não inicia**
```bash
# Verificar recursos
kubectl describe pod -n cattle-system -l app=rancher

# Ver logs
kubectl logs -n cattle-system -l app=rancher --tail=100
```

### **Certificado SSL não confiável**
- Normal em ambiente local
- Clique em "Avançado" → "Continuar" no navegador

### **Port-forward cai**
```bash
# Use nohup para manter ativo
nohup kubectl port-forward -n cattle-system svc/rancher 8443:443 &
```

---

**Desenvolvido para**: UniFIAP Pay SPB - RM556786  
**Cluster**: Kind (local)  
**Rancher Version**: Latest Stable
