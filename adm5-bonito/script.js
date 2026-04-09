let rodada = 1;
let etapa = 1;

const etapas = ["Investimento", "Compra", "Venda", "Fechamento"];

let caixa = 100000;
let capacidade = 10;

let freezer = false;
let embalagem = false;

let transporte = null;
let transporteEscolhido = false;
let vendeuNaRodada = false;

let perdaMsg = "";

let produtos = {
    arroz: 0, enlatados: 0, massas: 0, laticinios: 0, congelados: 0,
    frutas: 0, verduras: 0, higiene: 0, limpeza: 0
};

const nomes = {
    arroz: "🌾 Arroz", enlatados: "🥫 Enlatados", massas: "🍝 Massas",
    laticinios: "🥛 Laticínios", congelados: "🍦 Congelados",
    frutas: "🍎 Frutas", verduras: "🥬 Verduras",
    higiene: "🧴 Higiene", limpeza: "🧼 Limpeza"
};

const custoProduto = {
    arroz: 2000, enlatados: 2500, massas: 2200,
    laticinios: 2500, congelados: 3000,
    frutas: 1500, verduras: 1200,
    higiene: 4000, limpeza: 3500
};

const vendaBase = {
    arroz: 3200, enlatados: 3800, massas: 3500,
    laticinios: 4500, congelados: 5500,
    frutas: 3000, verduras: 2800,
    higiene: 6500, limpeza: 5500
};

let preco = {};
let demanda = {};

const riscoRodada = {
    2: { eco: 0.5, premium: 0.2, aereo: 0 },
    4: { eco: 0.4, premium: 0.2, aereo: 0.1 }
};

const custoTransporte = { eco: 3000, premium: 5000, aereo: 8000 };

function moeda(v) { return "R$ " + Math.floor(v).toLocaleString("pt-BR"); }

// MERCADO
function carregarMercado() {
    preco = { ...vendaBase };
    if (rodada === 1) {
        demanda = { arroz: 10, enlatados: 5, massas: 5, laticinios: 10, congelados: 5, frutas: 10, verduras: 5, higiene: 5, limpeza: 5 };
    }
    if (rodada === 2) {
        demanda = { arroz: 5, enlatados: 5, massas: 5, laticinios: 10, congelados: 5, frutas: 15, verduras: 10, higiene: 5, limpeza: 5 };
        preco.frutas *= 1.1; preco.verduras *= 1.1; preco.laticinios *= 1.1;
    }
    if (rodada === 3) {
        demanda = { arroz: 5, enlatados: 10, massas: 5, laticinios: 5, congelados: 10, frutas: 5, verduras: 5, higiene: 20, limpeza: 5 };
        preco.higiene = 7500;
    }
    if (rodada === 4) {
        demanda = { arroz: 20, enlatados: 5, massas: 5, laticinios: 15, congelados: 15, frutas: 5, verduras: 5, higiene: 10, limpeza: 0 };
        preco.arroz = 3500; preco.laticinios = 5500; preco.congelados = 6500;
    }
}

// UI
function atualizar() {
    document.getElementById("rodada").innerText = rodada;
    document.getElementById("etapa").innerText = etapas[etapa - 1];
    document.getElementById("caixa").innerText = moeda(caixa);

    let ocupado = Object.values(produtos).reduce((a, b) => a + b, 0);
    document.getElementById("ocupado").innerText = ocupado;
    document.getElementById("capacidade").innerText = capacidade;

    document.getElementById("freezer").innerText = freezer ? "SIM" : "NÃO";
    document.getElementById("embalagem").innerText = embalagem ? "SIM" : "NÃO";

    renderEtapa();
}

// RENDER
function renderEtapa() {
    let html = `<div class="card">`;

    if (etapa === 1) {
        html += `<h3>🏗️ Investimentos</h3>
      <div class="btn-card"><button onclick="investir('prateleira')">📦 Prateleira<br><small>R$ 5.000 → +10 capacidade</small></button></div>
      <div class="btn-card"><button onclick="investir('galpao')">🏭 Galpão<br><small>R$ 12.500 → +30 capacidade</small></button></div>
      <div class="btn-card"><button onclick="investir('freezer')">❄️ Freezer<br><small>R$ 10.000 → Necessário para congelados</small></button></div>
      <div class="btn-card"><button onclick="investir('embalagem')">📦 Embalagem<br><small>R$ 5.000 → Protege itens frágeis</small></button></div>`;
    }

    if (etapa === 2) {
        html += `<h3>🛒 Compra de Produtos</h3>`;
        for (let p in produtos) {
            html += `<div class="compra-card"><span>${nomes[p]} (${moeda(custoProduto[p])})</span>
        <input id="c_${p}" type="number" min="0" placeholder="Qtd"></div>`;
        }
        html += `<button onclick="comprarTudo()">Comprar Tudo</button>`;
    }

    if (etapa === 3) {
        html += `<h3>💰 Venda & Transporte</h3>`;
        let totalEstoque = Object.values(produtos).reduce((a, b) => a + b, 0);
        html += `<p>📦 Estoque: ${totalEstoque}/${capacidade}</p>`;
        for (let p in produtos) {
            html += `<div class="venda-card"><span>${nomes[p]}: ${produtos[p]} | Demanda: ${demanda[p]}</span>
        <input id="v_${p}" type="number" placeholder="Qtd"></div>`;
        }
        html += `<button onclick="vender()">Vender Produtos</button>`;
        html += `<h4>🚚 Escolha o Transporte</h4>
      <div class="transporte-group">
        <button class="transporte-btn" onclick="setTransporte('eco')">🟢 Econômico (${moeda(3000)})</button>
        <button class="transporte-btn" onclick="setTransporte('premium')">🟡 Padrão (${moeda(5000)})</button>
        <button class="transporte-btn" onclick="setTransporte('aereo')">🔵 Aéreo (${moeda(8000)})</button>
      </div>`;
    }

    if (etapa === 4) {
        html += `<h3>📊 Fechamento</h3>`;
        if (perdaMsg) { html += `<p class="alerta">${perdaMsg}</p>`; }
        else { html += `<p>✅ Sem perdas nesta rodada</p>`; }
    }

    html += `</div>`;
    document.getElementById("conteudo").innerHTML = html;

    document.querySelectorAll(".transporte-btn").forEach(btn => {
        if (transporte && btn.textContent.toLowerCase().includes(transporte)) btn.classList.add("selected");
    });
}

// COMPRA
function comprarTudo() {
    let totalCusto = 0;
    let compras = {};
    for (let p in produtos) {
        let q = parseInt(document.getElementById("c_" + p).value) || 0;
        if ((p === "congelados" || p === "laticinios") && !freezer && q > 0) return alert("Precisa de freezer");
        compras[p] = q;
        totalCusto += q * custoProduto[p];
    }
    let ocupado = Object.values(produtos).reduce((a, b) => a + b, 0);
    let totalQtd = Object.values(compras).reduce((a, b) => a + b, 0);
    if (ocupado + totalQtd > capacidade) return alert("Sem espaço");
    if (totalCusto > caixa) return alert("Sem dinheiro");
    for (let p in compras) { produtos[p] += compras[p]; }
    caixa -= totalCusto;
    atualizar();
}

// VENDA
function vender() {
    vendeuNaRodada = false;
    for (let p in produtos) {
        let q = parseInt(document.getElementById("v_" + p).value) || 0;
        let venda = Math.min(q, produtos[p], demanda[p]);
        if (venda > 0) vendeuNaRodada = true;
        produtos[p] -= venda;
        demanda[p] -= venda;
        caixa += venda * preco[p];
    }

    // Aplicar evento logístico imediatamente após venda (Rodada 2 e 4)
    if (rodada === 2 || rodada === 4) aplicarEventoTransporte();

    atualizar();
}

// TRANSPORTE
function setTransporte(t) {
    if (transporteEscolhido) { alert("Transporte já escolhido!"); return; }
    if (caixa < custoTransporte[t]) return alert("Sem dinheiro");
    transporte = t;
    transporteEscolhido = true;
    caixa -= custoTransporte[t];
    atualizar();
}

// EVENTO DE TRANSPORTE (rodadas 2 e 4)
function aplicarEventoTransporte() {
    let risco = riscoRodada[rodada]; // risco da rodada
    let tipo = transporte || "eco";   // transporte escolhido
    let qtd = 0, valor = 0;

    for (let p in produtos) {
        let perda = Math.floor(produtos[p] * risco[tipo]);
        if (perda > produtos[p]) perda = produtos[p];
        produtos[p] -= perda;
        qtd += perda;
        valor += perda * preco[p];
    }

    perdaMsg = `⚠️ Perdas logísticas: ${qtd} unidades (${moeda(valor)})`;
}

// EVENTOS (rodada 3 produtos frágeis)
function aplicarEventosFrageis() {
    if (rodada === 3 && !embalagem) {
        let qtd = 0, valor = 0;
        ["higiene", "limpeza"].forEach(p => {
            let perda = Math.floor(produtos[p] * 0.3);
            produtos[p] -= perda;
            qtd += perda;
            valor += perda * preco[p];
        });
        perdaMsg = `⚠️ Produtos danificados (sem embalagem): ${qtd} unidades (${moeda(valor)})`;
    }
}

// INVESTIMENTO
function investir(tipo) {
    if (tipo === "freezer") { if (freezer) return alert("Já possui freezer"); if (caixa >= 10000) { caixa -= 10000; freezer = true; } }
    if (tipo === "embalagem") { if (embalagem) return alert("Já possui embalagem"); if (caixa >= 5000) { caixa -= 5000; embalagem = true; } }
    if (tipo === "prateleira" && caixa >= 5000) { caixa -= 5000; capacidade += 10; }
    if (tipo === "galpao" && caixa >= 12500) { caixa -= 12500; capacidade += 30; }
    atualizar();
}

// AVANÇAR
function avancar() {

    // transporte obrigatório após venda
    if (etapa === 3 && vendeuNaRodada && !transporteEscolhido) {
        return alert("Escolha um transporte antes de avançar!");
    }

    if (etapa < 4) {
        etapa++;
    } else {

        // Rodada 3 → aplicar evento produtos frágeis
        if (rodada === 3) aplicarEventosFrageis();

        // reset correto
        transporte = null;
        transporteEscolhido = false;
        vendeuNaRodada = false;

        if (rodada === 4) {
            liquidarFinal();
            return;
        }

        rodada++;
        etapa = 1;
        carregarMercado();
    }

    atualizar();
}

// FINAL
function liquidarFinal() {
    let total = 0;
    for (let p in produtos) { total += produtos[p] * preco[p] * 0.8; produtos[p] = 0; }
    caixa += total;
    alert("🏁 Fim do jogo! Estoque liquidado.");
    atualizar();
}

// INIT
carregarMercado();
atualizar();