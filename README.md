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

Inspecionar o projeto demo:

```bash
python apps/simulator/inspect_project.py
```

Gerar um manifesto inicial de cenário:

```bash
python apps/simulator/build_scenario_manifest.py --scenario baseline
python apps/simulator/build_scenario_manifest.py --scenario green-wave-40
python apps/simulator/build_scenario_manifest.py --scenario no-left-turn
```

Os manifestos são salvos em:

```txt
data/scenario-manifests/
```

Gerar uma pasta de cenário SUMO a partir de um manifesto:

```bash
python apps/simulator/generate_sumo_scenario.py --manifest data/scenario-manifests/demo-corridor__baseline.json
```

Depois execute o cenário gerado:

```bash
python apps/simulator/main.py --scenario demo-corridor__baseline --strategy fixed --duration 600 --seed 42 --gui
```

## Gerar cenário a partir de mapa OpenStreetMap local

Ainda não há seleção de mapa pelo navegador. O primeiro suporte a mapa funciona a partir de um arquivo `.osm` ou `.osm.xml` salvo localmente.

Exemplo:

```bash
python apps/simulator/generate_osm_scenario.py --osm-file data/osm/minha-area.osm.xml --scenario-id minha-area-demo --vehicles 300 --duration 600 --force
```

Depois execute:

```bash
python apps/simulator/main.py --scenario minha-area-demo --strategy fixed --duration 600 --seed 42 --gui
```

Observação: cenários importados de OSM ainda não têm `laneGroups` configurado para o controlador `rule_based`, então comece com `--strategy fixed`.

## Baixar mapa por bounding box

Também é possível baixar uma área do OpenStreetMap informando coordenadas.

Exemplo:

```bash
python apps/simulator/download_osm_bbox.py \
  --name minha-area \
  --south -23.5650 \
  --west -46.6600 \
  --north -23.5550 \
  --east -46.6450
```

Isso salva:

```txt
data/osm/minha-area.osm.xml
data/osm/minha-area.bbox.json
```

Depois gere o cenário SUMO:

```bash
python apps/simulator/generate_osm_scenario.py --osm-file data/osm/minha-area.osm.xml --scenario-id minha-area --vehicles 300 --duration 600 --force
```

E execute:

```bash
python apps/simulator/main.py --scenario minha-area --strategy fixed --duration 600 --seed 42 --gui
```
