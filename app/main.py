"""Painel de status de servidores de Minecraft.

Backend em FastAPI: serve a interface e expõe uma rota que consulta o status
de qualquer servidor de Minecraft Java a partir do endereço informado.
"""

from pathlib import Path

from fastapi import FastAPI, Query
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.mc import consultar_servidor

app = FastAPI(title="Minecraft Server Status")

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"


@app.get("/api/status")
async def status(host: str = Query(..., description="Endereço do servidor, ex: mc.hypixel.net")):
    """Consulta o status de um servidor e devolve os dados em JSON.

    Se o servidor estiver offline ou inacessível, responde 200 com
    online=false — o front-end trata isso como um estado normal, não erro.
    """
    endereco = host.strip()
    if not endereco:
        return JSONResponse(
            {"online": False, "erro": "Informe o endereço do servidor."},
            status_code=400,
        )

    try:
        dados = await consultar_servidor(endereco)
        return dados
    except Exception:
        # Timeout, DNS inválido, conexão recusada, etc. — tudo vira "offline".
        return {
            "online": False,
            "host": endereco,
            "erro": "Servidor offline ou inacessível.",
        }


@app.get("/")
async def index():
    """Serve a página principal do painel."""
    return FileResponse(STATIC_DIR / "index.html")


# Arquivos estáticos (css, js, imagens) ficam sob /static.
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
