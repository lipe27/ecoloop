/* * PROJECT_NAME: EcoLoop Digital Experience Platform
 * MODULE_ID: IMPACTO
 * FILE_NAME: script-impacto.js
 * VERSION_CONTROL: v1.0.0-PROD-CRISTAL
 * AUTHOR_TEAM: Giga-ARCHITECTS OMEGA-TIER CRISTAL
 * CREATION_DATE: 2025-11-01
 * LICENSE_STATUS: PROPRIETARY & CONFIDENTIAL
 * DESCRIPTION_EXTENDED: Gerencia a simulação de API, o contador animado (easing) e o tratamento de erro CRÍTICO.
*/

// --- 1. GESTÃO DE ESTADO GLOBAL (REPLICADO) ---
const ECOLOOP_APP = {
    config: {
        // CRÍTICO: Use esta flag para forçar o erro e testar o RMP.
        featureFlags: { enableDarkMode: false, skipAPISimulation: false, forceApiError: false } 
    },
    state: {
        isInitialized: false,
        currentModule: 'IMPACTO',
        isMenuOpen: false,
        metricsLoaded: false
    },
    methods: {}
};

// --- 2. SIMULAÇÃO DE LÓGICA DE BACKEND (DataService) ---

// Estrutura de resposta simulada (Dados)
const FAKE_API_RESPONSE = {
    realtime: {
        plasticKg: { value: 5870, unit: 'kg', duration: 2500, decimals: 0 },
        co2Tons: { value: 12.45, unit: 't', duration: 3000, decimals: 2 },
        productsUnits: { value: 350000, unit: 'unid.', duration: 2000, decimals: 0 }
    },
    qualitative: {
        communities: { value: 24, label: 'Comunidades Mapeadas' },
        trainingHours: { value: 12000, label: 'Horas de Treinamento Comunitário' }
    }
};

const DataService = {
    fetch: async (endpoint) => {
        return new Promise((resolve, reject) => {
            const latency = 1500; // Latência de 1.5s
            
            setTimeout(() => {
                // CRÍTICO: Lógica de Forçar Erro
                if (ECOLOOP_APP.config.featureFlags.forceApiError) {
                    console.error("[RMP-002]: Erro de API forçado. Rejeitando a Promise.");
                    return reject(new Error('Simulação de falha de conexão ou timeout.'));
                }
                
                if (endpoint === '/api/v2/metrics/realtime') {
                    resolve(FAKE_API_RESPONSE.realtime);
                } else if (endpoint === '/api/v2/metrics/qualitative') {
                    resolve(FAKE_API_RESPONSE.qualitative);
                } else {
                    reject(new Error('Endpoint não encontrado no mock.'));
                }
            }, latency * (ECOLOOP_APP.config.featureFlags.skipAPISimulation ? 0 : 1));
        });
    }
};

// --- 3. CONTADOR ANIMADO AVANÇADO (Cubic-Bezier Easing) ---
ECOLOOP_APP.methods.animateCounter = ({ id, target, duration, decimals = 0 }) => {
    const element = document.getElementById(id);
    if (!element) return;
    
    let start = 0;
    const startTimestamp = performance.now();
    const step = (timestamp) => {
        const elapsed = timestamp - startTimestamp;
        // Função de Easing: Saída Rápida (Cubic-bezier(0.19, 1, 0.22, 1))
        const progress = Math.min(1, elapsed / duration);
        // Ajusta a velocidade inicial para aceleração suave
        const easedProgress = 1 - Math.pow(1 - progress, 3); 
        
        const currentValue = start + (target - start) * easedProgress;
        
        // Formatação do número
        element.textContent = currentValue.toFixed(decimals).replace('.', ',');
        
        if (elapsed < duration) {
            window.requestAnimationFrame(step);
        } else {
            // Garante o valor final exato
            element.textContent = target.toFixed(decimals).replace('.', ',');
        }
    };
    
    window.requestAnimationFrame(step);
};

// --- 4. FUNÇÃO CRÍTICA DE CARREGAMENTO DE DADOS ---
ECOLOOP_APP.methods.fetchDashboardData = async () => {
    const spinner = document.querySelector('.impacto-dashboard__spinner-wrapper');
    const metricCards = document.querySelectorAll('.impacto-metric');
    
    spinner.style.display = 'flex'; // Mostrar spinner

    try {
        // Simulação de chamadas concorrentes (Promise.all)
        const [realtimeData, qualitativeData] = await Promise.all([
            DataService.fetch('/api/v2/metrics/realtime'),
            DataService.fetch('/api/v2/metrics/qualitative')
        ]);
        
        // 4.1. Processar dados em tempo real (Contadores)
        Object.entries(realtimeData).forEach(([key, metric]) => {
            ECOLOOP_APP.methods.animateCounter({
                id: `counter-${key}`,
                target: metric.value,
                duration: metric.duration,
                decimals: metric.decimals
            });
            // Opcional: Atualizar a unidade se viesse da API
            document.querySelector(`#counter-${key}`).nextElementSibling.textContent = metric.unit;
        });

        // 4.2. Processar dados qualitativos (Badges)
        Object.entries(qualitativeData).forEach(([key, metric]) => {
            const badgeValueEl = document.querySelector(`.badge-item[data-badge-id="${key}"] .badge-item__value`);
            if (badgeValueEl) {
                // Simplesmente injeta o valor para métricas não animadas
                badgeValueEl.textContent = metric.value.toLocaleString('pt-BR');
            }
        });
        
        // 4.3. Sucesso: Esconder spinner e mostrar métricas
        spinner.style.opacity = 0;
        setTimeout(() => {
            spinner.style.display = 'none';
            metricCards.forEach(card => card.classList.add('is-loaded'));
            ECOLOOP_APP.state.metricsLoaded = true;
        }, 500); // Espera a transição de opacidade

    } catch (error) {
        console.error("Erro ao carregar dashboard:", error.message);
        // RMP CRÍTICO: Exibir banner de erro
        document.getElementById('alert-api-error').style.display = 'block';
        
        spinner.style.display = 'none';
        
        // Fallback: Mostrar cards com valores de 0
        metricCards.forEach(card => card.classList.add('is-loaded'));
    }
};


// --- 5. INICIALIZAÇÃO DO MÓDULO ---
document.addEventListener('DOMContentLoaded', () => {
    // 5.1. Inicializa a navegação (função replicada do Pacote 2)
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const header = document.querySelector('.main-header');

    if (menuToggle && mainNav && header) {
        // Inicialização da Navegação aqui (omitida para brevidade, mas deve ser copiada da pág. 2)
    }

    // 5.2. Inicia o carregamento de dados
    ECOLOOP_APP.methods.fetchDashboardData();
    ECOLOOP_APP.state.isInitialized = true;
    
    // 5.3. Hook de Teste E2E
    if (console.log) { 
        ECOLOOP_RUN_E2E(ECOLOOP_APP.state.currentModule);
    }
});

const ECOLOOP_RUN_E2E = (module) => {
    console.log(`[E2E-TEST]: Iniciando testes em ${module}. Status: PENDENTE.`);
    // Teste E2E deve ser finalizado APÓS o carregamento da API simulada.
    setTimeout(() => {
        if (ECOLOOP_APP.state.metricsLoaded) {
             console.log(`[E2E-TEST]: Dashboard carregado e contadores iniciados: OK.`);
        } else {
             console.log(`[E2E-TEST]: Dashboard falhou no carregamento (RMP ativado).`);
        }
    }, 4000); // Espera o tempo de API + animação

};

/* --- QA Nível CRÍTICO (TESTES UNITÁRIOS SIMULADOS) --- */
// TEST_U1: Teste de Formatação de Decimal: Garantir que o contador co2Tons use vírgula (12,45).
// TEST_U2: Teste de Concorrência: Verificar se o Promise.all resolve ambos os endpoints antes de esconder o spinner.
// TEST_U3: Teste de Resiliência: Forçar 'forceApiError: true' e verificar se o #alert-api-error aparece.