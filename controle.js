/* ====== Dados ====== */
let rendas = JSON.parse(localStorage.getItem('rendas')) || [];
let despesas = JSON.parse(localStorage.getItem('despesas')) || [];

/* ====== Elementos ====== */
const tabelaRendasBody = document.querySelector('#tabelaRendas tbody');
const tabelaDespesasBody = document.querySelector('#tabelaDespesas tbody');

const elDataRenda = document.getElementById('dataRenda');
const elNomeRenda = document.getElementById('nomeRenda');
const elValorRenda = document.getElementById('valorRenda');
const btnAddRenda = document.getElementById('btnAddRenda');

const elDataDesp = document.getElementById('dataDespesa');
const elDescDesp = document.getElementById('descDespesa');
const elValorDesp = document.getElementById('valorDespesa');
const btnAddDespesa = document.getElementById('btnAddDespesa');

const elTotalRendas = document.getElementById('totalRendas');
const elTotalDespesas = document.getElementById('totalDespesas');
const elSaldo = document.getElementById('saldo');
const avisoSaldo = document.getElementById('avisoSaldo');

/* ====== Render ====== */
function render() {

  // RENDAS
  tabelaRendasBody.innerHTML = '';
  let totalR = 0;
  rendas.forEach((r, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.data}</td>
      <td>${r.nome}</td>
      <td>${formatMoney(r.valor)}</td>
      <td class="actions">
        <button class="btn-edit" onclick="abrirEdicaoRenda(${idx})">✏ Editar</button>
        <button class="btn-delete" onclick="excluirRenda(${idx})">🗑 Excluir</button>
      </td>
    `;
    tabelaRendasBody.appendChild(tr);
    totalR += Number(r.valor);
  });

  // DESPESAS
  tabelaDespesasBody.innerHTML = '';
  let totalD = 0;
  despesas.forEach((d, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${d.data}</td>
      <td>${d.descricao}</td>
      <td>${formatMoney(d.valor)}</td>
      <td class="actions">
        <button class="btn-edit" onclick="abrirEdicaoDespesa(${idx})">✏ Editar</button>
        <button class="btn-delete" onclick="excluirDespesa(${idx})">🗑 Excluir</button>
      </td>
    `;
    tabelaDespesasBody.appendChild(tr);
    totalD += Number(d.valor);
  });

  const saldo = totalR - totalD;

  elTotalRendas.textContent = formatMoney(totalR);
  elTotalDespesas.textContent = formatMoney(totalD);
  elSaldo.textContent = formatMoney(saldo);

  /* ⭐ AVISO DE SALDO BAIXO */
  const limite = totalR * 0.20;
  if (saldo > 0 && saldo < limite) {
    avisoSaldo.style.display = "block";
    avisoSaldo.textContent = `⚠️ Atenção! Seu saldo está baixo: ${formatMoney(saldo)}`;
  } else if (saldo <= 0) {
    avisoSaldo.style.display = "block";
    avisoSaldo.textContent = `❌ Você está no negativo: ${formatMoney(saldo)}`;
  } else {
    avisoSaldo.style.display = "none";
  }

  salvar();
}

/* ====== Helpers ====== */
function formatMoney(v){ return 'R$ ' + (Number(v)||0).toFixed(2); }
function salvar(){
  localStorage.setItem('rendas', JSON.stringify(rendas));
  localStorage.setItem('despesas', JSON.stringify(despesas));
}

/* ====== Ações ====== */
btnAddRenda.onclick = () => {
  const data = elDataRenda.value;
  const nome = elNomeRenda.value.trim();
  const valor = parseFloat(elValorRenda.value);
  if(!data || !nome || isNaN(valor)) return alert('Preencha tudo corretamente!');
  rendas.push({data, nome, valor:Number(valor.toFixed(2))});
  elDataRenda.value = ''; elNomeRenda.value = ''; elValorRenda.value = '';
  render();
};

btnAddDespesa.onclick = () => {
  const data = elDataDesp.value;
  const descricao = elDescDesp.value.trim();
  const valor = parseFloat(elValorDesp.value);
  if(!data || !descricao || isNaN(valor)) return alert('Preencha tudo corretamente!');
  despesas.push({data, descricao, valor:Number(valor.toFixed(2))});
  elDataDesp.value = ''; elDescDesp.value = ''; elValorDesp.value = '';
  render();
};

function excluirRenda(i){ if(confirm('Excluir?')){ rendas.splice(i,1); render(); } }
function excluirDespesa(i){ if(confirm('Excluir?')){ despesas.splice(i,1); render(); } }

function abrirEdicaoRenda(i){
  const r = rendas[i];
  const d = prompt("Data:", r.data);
  if(d===null) return;
  const n = prompt("Nome:", r.nome);
  if(n===null) return;
  const v = parseFloat(prompt("Valor:", r.valor));
  if(isNaN(v)) return alert("Valor inválido");
  rendas[i] = {data:d, nome:n, valor:Number(v.toFixed(2))};
  render();
}

function abrirEdicaoDespesa(i){
  const d = despesas[i];
  const da = prompt("Data:", d.data);
  if(da===null) return;
  const desc = prompt("Descrição:", d.descricao);
  if(desc===null) return;
  const v = parseFloat(prompt("Valor:", d.valor));
  if(isNaN(v)) return alert("Valor inválido");
  despesas[i] = {data:da, descricao:desc, valor:Number(v.toFixed(2))};
  render();
}

/* ===== Inicial ===== */
render();