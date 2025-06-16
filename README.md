# IP Location API

A Backend Developer Challenge to showcase abilities and knowledge on desired technologies like Node.js and TypeScript

## The Challenge

Implement a REST API using TypeScript that resolves a given IP address to a world location by looking it up in a dataset.

## Dataset

The provided CSV file [iplocation-dataset.csv](https://github.com/renancpin/ip-location/raw/refs/heads/main/iplocation-dataset.csv?download=) has **2,979,950 rows** (`330Mb`).
Each row describes an IP range and its corresponding location.

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

## Testing

For convenience, examples of [Unit](/tests/ip-calculator.test.ts), [Integration](/tests/server.test.ts) and [Performance](/test.js) tests are available. Test running scripts are also available:

```bash
# Unit and integration tests
yarn test

# Performance test with k6 (optionally with dashboard)
yarn test:performance

yarn test:performance:dashboard
```

---

# The Implementation

To complete this challenge, some popular frameworks like Koa, Inversify and Jest were leveraged. The resulting implementation has aimed for stunning performance, code quality and correctness.

Below, there are step to setup, run, test, and the thoughts behind many important Design decisions, library choices, performance issues and more.

## Setup And Run

### 1. Installing Dependencies

First, install packages with your preferred package manager:

```bash
npm install
# or
yarn install
```

### 2. Loading Dataset

There is a [**script**](/database/import-ips.ts) available at the `database` folder that will load a csv dataset and create an sqlite instance with all the location data.

The original dataset is available. [Download it **here**](https://github.com/renancpin/ip-location/raw/refs/heads/main/iplocation-dataset.csv?download=), and put it in the same folder where this project is cloned.

Call the **`loadcsv`** script provided on [package.json](package.json#L8):

```bash
yarn loadcsv
```

### [OPTIONAL] Set Environment Variables

Default values are provided for API running port, database location and dataset filename

For the occasions when changing those values is necessary, use the available environment variables:

| Name                  | Description                        |
| --------------------- | ---------------------------------- |
| `PORT`                | API address port                   |
| `DB_HOST`             | Path where database is located     |
| `IPLOCATION_CSV_PATH` | Filename/path where csv dataset is |

[**Dotenv**](https://www.dotenv.org/docs/) package is included. To use it, define a text file called `.env` and set variables as needed. You can also copy contents from the [`.env.example`](.env.example) file that is provided as a model

## Using the API

While the API is running, make a GET request to `/ip/location`, passing an ipv4 address as the `ip` query parameter:

```bash
curl "http://localhost:3000/ip/location?ip=1.1.1.1"
```

## Running tests

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

### 2. [**SQLite**](https://sqlite.org/index.html) as Database Choice

SQLite was chosen as the database solution for the following reasons:

1. **Simplicity and Portability**

   SQLite requires no separate server process. As a filesystem-based application, it's self-contained and requires minimal initial setup and maintenance overhead

2. **Performance**

   Since it does not rely on network connectivity, SQLite provides faster read operations and lower latency overall

3. **Concurrent Read Support**

   Although SQLite might present limitations on concurrent writes and locks, it allows for multiple parallel reads, being suitable for read-heavy applications - like this one

### 3. [**Koa**](https://koajs.com/) as Web Framework

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

As the web framework is not very opinionated on software architecture itself, **Inversify** comes in as a Dependency Inversion framework that greatly improves code organization:

1. **Decoupling**:

   Inversify can manage class instantiation and is able to bind services to tokens and interfaces. By following those principles, developers can reduce interdependence, which improves code maintainability

2. **Dependency Injection**

   It provides class and parameter Decorators to allow marking classes as injectable instances, as well as automatically referencing other classes as arguments to the constructor, reducing boilerplate code

### 5. **Indexing**

One of the desired points of evaluation criteria was to perform requests in 200ms or less.

When testing, it was immediately clear that the critical point of performance was querying data. Even when using SQLite, the average search could take well over a second, especially on worst case scenarios like ip addresses out of range. To solve this pain point, creating a proper index was of utmost importance

The **QUERY** has the following form:

```sql
SELECT * FROM ip
WHERE ?ip BETWEEN lower_ip_id AND upper_ip_id
LIMIT 1;
```

By default, database engine will perform a full scan - that is, checking every row on table `ip` - because it assumes data is unordered.

A database index acts much like an address or contact list. It stores information ordered by "name", or any particular column, along with the "address" that points to the actual location of data.

Index should be created over the columns used for operations (like `=`, `>`, `<`). In our case, we should tell the db engine to "order by" columns `lower_ip_id` and `upper_ip_id`, as those are columns frequently searched upon together:

```sql
CREATE INDEX "ip_range" ON "ip" ("upper_ip_id", "lower_ip_id")
```

> **Column order** is also important. Operations that further narrow down the search (like **equality** comparisons) come first. That way the number of "checks" the engine might perform is reduced

Bringing all the searched data to the index makes it unecessary to retrieve each row during lookup. That alone can reduce data retrieval time down to about 300ms.

But that is not enough, and there's even more room for improvement. Other than column order, there is a simple adjustment that can further reduce query time.

Order of **data** itself, on the first column, doesn't really matter much, since the engine can choose to go up (ascending) or down (descending) based on proximity of value to index upper or lower limits.

But, since a range comparison has two operations (`>= lower bound` and `<= upper bound`), and because the database is unaware of range overlap, we can tell the engine that the second column on the index, is on **descending** order:

```sql
CREATE INDEX "ip_range" ON "ip" (
  "upper_ip_id",
  "lower_ip_id" DESC
)
```

With that small adjustment, the engine knows that if a particular combination of lower and upper limits won't fulfill the criteria, there will be no similar range (with same upper or lower limit) that could. That essentially reduces the amount of comparisons made, which brings worst case scenarios closer to the average case performance (now, a stunning `10-30ms`).

In conclusion, when using the specified index, tests will show that average request time is possibly below `100ms`. A performance that entirely satisfies both essential and desired criteria.
