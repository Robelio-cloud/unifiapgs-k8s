## Índice de Evidências (Desafio UniFIAP Pay SPB)
3.1. Etapa 1: Docker e Imagem Segura (1,5 pts)

Print 1: Build Multi-Stage 

O que é: O output do seu terminal do comando docker build (para o api-pagamentos ou auditoria-service).

O que Prova: Mostra os "Estágio 1/2" e "Estágio 2/2", provando o uso de multi-stage build.


Print 2: Push no Docker Hub 

O que é: O output do terminal dos comandos docker push robelio/api-pagamentos-spb:v1.RM556786 e docker push robelio/auditoria-service-spb:v1.RM556786.

O que Prova: Mostra que as imagens com sua tag de RM (v1.RM556786) foram publicadas com sucesso.


Print 3: (Evidência de Contorno) Scan de Vulnerabilidade 

O que é: O output do terminal mostrando os erros docker: unknown command: docker scout e docker: unknown command: docker scan.

O que Prova: Prova que você tentou executar o requisito, mas o plugin não estava disponível no seu ambiente Docker Engine.

3.2. Etapa 2: Rede, Comunicação e Segmentação (2,5 pts)

Print 4: Inspeção da Rede Docker 

O que é: O output do comando docker network inspect unifiap_net. (Nós criamos a rede, mas não a inspecionamos. Você pode rodar este comando agora para pegar a evidência).

O que Prova: Mostra a configuração da sub-rede 172.25.0.0/24.


Print 5: Logs da API lendo a Reserva 

O que é: O output do terminal de quando você rodou kubectl exec -it ... -- /bin/sh e depois env | grep RESERVA.

O que Prova: Mostra RESERVA_BANCARIA_SALDO=1000000.00, provando que o Pod leu o ConfigMap.

3.3. Etapa 3: Kubernetes - Estrutura, Escala e Deploy (3,0 pts)

Print 6: Pods Iniciais (2 Réplicas) 

O que é: O output do kubectl get pods -n unifiapay que mostrou os dois pods api-pagamentos... 1/1 Running.

O que Prova: Mostra que o Deployment subiu com as 2 réplicas pedidas.


Print 7: Escala (4 Réplicas) 

O que é: O output do kubectl get pods -n unifiapay depois de você rodar o kubectl scale --replicas=4.

O que Prova: Mostra os 4 pods da api-pagamentos rodando, provando que o scale funcionou.


Print 8: Prova de Escrita/Leitura no Volume Compartilhado 

O que é: O output do cat /var/logs/api/instrucoes.log (de dentro do Pod 2) mostrando a linha TESTE_DO_POD_1 (que você escreveu a partir do Pod 1).

O que Prova: Prova que os dois pods da API leem e escrevem no mesmo volume (o PVC livro-razao-pvc).


Print 9: CronJob e Job Concluído 

O que é: O output do kubectl get pods -n unifiapay --watch (ou kubectl get pods) que mostrou o pod auditoria-run-3-lqnxz com o status Completed.

O que Prova: Prova que o CronJob foi executado (manualmente, via kubectl create job) e o script rodou com sucesso.


Print 10: Log do Auditor 

O que é: O output do kubectl logs -n unifiapay auditoria-run-3-lqnxz.

O que Prova: Mostra [Auditoria] Nenhuma transação aguardando liquidação encontrada, provando que o código do auditor (que lê o volume) também funcionou.

3.4. Etapa 4: Kubernetes - Segurança e Operação (2,0 pts)

Print 11: (Evidência de Contorno) Limites de CPU/Memória 

O que é: O output do comando kubectl top pods -n unifiapay mostrando o erro error: Metrics API not available.

O que Prova: Prova que o comando foi executado, mas o Metrics Server (um componente opcional) não estava instalado no Kind.


Print 12: Prova do securityContext (YAML) 

O que é: Um print do seu arquivo k8s/03-api-deployment.yaml (no VSCode) focado nas linhas do securityContext.

O que Prova: Mostra as diretivas runAsNonRoot: true e runAsUser: 1000.


Print 13: Prova de Permissão Restrita 

O que é: O output do comando kubectl auth can-i create deployments ... -n unifiapay.

O que Prova: Mostra a resposta no, provando que a Service Account padrão (dos pods) tem permissão restrita e não pode criar deployments, como manda a boa prática.