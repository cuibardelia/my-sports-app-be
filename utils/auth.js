const { getConnection } = require('../config/db');
const Admin = require('../schemas/Admin');


const grantRolesToUser = async (email, password) => {
	try {
		const db = getConnection().db;

		const adminDb = db.admin();

		// Find the user based on the email in the admins collection
		const user = await Admin.findOne({ email });

		console.log('userr', user);

		if (!user) {
			console.log('User not found.');
			return;
		}

		// Create the user in the 'admin' database
		await adminDb.command({
			createUser: user.email,
			pwd: password,
			roles: [{ role: 'readWrite', db: 'fitbud' }], // Set appropriate roles
		});

		// Grant additional roles to the user in the 'admin' database
		await adminDb.command({
			grantRolesToUser: user.email,
			roles: [
				{ role: 'userAdminAnyDatabase', db: 'admin' },
				// additional roles?
			],
		});


		console.log('Roles granted to user successfully.');
	} catch (error) {
		console.error('Error granting roles to user:', error);
	}
};

module.exports = grantRolesToUser;
