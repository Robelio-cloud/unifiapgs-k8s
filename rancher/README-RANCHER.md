# 🐮 Rancher - Gerenciamento Kubernetes GUI

## ⚠️ IMPORTANTE: Incompatibilidade com Kubernetes 1.34+

**Este documento serve como referência histórica da tentativa de implementação do Rancher.**

### **Problema Encontrado:**

Durante a instalação do Rancher no cluster Kind (Kubernetes 1.34.0), foi identificado um problema crítico de **incompatibilidade de versão**:

```
Error: INSTALLATION FAILED: chart requires kubeVersion: < 1.34.0-0 which is incompatible with Kubernetes v1.34.0
```

### **Análise Técnica:**

- ❌ **Rancher 2.12.x** não suporta Kubernetes 1.34+
- ❌ Tentativas com `kubeVersionOverride` não foram bem-sucedidas
- ❌ Incompatibilidade no nível de validação do Helm Chart
- ⚠️ Instalação manual sem Helm poderia causar instabilidades

### **Decisão Técnica:**

Optou-se por utilizar o **Kubernetes Dashboard oficial** devido a:
- ✅ **Compatibilidade total** com Kubernetes 1.34+
- ✅ **Ferramenta oficial** da CNCF
- ✅ **Leveza** (~50MB vs >1GB do Rancher)
- ✅ **Simplicidade** adequada para um único cluster
- ✅ **Estabilidade** garantida para a versão do Kind

📖 **Documentação do Kubernetes Dashboard**: [`README-DASHBOARD.md`](README-DASHBOARD.md)

---

## 📋 Sobre o Rancher (Para Referência)

O Rancher é uma plataforma completa de gerenciamento de clusters Kubernetes que oferece:

- 🎨 **Interface Web Intuitiva** - Gerenciar recursos visualmente
- 📊 **Monitoramento Integrado** - Métricas, logs e alertas
- 🔐 **Segurança Avançada** - RBAC, políticas de rede, scan de vulnerabilidades
- 📦 **Catálogo de Apps** - Deploy fácil com Helm Charts
- 🔄 **Multi-Cluster** - Gerenciar múltiplos clusters K8s

**Nota**: Ideal para ambientes de produção com Kubernetes < 1.34 e necessidade de gerenciar múltiplos clusters.

---

## 🚀 Tentativa de Instalação (Histórico)

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

## 📸 Screenshots e Evidências (Histórico)

### **Para o Desafio UniFIAP:**

Estas capturas de tela serviriam de evidência caso o Rancher tivesse sido instalado com sucesso:

#### **1. Tentativa de Instalação**
![Erro de Instalação do Rancher](../images/image10.png)

#### **2. Incompatibilidade de Versão**
![Mensagem de Erro - Kubernetes 1.34](../images/image11.png)

**Nota**: Como o Rancher não foi instalado com sucesso, as evidências do projeto foram capturadas no **Kubernetes Dashboard**. Consulte [`README-DASHBOARD.md`](README-DASHBOARD.md) para ver os screenshots funcionais.

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


---

## 🎓 Recursos de Aprendizado (Rancher)

- [Documentação Oficial](https://rancher.com/docs/)
- [Rancher Academy](https://academy.rancher.com/)
- [Vídeos Tutoriais](https://www.youtube.com/c/Rancher)
- [Compatibility Matrix](https://www.suse.com/suse-rancher/support-matrix/all-supported-versions/)

---

## ✅ Solução Implementada: Kubernetes Dashboard

Para este projeto, foi implementado o **Kubernetes Dashboard oficial** como alternativa ao Rancher.

### **Vantagens para este contexto:**

| Critério | Rancher | Kubernetes Dashboard |
|----------|---------|---------------------|
| Compatibilidade K8s 1.34+ | ❌ Não suportado | ✅ Total |
| Peso/Recursos | 🔴 Pesado (>1GB) | 🟢 Leve (~50MB) |
| Complexidade | 🟡 Alto (multi-cluster) | 🟢 Simples (single) |
| Tempo de instalação | 🟡 5-10 min | 🟢 1-2 min |
| Funcionalidades básicas | ✅ Sim | ✅ Sim |
| Multi-cluster | ✅ Sim | ❌ Não |
| Catálogo de apps | ✅ Sim | ❌ Não |
| **Adequado para Kind local** | ❌ Não | ✅ Sim |

### **Acesse a documentação:**

📖 **[README-DASHBOARD.md](README-DASHBOARD.md)** - Guia completo de instalação e uso

---

## 🤝 Troubleshooting (Histórico)

**Problemas encontrados durante a tentativa de instalação:**

### **1. Incompatibilidade de Versão (CRÍTICO)**
```bash
Error: chart requires kubeVersion: < 1.34.0-0 which is incompatible with Kubernetes v1.34.0
```
**Causa**: Rancher 2.12.x não suporta Kubernetes 1.34+  
**Solução aplicada**: Migração para Kubernetes Dashboard

### **2. Rancher não inicia (Se tentasse forçar instalação)**
```bash
# Verificar recursos
kubectl describe pod -n cattle-system -l app=rancher

# Ver logs
kubectl logs -n cattle-system -l app=rancher --tail=100
```

### **3. Certificado SSL não confiável (Caso instalasse)**
- Normal em ambiente local
- Clique em "Avançado" → "Continuar" no navegador

### **4. Port-forward cai (Problema geral)**
```bash
# Use nohup para manter ativo
nohup kubectl port-forward -n cattle-system svc/rancher 8443:443 &
```

---

## 📌 Conclusão

Este documento serve como **registro histórico** da tentativa de implementação do Rancher no projeto UniFIAP Pay SPB.

### **Lições Aprendidas:**

1. ✅ **Validar compatibilidade** de versões antes da escolha de ferramentas
2. ✅ **Adequar ferramentas** ao contexto do projeto (single cluster vs multi-cluster)
3. ✅ **Priorizar leveza** em ambientes de desenvolvimento local
4. ✅ **Usar ferramentas oficiais** quando possível (maior estabilidade)

### **Resultado Final:**

- ❌ Rancher: Incompatível com Kubernetes 1.34+
- ✅ **Kubernetes Dashboard**: Implementado com sucesso

---

**Projeto**: UniFIAP Pay SPB - Sistema de Pagamentos Brasileiro  
**RM**: 556786  
**Cluster**: Kind (Kubernetes 1.34.0)  
**Status**: Rancher descontinuado | Dashboard implementado  
**Data**: Novembro 2025
