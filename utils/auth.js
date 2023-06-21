const { getConnection } = require('../config/db');
const Admin = require('../schemas/Admin');


const grantRolesToUser = async (email, password) => {
	try {
		const db = getConnection().db;

		const adminDb = db.admin();
		const user = await Admin.findOne({ email });

		if (!user) {
			console.log('User not found.');
			return;
		}

		await adminDb.command({
			createUser: user.email,
			pwd: password,
			roles: [{ role: 'readWrite', db: 'fitbud' }],
		});

		await adminDb.command({
			grantRolesToUser: user.email,
			roles: [
				{ role: 'userAdminAnyDatabase', db: 'admin' },

			],
		});


		console.log('Roles granted to user successfully.');
	} catch (error) {
		console.error('Error granting roles to user:', error);
	}
};

module.exports = grantRolesToUser;
