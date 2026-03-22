# Getting Started with Classo

Classo is a multi-database ORM for Node.js that lets you define your data models once and use them across SQLite, PostgreSQL, MySQL, and MongoDB. It handles validation, database operations, relations, migrations, and queries — all from a single class definition.

## Installation

```bash
npm install classo
```

## Choose Your Database

Classo supports four databases. Install the driver for the one you want to use:

```bash
# SQLite
npm install sqlite3

# PostgreSQL
npm install pg

# MySQL
npm install mysql2

# MongoDB
npm install mongoose
```

## Connect to a Database

### SQLite

```javascript
const { SQLiteDatabase } = require("classo/databases/sqlite3")

const db = new SQLiteDatabase("my_database.db")
await db.connect()
```

### PostgreSQL

```javascript
const { PostgresDatabase } = require("classo/databases/postgresql")

const db = new PostgresDatabase()
await db.connect("localhost", "myuser", "mypassword", "mydatabase")
```

### MySQL

```javascript
const { MySqlDatabase } = require("classo/databases/mysql")

const db = new MySqlDatabase()
await db.connect("mydatabase", "myuser", "mypassword", "localhost")
```

### MongoDB

```javascript
const { MongoDBDatabase } = require("classo/databases/mongodb")

const db = new MongoDBDatabase()
await db.connect("mongodb://localhost:27017/mydatabase")
```

## Define Your First DataClass

A DataClass defines your model — its fields, types, and validations. It works with any of the databases above.

```javascript
const { DataClass } = require("classo/dataclasses/base")
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

    getName() {
        return "users" // this becomes your table/collection name
    }
}
```

## Create the Table

For SQL databases, create the table before saving data:

```javascript
await db.createTable(UserDataClass)
```

For multiple tables with relations, use `createTables` instead:

```javascript
await db.createTables(UserDataClass, PostDataClass, CommentDataClass)
```

Classo figures out the correct creation order automatically based on foreign key dependencies.

MongoDB does not require table creation — collections are created automatically.

## Validate and Save Data

```javascript
const factory = DataClassFactory.createFactory(UserDataClass, { DATABASE: "sqlite" })

// create a DataClass instance with user data
const userInstance = factory.createObject({
    username: "johndoe",
    password: "securepassword123"
})

// run validation
const validationResult = await userInstance.validate()

if (!validationResult.data.okay) {
    console.log("Error:", validationResult.data.error)
    console.log("Field:", validationResult.field)
} else {
    // transform data (runs afterValidation like password hashing)
    const dataToSave = await userInstance.transformValidateDataToBeSaved({
        username: "johndoe",
        password: "securepassword123"
    })

    // save to database
    const newUser = await db.createObject(UserDataClass, dataToSave)
    console.log("Created user:", newUser)
}
```

## What's Next

- [DataClass & Validation](./dataclass/dataclass_intro) — learn how to define fields and write validators
- [Database CRUD](./sqlite3/database_crud) — create, read, update, delete operations
- [Relations](./relations/intro) — define one-to-many, one-to-one, and many-to-many relations
- [Migration](./migration/intro) — update your database schema as your DataClass changes
- [Query Builder](./query/intro) — filter, sort, and preload related data