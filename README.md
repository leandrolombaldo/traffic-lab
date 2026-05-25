# SmartSignal Lab (MVP 1)

Projeto local para simular um cruzamento simples no SUMO e comparar estratégias de controle semafórico (fixo vs rule-based), com resultados salvos em JSON e visualizados em um dashboard web.

## Estrutura
- `apps/simulator`: simulador/controle em Python + cenário SUMO
- `apps/web`: dashboard (Next.js)
- `data/runs`: saídas (runs) em JSON
- `data/projects`: projetos urbanos e cenários parametrizados para a próxima fase

## Rodar o simulador
Pré-requisitos:
- SUMO instalado (incluindo `sumo`, `sumo-gui`, `netconvert`)
- `SUMO_HOME` configurado ou binários no `PATH`
- Python 3.10+

Execuções típicas:
```bash
python apps/simulator/main.py --strategy fixed --duration 600 --seed 42
python apps/simulator/main.py --strategy rule_based --duration 600 --seed 42
```

Para abrir a visualização do SUMO GUI:
```bash
python apps/simulator/main.py --strategy fixed --duration 600 --seed 42 --gui
python apps/simulator/main.py --strategy rule_based --duration 600 --seed 42 --gui
```

## Rodar o dashboard
```bash
cd apps/web
npm install
npm run dev
```

Acesse:
- Dashboard: `http://localhost:3000/`
- Lista de runs: `http://localhost:3000/runs`

O dashboard lê os arquivos em `data/runs/`. O repositório já inclui dois runs de exemplo para validar a UI.

## Próxima fase: Scenario Builder

O MVP 1 continua sendo o motor base de simulação e comparação.

A próxima camada do projeto é o **Scenario Builder**, responsável por preparar projetos urbanos, cenários alternativos e intervenções parametrizadas antes da execução no SUMO.

Documentação inicial:

```txt
docs/scenario-builder.md
```

Projeto demo:

```txt
data/projects/demo-corridor/project.json
```
