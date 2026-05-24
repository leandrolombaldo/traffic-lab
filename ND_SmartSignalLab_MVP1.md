# ND — SmartSignal Lab

## MVP 1: Cruzamento Simulado com Visual

## 1. Objetivo do MVP 1

Criar a primeira versão funcional do **SmartSignal Lab**, simulando **um cruzamento simples** com semáforo, veículos e métricas visuais.

O MVP 1 terá foco em:

```txt
simular um cruzamento
visualizar carros andando no SUMO GUI
comparar semáforo fixo vs controle por regra
coletar métricas básicas
exibir resultados em dashboard web
gerar base para evoluir para IA depois
```

Neste MVP **não entra IA ainda**. Primeiro vamos criar a fundação do produto.

---

## 2. Resultado esperado

Ao final do MVP 1, teremos:

```txt
1 cruzamento rodando no SUMO
visualização gráfica da simulação
2 estratégias de controle semafórico
métricas salvas em CSV/JSON
dashboard web com comparativo
relatório simples da melhor estratégia
```

O usuário poderá rodar:

```bash
python apps/simulator/main.py --strategy fixed --gui
```

ou:

```bash
python apps/simulator/main.py --strategy rule_based --gui
```

E depois visualizar os resultados no dashboard:

```bash
cd apps/web
npm run dev
```

---

## 3. Escopo fechado do MVP 1

### Inclui

```txt
cruzamento simples
semáforo de 2 fases
fluxo de veículos simulado
modo visual com SUMO GUI
modo terminal/headless
controle fixo
controle por regra simples
coleta de métricas
exportação de CSV/JSON
dashboard Next.js básico
comparativo entre execuções
```

### Não inclui neste MVP

```txt
IA / reinforcement learning
avenida de 10 km
múltiplos cruzamentos
dados reais de câmera
controle de semáforo real
dashboard em tempo real
login/autenticação
Supabase
relatórios PDF
```

---

## 4. Cenário simulado

O MVP terá **um cruzamento de 4 aproximações**:

```txt
Norte
Sul
Leste
Oeste
```

Com duas fases semafóricas:

```txt
Fase 1: Norte-Sul verde
Fase 2: Leste-Oeste verde
```

Visual simples:

```txt
          Norte
            │
            │
Oeste ──────┼────── Leste
            │
            │
           Sul
```

### Fluxo inicial de veículos

Para começar, o fluxo será artificial:

```txt
Norte-Sul: fluxo médio
Leste-Oeste: fluxo médio/baixo
```

Depois poderemos criar cenários:

```txt
fluxo leve
fluxo médio
fluxo pesado
pico em uma direção
```

Mas no MVP 1, o foco será só um cenário principal.

---

## 5. Parte visual do MVP

O MVP terá **duas visualizações**.

---

## 5.1 Visual 1 — SUMO GUI

A primeira visualização será a própria interface gráfica do SUMO.

Nela veremos:

```txt
veículos se movimentando
filas se formando
semáforos trocando de fase
cruzamento funcionando
impacto de cada estratégia
```

Comando esperado:

```bash
python apps/simulator/main.py --strategy fixed --gui
```

ou:

```bash
python apps/simulator/main.py --strategy rule_based --gui
```

Quando usar `--gui`, o sistema abre o `sumo-gui`.

Quando não usar, roda em modo terminal:

```bash
python apps/simulator/main.py --strategy fixed
```

---

## 5.2 Visual 2 — Dashboard Web

O dashboard será feito em **Next.js**.

Ele mostrará os resultados das simulações já executadas.

Primeira versão da tela:

```txt
┌────────────────────────────────────────────────────┐
│ SmartSignal Lab — MVP 1                            │
├────────────────────────────────────────────────────┤
│ Estratégia selecionada: Semáforo Fixo              │
│ Status: Simulação finalizada                       │
├────────────────────────────────────────────────────┤
│ Espera média       Fila média       Veículos       │
│ 58.4s              21.3             1200           │
├────────────────────────────────────────────────────┤
│ Fila ao longo do tempo                             │
│ [ gráfico de linha ]                               │
├────────────────────────────────────────────────────┤
│ Comparativo                                        │
│ Semáforo Fixo: 58.4s espera média                  │
│ Regra Simples: 42.1s espera média                  │
├────────────────────────────────────────────────────┤
│ Resultado                                          │
│ A estratégia por regra reduziu a espera em 27.9%   │
└────────────────────────────────────────────────────┘
```

---

## 6. Estratégias do MVP 1

## 6.1 Estratégia 1 — Semáforo fixo

O semáforo troca de fase em tempos fixos.

Exemplo:

```txt
Norte-Sul verde: 45 segundos
Amarelo: 3 segundos
Leste-Oeste verde: 30 segundos
Amarelo: 3 segundos
```

Objetivo:

```txt
servir como baseline
representar uma programação semafórica simples
comparar com controle adaptativo
```

---

## 6.2 Estratégia 2 — Controle por regra

O semáforo decide com base no tamanho das filas.

Regra inicial:

```txt
se fila Norte-Sul > fila Leste-Oeste:
    prioriza Norte-Sul
senão:
    prioriza Leste-Oeste
```

Com limites de segurança:

```txt
tempo mínimo de verde
tempo máximo de verde
tempo de amarelo
não trocar rápido demais
```

Exemplo:

```txt
verde mínimo: 20 segundos
verde máximo: 60 segundos
amarelo: 3 segundos
```

Objetivo:

```txt
mostrar que uma regra simples já pode melhorar o fluxo
criar base para comparação futura com IA
```

---

## 7. Métricas do MVP 1

O sistema coletará:

```txt
tempo médio de espera
fila média
fila máxima
veículos processados
tempo médio de viagem
número médio de paradas
duração total da simulação
```

### Métrica principal do MVP

A métrica principal será:

```txt
tempo médio de espera
```

Porque é fácil de explicar e ótima para comparação.

Exemplo:

```txt
Semáforo fixo: 58.4s
Controle por regra: 42.1s
Melhoria: 27.9%
```

---

## 8. Fluxo de execução

### 8.1 Rodar simulação visual

```bash
python apps/simulator/main.py --strategy fixed --gui
```

Fluxo:

```txt
carrega cenário SUMO
abre SUMO GUI
executa semáforo fixo
coleta métricas
salva resultados
```

---

### 8.2 Rodar simulação sem visual

```bash
python apps/simulator/main.py --strategy fixed
```

Fluxo:

```txt
carrega cenário SUMO
executa em modo rápido
coleta métricas
salva resultados
```

---

### 8.3 Rodar controle por regra

```bash
python apps/simulator/main.py --strategy rule_based --gui
```

Fluxo:

```txt
carrega cenário SUMO
abre SUMO GUI
controlador lê filas
decide fase do semáforo
coleta métricas
salva resultados
```

---

### 8.4 Abrir dashboard

```bash
cd apps/web
npm run dev
```

O dashboard lê os arquivos gerados em:

```txt
data/runs/
```

E mostra os comparativos.

---

## 9. Estrutura do projeto

```txt
smart-signal-lab/
  apps/
    simulator/
      main.py
      config.py

      controllers/
        fixed_time.py
        rule_based.py

      metrics/
        collector.py
        exporter.py

      scenarios/
        simple_intersection/
          intersection.net.xml
          routes.rou.xml
          simulation.sumocfg

    web/
      app/
        page.tsx
        simulations/
          page.tsx

      components/
        MetricCard.tsx
        ComparisonChart.tsx
        QueueChart.tsx
        StrategyBadge.tsx

      lib/
        simulations.ts

  data/
    runs/
      fixed_run_001.json
      rule_based_run_001.json

  README.md
```

---

## 10. Formato de saída da simulação

Cada execução salvará um JSON.

Exemplo:

```json
{
  "runId": "fixed_run_001",
  "strategy": "fixed",
  "scenario": "simple_intersection",
  "durationSeconds": 3600,
  "vehiclesProcessed": 1200,
  "averageWaitingTime": 58.4,
  "averageQueueLength": 21.3,
  "maxQueueLength": 48,
  "averageTravelTime": 184.7,
  "averageStops": 3.2,
  "createdAt": "2026-05-24T15:30:00"
}
```

Também poderá salvar séries temporais:

```json
{
  "time": 120,
  "northSouthQueue": 18,
  "eastWestQueue": 9,
  "currentPhase": "NS_GREEN",
  "averageWaitingTime": 41.2
}
```

---

## 11. Dashboard MVP 1

### Página principal

Rota:

```txt
/
```

Conteúdo:

```txt
nome do projeto
última simulação executada
cards de métricas
comparativo entre estratégias
gráfico de filas
conclusão automática
```

### Componentes

```txt
MetricCard
ComparisonChart
QueueChart
StrategyBadge
SimulationSummary
```

### Cards iniciais

```txt
Tempo médio de espera
Fila média
Fila máxima
Veículos processados
Tempo médio de viagem
Paradas médias por veículo
```

---

## 12. Layout visual do dashboard

```txt
┌─────────────────────────────────────────────────────────┐
│ SmartSignal Lab                                         │
│ MVP 1 — Cruzamento Simulado                             │
├─────────────────────────────────────────────────────────┤
│ [Semáforo Fixo] [Controle por Regra]                    │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│ │ Espera média│ │ Fila média  │ │ Veículos    │         │
│ │ 58.4s       │ │ 21.3        │ │ 1200        │         │
│ └─────────────┘ └─────────────┘ └─────────────┘         │
├─────────────────────────────────────────────────────────┤
│ Gráfico: fila por tempo                                 │
│ ─────────────────────────────────────────────────────── │
├─────────────────────────────────────────────────────────┤
│ Comparativo de estratégias                              │
│ Fixo        ███████████████████ 58.4s                  │
│ Regra       █████████████ 42.1s                        │
├─────────────────────────────────────────────────────────┤
│ Insight                                                  │
│ O controle por regra reduziu a espera média em 27.9%.   │
└─────────────────────────────────────────────────────────┘
```

---

## 13. Critérios de sucesso

O MVP 1 será considerado concluído quando:

```txt
SUMO rodar um cruzamento simples
modo GUI funcionar
modo terminal funcionar
semáforo fixo funcionar
controle por regra funcionar
métricas forem salvas
dashboard exibir os resultados
comparativo entre estratégias aparecer
README explicar como rodar
```

---

## 14. O que será demonstrável

Ao apresentar o MVP, será possível mostrar:

```txt
simulação visual no SUMO GUI
carros formando filas
semáforos alternando
controle fixo vs controle por regra
dashboard com métricas
comparativo percentual de melhoria
```

Essa será a primeira versão com cara de produto.

---

## 15. Roadmap restrito do MVP 1

### Etapa 1 — Setup

```txt
instalar SUMO
criar projeto Python
validar execução do sumo-gui
```

### Etapa 2 — Cenário

```txt
criar cruzamento simples
criar rotas de veículos
configurar simulação
```

### Etapa 3 — Controlador fixo

```txt
implementar tempos fixos
rodar simulação
salvar métricas
```

### Etapa 4 — Controlador por regra

```txt
ler filas por aproximação
decidir fase
respeitar verde mínimo e máximo
salvar métricas
```

### Etapa 5 — Exportação

```txt
salvar JSON resumo
salvar série temporal
salvar CSV opcional
```

### Etapa 6 — Dashboard

```txt
criar app Next.js
ler arquivos de resultado
exibir cards
exibir gráficos
mostrar comparação
```

### Etapa 7 — README

```txt
explicar instalação
comandos
estratégias
métricas
como ver o visual
```

---

## 16. Próximo passo

O primeiro passo técnico será criar o repositório com esta estrutura mínima:

```txt
smart-signal-lab/
  apps/
    simulator/
      main.py
      controllers/
      metrics/
      scenarios/
    web/
  data/
    runs/
```

Depois rodar o primeiro objetivo:

```txt
abrir o SUMO GUI com um cruzamento simples e veículos passando
```

Esse será o marco inicial do **SmartSignal Lab MVP 1**.
