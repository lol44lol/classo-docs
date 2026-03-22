# Relations

Classo supports three types of relations between DataClasses — one-to-many, one-to-one, and many-to-many. Relations are defined directly on your DataClass using helper functions imported from the relations module.

## Import

```javascript
const { hasMany, hasOne, manyToMany, belongsTo, ON_DELETE } = require("classo/databases/relations")
```

---

## Relation Types

### hasMany

Declares that the current DataClass has many records of another DataClass. No database column is created — this is metadata used for querying.

```javascript
class UserDataClass extends DataClass {
    username = createField(types.TEXT, false, false, [])

    messages = hasMany(MessageDataClass) // user has many messages

    getName() { return "users" }
}
```

### hasOne

Declares that the current DataClass has exactly one record of another DataClass. No database column is created.

```javascript
class UserDataClass extends DataClass {
    username = createField(types.TEXT, false, false, [])

    profile = hasOne(ProfileDataClass) // user has one profile

    getName() { return "users" }
}
```

### belongsTo

Declares that the current DataClass belongs to another DataClass. **This creates an actual foreign key column** in the database table.

```javascript
class MessageDataClass extends DataClass {
    text = createField(types.TEXT, false, false, [])

    userID = belongsTo(UserDataClass, "_id", false, ON_DELETE.CASCADE, types.TEXT)

    getName() { return "messages" }
}
```

`belongsTo` parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| parentClass | DataClass | The parent DataClass this belongs to |
| parentField | String | The field on the parent to reference (usually `"_id"`) |
| unique | Boolean | Set `true` for one-to-one, `false` for one-to-many |
| onDelete | ON_DELETE | What happens when the parent is deleted |
| type | types.x | The SQL type for the foreign key column |

### manyToMany

Declares a many-to-many relation. No column is created on either table — Classo automatically creates a join table when you call `createTables`.

```javascript
class UserDataClass extends DataClass {
    username = createField(types.TEXT, false, false, [])

    rooms = manyToMany(RoomDataClass)

    getName() { return "users" }
}

class RoomDataClass extends DataClass {
    name = createField(types.TEXT, false, false, [])

    users = manyToMany(UserDataClass)

    getName() { return "rooms" }
}
```

Classo automatically creates a `room_users` join table with foreign keys pointing to both tables.

---

## ON_DELETE Options

`ON_DELETE` controls what happens to child records when a parent record is deleted:

| Constant | Behaviour |
|----------|-----------|
| `ON_DELETE.CASCADE` | Delete child records automatically |
| `ON_DELETE.SET_NULL` | Set the foreign key to null |
| `ON_DELETE.RESTRICT` | Block the delete if children exist |
| `ON_DELETE.NO_ACTION` | Same as RESTRICT in most databases |
| `ON_DELETE.SET_DEFAULT` | Set the foreign key to its default value |

---

## One-to-Many Example

A user has many messages. The foreign key lives on the `messages` table:

```javascript
const { DataClass, DataClassFactory } = require("classo/dataclasses/base")
const { createField, types } = require("classo/databases/sqlite3")
const { hasMany, belongsTo, ON_DELETE } = require("classo/databases/relations")

class UserDataClass extends DataClass {
    username = createField(types.TEXT, false, false, [])

    messages = hasMany(MessageDataClass)

    getName() { return "users" }
}

class MessageDataClass extends DataClass {
    text = createField(types.TEXT, false, false, [])

    userID = belongsTo(UserDataClass, "_id", false, ON_DELETE.CASCADE, types.TEXT)

    getName() { return "messages" }
}
```

---

## One-to-One Example

A user has exactly one profile. Same as one-to-many but `unique` is set to `true` on `belongsTo`:

```javascript
class UserDataClass extends DataClass {
    username = createField(types.TEXT, false, false, [])

    profile = hasOne(ProfileDataClass)

    getName() { return "users" }
}

class ProfileDataClass extends DataClass {
    bio = createField(types.TEXT, false, true, [])

    userID = belongsTo(UserDataClass, "_id", true, ON_DELETE.CASCADE, types.TEXT) // unique: true

    getName() { return "profiles" }
}
```

---

## Many-to-Many Example

Users can join many rooms and rooms can have many users:

```javascript
class UserDataClass extends DataClass {
    username = createField(types.TEXT, false, false, [])

    rooms = manyToMany(RoomDataClass)

    getName() { return "users" }
}

class RoomDataClass extends DataClass {
    name = createField(types.TEXT, false, false, [])

    users = manyToMany(UserDataClass)

    getName() { return "rooms" }
}
```

Classo creates a `room_users` join table automatically — you never have to define it yourself.

### Adding a Many-to-Many Record

Use `addRelation` to link two records together in the join table:

```javascript
// add user-1 to room-1
await db.addRelation(UserDataClass, RoomDataClass, 'user-1', 'room-1')
```

`addRelation` parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| classOne | DataClass | First DataClass |
| classTwo | DataClass | Second DataClass |
| idOne | String | ID of the first record |
| idTwo | String | ID of the second record |

The order of `classOne` and `classTwo` doesn't matter — Classo figures out the join table name automatically.

---

## Creating Tables with Relations

Always use `createTables` (not `createTable`) when your DataClasses have relations. Classo figures out the correct creation order automatically based on foreign key dependencies:

```javascript
const db = new SQLiteDatabase("mydb.db")
await db.connect()

// Classo creates tables in the right order
// and creates join tables for many-to-many relations last
await db.createTables(UserDataClass, MessageDataClass, RoomDataClass)
```

:::caution Order matters
If you use `createTable` individually you risk foreign key errors because a parent table might not exist yet when the child table tries to reference it. Always use `createTables` when relations are involved.
:::

---

## MySQL Note

For MySQL, foreign key columns must use `types.VARCHAR` instead of `types.TEXT`:

```javascript
// SQLite / PostgreSQL
userID = belongsTo(UserDataClass, "_id", false, ON_DELETE.CASCADE, types.TEXT)

// MySQL
userID = belongsTo(UserDataClass, "_id", false, ON_DELETE.CASCADE, types.VARCHAR)
```

---

## What's Next

- [Query Builder](../query/intro) — fetch related data using `preload`
- [Migration](../migration/intro) — update your schema as your DataClasses change