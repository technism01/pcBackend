const { join } = require('@prisma/client/runtime');
const { string } = require('joi');
const Joi = require('joi');

// // * Admin validation
// module.exports.loginAdminValidation = (data) => {
// 	const loginAdminSchema = Joi.object({
// 		email: Joi.string().lowercase().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'io'] } }).trim().required(),
// 		password: Joi.string().required()
// 	});

// 	return loginAdminSchema.validate(data);
// };
// module.exports.updateAdminValidation = (data) => {
// 	const updateAdminSchema = Joi.object({
// 		id: Joi.number().required(),
// 		email: Joi.string().lowercase().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'io'] } }).trim(),
// 		password: Joi.string()
// 	});

// 	return updateAdminSchema.validate(data);
// };

// * Member validation
module.exports.registerMemberValidation = (data) => {
	const registerMemberSchema = Joi.object({
		name: Joi.string().min(3).max(50).trim().required(),
		companyName: Joi.string().min(3).required(),
		email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'io'] } }).trim().lowercase(),
		mobileNumber: Joi.string().trim().length(10).pattern(/^[0-9]+$/).messages({ 'string.pattern.base': `Phone number must have 10 digits.` }).required(),
		pcGroup: Joi.string().min(3).required(),
		profile: Joi.string(),
		subCategoryIds :Joi.array().min(1).items(Joi.number())
	});

	return registerMemberSchema.validate(data);
};
module.exports.updateMemberValidation = (data) => {
	const updateMemberSchema = Joi.object({
		id: Joi.number().required(),
		name: Joi.string().min(3).max(50).trim(),
		companyName: Joi.string().min(3),
		email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'io'] } }).trim().lowercase(),
		pcGroup: Joi.string().min(3),
		profile: Joi.string(),
		subCategoryIds :Joi.array().min(1).items(Joi.number())
	});

	return updateMemberSchema.validate(data);
};
module.exports.loginMemberValidation= (data) => {
	const loginMemberSchema = Joi.object({
		mobileNumber: Joi.string().trim().length(10).pattern(/^[0-9]+$/).messages({ 'string.pattern.base': `Phone number must have 10 digits.` }).required(),
	});

	return loginMemberSchema.validate(data);
};

// * Category validation 
module.exports.addCategoryValidation =(data) =>{
	const addCategorySchema = Joi.object({
		categories : Joi.array().items({name: Joi.string()}).min(1).required()
	});

	return addCategorySchema.validate(data);
};

// * Sub Category validation 
module.exports.addSubCategoryValidation =(data) =>{
	const addSubCategorySchema = Joi.object({
		subCategories : Joi.array().min(1).items({categoryId: Joi.number(), name: Joi.string()}).required()
	});

	return addSubCategorySchema.validate(data);
};
// * Request validation 
module.exports.addRequestValidation =(data) =>{
	const addRequestSchema = Joi.object({
		memberId:Joi.number().required(),
		requests : Joi.array().min(1).items({memberId: Joi.number(), categoryId: Joi.number(), subCategoryId: Joi.number()}).required()
	});

	return addRequestSchema.validate(data);
};
module.exports.myRequestValidation =(data) =>{
	const myRequestSchema = Joi.object({
		memberId:Joi.number().required()
	});

	return myRequestSchema.validate(data);
};
module.exports.leadRequestValidation =(data) =>{
	const leadRequestSchema = Joi.object({
		memberId:Joi.number().required()
	});

	return leadRequestSchema.validate(data);
};
module.exports.getRequestValidation =(data) =>{
	const getRequestSchema = Joi.object({
		memberId:Joi.number().required()
	});

	return getRequestSchema.validate(data);
};
////////////////////////////////////////////////////////////////////////////////////////////////////////
// module.exports.loginCustomerValidation = (data) => {
// 	const loginUserSchema = Joi.object({
// 		mobile_number: Joi.string().length(10).pattern(/^[0-9]+$/).messages({ 'string.pattern.base': `Phone number must have 10 digits.` }).required(),
// 	});

// 	return loginUserSchema.validate(data);
// };

// module.exports.updateCustomerValidation = (data) => {
// 	const updateUserSchema = Joi.object({
// 		id: Joi.number().required(),
// 		name: Joi.string().min(3).max(30),
// 		email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'io'] } }),
// 		date_of_birth: Joi.date(),
// 		profile_image: Joi.string(),
// 		gender: Joi.string().lowercase().valid('male').valid('female').valid('other'),
// 		house_no: Joi.string(),
// 		street_address: Joi.string().min(3).max(50),
// 		city: Joi.string().min(3).max(20),
// 		state: Joi.string().min(3).max(20),
// 		pincode: Joi.string().length(6),
// 		profile_image: Joi.string(),
// 		is_active: Joi.boolean(),

// 	});

// 	return updateUserSchema.validate(data);
// };

// module.exports.deleteCustomerValidation = (data) => {
// 	const deleteUserSchema = Joi.object({
// 		id: Joi.number().required(),
// 	});

// 	return deleteUserSchema.validate(data);
// };

// module.exports.fcmCustomerValidation = (data) => {
// 	const fcmCustomerSchema = Joi.object({
// 		id: Joi.number().required(),
// 		fcmToken : Joi.string().required(),
// 	});

// 	return fcmCustomerSchema.validate(data);
// };


// // * Icon Validation
// module.exports.addIconValidation = (data) => {
// 	const addIconSchema = Joi.object({
// 		path: Joi.string().required()
// 	});
// 	return addIconSchema.validate(data);
// };
// module.exports.deleteIconValidation = (data) => {
// 	const addIconSchema = Joi.object({
// 		id: Joi.number().required()
// 	});
// 	return addIconSchema.validate(data);
// };

// // * Category validation
// module.exports.addCategoryValidation = (data) => {
// 	const addCategorySchema = Joi.object({
// 		name: Joi.string().min(3).max(40).required(),
// 		icon: Joi.string().required()
// 	});

// 	return addCategorySchema.validate(data);
// };

// module.exports.singleCategoryValidation = (data) => {
// 	const singleCategorySchema = Joi.object({
// 		id: Joi.number().required()
// 	});
// 	return singleCategorySchema.validate(data);
// };

// module.exports.updateCategoryValidation = (data) => {
// 	const updateCategorySchema = Joi.object({
// 		id: Joi.number().required(),
// 		name: Joi.string().min(3).max(20).trim().required(),
// 		icon: Joi.string()
// 	});
// 	return updateCategorySchema.validate(data);
// };

// module.exports.deleteCategoryValidation = (data) => {
// 	const deleteCategorySchema = Joi.object({
// 		id: Joi.number().required(),
// 	});

// 	return deleteCategorySchema.validate(data);
// };


// // * Sub Category validation
// module.exports.addSubCategoryValidation = (data) => {
// 	const addSubCategorySchema = Joi.object({
// 		categoryId: Joi.number().required(),
// 		name: Joi.string().min(3).max(40).trim().required()
// 	});

// 	return addSubCategorySchema.validate(data);
// };
// module.exports.categoryWiseSubCategoryValidation = (data) => {
// 	const categoryWiseSubCategorySchema = Joi.object({
// 		id: Joi.number().required()
// 	});
// 	return categoryWiseSubCategorySchema.validate(data);
// };

// module.exports.deleteSubCategoryValidation = (data) => {
// 	const deleteCategorySchema = Joi.object({
// 		id: Joi.number().required(),
// 	});

// 	return deleteCategorySchema.validate(data);
// };


// //  * Services validation 
// module.exports.addServicesValidation = (data) => {
// 	const addServicesSchema = Joi.object({
// 		categoryId: Joi.number().required(),
// 		subCategoryId: Joi.number().required(),
// 		name: Joi.string().min(3).max(40).trim().required(),
// 		icon: Joi.string().required(),
// 		service_image: Joi.string(),
// 		service_total_amount: Joi.number().required(),
// 		service_token_amount: Joi.number(),
// 		overview: Joi.object().keys({description: Joi.string().required(),duration: Joi.string().required(),penalty: Joi.string().required()}),
// 		benefits: Joi.array(),
// 		document: Joi.array(), //.items(Joi.string().trim())
// 		deliverable: Joi.array(),
// 	});

// 	return addServicesSchema.validate(data);
// };
// module.exports.getServicesValidation = (data) => {
// 	const deleteCategorySchema = Joi.object({
// 		categoryId: Joi.number().required(),
// 		subCategoryId: Joi.number().required()
// 	});

// 	return deleteCategorySchema.validate(data);
// };

// module.exports.getSingleServiceValidation = (data) => {
// 	const getSingleServiceSchema = Joi.object({
// 		id: Joi.number().required()
// 	});
// 	return getSingleServiceSchema.validate(data);
// };

// module.exports.updateServiceValidation = (data) => {
// 	const updateServiceSchema = Joi.object({
// 		id: Joi.number().required(),
// 		// categoryId: Joi.number().required(),
// 		// subCategoryId: Joi.number().required(),
// 		name: Joi.string().min(3).max(40).trim(),
// 		icon: Joi.string(),
// 		service_image: Joi.string(),
// 		service_total_amount: Joi.number(),
// 		service_token_amount: Joi.number(),
// 		overview: Joi.object().keys({description: Joi.string().required(),duration: Joi.string().required(),penalty: Joi.string().required()}),
// 		benefits: Joi.array(),
// 		document: Joi.array(), //.items(Joi.string().trim())
// 		deliverable: Joi.array(),
// 	});

// 	return updateServiceSchema.validate(data);
// };

// module.exports.deleteServiceValidation = (data) => {
// 	const deleteServiceSchema = Joi.object({
// 		id: Joi.number().required()
// 	});
// 	return deleteServiceSchema.validate(data);
// };


// //  * Report validation 
// module.exports.addReportValidation = (data) => {
// 	const addReportSchema = Joi.object({
// 		customerId: Joi.number().required(),
// 		title: Joi.string().min(3).max(50).trim().required(),
// 		data: Joi.string().trim().min(10).required(),
// 		file: Joi.string()
// 	});

// 	return addReportSchema.validate(data);
// };
// module.exports.customerReportValidation = (data) => {
// 	const customerReportSchema = Joi.object({
// 		id: Joi.number().required()
// 	});

// 	return customerReportSchema.validate(data);
// };
// module.exports.updateReportValidation = (data) => {
// 	const updateReportSchema = Joi.object({
// 		id: Joi.number().required(),
// 		status: Joi.string().valid('InProgress').valid('Closed')
// 	});

// 	return updateReportSchema.validate(data);
// };

// // *  Notification Validation
// module.exports.addNotificationValidation = (data) => {
// 	const addNotificationSchema = Joi.object({
// 		title: Joi.string().required(),
// 		forAll: Joi.bool().required(),
// 		customerIds: Joi.array().items(Joi.number()).required()
// 	});
// 	return addNotificationSchema.validate(data);
// };
// module.exports.getCustomerNotificationValidation = (data) => {
// 	const getCustomerNotificationSchema = Joi.object({
// 		id: Joi.number().required()
// 	});
// 	return getCustomerNotificationSchema.validate(data);
// };

// // * BookServices Validation
// module.exports.addBookServicesValidation = (data) => {
// 	const addBookServicesSchema = Joi.object({
// 		customerId: Joi.number().required(),
// 		servicesId: Joi.number().required(),
// 		amount: Joi.number().required(),
// 		book_date: Joi.date().required(),
// 		status: Joi.string().valid('Pending').valid('Accepted').valid('Rejected').valid('InProgress').valid('Completed').required()

// 	});
// 	return addBookServicesSchema.validate(data);
// };
// module.exports.getCustomerBookServicesValidation = (data) => {
// 	const getCustomerBookServicesSchema = Joi.object({
// 		id: Joi.number().required()
// 	});
// 	return getCustomerBookServicesSchema.validate(data);
// };
// module.exports.updateBookServicesValidation = (data) => {
// 	const updateBookServicesSchema = Joi.object({
// 		id: Joi.number().required(),
// 		status: Joi.string()
// 			.valid("Accepted")
// 			.valid("Rejected")
// 			.valid("InProgress")
// 			.valid("Completed")
// 			.valid("Cancelled")
// 			.required(),
// 	});
// 	return updateBookServicesSchema.validate(data);
// };


// // * Blog Validation
// module.exports.addBlogValidation = (data) => {
// 	const addBlogSchema = Joi.object({
// 		category_Name: Joi.string().min(3).max(50).required(),
// 		title: Joi.string().min(3).max(50).required(),
// 		image: Joi.string().required(),
// 		content: Joi.string().required(),
// 		author_name: Joi.string().required()
// 	});
// 	return addBlogSchema.validate(data);
// };
// module.exports.deleteBlogValidation = (data) => {
// 	const deleteBlogSchema = Joi.object({
// 		id: Joi.number().required()
// 	});
// 	return deleteBlogSchema.validate(data);
// };


// // * My Interest Validation
// module.exports.addMyInterestsValidation = (data) => {
// 	const addMyInterestsSchema = Joi.object({
// 		customerId: Joi.number().required(),
// 		servicesId: Joi.number().required()
// 	});
// 	return addMyInterestsSchema.validate(data);
// };

// module.exports.deleteMyInterestsValidation = (data) => {
// 	const deleteMyInterestsSchema = Joi.object({
// 		customerId: Joi.number().required(),
// 		servicesId: Joi.number().required()
// 	});
// 	return deleteMyInterestsSchema.validate(data);
// };

// module.exports.getMyInterestsValidation = (data) => {
// 	const getMyInterestsSchema = Joi.object({
// 		id: Joi.number().required()
// 	});
// 	return getMyInterestsSchema.validate(data);
// };

// // * Dashboard Validation 
// module.exports.addServiceForDashboardValidation = (data) => {
// 	const addServiceForDashboardSchema = Joi.object({
// 		servicesId: Joi.array().items({servicesId: Joi.number().required()}).max(9).required()
// 	});
// 	return addServiceForDashboardSchema.validate(data);
// };
