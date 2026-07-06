"""Consulta o status de um servidor de Minecraft.

Usa o protocolo "Server List Ping" (o mesmo que o launcher do jogo usa para
mostrar o status na lista de servidores), através da biblioteca mcstatus.
"""

from mcstatus import JavaServer


async def consultar_servidor(endereco: str) -> dict:
    """Consulta um servidor e devolve os dados de status em um dicionário limpo.

    O endereço pode vir com ou sem a porta, ex: "mc.hypixel.net" ou
    "meuserver.com:25566". Quando a porta é omitida, o padrão 25565 é usado.

    Levanta uma exceção quando o servidor está offline ou inacessível — quem
    chama decide como tratar (ver app/main.py).
    """
    servidor = await JavaServer.async_lookup(endereco)
    status = await servidor.async_status()

    return {
        "online": True,
        "host": endereco,
        "jogadores_online": status.players.online,
        "jogadores_max": status.players.max,
        "versao": status.version.name,
        # MOTD em duas formas: texto puro e HTML (com as cores do Minecraft).
        "motd": status.motd.to_plain(),
        "motd_html": status.motd.to_html(),
        # Latência de ida e volta em milissegundos, arredondada.
        "ping_ms": round(status.latency),
        # Ícone do servidor: já vem como data URI (data:image/png;base64,...).
        "icone": status.icon,
        # Amostra de jogadores online (nem todo servidor expõe).
        "amostra_jogadores": [
            jogador.name for jogador in (status.players.sample or [])
        ],
    }
