# SmartSignal Lab — Simulador

## Pré-requisitos
- SUMO instalado (incluindo `sumo`, `sumo-gui`, `netconvert`)
- Variável `SUMO_HOME` configurada ou binários no `PATH`
- Python 3.10+

## Instalação (opcional)
```bash
pip install -r apps/simulator/requirements.txt
```

## Rodar uma simulação
Headless (mais rápido):
```bash
python apps/simulator/main.py --strategy fixed --duration 600 --seed 42
python apps/simulator/main.py --strategy rule_based --duration 600 --seed 42
```

Com GUI:
```bash
python apps/simulator/main.py --strategy rule_based --gui
```

Os resultados são salvos em `data/runs/` e o caminho do JSON gerado é impresso no final da execução.
