/* * PROJECT_NAME: EcoLoop Digital Experience Platform
 * MODULE_ID: VISAO
 * FILE_NAME: script-visao.js
 * VERSION_CONTROL: v1.0.0-PROD-CRISTAL
 * AUTHOR_TEAM: Giga-ARCHITECTS OMEGA-TIER CRISTAL
 * CREATION_DATE: 2025-11-01
 * LICENSE_STATUS: PROPRIETARY & CONFIDENTIAL
 * DEPENDENCIES_EXTERNAL: Intersection Observer API
 * DESCRIPTION_EXTENDED: Gerencia a Linha do Tempo Animada (Timeline) de 2025 a 2030, usando Intersection Observer para animar o progresso na rolagem.
*/

// --- 1. GESTÃO DE ESTADO GLOBAL (REPLICADO) ---
const ECOLOOP_APP = {
    config: {
        featureFlags: { enableDarkMode: false, skipAPISimulation: true, observerThreshold: 0.15 } 
    },
    state: {
        isInitialized: false,
        currentModule: 'VISAO',
        isMenuOpen: false
    },
    methods: {}
};

// --- 2. FUNÇÃO CRÍTICA: CONTROLE DA TIMELINE ANIMADA ---
ECOLOOP_APP.methods.initTimelineAnimation = () => {
    const items = document.querySelectorAll('.timeline-item');
    const timelineContainer = document.querySelector('.timeline-container');
    const progressLine = document.getElementById('timeline-progress-line');
    const observerStatus = document.getElementById('observer-status');

    if (!items.length || !timelineContainer || !progressLine) return;

    // Calcula a altura da linha de progresso dinamicamente
    const updateProgressLine = () => {
        // Encontra o último item visível
        const lastVisibleItem = Array.from(items).reverse().find(item => item.classList.contains('in-view'));

        if (!lastVisibleItem) {
            // Se nenhum item estiver visível (topo da página), a altura é zero
            progressLine.style.height = '0px';
            return;
        }

        // Posição do topo do contêiner em relação à viewport
        const containerTop = timelineContainer.getBoundingClientRect().top + window.scrollY;
        
        // Posição do centro do dot do último item visível
        const dot = lastVisibleItem.querySelector('.timeline-dot');
        const dotTop = dot.getBoundingClientRect().top + window.scrollY;

        // Altura: da base do contêiner (containerTop) até o centro do dot (dotTop)
        // Subtrai containerTop para obter a altura relativa
        const newHeight = dotTop - containerTop + (dot.offsetHeight / 2);

        progressLine.style.height = `${newHeight}px`;
    };
    
    // Configuração do Intersection Observer
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Item entrou na viewport
                entry.target.classList.add('in-view');
                observerStatus.textContent = `[Status: ${entry.target.dataset.year} visível. Animando...]`;
                
                // CRÍTICO: Recalcula o progresso da linha toda vez que um novo item entra
                updateProgressLine();
                
                // Opcional: Desobservar após a primeira visualização para otimização
                // observer.unobserve(entry.target); 
            } else {
                // Item saiu da viewport (Se for necessário resetar a animação, o que não é o caso aqui)
            }
        });
    }, {
        root: null, // viewport como root
        threshold: ECOLOOP_APP.config.featureFlags.observerThreshold // 15% do item visível
    });

    // Observa todos os itens da timeline
    items.forEach(item => observer.observe(item));

    // Garante que a linha de progresso é atualizada se a rolagem continuar
    window.addEventListener('scroll', updateProgressLine);
    window.addEventListener('resize', updateProgressLine);
    
    // Atualização inicial (em caso de carregamento no meio da página)
    updateProgressLine();
};


// --- 3. INICIALIZAÇÃO DO MÓDULO ---
document.addEventListener('DOMContentLoaded', () => {
    // 3.1. Inicializa a navegação (omitida por brevidade)
    // ...

    // 3.2. Inicializa a animação da timeline
    ECOLOOP_APP.methods.initTimelineAnimation();

    ECOLOOP_APP.state.isInitialized = true;
    
    if (console.log) { 
        ECOLOOP_RUN_E2E(ECOLOOP_APP.state.currentModule);
    }
});

const ECOLOOP_RUN_E2E = (module) => {
    console.log(`[E2E-TEST]: Iniciando testes em ${module}. Status: PENDENTE (Requer Rolagem).`);
    // Teste de Componente Timeline: Verificar se a classe 'in-view' é adicionada ao rolar.
    // Teste de Performance: O Intersection Observer deve estar ativo.
    
    setTimeout(() => {
        // Simulação de rolagem para disparar o primeiro item
        window.scrollTo(0, 100); 
        console.log("[E2E-TEST]: Simulação de rolagem iniciada. Verifique se o item 2025 está animado.");
    }, 1000);
};

/* --- QA Nível CRÍTICO (TESTES UNITÁRIOS SIMULADOS) --- */
// TEST_U1: Teste de Interseção: Verificar se a classe 'in-view' é adicionada ao primeiro item (2025) após a rolagem.
// TEST_U2: Teste de Layout Responsivo: Garantir que a linha de progresso (left: 50%) se mantém centralizada em todas as larguras.
// TEST_U3: Teste de Performance: A função updateProgressLine não deve ser chamada sem a Intersection Observer.