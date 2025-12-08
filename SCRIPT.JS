// Selecionar botões
const btnAddRenda = document.getElementById("btnAddRenda");
const btnAddDespesa = document.getElementById("btnAddDespesa");

// Selecionar tabelas
const tabelaRendas = document.querySelector("#tabelaRendas tbody");
const tabelaDespesas = document.querySelector("#tabelaDespesas tbody");

// Totais
const totalRendas = document.getElementById("totalRendas");
const totalDespesas = document.getElementById("totalDespesas");
const elSaldo = document.getElementById("saldo");

// Carregar dados do localStorage
let rendas = JSON.parse(localStorage.getItem("rendas")) || [];
let despesas = JSON.parse(localStorage.getItem("despesas")) || [];

// SALVAR
function salvar() {
    localStorage.setItem("rendas", JSON.stringify(rendas));
    localStorage.setItem("despesas", JSON.stringify(despesas));
}

// CALCULAR SALDO
function calcularSaldo() {
    const totalR = rendas.reduce((s, r) => s + r.valor, 0);
    const totalD = despesas.reduce((s, d) => s + d.valor, 0);
    return totalR - totalD;
}

// ADICIONAR RENDA
btnAddRenda.addEventListener("click", () => {
    const data = document.getElementById("dataRenda").value;
    const nome = document.getElementById("nomeRenda").value;
    const valor = parseFloat(document.getElementById("valorRenda").value);

    if (!data || !nome || isNaN(valor)) {
        alert("Preencha todos os campos da renda!");
        return;
    }

    rendas.push({ data, nome, valor });
    salvar();
    render();
});

// ADICIONAR DESPESA
btnAddDespesa.addEventListener("click", () => {
    const data = document.getElementById("dataDespesa").value;
    const desc = document.getElementById("descDespesa").value;
    const valor = parseFloat(document.getElementById("valorDespesa").value);

    if (!data || !desc || isNaN(valor)) {
        alert("Preencha todos os campos da despesa!");
        return;
    }

    const saldoAtual = calcularSaldo();

    // AVISO SOMENTE AO ADICIONAR
    if (valor > saldoAtual) {
        alert("⚠ Essa despesa é maior que o saldo disponível!");
        return; // NÃO salva se for maior
    }

    if (saldoAtual - valor < 50) {
        alert("⚠ Alerta! Seu saldo ficará abaixo de R$ 50,00!");
    }

    despesas.push({ data, desc, valor });
    salvar();
    render();
});

// REMOVER RENDA
function removerRenda(i) {
    rendas.splice(i, 1);
    salvar();
    render();
}

// REMOVER DESPESA
function removerDespesa(i) {
    despesas.splice(i, 1);
    salvar();
    render();
}

// EDITAR RENDA
function editarRenda(i) {
    const item = rendas[i];

    const novaData = prompt("Editar data:", item.data);
    const novoNome = prompt("Editar nome:", item.nome);
    const novoValor = parseFloat(prompt("Editar valor (R$):", item.valor));

    if (!novaData || !novoNome || isNaN(novoValor)) {
        alert("Valores inválidos!");
        return;
    }

    rendas[i] = { data: novaData, nome: novoNome, valor: novoValor };
    salvar();
    render();
}

// EDITAR DESPESA
function editarDespesa(i) {
    const item = despesas[i];

    const novaData = prompt("Editar data:", item.data);
    const novaDesc = prompt("Editar descrição:", item.desc);
    const novoValor = parseFloat(prompt("Editar valor (R$):", item.valor));

    if (!novaData || !novaDesc || isNaN(novoValor)) {
        alert("Valores inválidos!");
        return;
    }

    const saldoAtual = calcularSaldo();
    const saldoSemEstaDespesa = saldoAtual + item.valor;

    if (novoValor > saldoSemEstaDespesa) {
        alert("⚠ Novo valor é maior que o saldo disponível!");
        return;
    }

    despesas[i] = { data: novaData, desc: novaDesc, valor: novoValor };
    salvar();
    render();
}

// ATUALIZAR TELA
function render() {
    tabelaRendas.innerHTML = "";
    tabelaDespesas.innerHTML = "";

    let totalR = 0;
    let totalD = 0;

    rendas.forEach((item, index) => {
        totalR += item.valor;

        tabelaRendas.innerHTML += `
            <tr>
                <td>${item.data}</td>
                <td>${item.nome}</td>
                <td>R$ ${item.valor.toFixed(2)}</td>
                <td>
                    <button onclick="editarRenda(${index})">✏ Editar</button>
                    <button onclick="removerRenda(${index})">🗑 Excluir</button>
                </td>
            </tr>
        `;
    });

    despesas.forEach((item, index) => {
        totalD += item.valor;

        tabelaDespesas.innerHTML += `
            <tr>
                <td>${item.data}</td>
                <td>${item.desc}</td>
                <td>R$ ${item.valor.toFixed(2)}</td>
                <td>
                    <button onclick="editarDespesa(${index})">✏ Editar</button>
                    <button onclick="removerDespesa(${index})">🗑 Excluir</button>
                </td>
            </tr>
        `;
    });

    totalRendas.textContent = "R$ " + totalR.toFixed(2);
    totalDespesas.textContent = "R$ " + totalD.toFixed(2);
    elSaldo.textContent = "R$ " + (totalR - totalD).toFixed(2);
}

// Inicializar
render();
