const form = document.getElementById("form-busca");
const input = document.getElementById("input-host");
const botao = form.querySelector(".botao");
const resultado = document.getElementById("resultado");

form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const host = input.value.trim();
    if (!host) return;

    botao.disabled = true;
    botao.textContent = "...";
    mostrarCarregando(host);

    try {
        const resposta = await fetch(`/api/status?host=${encodeURIComponent(host)}`);
        const dados = await resposta.json();
        renderizar(dados);
    } catch (erro) {
        renderizar({ online: false, host, erro: "Falha ao consultar. Tente de novo." });
    } finally {
        botao.disabled = false;
        botao.textContent = "Consultar";
    }
});

function mostrarCarregando(host) {
    resultado.hidden = false;
    resultado.innerHTML = `<p class="mensagem-offline" style="color: var(--texto-fraco)">Consultando ${escapar(host)}...</p>`;
}

function renderizar(dados) {
    resultado.hidden = false;

    if (!dados.online) {
        resultado.innerHTML = `
            <div class="card-topo">
                <div class="card-info">
                    <div class="card-host">${escapar(dados.host || "")}</div>
                    <div class="status-linha"><span class="bolinha off"></span> Offline</div>
                </div>
            </div>
            <p class="mensagem-offline">${escapar(dados.erro || "Servidor offline ou inacessível.")}</p>
        `;
        return;
    }

    const icone = dados.icone
        ? `<img class="icone-servidor" src="${dados.icone}" alt="Ícone do servidor">`
        : `<div class="icone-servidor"></div>`;

    const players = (dados.amostra_jogadores || [])
        .map((nome) => `<span class="player-tag">${escapar(nome)}</span>`)
        .join("");

    const blocoPlayers = players
        ? `<div class="bloco">
               <div class="bloco-rotulo">Jogadores online</div>
               <div class="players">${players}</div>
           </div>`
        : "";

    resultado.innerHTML = `
        <div class="card-topo">
            ${icone}
            <div class="card-info">
                <div class="card-host">${escapar(dados.host)}</div>
                <div class="status-linha"><span class="bolinha on"></span> Online</div>
            </div>
        </div>

        <div class="grid">
            <div class="stat">
                <div class="stat-rotulo">Jogadores</div>
                <div class="stat-valor">${dados.jogadores_online} / ${dados.jogadores_max}</div>
            </div>
            <div class="stat">
                <div class="stat-rotulo">Ping</div>
                <div class="stat-valor">${dados.ping_ms} ms</div>
            </div>
            <div class="stat">
                <div class="stat-rotulo">Versão</div>
                <div class="stat-valor" style="font-size: 20px">${escapar(dados.versao)}</div>
            </div>
            <div class="stat">
                <div class="stat-rotulo">Capacidade</div>
                <div class="stat-valor">${Math.round((dados.jogadores_online / dados.jogadores_max) * 100) || 0}%</div>
            </div>
        </div>

        <div class="bloco">
            <div class="bloco-rotulo">MOTD</div>
            <div class="motd">${dados.motd_html || escapar(dados.motd || "")}</div>
        </div>

        ${blocoPlayers}
    `;
}

// Evita injeção de HTML ao inserir texto vindo do servidor consultado.
function escapar(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}
