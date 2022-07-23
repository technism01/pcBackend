const Joi = require('joi');

// * Member validation
module.exports.registerMemberValidation = (data) => {
	const registerMemberSchema = Joi.object({
		name: Joi.string().min(3).max(50).trim().required(),
		companyName: Joi.string().min(3).required(),
		email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'io'] } }).trim().lowercase(),
		mobileNumber: Joi.string().trim().length(10).pattern(/^[0-9]+$/).messages({ 'string.pattern.base': `Phone number must have 10 digits.` }).required(),
		pcGroup: Joi.string().min(3).required(),
		profile: Joi.string(),
		subCategoryIds: Joi.array().min(1).items(Joi.number()),
		product: Joi.array().items(Joi.number().required())
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
		subCategoryIds: Joi.array().items(Joi.number().required()),
		google_my_business_link: Joi.string(),
		website_link: Joi.string(),
		instagram: Joi.string(),
		facebook: Joi.string(),
		linkedin: Joi.string(),
		product: Joi.array().items(Joi.number().required())

	});

	return updateMemberSchema.validate(data);
};
module.exports.loginMemberValidation = (data) => {
	const loginMemberSchema = Joi.object({
		mobileNumber: Joi.string().trim().length(10).pattern(/^[0-9]+$/).messages({ 'string.pattern.base': `Phone number must have 10 digits.` }).required(),
	});

	return loginMemberSchema.validate(data);
};

// * Category validation 
module.exports.addCategoryValidation = (data) => {
	const addCategorySchema = Joi.object({
		categories: Joi.array().items({ name: Joi.string() }).min(1).required()
	});

	return addCategorySchema.validate(data);
};

// * Sub Category validation 
module.exports.addSubCategoryValidation = (data) => {
	const addSubCategorySchema = Joi.object({
		subCategories: Joi.array().min(1).items({ categoryId: Joi.number(), name: Joi.string() }).required()
	});

	return addSubCategorySchema.validate(data);
};
// * Request validation 
module.exports.addRequestValidation = (data) => {
	const addRequestSchema = Joi.object({
		memberId: Joi.number().required(),
		requests: Joi.array().items({ memberId: Joi.number(), categoryId: Joi.number(), subCategoryId: Joi.number() }).required()
	});

	return addRequestSchema.validate(data);
};
module.exports.myRequestValidation = (data) => {
	const myRequestSchema = Joi.object({
		memberId: Joi.number().required()
	});

	return myRequestSchema.validate(data);
};
module.exports.leadRequestValidation = (data) => {
	const leadRequestSchema = Joi.object({
		memberId: Joi.number().required()
	});

	return leadRequestSchema.validate(data);
};
module.exports.getRequestValidation = (data) => {
	const getRequestSchema = Joi.object({
		memberId: Joi.number().required()
	});

	return getRequestSchema.validate(data);
};

module.exports.addProductValidation = (data) => {
	const addProductSchema = Joi.object({
		memberId: Joi.number().required(),
		name: Joi.string().min(3).max(50).required(),
		categoryId: Joi.number().required(),
		subCategoryId: Joi.number().required()
	});

	return addProductSchema.validate(data);
};

module.exports.addMyProductValidation = (data) => {
	const addMyProductSchema = Joi.object({
		memberId: Joi.number().required(),
		data: Joi.array().items(Joi.object({
			memberId: Joi.number().required(),
			productId: Joi.number().required()
		})).min(1).required()
	});

	return addMyProductSchema.validate(data);
};

module.exports.addNeedValidation = (data) => {
	const addNeedSchema = Joi.object({
		product: Joi.string(),
		priority: Joi.string(),
		categoryId: Joi.number().required(),
		subCategoryId: Joi.number().required(),
		memberId: Joi.number().required(),
	});

	return addNeedSchema.validate(data);
};

module.exports.needCompletedValidation = (data) => {
	const needCompletedSchema = Joi.object({
		leadId: Joi.number().required(),
		amount: Joi.number().required()
	});

	return needCompletedSchema.validate(data);
}

