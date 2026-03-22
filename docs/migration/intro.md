# Migration

Migration keeps your database schema in sync with your DataClass definitions. When you add, remove, or change fields in a DataClass, running `migrate` updates the database to match.

```javascript
await db.migrate(UserDataClass)
```

That's all it takes. Classo compares your DataClass definition against the existing table and applies the necessary changes.

---

## What Migration Handles

| Change | SQLite | PostgreSQL | MySQL | MongoDB |
|--------|--------|------------|-------|---------|
| Add a new column | ✅ | ✅ | ✅ | ✅ |
| Drop a column | ✅ | ✅ | ✅ | ➖ |
| Change nullable → NOT NULL | ✅ | ✅ | ✅ | ➖ |
| Change NOT NULL → nullable | ✅ | ✅ | ✅ | ➖ |
| Change column type | ❌ | ❌ | ❌ | ❌ |

:::caution Type changes are blocked
Changing a column type is blocked on all databases because copying existing data to a new type can cause data loss. To change a column type, do it manually at the database level first, then update the type in your DataClass.
:::

---

## Adding a New Field

When you add a field to your DataClass, migration needs to know what value to put in existing rows. You must provide a `defaultValue` in the field's metaData:

```javascript
class UserDataClass extends DataClass {
    username = createField(types.TEXT, false, false, [])
    password = createField(types.TEXT, false, false, [])

    // new field added later - must have a defaultValue
    age = createField(types.INTEGER, false, true, [], null, null, { defaultValue: 0 })

    getName() { return "users" }
}

await db.migrate(UserDataClass)
```

Existing rows will have `age` set to `0`. New rows will require `age` to be provided.

### Rules for adding fields

- **Nullable field** — no default value needed, existing rows get `NULL`
- **NOT NULL field** — must have a `defaultValue`, existing rows use it
- **Unique NOT NULL field** — cannot be added via migration. Since all existing rows would get the same default value, it would immediately violate the unique constraint. Add it manually at the database level instead.

---

## Dropping a Field

Simply remove the field from your DataClass and run migrate:

```javascript
class UserDataClass extends DataClass {
    username = createField(types.TEXT, false, false, [])
    // password field removed

    getName() { return "users" }
}

await db.migrate(UserDataClass)
```

:::warning Data loss
Dropping a field permanently deletes that column and all its data. This cannot be undone. Make sure you have a backup before running migration that drops columns.
:::

---

## Changing Nullable Constraints

### NOT NULL → Nullable

Safe — existing rows just gain the ability to store NULL. No default value needed:

```javascript
// before: false (NOT NULL)
// after: true (nullable)
age = createField(types.INTEGER, false, true, [])

await db.migrate(UserDataClass)
```

### Nullable → NOT NULL

Requires a `defaultValue` — existing rows that currently have NULL need a value to fill in:

```javascript
// before: true (nullable)
// after: false (NOT NULL) — must provide defaultValue
age = createField(types.INTEGER, false, false, [], null, null, { defaultValue: 0 })

await db.migrate(UserDataClass)
```

---

## How SQLite Migration Works

SQLite has limited `ALTER TABLE` support — it cannot drop columns or change constraints directly. Instead Classo uses a **table rebuild strategy**:

1. Creates a new temp table with the correct schema
2. Copies all overlapping data from the old table
3. Drops the old table
4. Renames the temp table to the original name

This happens automatically — you just call `db.migrate(UserDataClass)`. The only thing to be aware of is that if migration fails midway, you may have a `tmp_tablename` table left in your database that you need to clean up manually.

PostgreSQL and MySQL support `ALTER TABLE` directly so no rebuild is needed for those databases.

---

## MongoDB Migration

MongoDB is schemaless so there are no tables to alter. Migration for MongoDB only handles **adding new fields with default values** to existing documents:

```javascript
class UserDataClass extends DataClass {
    username = createField(types.TEXT, false, [])

    // new field - existing documents will get this default
    isActive = createField(types.BOOLEAN, false, [], null, null, { defaultValue: true })

    getName() { return "users" }
}

await db.migrate(UserDataClass)
// existing documents now have isActive: true
```

Dropping fields and changing constraints are not handled by MongoDB migration — you can do those operations directly through your MongoDB client or Atlas dashboard.

---

## Full Example

```javascript
const { SQLiteDatabase, createField, types } = require("classo/databases/sqlite3")
const { DataClass } = require("classo/dataclasses/base")
const { is_required, minLength } = require("classo/dataclasses/validators")

class UserDataClass extends DataClass {
    username = createField(types.TEXT, false, false, [
        is_required("Username is required"),
        minLength(4, "Username must be at least 4 characters")
    ])

    password = createField(types.TEXT, false, false, [
        is_required("Password is required")
    ])

    // newly added field
    age = createField(types.INTEGER, false, true, [], null, null, { defaultValue: 0 })

    getName() { return "users" }
}

async function main() {
    const db = new SQLiteDatabase("mydb.db")
    await db.connect()

    // run migration - adds the age column to existing table
    await db.migrate(UserDataClass)
    console.log("Migration complete")
}

main()
```

---

## What's Next

- [Query Builder](../query/intro) — filter, sort, and preload related data