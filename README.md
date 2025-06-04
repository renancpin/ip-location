# IP Location API

A Backend Developer Challenge to showcase abilities and knowledge on desired technologies like Node.js and TypeScript

## The Challenge

Implement a REST API using TypeScript that resolves a given IP address to a world location by looking it up in a dataset.

## Dataset

The provided CSV file [iplocation-dataset.csv](iplocation-dataset.csv) has **2,979,950 rows** (`330Mb`).
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

# The Implementation

To complete this challenge, some popular frameworks like Koa, Inversify and Jest were leveraged. The resulting implementation has aimed for stunning performance, code quality and correctness.

Below, there are step to setup, run, test, and the thoughts behind many important Design decisions, library choices, performance issues and more.

## Setup And Run

First, install dependencies with your preferred package manager:

```bash
npm install
# or
yarn install
```

Then, run the `start` script:

```bash
npm run start
# or
yarn start
```

## Data Loading

Inside the `database` folder there is a [script](/database/import-ips.ts) to load the csv dataset and create an sqlite instance with the location data.

To use it, run the `loadcsv` script on [package.json](package.json):

```bash
yarn loadcsv
```

To use a custom dataset filename, there's an environment variable available in the form of `IPLOCATION_CSV_PATH`

## Using the API

While the API is running, make a GET request to `/ip/location`, passing an ipv4 address as the `ip` query parameter:

```bash
curl --request GET \
      --url 'http://localhost:3000/ip/location?ip=1.1.1.1'
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
