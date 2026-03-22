# Query Builder

Classo includes a query builder for each SQL database that lets you build complex queries with filters, sorting, pagination, and joins. For fetching related data from `hasMany` and `hasOne` relations, you can use `preload` directly on the query.

:::note Many-to-many queries
Fetching data across many-to-many relations via `preload` is not yet supported. For now use `innerJoin` to query across join tables manually. This will be added in a future release.
:::

---

## Import

Each database has its own query class:

```javascript
// SQLite
const { SqliteQuery, ACTION_TYPES, LikePatterns, ORDER_DIRECTIONS } = require("classo/query/sqliteQuery")

// PostgreSQL
const { PostgresqlQuery, ACTION_TYPES, LikePatterns, ORDER_DIRECTIONS } = require("classo/query/postgresqlQuery")

// MySQL
const { MySQLQuery, ACTION_TYPES, LikePatterns, ORDER_DIRECTIONS } = require("classo/query/mysqlQuery")
```

---

## Basic Query Structure

Every query follows the same steps:

1. Create a query instance with your DataClass
2. Set the action type (`SELECT`, `INSERT`, `UPDATE`, `DELETE`)
3. Set fields and table name
4. Add filters (optional)
5. Add limit, skip, orderBy (optional)
6. Call `build()` to get the query and values
7. Run with `db.runQuery()`

---

## Select

```javascript
const query = new SqliteQuery(UserDataClass)

query.setActionType(ACTION_TYPES.SELECT)
query.setSelectingFields("*") // or ["username", "age"] for specific fields
query.setTableName(UserDataClass)

query.startFiltering()
query.equals("username", "johndoe")
query.endFiltering()

query.limit(10).skip(0).orderBy("username", ORDER_DIRECTIONS.ASCENDING)

const { query: sql, values } = query.build()
const results = await db.runQuery(ACTION_TYPES.SELECT, sql, values) // SQLite needs action type
// PostgreSQL / MySQL: await db.runQuery(sql, values)
```

:::note SQLite runQuery
SQLite's `runQuery` takes the action type as the first argument:
```javascript
await db.runQuery(ACTION_TYPES.SELECT, sql, values)
```
PostgreSQL and MySQL do not need it:
```javascript
await db.runQuery(sql, values)
```
:::

---

## Filters

All filters can be chained:

```javascript
query.startFiltering()
    .equals("username", "johndoe")
    .greaterThan("age", 18)
    .lessThan("age", 65)
    .like("username", "john", LikePatterns.CONTAINS)
query.endFiltering()
```

### Available filters

| Method | Description | Example |
|--------|-------------|---------|
| `equals(field, value)` | Exact match | `.equals("username", "john")` |
| `notEqual(field, value)` | Not equal | `.notEqual("status", "banned")` |
| `greaterThan(field, value)` | Greater than | `.greaterThan("age", 18)` |
| `lessThan(field, value)` | Less than | `.lessThan("age", 65)` |
| `like(field, value, pattern)` | Pattern match | `.like("name", "john", LikePatterns.CONTAINS)` |

### LikePatterns

| Pattern | Matches |
|---------|---------|
| `LikePatterns.CONTAINS` | Value appears anywhere |
| `LikePatterns.STARTS_WITH` | Value appears at the start |
| `LikePatterns.ENDS_WITH` | Value appears at the end |

---

## Insert

```javascript
const query = new SqliteQuery(UserDataClass)

query.setActionType(ACTION_TYPES.INSERT)
query.setTableName(UserDataClass)
query.insert({ username: "johndoe", password: "hashedpassword" })

const { query: sql, values } = query.build()
await db.runQuery(ACTION_TYPES.INSERT, sql, values)
```

---

## Update

```javascript
const query = new SqliteQuery(UserDataClass)

query.setActionType(ACTION_TYPES.UPDATE)
query.setTableName(UserDataClass)
query.update({ username: "janedoe" }) // new values

query.startFiltering()
query.equals("username", "johndoe") // which records to update
query.endFiltering()

const { query: sql, values } = query.build()
await db.runQuery(ACTION_TYPES.UPDATE, sql, values)
```

---

## Delete

```javascript
const query = new SqliteQuery(UserDataClass)

query.setActionType(ACTION_TYPES.DELETE)
query.setTableName(UserDataClass)

query.startFiltering()
query.equals("username", "johndoe")
query.endFiltering()

const { query: sql, values } = query.build()
await db.runQuery(ACTION_TYPES.DELETE, sql, values)
```

---

## Preload Related Data

Use `preload` to fetch related data from `hasMany` and `hasOne` relations in a single call. Classo batches the queries efficiently — one query per relation level, not one per record.

```javascript
const query = new SqliteQuery(UserDataClass)

query.setActionType(ACTION_TYPES.SELECT)
query.setSelectingFields("*")
query.setTableName(UserDataClass)

// fetch users with their messages and each message's meta
query.preload("messages.meta")

const { query: sql, values } = query.build()
const results = await query.execute(db)
console.log(results)
// [{ _id: "...", username: "john", messages: [{ text: "...", meta: {...} }] }]
```

### Nested preload

Use dot notation to preload nested relations:

```javascript
query.preload("messages.meta") // users → messages → meta
```

### Preload with filters

Pass an optional query object per relation to filter preloaded data:

```javascript
const messageQuery = new SqliteQuery(MessageDataClass)
messageQuery.startFiltering().equals("text", "Hello world").endFiltering()

query.preload("messages.meta", {
    messages: messageQuery // only load messages matching this filter
})

const results = await query.execute(db)
```

### execute()

When using `preload`, call `execute(db)` instead of `build()` + `runQuery()`:

```javascript
const results = await query.execute(db)
```

`execute` runs the main query, fetches all preloaded relations in batched queries, and returns the fully nested result.

---

## Inner Join

Use `innerJoin` to query across related tables manually. This is the recommended approach for many-to-many relations until native preload support is added:

```javascript
const { getFromTable } = require("classo/query/utils")

const query = new MySQLQuery(OrderDataClass)

query.setActionType(ACTION_TYPES.SELECT)
query.setSelectingFields([
    ...getFromTable("orders", "orderDate", "status"),
    getFromTable("customers", "customerName")
])
query.setTableName(OrderDataClass)

query.innerJoin(
    "customers",
    getFromTable("customers", "customerNumber"),
    getFromTable("orders", "customerNumber")
)

query.startFiltering()
    .greaterThan("orders.orderDate", "2024-01-01")
query.endFiltering()

query.limit(20)

const { query: sql, values } = query.build()
const results = await db.runQuery(sql, values)
```

`getFromTable(table, ...fields)` formats field names as `table.field` to avoid ambiguity when joining tables.

Other join types are also available:

```javascript
query.leftJoin(joinTable, fieldOne, fieldTwo)
query.rightJoin(joinTable, fieldOne, fieldTwo)
query.fullJoin(joinTable, fieldOne, fieldTwo)
```

---

## What's Next

- [Migration](../migration/intro) — update your schema as your DataClasses change