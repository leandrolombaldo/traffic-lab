# Scenario Builder — Fundação

O **Scenario Builder** é a próxima camada do Traffic Lab / SmartSignal Lab.

Enquanto o MVP 1 simula um cruzamento fixo, o Scenario Builder prepara o projeto para trabalhar com **projetos urbanos**, **cenários alternativos** e **intervenções parametrizadas**.

## Objetivo

Permitir que o sistema evolua de:

```txt
um cruzamento simples
```

para:

```txt
uma região real ou avenida importada do mapa
  ↓
cenários alternativos
  ↓
intervenções urbanas parametrizadas
  ↓
simulações comparativas
  ↓
ranking da melhor alternativa
```

## Conceitos principais

### Project

Representa uma área de estudo.

Exemplos:

```txt
Av. Brasil — trecho central
Centro — corredor norte-sul
Bairro X — zona escolar
```

Um projeto pode ter vários cenários.

### Scenario

Representa uma versão simulável do projeto.

Exemplos:

```txt
Cenário atual
Onda verde a 40 km/h
Sem conversão à esquerda
Faixa exclusiva de ônibus
Rua lateral em mão única
```

### Intervention

Representa uma mudança aplicada em uma rede viária.

Tipos iniciais:

```txt
change_speed_limit
change_lane_count
change_direction
restrict_turn
signal_timing
bus_lane
close_edge
```

## Fluxo esperado

```txt
1. Criar projeto
2. Importar ou gerar rede SUMO
3. Criar cenário base
4. Adicionar intervenções
5. Gerar cenário SUMO modificado
6. Rodar simulação
7. Comparar métricas
8. Gerar recomendação
```

## Relação com o MVP 1

O MVP 1 continua sendo o motor base:

```txt
simular → medir → salvar run → visualizar dashboard
```

O Scenario Builder entra antes da simulação:

```txt
mapa/projeto → cenário → intervenções → rede SUMO → simulação
```

## Escopo desta fundação

Nesta primeira etapa, o objetivo é apenas criar os modelos e contratos iniciais.

Inclui:

```txt
ProjectSpec
ScenarioSpec
InterventionSpec
InterventionType
helpers para salvar/carregar JSON
```

Não inclui ainda:

```txt
importação real do OpenStreetMap
edição visual no mapa
aplicação física das intervenções na rede SUMO
otimização automática
IA
```

## Próximo passo técnico

Criar um gerador que receba um `ScenarioSpec` e produza uma pasta de cenário compatível com o simulador atual.

Exemplo futuro:

```bash
python apps/simulator/scripts/build_scenario.py \
  --project data/projects/avenida-demo/project.json \
  --scenario baseline
```

Saída futura esperada:

```txt
apps/simulator/simulator/scenarios/avenida-demo-baseline/
  scenario.json
  scenario.sumocfg
  network.net.xml
  routes.rou.xml
```
