# Gateway de Pagamento - API Gateway (Nest.js)

Este é o microsserviço de Anti-Fraude desenvolvido em ***Nest.js***.

## Sobre o Projeto

O Gateway de Pagamento é um sistema distribuído composto por:
- [Frontend em Next.js](https://github.com/patrick-cuppi/Gateway-Payment-Next.js)
- [API Gateway em Go com Apache Kafka para comunicação assíncrona](https://github.com/patrick-cuppi/Gateway-Payment-Golang)
- Sistema de Antifraude em Nest.js (este repositório)

### Componentes do Sistema

- **Frontend (Next.js)**
  - Interface do usuário para gerenciamento de contas e processamento de pagamentos
  - Desenvolvido com Next.js para garantir performance e boa experiência do usuário

- **Gateway (Go)**
  - Sistema principal de processamento de pagamentos
  - Gerencia contas, transações e coordena o fluxo de pagamentos
  - Publica eventos de transação no Kafka para análise de fraude

- **Apache Kafka**
  - Responsável pela comunicação assíncrona entre API Gateway e Antifraude
  - Garante confiabilidade na troca de mensagens entre os serviços
  - Tópicos específicos para transações e resultados de análise

- **Antifraude (Nest.js)**
  - Consome eventos de transação do Kafka
  - Realiza análise em tempo real para identificar possíveis fraudes
  - Publica resultados da análise de volta no Kafka

## Fluxo de Comunicação

1. Frontend realiza requisições para a API Gateway via REST
2. Gateway processa as requisições e publica eventos de transação no Kafka
3. Serviço Antifraude consome os eventos e realiza análise em tempo real
4. Resultados das análises são publicados de volta no Kafka
5. Gateway consome os resultados e finaliza o processamento da transação

## Ordem de Execução dos Serviços

Para executar o projeto completo, os serviços devem ser iniciados na seguinte ordem:

1. **API Gateway (Go)** - Deve ser executado primeiro pois configura a rede Docker
2. **Serviço Antifraude (Nest.js)** - Depende do Kafka configurado pelo Gateway
3. **Frontend (Next.js)** - Interface de usuário que se comunica com a API Gateway

## Instruções Detalhadas

Cada componente do sistema possui instruções específicas de instalação e configuração em seus repectivos repositórios:

- **API Gateway em Go**: Consulte o README na pasta do projeto [(clique aqui)](https://github.com/patrick-cuppi/Gateway-Payment-Golang).
- **Frontend**: Consulte o README na pasta do projeto [(clique aqui)](https://github.com/patrick-cuppi/Gateway-Payment-Next.js).

## Arquitetura da aplicação
[Visualize a arquitetura completa aqui](https://link.excalidraw.com/readonly/Nrz6WjyTrn7IY8ZkrZHy)

## Pré-requisitos

- [Docker](https://www.docker.com/get-started)
  - Para Windows: [WSL2](https://docs.docker.com/desktop/windows/wsl/) é necessário
- [Extensão REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) (opcional, para testes via api.http)

## Importante!

⚠️ **É necessário executar primeiro o serviço Gateway-Payment-Golang** antes deste projeto, pois este serviço utiliza a rede Docker criada pela API em Go.

## Setup do Projeto

1. Clone o repositório:
```bash
git clone https://github.com/patrick-cuppi/Gateway-Payment-Nest.js
```

2. Verifique se o serviço Gateway-Payment-Golang já está em execução

3. Inicie os serviços com Docker Compose:
```bash
docker compose up -d
```

4. Execute as migrations do Prisma dentro do container:
```bash
docker compose exec nestjs bash
npx prisma migrate dev
```

## Executando a aplicação

Você pode rodar a aplicação em dois modos diferentes dentro do container:

### 1. API REST + Consumidor Kafka (padrão)
```bash
docker compose exec nestjs bash
npm run start:dev
```

### 2. Apenas o Consumidor Kafka
```bash
docker compose exec nestjs bash
npm run start:dev -- --entryFile cmd/kafka.cmd
```

## Estrutura do Projeto

O projeto usa:
- NestJS como framework
- Prisma ORM para acesso ao banco de dados PostgreSQL
- Integração com Apache Kafka para processamento assíncrono
- TypeScript para tipagem estática

## Comunicação via Kafka

O serviço de Anti-Fraude se comunica com o API Gateway via Apache Kafka:

### Consumo de eventos
- **Tópico**: `pending_transactions`
- **Formato**: JSON com os dados completos da transação

### Produção de eventos
- **Tópico**: `transactions_result`
- **Formato**: JSON com o resultado da análise e score de risco

## Regras de Análise

O sistema aplica regras para detectar possíveis fraudes, como:

1. **Valor da transação**:
   - Transações acima de determinados limites recebem pontuação de risco mais alta

2. **Frequência de transações**:
   - Muitas transações em curto período aumentam o risco

3. **Comportamento do cartão**:
   - Uso de múltiplos cartões com padrões suspeitos

## API Endpoints

O projeto inclui um arquivo `api.http` que pode ser usado com a extensão REST Client do VS Code para testar os endpoints da API:

1. Instale a extensão REST Client no VS Code
2. Abra o arquivo `api.http`
3. Clique em "Send Request" acima de cada requisição

Os endpoints disponíveis estão documentados neste arquivo para fácil teste e referência.

## Acesso ao Banco de Dados

O PostgreSQL do serviço de Anti-Fraude está configurado para evitar conflitos com o banco do Gateway-Payment-Golang.

Para acessar o Prisma Studio (interface visual do banco de dados):

```bash
docker compose exec nestjs bash
npx prisma studio
```

## Logs e Monitoramento

Para visualizar os logs do serviço:

```bash
# Logs do serviço NestJS
docker logs -f nestjs-anti-fraud-nestjs-1
```

## Desenvolvimento

Para desenvolvimento, você pode executar comandos dentro do container:

```bash
# Acessar o shell do container
docker compose exec nestjs bash

# Exemplo de comandos disponíveis dentro do container
npm run start:dev  # Iniciar em modo de desenvolvimento
npm run start:dev -- --entryFile cmd/kafka.cmd  # Iniciar apenas o consumidor Kafka
npx prisma studio  # Interface visual do banco de dados
npx prisma migrate dev  # Executar migrations
```