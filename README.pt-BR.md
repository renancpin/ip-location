# API de Localização por IP

[![en](https://img.shields.io/badge/lang-en-red.svg)](/README.md)
[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](/README.pt-BR.md)

Um desafio para desenvolvedores Backend projetado para avaliar habilidades de otimização e conhecimento das tecnologias-alvo, como Node.js e TypeScript.

## O Desafio

Implemente uma API REST usando TypeScript, que resolva um endereço IP para uma localização no mundo, consultando um dataset.

### Critérios de Avaliação

- **Corretude**: A API deve se comportar conforme a especificação.
- **Arquitetura**: Clareza e organização do código.
- **Qualidade do Código**: Legibilidade, modularidade, manutenibilidade.
- **Desempenho**: Manter tempos de resposta abaixo de `100ms`.
- **Mínimas Dependências**: Evite bibliotecas externas e abstrações de alto nível, exceto para operações REST e dependências de desenvolvimento.
- **Concorrência**: Atenda mais de `100` usuários simultâneos.
- **Testabilidade**: Use qualquer biblioteca de testes desejada (como [Jest](https://jestjs.io)) para implementar testes automatizados.

&nbsp;

## O Dataset

Fornecido como um arquivo CSV ([iplocation-dataset.csv](https://github.com/renancpin/ip-location/raw/refs/heads/main/iplocation-dataset.csv?download=)), contém **2.979.950 linhas** (`330Mb`)  
Cada linha descreve um intervalo de IPs e sua respectiva localização.

- O arquivo é separado por **vírgulas** (`,`) e os campos estão entre **aspas duplas** (`" "`).
- O arquivo **não** possui nomes de colunas na primeira linha.
- Os intervalos de IPs são dados em **representações numéricas de IPs**.
- Cada linha tem a seguinte estrutura:

| Coluna | Descrição                                                  |
| ------ | ---------------------------------------------------------- |
| 1      | ID do IP inferior (inclusivo)                              |
| 2      | ID do IP superior (inclusivo)                              |
| 3      | Código do país                                             |
| 4      | Nome do país                                               |
| 5      | Estado/Região                                              |
| 6      | Cidade                                                     |
| 7–10   | Ignorar (latitude, longitude, código postal, fuso horário) |

## Especificação da API

### **`GET /ip/location`**

**Parâmetros de Query**:

- `ip` (string): O endereço IPv4 a ser consultado.

**Comportamento**:

- Converta o IP para seu respectivo ID numérico usando a função [`ipToId`](./src/utils/ip-calculator.ts).
- Procure uma linha onde:

  ```sql
  lower_ip_id <= ip_id <= upper_ip_id
  ```

- Se nenhum resultado for encontrado, retorne:

  ```http
  Status: 404 Not Found
  ```

  Se encontrado, retorne:

  ```http
  Status: 200 OK

  {
     "country": "Nome do País",
     "countryCode": "Código do País",
     "region": "Estado/Região",
     "city": "Cidade"
  }
  ```

&nbsp;

# A Implementação

Para completar este desafio, foram utilizados frameworks como **Koa**, **Inversify** e **Jest**, levando em conta os critérios de avaliação.

A implementação resultante visa alto desempenho, qualidade de código, facilidade de compreensão e baixo uso de memória.

Abaixo estão as instruções para configurar e executar a aplicação, rodar os testes e as decisões por trás do design, escolhas de biblioteca, considerações de performance, entre outros.

&nbsp;

# Configuração do Projeto

## 1. Clonar o Projeto com [**Git**](https://git-scm.com/)

Se ainda não tiver o **git**, [baixe **aqui**](https://git-scm.com/downloads) e siga as instruções para seu Sistema Operacional.

Depois, execute:

```bash
git clone https://github.com/renancpin/ip-location.git
```

## [Opcional] 2. Definir Variáveis de Ambiente

Este projeto usa [**dotenv**](https://www.dotenv.org/docs/) para ler variáveis automaticamente.

Crie um arquivo `.env` na raiz do projeto e defina as variáveis conforme necessário.

> **Dica**: Copie o conteúdo do arquivo [`.env.example`](.env.example) como modelo:

```env
# Porta da aplicação
PORT=3000

# Banco de Dados
DB_CONNECTION=database/ips.db

# Caminho do conjunto de dados
DATASET_FILE_PATH=iplocation-dataset.csv
```

&nbsp;

# Instalação e Execução

## Opção 1: Usando [**Docker**](https://docker.com)

A forma mais fácil.

Todas as dependências, incluindo o Node.js, serão instaladas no container, e o dataset será carregado automaticamente.

Baixe e instale o **Docker** em sua [página oficial](https://www.docker.com/products/docker-desktop/)

Siga as instruções do [item 2.3 abaixo](#23-carregar-o-dataset) para baixar o conjunto de dados, coloque-o na raiz do projeto

Então, crie e rode um contêiner ao executar:

```bash
docker compose up --build
```

Para parar o container:

```bash
docker compose down
```

## Opção 2: Localmente com Node.js

Para rodar diretamente na sua máquina.

### 2.1. Versão do Node.js

Este projeto requer **Node.js v22.16.0** ou superior.

> **Dica**: use um gerenciador de versões, como o [nvm](https://github.com/nvm-sh/nvm), para ter múltiplas versões na mesma máquina

### 2.2. Instalar Dependências

Use o gerenciador de pacotes de sua preferência (`npm`, `yarn`, `pnpm`):

```bash
yarn install
```

### 2.3. Carregar o Conjunto de Dados

O conjunto de dados original está disponível. [Baixe-o **aqui**](https://github.com/renancpin/ip-location/raw/refs/heads/main/iplocation-dataset.csv?download=1), salve com a extensão `.csv` e coloque-o na raiz do projeto

Use o [**script**](`/scripts/load-dataset.script.ts`) fornecido para carregar os dados do CSV para uma instância SQLite:

```bash
yarn dataset:load
```

### 2.4. Rodar a API

Há três formas principais de executar a aplicação:

1. Apenas rodar (necessário **TypeScript**):

   ```bash
   yarn start
   ```

2. Modo de **produção**:

   ```bash
   yarn build

   yarn start:prod
   ```

3. Modo de **desenvolvimento** (com hot-reload):

   ```bash
   yarn start:dev
   ```

&nbsp;

# Usando a API

Com a API rodando, faça um GET para `/ip/location`, passando o endereço ipv4 como parâmetro de query `ip`:

```bash
curl "http://localhost:3000/ip/location?ip=1.1.1.1"
```

&nbsp;

# Testes

Há exemplos de testes [Unitários](/tests/ip-calculator.test.ts), de [Integração](/tests/server.test.ts) e de [Performance](/tests/test.js).

Testes **Unitários** e de **Integração** com [Jest](https://jestjs.io/docs/getting-started):

```bash
yarn test
```

Testes de **Performance** foram projetados com [K6](https://grafana.com/docs/k6/latest/set-up/install-k6/).
Siga as instruções de instalação, depois execute:

```bash
yarn test:performance
```

# Deciões de Desenvolvimento

Uma visão aprofundada sobre as decisões de design e arquitetura está disponível [aqui](/development-decisions.pt-BR.md). Sinta-se à vontade para mergulhar.

&nbsp;

---

# Licença

Este projeto está licenciado sob os termos da [GNU GPL v3](/LICENSE) (em inglês), de 29 de junho de 2007.

# Contato

Deseja contribuir, dar feedback ou entrar em contato?

- [GitHub](https://github.com/renancpin): @**renancpin**
- [LinkedIn](https://linkedin.com/in/renan-c-pinheiro)
- [Email](mailto:renan.coelho.p@gmail.com)
