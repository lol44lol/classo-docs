# Database CRUD

This page covers create, read, update, and delete operations across all supported databases. The API is nearly identical for SQLite, PostgreSQL, MySQL, and MongoDB — the main difference is the import path and connection setup.

## Setup

First connect to your database and create the table. See [Getting Started](../getting-started) for connection details.

For SQL databases, define your DataClass using `createField` from your database module:

```javascript
// SQLite
const { SQLiteDatabase, createField, types } = require("classo/databases/sqlite3")

// PostgreSQL
const { PostgresDatabase, createField, types } = require("classo/databases/postgresql")

// MySQL
const { MySqlDatabase, createField, types } = require("classo/databases/mysql")

// MongoDB
const { MongoDBDatabase, createField, types } = require("classo/databases/mongodb")
```

Here is the DataClass we will use throughout this page. Swap the import for your database:

```javascript
const { DataClass, DataClassFactory } = require("classo/dataclasses/base")
const { createField, types } = require("classo/databases/sqlite3") // change to your database
const { is_required, minLength } = require("classo/dataclasses/validators")

class UserDataClass extends DataClass {

    username = createField(types.TEXT, false, false, [
        is_required("Username is required"),
        minLength(4, "Username must be at least 4 characters")
    ])

    password = createField(types.TEXT, false, false, [
        is_required("Password is required"),
        minLength(8, "Password must be at least 8 characters")
    ])

    getName() { return "users" }
}
```

:::note MySQL VARCHAR
For MySQL, fields you want to be unique must use `types.VARCHAR` instead of `types.TEXT`. Pass a `max` value in metaData:

```javascript
username = createField(types.VARCHAR, true, false, [...validators], null, null, { max: 250 })
```
:::

---

## Create

Use `DataClassFactory` to validate and save data:

```javascript
const { DATABASE_TYPES } = require("classo/databases")

const db = new SQLiteDatabase("mydb.db")
await db.connect()
await db.createTable(UserDataClass)

const userFactory = new DataClassFactory(UserDataClass, { DATABASE: DATABASE_TYPES.SQLITE })

const payload = { username: "johndoe", password: "securepassword123" }

// create a DataClass instance for validation
const userInstance = userFactory.createObject(payload)
const result = await userInstance.validate()

if (result.data.okay) {
    // transform data (runs afterValidation like password hashing)
    const dataToSave = await userInstance.transformValidateDataToBeSaved(payload)
    // save to database
    const newUser = await userFactory.createModelObject(dataToSave)
    console.log(newUser)
} else {
    console.log("Validation failed:", result.data.error, "on field:", result.field)
}
```

`createModelObject` saves the record and returns the created object including the auto-generated `_id`, `createdAt`, and `updatedAt` fields.

### DATABASE_TYPES

| Database | Constant |
|----------|----------|
| SQLite | `DATABASE_TYPES.SQLITE` |
| PostgreSQL | `DATABASE_TYPES.POSTGRES` |
| MySQL | `DATABASE_TYPES.MYSQL` |
| MongoDB | `DATABASE_TYPES.MONGODB` |

---

## Read

### Get all records

```javascript
// limit=10, skip=0 by default
const users = await db.find(UserDataClass, null, true, 10, 0)
console.log(users)
```

### Get with filter

Pass a filter object to find matching records:

```javascript
const user = await db.find(UserDataClass, { username: "johndoe" }, true)
console.log(user)
```

### Get by ID

```javascript
const user = await db.findById(UserDataClass, "some-uuid-here")
console.log(user)
```

### find() parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| dataClass | DataClass | Your DataClass |
| query | Object or null | Filter conditions e.g. `{ username: "john" }` |
| getObj | Boolean | Set to `true` |
| limit | Number | Max records to return (default 10) |
| skip | Number | Records to skip for pagination (default 0) |

---

## Update

Use `updateModelObject` on the factory — pass a query to filter records and a payload with the new values:

```javascript
const userFactory = new DataClassFactory(UserDataClass, { DATABASE: DATABASE_TYPES.SQLITE })

// find user with username "johndoe" and change it to "janedoe"
await userFactory.updateModelObject(
    { username: "johndoe" },  // query - which records to update
    { username: "janedoe" }   // payload - what to change
)
```

This updates all records matching the query.

---

## Delete

Use `deleteModels` on the factory — pass a query to filter which records to delete:

```javascript
const userFactory = new DataClassFactory(UserDataClass, { DATABASE: DATABASE_TYPES.SQLITE })

// delete by id
const deleted = await userFactory.deleteModels({ _id: "some-uuid-here" })

// delete by field value
const deleted = await userFactory.deleteModels({ username: "johndoe" })

console.log(deleted) // returns the deleted records
```

`deleteModels` returns the deleted records before removing them so you can log or process them if needed.

---

## Database Differences

Most operations work identically across all four databases. The only differences are:

| Feature | SQLite | PostgreSQL | MySQL | MongoDB |
|---------|--------|------------|-------|---------|
| Table creation | `createTable` / `createTables` | `createTable` / `createTables` | `createTable` / `createTables` | Not needed |
| Unique fields | `types.TEXT` | `types.TEXT` | `types.VARCHAR` | `types.TEXT` |
| Close connection | `db.close()` | `db.disconnect()` | `db.connection.destroy()` | `db.disconnect()` |

---

## What's Next

- [Relations](../relations/intro) — define one-to-many, one-to-one, and many-to-many relations
- [Query Builder](../query/intro) — advanced filtering, sorting, and preloading related data
- [Migration](../migration/intro) — update your database schema as your DataClass changes