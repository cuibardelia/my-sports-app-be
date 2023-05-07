// For safety reasons, admin has been manually created
// with `userAdminAnyDatabase` rights, a built-in role in MongoDB that has the privileges to perform administrative actions on all databases in the MongoDB deployment, including creating and modifying users, roles, and indexes.
// db.createUser({ user, pwd, roles[]})
// Password has been manually hashed using:
// (async () => {const salt = await bcrypt.genSalt(10); const hashed = await bcrypt.hash(pwd, salt); console.log(hashed);})();
