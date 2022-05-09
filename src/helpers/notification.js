const admin = require("firebase-admin");

const serviceAccount = require('../public/fcmKeyFile/taxpatra-fedc2-firebase-adminsdk-baknm-152fb5575f.json');

// * Only one time initialization global variable
let isSpecificFunctionAdminInitialised = false;

module.exports.single_push_notification = (fcm_token, title) => {
	// const serviceAccount = require('/src/public/fcmKeyFile/taxpatra-fedc2-firebase-adminsdk-baknm-152fb5575f.json');

	if (!isSpecificFunctionAdminInitialised) {
		admin.initializeApp({
			credential: admin.credential.cert(serviceAccount)
		});
		isSpecificFunctionAdminInitialised = true;
	}

	const registrationToken = fcm_token;

	const message = {
		data: {},
		notification: {
			title: title
		},
		token: registrationToken
	};

	admin.messaging().send(message)
		.then((response) => {
			// Response is a message ID string.
			console.log('Successfully sent message:', response);
		})
		.catch((error) => {
			console.log('Error sending message:', error);
		});


};

module.exports.multi_push_notification = (fcm_token, title) => {
	// // const serviceAccount = require('/src/public/fcmKeyFile/taxpatra-fedc2-firebase-adminsdk-baknm-152fb5575f.json');
	// const fcm = ['eqKRnIHDQmKGt0bD6eutzz:APA91bHfCpV6mEqHTw841yOcvjn6bhhJLVtjdraBS9yHtmiR-mqndZxz6L3FhzaNZGYyJDQ2rT7LNjZg5EXEAojLo7KTcNDQtTRb-qzHEUL76RILL226jyyfG0s-fI_WtzkOcEyGyx2r'];
	if (!isSpecificFunctionAdminInitialised) {
		admin.initializeApp({
			credential: admin.credential.cert(serviceAccount)
		});
		isSpecificFunctionAdminInitialised = true;
	}

	const registrationToken = fcm_token;
	// const registrationToken = fcm;

	const message = {
		data: {},
		notification: {
			title: title
		},
		tokens: registrationToken
	};

	admin.messaging().sendMulticast(message)
		.then((response) => {
			if (response.failureCount > 0) {
				const failedTokens = [];
				response.responses.forEach((resp, idx) => {
					if (!resp.success) {
						failedTokens.push(registrationTokens[idx]);
					}
				});
				console.log('List of tokens that caused failures: ' + failedTokens);
			}
		});
	// .then((response) => {
	// 	// Response is a message ID string.
	// 	console.log('Successfully sent message:', response);
	// })
	// .catch((error) => {
	// 	console.log('Error sending message:', error);
	// });


};

// module.exports.all_push_notification = (fcm_token, title) => {
// 	// const serviceAccount = require('/src/public/fcmKeyFile/taxpatra-fedc2-firebase-adminsdk-baknm-152fb5575f.json');

// 	if (!isSpecificFunctionAdminInitialised) {
// 		admin.initializeApp({
// 			credential: admin.credential.cert(serviceAccount)
// 		});
// 		isSpecificFunctionAdminInitialised = true;
// 	}	

// 	const registrationToken = fcm_token;

// 	const message = {
// 		data: {},
// 		notification: {
// 			title: title
// 		},
// 		token: registrationToken
// 	};

// 	admin.messaging().send(message)
// 		.then((response) => {
// 			// Response is a message ID string.
// 			console.log('Successfully sent message:', response);
// 		})
// 		.catch((error) => {
// 			console.log('Error sending message:', error);
// 		});


// }
