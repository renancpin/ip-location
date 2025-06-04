# IP Location API

A Backend Developer Challenge designed to evaluate optimization skills and knowledge of target technologies like Node.js and TypeScript

## The Challenge

Implement a REST API using TypeScript that resolves a given IP address to a world location by looking it up in a dataset.

### Evaluation Criteria:

- **Correctness**: The API must behave according to the spec.
- **Architecture**: Clarity and organization of code.
- **Code Quality**: Readability, modularity, maintainability.
- **Performance**: Keep response times below `100ms`.
- **Minimal Dependencies**: Avoid external libraries and high-level abstractions, except for REST operations and dev dependencies.
- **Concurrency**: Respond to more than `100` concurrent users.
- **Testability**: Use any desired test library (like [Jest](https://jestjs.io)) to implement automated tests.

---

## The Dataset

Provided as a CSV file ([iplocation-dataset.csv](https://github.com/renancpin/ip-location/raw/refs/heads/main/iplocation-dataset.csv?download=)), it has **2,979,950 rows** (`330Mb`)  
Each row describes an IP range and its corresponding location

- The file is **comma-separated** (`,`) and fields are encased in **double quotes** (`" "`).
- The file **does not** include column names on the first row.
- The IP ranges are given using **numeric representations of IPs**.
- Each row is structured as:

| Column | Description                                                       |
| ------ | ----------------------------------------------------------------- |
| 1      | Lower IP ID (inclusive)                                           |
| 2      | Upper IP ID (inclusive)                                           |
| 3      | Country Code                                                      |
| 4      | Country Name                                                      |
| 5      | State/Region                                                      |
| 6      | City                                                              |
| 7–10   | You may ignore these (latitude, longitude, postal code, timezone) |

## API Specification

### **`GET /ip/location`**

**Query Parameters**:

- `ip` (string): The IPv4 address to look up.

**Behavior**:

- Convert the IP to its corresponding IP ID using the [`ipToId`](./src/utils/ip-calculator.ts) function.
- Search for a row where:
  ```sql
  lower_ip_id <= ip_id <= upper_ip_id
  ```
- If no match is found, return:

  ```http
  Status: 404 Not Found
  ```

- If a match is found, return:

  ```http
  Status: 200 OK

  {
     "country": "Country Name",
     "countryCode": "Country Code",
     "region": "State/Region",
     "city": "City"
  }
  ```

---

# The Implementation

To complete this challenge, some popular frameworks like **Koa**, **Inversify** and **Jest** were leveraged considering each evaluation criteria.

The resulting implementation has aimed for stunning performance, code quality, correctness and lower space usage.

Below are instructions to setup, execute and run tests, as well as the thoughts behind many important Design decisions, library choices, performance considerations and more.

## Setup And Run

### With [**Docker**](https://docker.com)

Download and install **Docker** from their [official webpage](https://www.docker.com/products/docker-desktop/)

Follow instructions [below](#2-loading-dataset) to download the dataset and put it at the project's root folder

Then, build and spin up a container by running:

```bash
docker compose up --build
```

If you wish to spin down the container, run:

```bash
docker compose down
```

### 1. Installing Dependencies

You're free to use your preferred package manager (`npm`, `yarn`, `pnpm`):

```bash
yarn install
```

### 2. Loading Dataset

The original dataset is available. [Download it **here**](https://github.com/renancpin/ip-location/raw/refs/heads/main/iplocation-dataset.csv?download=1), then put it on the root project folder.

An utility [**script**](`/scripts/load-dataset.script.ts`) (available at `/scripts/load-dataset.script.ts`) is able to load the entire csv dataset into an sqlite instance.

To execute it, run:

```bash
yarn dataset:load
```

### 3. [OPTIONAL] Set Environment Variables

This project uses [**dotenv**](https://www.dotenv.org/docs/) to automatically parse environment variables

Just create a `.env` text file at the project's root folder, and set variables as needed

> **Hint**: Copy contents from the [`.env.example`](.env.example) file, provided as a model:

```env
# Application running port
PORT=3000

# Database
DB_CONNECTION=database/ips.db

# Dataset path
DATASET_FILE_PATH=iplocation-dataset.csv
```

## Using the API

While the API is running, make a GET request to `/ip/location`, passing an ipv4 address as the `ip` query parameter:

```bash
curl "http://localhost:3000/ip/location?ip=1.1.1.1"
```

## Testing

For convenience, examples of [Unit](/tests/ip-calculator.test.ts), [Integration](/tests/server.test.ts) and [Performance](/test.js) tests are available. Test running scripts are as follows:

**Unit** and **Integration** tests are available with [Jest](https://jestjs.io/docs/getting-started):

```bash
yarn test
```

**Performance** tests are available with [K6](https://grafana.com/docs/k6/latest/set-up/install-k6/).
Follow the installation instructions on its page, then run:

```bash
yarn test:performance
```

---

# Architectural Decisions

While developing this application, many aspects have influenced important design and architectural decisions. The points presented below expose some of those aspects and the though behind each decision

### 1. Data Management Strategy: **CSV to Database**

The first strategical decision was to load data from the initially provided CSV file into a database

Reading directly from a file is slow and difficult to optimize. A database is a better tool that:

- Enables efficient **querying and filtering** of data
- Improves **space usage**, both on disk and in memory
- Allows for [**indexing**](#5-indexing) for faster data retrieval

### 2. [**SQLite**](https://sqlite.org/index.html) as the Database Choice

SQLite was chosen as the database solution for the following reasons:

1. **Simplicity and Portability**

   SQLite requires no separate server process. As an embedded application, it's self-contained and requires minimal initial setup and maintenance overhead

2. **Performance**

   Since it does not rely on network connectivity, SQLite provides faster read operations and lower latency overall

3. **Concurrent Read Support**

   Although SQLite might present limitations on concurrent writes and locks, it allows for multiple concurrent reads, being suitable for read-heavy applications - like this one

### 3. [**Koa**](https://koajs.com/) as the Web Framework

Koa was selected as the web framework for reasons very similar to the database choice:

1. **Developer Experience**
   - Familiarity and strong community support
   - Better error handling with async/await
   - Easy to extend and customize

2. **Performance**
   - Lightweight and minimal overhead
   - Built on top of Node.js's async/await capabilities
   - Excellent request handling performance

### 4. Dependency Inversion with [**Inversify**](https://inversify.io/docs/introduction/getting-started/)

As the web framework is not very opinionated on software architecture itself, **Inversify** steps in as a Dependency Inversion solution that greatly improves code organization, by assuring:

1. **Decoupling**:

   Inversify is able to bind services to tokens and interfaces, which reinforces encapsulation and implementation independence. By following those principles, developers can improves code organization and maintainability, as well as reducing errors

2. **Dependency Injection**

   It provides class and parameter Decorators to allow marking classes as injectable instances, as well as automatically referencing other classes as arguments to the constructor, reducing boilerplate code

### 5. Performance Considerations

One of the desired points of evaluation criteria was to perform requests in 100ms or less, and to be able to handle more than 100 concurrent users

In order to meet that criteria, several optimizations were made to improve performance

#### 5.1. **Indexing**

When testing, it was immediately clear that the critical point of performance was querying data

Even when using SQLite, the average search could take well over `2s`, especially on misses (`Not found`).  
The reason was that, by default, the database engine performs a **full scan** - that is, checking every row on table `ip` - because it assumes data is unordered

To solve this pain point, creating a proper index was of utmost importance

> 📓 A **`Database Index`** acts much like a **contact book**:
>
> It stores information (like phone number and address), following a given order (like alphabetically, by family name)
>
> That way, when you need to call Mr. Smith, instead of randomly reading every contact, you just skip to the page that contains names with "S". Much faster!

---

Our basic **SELECT** query has the following form:

```sql
SELECT * FROM ip
WHERE ?ip_id BETWEEN lower_ip_id AND upper_ip_id
LIMIT 1;
```

Our index will be the following:

```sql
CREATE INDEX "ip_range" ON "ip" (
  "upper_ip_id",
  "lower_ip_id"
)
```

> 📓 1. An **`Index`** should cover the columns on the **WHERE** clause of the most frequently used queries
>
> Filtering operations include **equality** (**`=`**) and **bigger than** (**`>`**)/**smaller than** (**`<`**) comparisons

> 📓 2. A **`Covering Index`**
>
> Is an index that includes **all** the columns on the **WHERE** clause of a given query

#### 5.2. **Service Instantiation**

Another consideration was raised about performance:

- By design, **Inversify** only instantiates bound services the moment they're requested.
- And by default, services are **Request-Scoped**: A new instance is created every time one is requested.

Therefore, a lot of overhead processing was present in each request:

- useCase is called, therefore instantiated.
- Then, repository is instantiated and injected on useCase. That involves creating a new database connection and a bigger delay.

For the reasons above, services became explicitly configured as **Singleton Scoped** on bind. With a single instance of each, only one connection was created and shared across all requests, greatly reducing latency

#### 5.3. **Prepared Statements** (and caching)

**Prepared Statements** are a great tool in SQL: they enforce safety and improve performance on frequent queries, even with different parameter values

Most **ORMs** and query building libraries come with the innate ability to cache statements. Although an actual ORM is not in use, that functionality is still desired.

A very simple implementation is included: constants carry the original SQL queries in text format, and a small internal cache exists inside the repository object.

When a request is made, the called method will look the prepared statement up on the cache. If it doesn't exist, a new prepared statement is created and immediately appended to the cache, as well as returned to the caller. Then, subsequent calls for the same statement will use the cached (prepared) statement, which further reduces overall latency.

---

# Conclusion

With everything said and done, performance tests have showed that (considering development on a local machine, with an SSD) the average request time is frequently below `10ms`, sometimes reaching the minimum of around `**700μs**`. A performance that entirely satisfies both essential and desired criteria!

I fully believe this project to be a display not only of technical skill, but of attention and thoughtful care with detail, patience and perseverance. As well as a representation of my own desire to keep learning and improving further.

## License

This project is licensed under the terms of the [GNU General Public License v3](/LICENSE), of 29 June, 2007.

## Help / {#contact-me}

If you wish to help by contributing, providing feedback, or otherwise would like to contact the author, feel free to reach out at:

[GitHub](https://github.com/renancpin): @**renancpin**  
[LinkedIn](https://linkedin.com/in/renan-c-pinheiro): (/**in**/**renan-c-pinheiro**)  
mailto: [renan.coelho.p@gmail.com](mailto:renan.coelho.p@gmail.com)
