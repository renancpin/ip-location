# Exploring Development Decisions

[![Back to README](https://img.shields.io/badge/Back_to-README-green.svg)](/README.md)

While developing this application, many aspects have influenced important design and architectural decisions. The points presented below expose some of those aspects and the though behind each decision

## 1. Data Management **Database**

The first strategical decision was to load the dataset, initially provided as a CSV file, into a database

Reading directly from a file is slow and difficult to optimize. A database is a better tool that:

- Enables efficient **querying and filtering** of data
- Improves **space usage**, both on disk and in memory
- Allows for [**indexing**](#51-indexing) for faster data retrieval

## 2. [**SQLite**](https://sqlite.org/index.html) as the Database Choice

SQLite was chosen for the following reasons:

1. **Simplicity and Portability**

   SQLite requires no separate server process. As an embedded application, it's self-contained and requires minimal initial setup and maintenance overhead

2. **Performance**

   Since it does not rely on network connectivity, SQLite provides faster read operations and lower latency overall

3. **Concurrent Read Support**

   Although SQLite might present limitations on concurrent writes and locks, it allows for multiple concurrent reads, being suitable for read-heavy applications - like this one

## 3. [**Koa**](https://koajs.com/) as the API Framework

Koa was selected as the web framework for reasons very similar to the database choice:

1. **Developer Experience**
   - Familiarity and strong community support
   - Better error handling
   - Easy to extend and customize

2. **Performance**
   - Lightweight and minimal overhead
   - Built on top of Node.js's async/await capabilities
   - Excellent request handling performance

## 4. Dependency Inversion with [**Inversify**](https://inversify.io/docs/introduction/getting-started/)

As the API framework is not very opinionated on software architecture itself, **Inversify** steps in as a Dependency Inversion solution that greatly improves code organization, by assuring:

1. **Decoupling**:

   Inversify is able to bind services to tokens and interfaces, which reinforces encapsulation and reduces interdependance. Therefore, reducing errors and improving maintainability

2. **Dependency Injection**

   It provides class and parameter Decorators to allow marking classes as injectable instances, having the container as responsible for handling and storing dependencies, reducing boilerplate code

## 5. Performance Considerations

One of the desired points of evaluation criteria was to perform requests in `100ms` or less, and to be able to handle more than `100` concurrent users

In order to meet that criteria, several optimizations were made to improve performance

### 5.1. **Indexing**

When testing, it was immediately clear that the critical point of performance was querying data

Even when using SQLite, the average search could take well over **2 seconds**, especially on misses (`Not found`).  
The reason was that, by default, the database engine performs a **full scan** - that is, checking every row on table `ip` - because it assumes data is unordered

To solve this pain point, creating a proper index was of utmost importance

> 📓 A **`Database Index`** acts much like a **contact book**:
>
> It stores information (like phone number and address), following a given order (like alphabetically, by family name)
>
> That way, when you need to call Mr. Smith, instead of randomly reading every contact, you just skip to the page that contains names with "S". Much faster!

Our basic **SELECT** query has the following form:

```sql
SELECT * FROM ip
WHERE ?ip_id BETWEEN lower_ip_id AND upper_ip_id
LIMIT 1;
```

Our index will be the following:

```sql
CREATE INDEX ip_range ON ip (
  upper_ip_id,
  lower_ip_id
)
```

> 📓 1. An **`Index`** should cover the columns on the **WHERE** clause of the most frequently used queries

> 📓 2. A **`Covering Index`** is an index that includes **all** the columns on the **WHERE** clause of a given query

---

### 5.2. **Service Instantiation**

The usual path of every request is:

1. Request is received by the **router**.
2. The **useCase** is called with request parameters, and parses the ip to a ipId.
3. The **repository** method is called with the ipId.
4. The result is treated and parsed at every step until it's returned to the user.

By default, **Inversify** services are **Request-Scoped**, which means that every time a service (a `useCase`, or a `repository`) is requested with `container.get(ServiceName)`, a new instance is created

In the repository's case, a new database connection is created at startup. Therefore, a lot of overhead processing was present in each request

To reduce that overhead, services were then explicitly configured as **Singleton Scoped** on bind. With that, only one repository instance is ever created, therefore one single connection was shared across all requests, which greatly reduced latency

### 5.3. **Caching Prepared Statements**

**Prepared Statements** are a great tool in Relational Databases: they validate statements written in SQL to enforce safety, helping to avoid injection attacks, and to improve performance by creating a "repeatable" statement, for when the same query is used frequently, only with different parameter values

Most **ORMs** and query building libraries come with the innate ability to cache prepared statements. Although an actual ORM is not used in this project, that functionality is still desired

A very simple implementation is included: constants carry the original SQL queries in text format, and a simple object will be used as a simple cache inside the repository

Whenever a request is made, the called method will then check for the prepared statement on the cache first. If it exists, it will be returned and used. If it doesn't, a new prepared statement is created and immediately appended to the cache, as well as returned to the caller

Using cached (prepared) statements has further reduced overall latency by a few more milliseconds

---

# Results

With everything said and done, performance tests have showed that the average request time is way below `10ms`, sometimes reaching the minimum of around **`700 microseconds`**! A performance that entirely satisfies both essential and desired criteria

> Obs: The setup included a local machine with 16gb of RAM and an SSD
> Results may vary depending on the setup used

# Conclusion

This project is a display not only of technical skill, but of attention and thoughtful care to detail, patience and a desire to keep learning and improving further.

Any questions or feedback, please don't hesitate to send a message. Contact info is provided on main.

[Back to main](/README.md)
