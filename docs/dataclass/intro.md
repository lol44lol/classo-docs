# DataClass

A DataClass lets you define your data model once and use it for both validation and database operations. You write one class — it handles input validation, database relations, and CRUD.

## Create a DataClass

Start by importing `DataClass` and extending it:

```javascript
const { DataClass } = require("classo/dataclasses/base")

class UserDataClass extends DataClass {
    getName() {
        return "users" // becomes your table or collection name
    }
}
```

`getName()` must be overridden — it returns the table name used in the database. No spaces allowed.

## Add Fields

For database-backed models, define fields using `createField` from your database module. This gives each field both a JS type for validation and a SQL type for the database:

```javascript
const { DataClass } = require("classo/dataclasses/base")
const { createField, types } = require("classo/databases/sqlite3") // or postgresql, mysql
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
        return "users"
    }
}
```

`createField` takes the following parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| type | `types.TEXT`, `types.INTEGER`, etc. | The database column type |
| unique | Boolean | Whether the field must be unique |
| nullable | Boolean | Whether the field can be null |
| validations | Array | List of validator functions |
| beforeValidation | Function | Runs before validation (e.g. trim whitespace) |
| afterValidation | Function | Runs after validation (e.g. hash password) |

## Validate Data

Once you have a DataClass, create an instance, init it with data, and run validation:

```javascript
async function example() {
    const user = new UserDataClass()

    // init with incoming data
    user.init({ username: "jo", password: "short" })

    // run validation
    const result = await user.validate()

    if (!result.data.okay) {
        console.log("Field:", result.field)
        console.log("Error:", result.data.error)
    }
}
```

If validation fails you get back:

```json
{
  "data": { "okay": false, "error": "Username must be at least 4 characters" },
  "field": "username"
}
```

If everything passes:

```json
{
  "data": { "okay": true }
}
```

## Why Validators Must Return Promises

All validators must return a Promise — even simple ones. This is because validators often need to make async calls like checking if a username is already taken in the database. By making all validators async by default, Classo handles both simple and database-level validation the same way.

## Built-in Validators

Classo comes with a set of validators out of the box:

```javascript
const { is_required, minLength, maxLength } = require("classo/dataclasses/validators")
```

| Validator | Description |
|-----------|-------------|
| `is_required(error)` | Field must not be empty |
| `minLength(n, error)` | Minimum character length |
| `maxLength(n, error)` | Maximum character length |

For database-specific validation like uniqueness, see the [Database docs](../sqlite3/database_basic).

## What's Next

- [DataClass Features](./dataclass_important) — beforeValidation, afterValidation, custom cross-field validation
- [Custom Validators](./dataclass_custom_validators) — write your own validator functions
- [Database CRUD](../sqlite3/database_crud) — save validated data to a database