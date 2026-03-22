# Validators & Data Transformation

This page covers three things — writing custom validators, transforming data before it gets saved with `beforeValidation` and `afterValidation`, and cross-field validation.

## Custom Validators

Every validator is a function that returns another function. That inner function must return a Promise. This is required because validators often need to make async calls like database lookups.

Classo provides a helper called `functionToPromise` to reduce the boilerplate:

```javascript
const { functionToPromise } = require("classo/utils/functionToPromise")
```

### Simple Validator

Here's a validator that checks whether a value contains spaces:

```javascript
function noSpaceValidator(errorMessage) {
    const validate = (resolve, reject, value) => {
        if (value.indexOf(" ") > -1) {
            resolve({ okay: false, error: errorMessage })
        } else {
            resolve({ okay: true })
        }
    }
    return functionToPromise(validate)
}
```

The inner function receives three arguments:
- `resolve` — call this with `{ okay: true }` if valid, or `{ okay: false, error: "..." }` if not
- `reject` — call this if an unexpected error occurs
- `value` — the field value being validated

Add it to a field like any built-in validator:

```javascript
const { DataClass } = require("classo/dataclasses/base")
const { createField, types } = require("classo/databases/sqlite3")
const { functionToPromise } = require("classo/utils/functionToPromise")

function noSpaceValidator(errorMessage) {
    const validate = (resolve, reject, value) => {
        if (value.indexOf(" ") > -1) {
            resolve({ okay: false, error: errorMessage })
        } else {
            resolve({ okay: true })
        }
    }
    return functionToPromise(validate)
}

class UserDataClass extends DataClass {
    username = createField(types.TEXT, false, false, [
        noSpaceValidator("Username cannot contain spaces")
    ])

    getName() { return "users" }
}
```

### Async Validator

If your validator needs to do something async — like check a database — the structure is the same. Just use `.then()` inside the inner function:

```javascript
function isUsernameAvailable(errorMessage) {
    const validate = (resolve, reject, value) => {
        checkDatabase(value).then(exists => {
            if (exists) {
                resolve({ okay: false, error: errorMessage })
            } else {
                resolve({ okay: true })
            }
        }).catch(error => {
            reject({ error })
        })
    }
    return functionToPromise(validate)
}
```

### Validate Only Selected Fields

Sometimes you only want to validate specific fields — for example when updating a single field. Use `validateOnlyPayload` and pass only the fields you want to check:

```javascript
const user = new UserDataClass()
user.init({ username: "john doe", password: "short" })

// only validates the password field
const result = await user.validateOnlyPayload({ password: "short" })
console.log(result)
```

This is useful for update operations where you don't want to re-validate unchanged fields.

---

## beforeValidation

`beforeValidation` runs as soon as `init()` is called, before any validators run. Use it to transform the incoming value — for example trimming whitespace or normalizing a string.

It must be an async function. It receives the value and must return the transformed value:

```javascript
async function trimWhitespace(value) {
    return value.trim()
}

class UserDataClass extends DataClass {
    username = createField(types.TEXT, false, false, [
        is_required("Username is required")
    ], trimWhitespace) // beforeValidation is the 5th parameter

    getName() { return "users" }
}
```

After `init()` runs, `form_data` will contain the trimmed value — the validators then run against the transformed value.

---

## afterValidation

`afterValidation` runs when you call `transformValidateDataToBeSaved()`. Use it to transform data before saving — the most common use case is hashing a password.

It must be an async function. It receives the validated value and returns the transformed value:

```javascript
const bcrypt = require("bcrypt")

async function hashPassword(value) {
    return await bcrypt.hash(value, 10)
}

class UserDataClass extends DataClass {
    password = createField(types.TEXT, false, false, [
        is_required("Password is required"),
        minLength(8, "Password must be at least 8 characters")
    ], null, hashPassword) // afterValidation is the 6th parameter

    getName() { return "users" }
}
```

To get the transformed data, call `transformValidateDataToBeSaved` with the original payload after validation passes:

```javascript
const user = new UserDataClass()
const payload = { password: "mysecretpassword" }
user.init(payload)

const validationResult = await user.validate()

if (validationResult.data.okay) {
    // password is now hashed
    const dataToSave = await user.transformValidateDataToBeSaved(payload)
    await db.createObject(UserDataClass, dataToSave)
}
```

`afterValidation` does not change `form_data` — it returns a new object with the transformed values.

---

## Cross-Field Validation

Sometimes you need to validate two fields against each other — for example making sure the username and password are not the same. Override `validationAllData` on your DataClass:

```javascript
class UserDataClass extends DataClass {
    username = createField(types.TEXT, false, false, [
        is_required("Username is required")
    ])

    password = createField(types.TEXT, false, false, [
        is_required("Password is required"),
        minLength(8, "Password must be at least 8 characters")
    ])

    async validationAllData() {
        const payload = this['form_data']
        if (payload['username'] === payload['password']) {
            return { okay: false, error: "Username and password cannot be the same" }
        }
        return { okay: true }
    }

    getName() { return "users" }
}
```

`validationAllData` runs automatically after all field validators pass when you call `validate()`. You can access the full payload via `this['form_data']`. Return `{ okay: true }` to pass or `{ okay: false, error: "..." }` to fail.

---

## What's Next

- [Database CRUD](../sqlite3/database_crud) — save validated data to a database
- [Relations](../relations/intro) — define relations between DataClasses