const fs = require('fs').promises;
const path = require('path');

// 1. Monitorar: O mesmo "Livro-Razão" [cite: 11]
const LOG_FILE_PATH = '/var/logs/api/instrucoes.log';

async function rodarAuditoria() {
    console.log('[Auditoria] Iniciando processo de liquidação...');

    let data;
    try {
        // Tenta ler o arquivo de log
        data = await fs.readFile(LOG_FILE_PATH, 'utf8');
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log('[Auditoria] Arquivo de log ainda não existe. Nenhuma ação a tomar.');
            return; // Sai se o log não foi criado
        }
        console.error('[Auditoria] Erro ao ler o arquivo de log:', err);
        return;
    }

    // 2. Liquidação: Busca transações pendentes
    // Usamos regex global (/g) para pegar todas as ocorrências
    const regex = /AGUARDANDO_LIQUIDACAO/g;

    if (!data.match(regex)) {
        console.log('[Auditoria] Nenhuma transação aguardando liquidação encontrada.');
        return;
    }

    // 3. Atualização: Atualiza o status de todas para LIQUIDADO
    // Esta é a forma mais simples: lê tudo, substitui na memória, e escreve tudo de volta.
    // Para um arquivo de log gigante, isso não seria o ideal, mas para o desafio é perfeito.
    const updatedData = data.replace(regex, 'LIQUIDADO');

    try {
        await fs.writeFile(LOG_FILE_PATH, updatedData, 'utf8');
        console.log('[Auditoria] Processo de liquidação concluído. Status atualizado para LIQUIDADO.');
    } catch (err) {
        console.error('[Auditoria] Erro ao escrever atualizações no log:', err);
    }
}

// Inicia a execução da auditoria
rodarAuditoria();