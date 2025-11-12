const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json()); // Middleware para entender JSON no body

// Configurar JSON pretty-print para respostas
app.set('json spaces', 2);

// Caminho do "Livro-Razão" que será montado pelo Kubernetes
const LOG_FILE_PATH = '/var/logs/api/instrucoes.log';

// 1. Ler Saldo: Lê a reserva do ConfigMap/ENV
const RESERVA_BANCARIA_SALDO = parseFloat(process.env.RESERVA_BANCARIA_SALDO || '0');

console.log(`[API-Pagamentos] Iniciado. Saldo da Reserva: ${RESERVA_BANCARIA_SALDO}`);

// Rota raiz - Documentação da API
app.get('/', (req, res) => {
    res.json({
        message: "API UniFIAP Pay - Sistema de Pagamentos Brasileiro",
        version: "1.0.0",
        rm: "RM556786",
        endpoints: {
            pix: "POST /pix - Criar transação PIX",
            health: "GET /health - Status da API"
        },
        documentation: "https://github.com/Robelio-cloud/unifiapgs-k8s"
    });
});

// Health check - Verificação de status
app.get('/health', (req, res) => {
    res.json({
        status: "OK",
        service: "api-pagamentos",
        reserva_bancaria: `R$ ${RESERVA_BANCARIA_SALDO.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.post('/pix', async (req, res) => {
    const { valor, id_transacao } = req.body;

    if (!valor || !id_transacao) {
        return res.status(400).send({ erro: 'Valor e id_transacao são obrigatórios.' });
    }

    // 2. Pré-Validar: Checa se o valor do PIX é coberto pela reserva
    if (valor <= RESERVA_BANCARIA_SALDO) {
        // 3. Registrar: Aprovado, escreve no log com status AGUARDANDO_LIQUIDACAO
        const logEntry = `${new Date().toISOString()} | ${id_transacao} | ${valor} | AGUARDANDO_LIQUIDACAO\n`;

        try {
            // Garante que o diretório exista (o Kubernetes vai montar o volume, mas é uma boa prática)
            await fs.mkdir(path.dirname(LOG_FILE_PATH), { recursive: true });
            // 'a' significa 'append' (juntar, apendar)
            await fs.appendFile(LOG_FILE_PATH, logEntry);

            console.log(`[API-Pagamentos] PIX ${id_transacao} aceito. Aguardando liquidação.`);
            res.status(202).send({ status: 'PIX Aceito', transacao: id_transacao, estado: 'AGUARDANDO_LIQUIDACAO' });

        } catch (err) {
            console.error('[API-Pagamentos] Erro ao escrever no log:', err);
            res.status(500).send({ erro: 'Erro interno ao registrar transação.' });
        }

    } else {
        // Rejeitado por falta de fundos na reserva
        console.warn(`[API-Pagamentos] PIX ${id_transacao} rejeitado. Valor ${valor} excede a reserva ${RESERVA_BANCARIA_SALDO}.`);
        res.status(400).send({ status: 'PIX Rejeitado', motivo: 'Fundos insuficientes na Reserva Bancária.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[API-Pagamentos] Servidor rodando na porta ${PORT}`);
});