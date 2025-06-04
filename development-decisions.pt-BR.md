# Decisões de Desenvolvimento

[![Voltar ao README](https://img.shields.io/badge/Voltar_ao-README-green.svg)](/README.pt-BR.md)

Ao desenvolver esta aplicação, vários aspectos influenciaram decisões importantes de design e arquitetura. Os pontos apresentados abaixo expõem alguns desses aspectos e o pensamento por trás de cada decisão

## 1. Gerenciar dados usando **Banco de dados**

A primeira decisão estratégica foi carregar os dados inicialmente em CSV, para um banco de dados

Ler diretamente de um arquivo pode ser lento e difícil de otimizar. Um banco de dados é uma ferramenta mais apropriada, que:

- Permite **busca e filtragem** eficientes
- Melhora o **uso de espaço**, tanto em disco como em memória
- Permite [**indexação**](#51-indexação) para acelerar as buscas

## 2. [**SQLite**](https://sqlite.org/index.html) como Banco de Dados escolhido

SQLite foi escolhido pelas seguintes razões:

1. **Simplicidade e Portabilidade**

   SQLite não requer um processo separado. Como uma aplicação embarcada, é autocontido e requer o mínimo de configuração inicial e manutenção

2. **Desempenho**

   Por não depender de uma conexão de rede, o SQLite fornece operações de leitura mais rápidas e com menor latência em geral

3. **Suporte a Leituras Simultâneas**

   Apesar de apresentar limitações quanto a operações de escrita simultâneas, o SQLite permite livremente múltiplas operações de leitura, sendo adequado para projetos como este

## 3. [**Koa**](https://koajs.com/) como framework de API

Koa foi selecionado como framework por razões bem similares ao banco de dados:

1. **Experiência do Desenvolvedor (DX)**
   - Familiaridade e forte suporte da comunidade
   - Melhor tratamento de erros
   - Fácil de customizar e estender

2. **Performance**
   - Leve e com mínimo desperdício
   - Construído sobre as capacidades assíncronas do Node.js
   - Excelente desempenho de requisições

## 4. Inversão de Dependência (DI) com [**Inversify**](https://inversify.io/docs/introduction/getting-started/)

Como o framework de API não reforça uma arquitetura específica, o **Inversify** surge como uma biblioteca de inversão de dependência, que oferece melhor organização de código ao garantir:

1. **Desacoplamento**:

   Inversify permite ligar serviços a _tokens_ e interfaces, reforçando encapsulamento e reduzindo interdependência entre implementações. Assim, reduz erros e facilita a manutenção

2. **Injeção de Dependências**

   Fornece _Decorators_ que permitem marcar classes e parâmetros como injetáveis, fazendo com que o contêiner cuide de instanciar e guardar dependências, reduzindo código repetitivo

## 5. Considerações de Performance

Um dos critérios de avaliação desejados foi o de realizar requisições em `100ms` ou menos, e ser capaz de lidar com mais de `100` usuários simultâneos

Para cumprir este critério, diversas otimizações foram realizadas para melhorar o desempenho

### 5.1. **Indexação**

Durante os testes, ficou imediatamente claro que o ponto crítico de desempenho era a consulta de dados

Mesmo utilizando SQLite, o tempo médio de consultas passaria de **2 seconds**, especialmente ao não encontrar resultados.  
O motivo é que, por padrão, o motor do banco de dados realiza um **full scan** - que seria, ler cada linha de dados da tabela `ip` - por assumir que os dados não têm ordem

Para solucionar este ponto, foi de extrema importância implementar um índice

> 📓 Um **`Índice de Banco de Dados`** é parecido com uma lista de contatos:
>
> Guarda informações como telefone e endereço de alguém, de acordo com alguma ordem (por exemplo, ordem alfabética de nome)
>
> Assim, quando você quer ligar para o Sr. Souza, ao invés de ler cada nome da lista, basta pular pra página do "S". Bem mais rápido!

Nossa consulta **SELECT** básica é:

```sql
SELECT * FROM ip
WHERE ?ip_id BETWEEN lower_ip_id AND upper_ip_id
LIMIT 1;
```

Nosso índice será:

```sql
CREATE INDEX ip_range ON ip (
  upper_ip_id,
  lower_ip_id
)
```

> 📓 1. Um **`Índice`** deve incluir as colunas na cláusula **WHERE** das consultas mais frequentemente usadas

> 📓 2. Um **`Índice de Cobertura`** é um índice que inclui **todas** as colunas da cláusula **WHERE** de uma dada consulta

---

### 5.2. **Instancias de Serviços**

O caminho usual de uma requisição é:

1. Requisição é recebida no **router**.
2. O **caso de uso** é chamado com os parâmetros da requisição, e converte o ip para um ipId.
3. A consulta no **repositório** é chamada com o ipId.
4. O resultado pode ser tratado e processado em cada etapa até ser retornado ao usuário.

Por padrão, serviços no **Inversify** têm **Escopo de Requisição**, o que significa que cada vez que um serviço (um `caso de uso`, ou um `repositório`) é chamado com `container.get(NomeDoServico)`, uma nova instância é criada

No caso do repositório, uma nova conexão ao banco de dados é criada em cada instância. Dessa forma, há um certo desperdício de processamento e memória em cada requisição

Para reduzir esse desperdício, os serviços foram então configurados com **Escopo Singleton** na vinculação. Com isso, somente um repositório será criado, portanto uma única conexão ao banco será compartilhada em todas as requisições, reduzindo a latência inicial

### 5.3. **Declarações Preparadas em Cache**

**Declarações Preparadas** (_Prepared Statements_) são uma grande ferramenta de bancos de dados relacionais: validam as declarações escritas em SQL para reforçar a segurança e ajudar a evitar ataques de injeção, e melhoram o desempenho ao criar uma declaração reutilizável, para consultas usadas com frequência, em que apenas os valores dos parâmetros mudam

A maioria dos **ORMs** e _query builders_ têm a habilidade de armazenar declarações em cache. Apesar de um ORM não estar sendo utilizado, essa funcionalidade faz sentido para este caso

Uma implementação simplificada foi incluída: constantes armazenam o texto original das consultas parametrizadas, e um objeto simples é usado como cachê dentro do repositório

Cada vez que uma requisição é feita, o método invocado checa se a declaração preparada existe no cachê. Se existir, esta declaração é retornada. Se não, uma nova declaração é preparada e armazenada em cachê, e depois retornada

Ao usar declarações armazenadas, a latência pôde ser reduzida em alguns milissegundos extras

---

# Resultados

Com todas as otimizações propostas, os testes de performance mostram tempo médio de requisição abaixo de 10ms, com picos de até **`700 microssegundos`**! Um desempenho que satisfaz totalmente tanto critérios obrigatórios quanto desejados.

> Obs: os testes foram feitos em uma máquina local com 16gb RAM e SSD
> Resultados podem variar de acordo com o setup utilizado

# Conclusão

Este projeto é uma amostra não só de habilidades técnicas, mas também atenção aos detalhes, paciência, e desejo contínuo de aprender e melhorar.

Quaisquer dúvidas ou feedback, não hesite em enviar uma mensagem. Informações de contato estão disponíveis na página principal.

[Voltar ao principal](/README.pt-BR.md)
