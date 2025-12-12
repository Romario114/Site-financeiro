// Sistema de Gerenciamento de Dívidas de Longo Prazo

class SistemaDividas {
    constructor() {
        this.dividas = JSON.parse(localStorage.getItem('dividas')) || [];
        this.editandoId = null;
        this.init();
    }

    init() {
        this.carregarElementos();
        this.configurarEventos();
        this.renderizarLista();
        this.atualizarResumo();
    }

    carregarElementos() {
        // Formulário
        this.form = document.getElementById('formDivida');
        this.nomeInput = document.getElementById('nomeDivida');
        this.valorInput = document.getElementById('valorTotal');
        this.parcelasInput = document.getElementById('parcelasTotal');
        this.tipoInput = document.getElementById('tipoDivida');
        this.dataInput = document.getElementById('dataInicio');
        this.descricaoInput = document.getElementById('descricao');
        this.btnCancelar = document.getElementById('btnCancelar');
        
        // Busca e filtro
        this.searchInput = document.getElementById('searchInput');
        this.filterSelect = document.getElementById('filterStatus');
        
        // Lista
        this.listaDividas = document.getElementById('listaDividas');
        
        // Resumo
        this.totalDividasEl = document.getElementById('totalDividas');
        this.valorTotalDividasEl = document.getElementById('valorTotalDividas');
        this.dividasQuitadasEl = document.getElementById('dividasQuitadas');
        this.progressoMedioEl = document.getElementById('progressoMedio');
        
        // Modal
        this.modal = document.getElementById('editModal');
        this.modalBody = document.querySelector('.modal-body');
        this.closeModal = document.querySelector('.close-modal');
        
        // Data de início padrão
        if (!this.dataInput.value) {
            const hoje = new Date().toISOString().split('T')[0];
            this.dataInput.value = hoje;
        }
    }

    configurarEventos() {
        // Formulário
        this.form.addEventListener('submit', (e) => this.salvarDivida(e));
        this.btnCancelar.addEventListener('click', () => this.limparFormulario());
        
        // Busca e filtro
        this.searchInput.addEventListener('input', () => this.renderizarLista());
        this.filterSelect.addEventListener('change', () => this.renderizarLista());
        
        // Modal
        this.closeModal.addEventListener('click', () => this.fecharModal());
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.fecharModal();
            }
        });
        
        // Tecla ESC para fechar modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'flex') {
                this.fecharModal();
            }
        });
    }

    // Formatar moeda
    formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }

    // Calcular progresso
    calcularProgresso(divida) {
        return Math.round((divida.parcelasPagas / divida.parcelasTotal) * 100);
    }

    // Salvar dívida
    salvarDivida(e) {
        e.preventDefault();
        
        const nome = this.nomeInput.value.trim();
        const valor = parseFloat(this.valorInput.value);
        const parcelasTotal = parseInt(this.parcelasInput.value);
        const tipo = this.tipoInput.value;
        const dataInicio = this.dataInput.value;
        const descricao = this.descricaoInput.value.trim();
        
        // Validações
        if (!nome || valor <= 0 || parcelasTotal <= 0) {
            alert('Por favor, preencha todos os campos obrigatórios corretamente.');
            return;
        }
        
        const novaDivida = {
            id: this.editandoId !== null ? this.editandoId : Date.now(),
            nome,
            valorTotal: valor,
            parcelasTotal,
            parcelasPagas: this.editandoId !== null ? 
                this.dividas.find(d => d.id === this.editandoId).parcelasPagas : 0,
            tipo,
            dataInicio: dataInicio || new Date().toISOString().split('T')[0],
            descricao,
            quitada: false,
            dataCriacao: new Date().toISOString()
        };
        
        if (this.editandoId !== null) {
            // Atualizar dívida existente
            const index = this.dividas.findIndex(d => d.id === this.editandoId);
            if (index !== -1) {
                this.dividas[index] = { 
                    ...this.dividas[index], 
                    ...novaDivida,
                    parcelasPagas: this.dividas[index].parcelasPagas // Mantém as parcelas pagas
                };
            }
            this.editandoId = null;
        } else {
            // Nova dívida
            this.dividas.push(novaDivida);
        }
        
        this.salvarNoLocalStorage();
        this.renderizarLista();
        this.atualizarResumo();
        this.limparFormulario();
        
        // Feedback visual
        const btnSubmit = this.form.querySelector('button[type="submit"]');
        const originalText = btnSubmit.innerHTML;
        btnSubmit.innerHTML = '<i class="fas fa-check"></i> Salvo!';
        btnSubmit.style.background = '#27ae60';
        
        setTimeout(() => {
            btnSubmit.innerHTML = originalText;
            btnSubmit.style.background = '';
        }, 1500);
    }

    // Limpar formulário
    limparFormulario() {
        this.form.reset();
        this.editandoId = null;
        
        // Restaurar data padrão
        const hoje = new Date().toISOString().split('T')[0];
        this.dataInput.value = hoje;
        
        // Restaurar botão
        const btnSubmit = this.form.querySelector('button[type="submit"]');
        btnSubmit.innerHTML = '<i class="fas fa-save"></i> Salvar Dívida';
        btnSubmit.style.background = '';
    }

    // Renderizar lista de dívidas
    renderizarLista() {
        const termoBusca = this.searchInput.value.toLowerCase();
        const filtroStatus = this.filterSelect.value;
        
        // Filtrar dívidas
        let dividasFiltradas = this.dividas.filter(divida => {
            const correspondeBusca = divida.nome.toLowerCase().includes(termoBusca);
            
            let correspondeStatus = true;
            if (filtroStatus === 'ativas') {
                correspondeStatus = !divida.quitada;
            } else if (filtroStatus === 'quitadas') {
                correspondeStatus = divida.quitada;
            }
            
            return correspondeBusca && correspondeStatus;
        });
        
        // Ordenar: não quitadas primeiro, depois por progresso
        dividasFiltradas.sort((a, b) => {
            if (a.quitada !== b.quitada) {
                return a.quitada ? 1 : -1;
            }
            return this.calcularProgresso(b) - this.calcularProgresso(a);
        });
        
        // Renderizar
        if (dividasFiltradas.length === 0) {
            this.listaDividas.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-invoice-dollar"></i>
                    <p>Nenhuma dívida encontrada.</p>
                    <p>Tente ajustar sua busca ou filtro.</p>
                </div>
            `;
            return;
        }
        
        this.listaDividas.innerHTML = dividasFiltradas.map(divida => this.criarCardDivida(divida)).join('');
        
        // Reconfigurar eventos nos botões
        this.reconfigurarEventos();
    }

    // Criar card de dívida
    criarCardDivida(divida) {
        const progresso = this.calcularProgresso(divida);
        const valorParcela = divida.valorTotal / divida.parcelasTotal;
        const valorPago = valorParcela * divida.parcelasPagas;
        
        const tipoText = {
            'consorcio': 'Consórcio',
            'emprestimo': 'Empréstimo',
            'financiamento': 'Financiamento',
            'outro': 'Outro'
        }[divida.tipo];
        
        const badgeClass = `badge-${divida.tipo}`;
        
        return `
            <div class="divida-item ${divida.quitada ? 'quitada' : ''}" data-id="${divida.id}">
                ${divida.quitada ? '<div class="quitada-overlay">QUITADA</div>' : ''}
                
                <div class="divida-header">
                    <div class="divida-title">
                        <i class="fas fa-file-invoice-dollar"></i>
                        ${divida.nome}
                        <span class="divida-badge ${badgeClass}">${tipoText}</span>
                    </div>
                    <div class="divida-actions">
                        <button class="btn btn-warning btn-small btn-editar" data-id="${divida.id}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-danger btn-small btn-excluir" data-id="${divida.id}">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
                
                <div class="divida-info">
                    <div class="info-item">
                        <span class="info-label">Valor Total</span>
                        <span class="info-value">${this.formatarMoeda(divida.valorTotal)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Valor da Parcela</span>
                        <span class="info-value">${this.formatarMoeda(valorParcela)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Parcelas</span>
                        <span class="info-value">${divida.parcelasPagas}/${divida.parcelasTotal}</span>
                    </div>
                </div>
                
                <div class="progress-container">
                    <div class="progress-info">
                        <span>Progresso do Pagamento</span>
                        <span><strong>${progresso}%</strong></span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progresso}%"></div>
                    </div>
                </div>
                
                <div class="parcela-controls">
                    <div class="parcela-status">
                        <strong>${progresso}%</strong> concluído • 
                        <strong>${this.formatarMoeda(valorPago)}</strong> pagos de ${this.formatarMoeda(divida.valorTotal)}
                    </div>
                    <div class="parcela-buttons">
                        ${!divida.quitada ? `
                            <button class="btn btn-success btn-small btn-pagar" data-id="${divida.id}">
                                <i class="fas fa-check"></i> Pagar Parcela
                            </button>
                            <button class="btn btn-primary btn-small btn-marcar-quitada" data-id="${divida.id}">
                                <i class="fas fa-flag-checkered"></i> Marcar como Quitada
                            </button>
                        ` : `
                            <button class="btn btn-secondary btn-small btn-reativar" data-id="${divida.id}">
                                <i class="fas fa-redo"></i> Reativar Dívida
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    // Reconfigurar eventos nos botões
    reconfigurarEventos() {
        // Botões de editar
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('button').dataset.id);
                this.abrirModalEdicao(id);
            });
        });
        
        // Botões de excluir
        document.querySelectorAll('.btn-excluir').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('button').dataset.id);
                this.excluirDivida(id);
            });
        });
        
        // Botões de pagar parcela
        document.querySelectorAll('.btn-pagar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('button').dataset.id);
                this.pagarParcela(id);
            });
        });
        
        // Botões de marcar como quitada
        document.querySelectorAll('.btn-marcar-quitada').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('button').dataset.id);
                this.marcarComoQuitada(id);
            });
        });
        
        // Botões de reativar
        document.querySelectorAll('.btn-reativar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('button').dataset.id);
                this.reativarDivida(id);
            });
        });
    }

    // Abrir modal de edição
    abrirModalEdicao(id) {
        const divida = this.dividas.find(d => d.id === id);
        if (!divida) return;
        
        this.editandoId = id;
        
        // Preencher formulário com dados da dívida
        this.nomeInput.value = divida.nome;
        this.valorInput.value = divida.valorTotal;
        this.parcelasInput.value = divida.parcelasTotal;
        this.tipoInput.value = divida.tipo;
        this.dataInput.value = divida.dataInicio;
        this.descricaoInput.value = divida.descricao || '';
        
        // Atualizar botão do formulário
        const btnSubmit = this.form.querySelector('button[type="submit"]');
        btnSubmit.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar Dívida';
        
        // Rolar até o formulário
        document.querySelector('.cadastro-card').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        // Dar foco no primeiro campo
        this.nomeInput.focus();
    }

    // Pagar uma parcela
    pagarParcela(id) {
        const divida = this.dividas.find(d => d.id === id);
        if (!divida || divida.quitada) return;
        
        if (divida.parcelasPagas < divida.parcelasTotal) {
            divida.parcelasPagas++;
            
            // Verificar se todas as parcelas foram pagas
            if (divida.parcelasPagas === divida.parcelasTotal) {
                divida.quitada = true;
            }
            
            this.salvarNoLocalStorage();
            this.renderizarLista();
            this.atualizarResumo();
            
            // Feedback visual
            this.mostrarNotificacao(`Parcela paga! Progresso: ${this.calcularProgresso(divida)}%`, 'success');
        }
    }

    // Marcar como quitada
    marcarComoQuitada(id) {
        const divida = this.dividas.find(d => d.id === id);
        if (!divida) return;
        
        if (confirm(`Deseja marcar a dívida "${divida.nome}" como quitada?`)) {
            divida.quitada = true;
            divida.parcelasPagas = divida.parcelasTotal;
            
            this.salvarNoLocalStorage();
            this.renderizarLista();
            this.atualizarResumo();
            
            this.mostrarNotificacao('Dívida marcada como quitada!', 'success');
        }
    }

    // Reativar dívida
    reativarDivida(id) {
        const divida = this.dividas.find(d => d.id === id);
        if (!divida) return;
        
        divida.quitada = false;
        
        this.salvarNoLocalStorage();
        this.renderizarLista();
        this.atualizarResumo();
        
        this.mostrarNotificacao('Dívida reativada!', 'info');
    }

    // Excluir dívida
    excluirDivida(id) {
        const divida = this.dividas.find(d => d.id === id);
        if (!divida) return;
        
        if (confirm(`Tem certeza que deseja excluir a dívida "${divida.nome}"?`)) {
            this.dividas = this.dividas.filter(d => d.id !== id);
            
            this.salvarNoLocalStorage();
            this.renderizarLista();
            this.atualizarResumo();
            
            this.mostrarNotificacao('Dívida excluída!', 'warning');
        }
    }

    // Atualizar resumo
    atualizarResumo() {
        const total = this.dividas.length;
        const quitadas = this.dividas.filter(d => d.quitada).length;
        
        // Calcular valor total
        const valorTotal = this.dividas.reduce((sum, d) => sum + d.valorTotal, 0);
        
        // Calcular progresso médio
        let progressoTotal = 0;
        this.dividas.forEach(d => {
            progressoTotal += this.calcularProgresso(d);
        });
        const progressoMedio = total > 0 ? Math.round(progressoTotal / total) : 0;
        
        // Atualizar elementos
        this.totalDividasEl.textContent = total;
        this.valorTotalDividasEl.textContent = this.formatarMoeda(valorTotal);
        this.dividasQuitadasEl.textContent = quitadas;
        this.progressoMedioEl.textContent = `${progressoMedio}%`;
    }

    // Salvar no LocalStorage
    salvarNoLocalStorage() {
        localStorage.setItem('dividas', JSON.stringify(this.dividas));
    }

    // Mostrar notificação
    mostrarNotificacao(mensagem, tipo = 'info') {
        // Remover notificações anteriores
        const notificacoesAntigas = document.querySelectorAll('.notificacao');
        notificacoesAntigas.forEach(n => n.remove());
        
        // Criar nova notificação
        const notificacao = document.createElement('div');
        notificacao.className = `notificacao notificacao-${tipo}`;
        notificacao.innerHTML = `
            <i class="fas fa-${tipo === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${mensagem}</span>
        `;
        
        // Estilos da notificação
        notificacao.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${tipo === 'success' ? '#27ae60' : tipo === 'warning' ? '#f39c12' : '#3498db'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 9999;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;
        
        // Animação
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notificacao);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notificacao.style.animation = 'slideOut 0.3s ease forwards';
            
            const styleOut = document.createElement('style');
            styleOut.textContent = `
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(styleOut);
            
            setTimeout(() => {
                notificacao.remove();
                style.remove();
                styleOut.remove();
            }, 300);
        }, 3000);
    }

    // Fechar modal
    fecharModal() {
        this.modal.style.display = 'none';
    }
}

// Inicializar o sistema quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.sistemaDividas = new SistemaDividas();
});

// Adicionar alguns dados de exemplo se estiver vazio (opcional)
function adicionarDadosExemplo() {
    if (localStorage.getItem('dividas') === null) {
        const exemploDividas = [
            {
                id: 1,
                nome: "Consórcio Toyota Corolla",
                valorTotal: 85000,
                parcelasTotal: 60,
                parcelasPagas: 15,
                tipo: "consorcio",
                dataInicio: "2023-01-15",
                descricao: "Consórcio para compra de carro novo",
                quitada: false,
                dataCriacao: "2023-01-15T10:00:00Z"
            },
            {
                id: 2,
                nome: "Empréstimo Pessoal Santander",
                valorTotal: 15000,
                parcelasTotal: 24,
                parcelasPagas: 24,
                tipo: "emprestimo",
                dataInicio: "2022-06-01",
                descricao: "Empréstimo para reforma do apartamento",
                quitada: true,
                dataCriacao: "2022-06-01T14:30:00Z"
            },
            {
                id: 3,
                nome: "Financiamento Imobiliário",
                valorTotal: 250000,
                parcelasTotal: 360,
                parcelasPagas: 48,
                tipo: "financiamento",
                dataInicio: "2020-03-10",
                descricao: "Financiamento do apartamento",
                quitada: false,
                dataCriacao: "2020-03-10T09:15:00Z"
            }
        ];
        
        localStorage.setItem('dividas', JSON.stringify(exemploDividas));
        location.reload();
    }
}

// Descomente a linha abaixo para carregar dados de exemplo na primeira execução
// adicionarDadosExemplo();