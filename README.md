# IP Location API

[![en](https://img.shields.io/badge/lang-en-red.svg)](/README.md)
[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](/README.pt-BR.md)

A Backend Developer Challenge designed to evaluate optimization skills and knowledge of target technologies, like Node.js and TypeScript

## The Challenge

Implement a REST API using TypeScript, that resolves a given IP address to a world location, by looking it up in a dataset

### Evaluation Criteria

- **Correctness**: The API must behave according to the spec.
- **Architecture**: Clarity and organization of code.
- **Code Quality**: Readability, modularity, maintainability.
- **Performance**: Keep response times below `100ms`.
- **Minimal Dependencies**: Avoid external libraries and high-level abstractions, except for REST operations and dev dependencies.
- **Concurrency**: Respond to more than `100` concurrent users.
- **Testability**: Use any desired test library (like [Jest](https://jestjs.io)) to implement automated tests.

&nbsp;

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

## The API Specification

### **`GET /ip/location`**

**Query Parameters**:

- `ip` (string): The IPv4 address to look up.

**Behavior**:

- Convert the IP to its corresponding numeric ID, using the [`ipToId`](./src/utils/ip-calculator.ts) function.
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

&nbsp;

# The Implementation

To complete this challenge, some popular frameworks like **Koa**, **Inversify** and **Jest** were leveraged considering each evaluation criteria.

The resulting implementation has aimed for stunning performance, quality of code, ease of understanding and low memory usage.

Below there are instructions to setup and execute the app, run tests, as well as the thoughts behind many important Design decisions, library choices, performance considerations and more.

&nbsp;

# Project Setup

## 1. Cloning the Project with [**Git**](https://git-scm.com/)

If you don't already have **git** installed, [download it **here**](https://git-scm.com/downloads) following the instructions for your Operational System.

Then, run:

```bash
git clone https://github.com/renancpin/ip-location.git
```

## [Optional] 2. Setting Environment Variables

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

&nbsp;

# Installing and Running

## Option 1: Running With [**Docker**](https://docker.com)

The easiest way.

All dependencies, including Node.js itself, will be installed inside the container, and the dataset will be loaded automatically, so don't worry and enjoy the wait

Download and install **Docker** from their [official webpage](https://www.docker.com/products/docker-desktop/)

Follow instructions [below at item #2.3](#23-loading-the-dataset) to download the dataset, then put it at this project's root folder

Then, build and spin up a container by running:

```bash
docker compose up --build
```

To spin down the container, run:

```bash
docker compose down
```

## Option 2: Locally with Node.js

For the ones who wish to run with their own machine

### 2.1. Node.js Version

This project requires **Node.js v22.16.0** or above

> **Hint**: Use a version manager, like [nvm](https://github.com/nvm-sh/nvm), to handle multiple versions on the same machine

### 2.2. Installing Dependencies

Use your preferred package manager (`npm`, `yarn`, `pnpm`):

```bash
yarn install
```

### 2.3. Loading the Dataset

The original dataset is available. [Download it **here**](https://github.com/renancpin/ip-location/raw/refs/heads/main/iplocation-dataset.csv?download=1), set its extension to `.csv`, then put it on the root folder

Use the provided [**script**](`/scripts/load-dataset.script.ts`) to load the CSV dataset into a SQLite instance:

```bash
yarn dataset:load
```

### 2.4. Running the API

There are three main ways to run the app:

1. To simply see it working (you'll need **TypeScript**):

   ```bash
   yarn start
   ```

2. To build and run in **production mode**:

   ```bash
   yarn build

   yarn start:prod
   ```

3. To run in **development mode** (with hot-reload):

   ```bash
   yarn start:dev
   ```

&nbsp;

# Using the API

While the API is running, make a GET request to `/ip/location`, passing an ipv4 address as the `ip` query parameter:

```bash
curl "http://localhost:3000/ip/location?ip=1.1.1.1"
```

&nbsp;

# Testing

Examples of [Unit](/tests/ip-calculator.test.ts), [Integration](/tests/server.test.ts) and [Performance](/tests/test.js) tests are available.

**Unit** and **Integration** tests are available with [Jest](https://jestjs.io/docs/getting-started):

```bash
yarn test
```

**Performance** tests are available with [K6](https://grafana.com/docs/k6/latest/set-up/install-k6/).
Follow the installation instructions on its page, then run:

```bash
yarn test:performance
```

# Development Decisions

An in-depth coverage of design and architectural decisions is available [here](/development-decisions.md). Feel free to dive into it with me.

&nbsp;

---

# License

This project is licensed under the terms of the [GNU General Public License v3](/LICENSE), of 29 June 2007.

# Contact Me

If you wish to help by contributing, providing feedback, or otherwise would like to contact the author, feel free to reach out at:

- [GitHub](https://github.com/renancpin): @**renancpin**
- [LinkedIn](https://linkedin.com/in/renan-c-pinheiro)
- [Email](mailto:renan.coelho.p@gmail.com)
