const router = require("express").Router();
const fs = require('fs');

// * Prisma
// const prisma = require("../../../helpers/prisma");
const prisma = require("../../helpers/prisma");

// * Data validation
const { registerMemberValidation, loginMemberValidation, updateMemberValidation } = require("../../helpers/validation");

// * TOKEN
const generateToken = require("../../helpers/generateToken");

// * MIDDLEWARE
const { isLoggedIn } = require("../../middlewares/auth");
const catchAsync = require("../../helpers/catchAsync");
const { nanoid } = require("nanoid");
const { single_file_upload } = require("../../helpers/fileUpload");

router.post('/signup', catchAsync(async (req, res, next) => {

    if (req.files !== null) {
        if (req.files.profile) {
            const profile_file = req.files.profile;
            const store_file_path = "src/public/member/profile/";
            const concat_file_name = nanoid();
            const new_member_profile = single_file_upload(profile_file, concat_file_name, store_file_path);
            if (new_member_profile) {
                req.body.profile = "member/profile/" + new_member_profile;
            }
        }
    }
    if (req.body.subCategoryIds) {
        req.body.subCategoryIds = JSON.parse(req.body.subCategoryIds)
    }
    const { error, value } = registerMemberValidation(req.body);
    // console.log(value);
    if (error) return res.status(400).json({ msg: error.details[0].message, data: {} });
    // res.end();

    // const { mobile_number, email } = req.body;
    const ids = value.subCategoryIds
    delete value.subCategoryIds;
    const memberExistsNumber = await prisma.member.findFirst({
        where: {
            mobileNumber: value.mobileNumber
        }
    });
    // console.log(memberExistsNumber);
    if (memberExistsNumber) return res.status(409).json({ msg: `Number is already registered`, data: {} });
    const addMember = await prisma.member.create({ data: value });
    ids.map(async (cat) => {
        await prisma.memberSubCategory.create({
            data: {
                memberId: addMember.id,
                subCategoryId: cat
            }
        })
    })
    const mySubCategory = await prisma.memberSubCategory.findMany({
        where: {
            memberId: addMember.id
        },
        include: {
            SubCategory: {
                select: {
                    id: true,
                    name: true,
                    Category: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }
        }
    })
    // console.log(addMember);
    const token = generateToken(addMember.id);
    // console.log(token);
    res.setHeader('x-authorization', token);
    res.status(201).json({ msg: 'Member register successful', data: addMember, token: token, mySubCategory : mySubCategory });
}));

router.post('/login', catchAsync(async (req, res, next) => {

    const { error, value } = loginMemberValidation(req.body);
    // console.log(value);
    if (error) return res.status(400).json({ msg: error.details[0].message, data: {} });
    // res.end();

    // const { mobile_number, email } = req.body;
    const memberLogin = await prisma.member.findFirst({
        where: {
            mobileNumber: value.mobileNumber
        }
    });
    // console.log(memberLogin);
    if (!memberLogin) return res.status(404).json({ msg: `This Number is not registered`, data: {} });

    const mySubCategory = await prisma.memberSubCategory.findMany({
        where: {
            memberId: memberLogin.id
        },
        include: {
            SubCategory: {
                select: {
                    id: true,
                    name: true,
                    Category: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }
        }
    })
    // console.log(addMember);
    const token = generateToken(memberLogin.id);
    // console.log(token);
    res.setHeader('x-authorization', token);
    res.status(200).json({ msg: 'Login successful', data: memberLogin, token: token , mySubCategory: mySubCategory});
}));

router.patch('/update', catchAsync(async (req, res, next) => {


    if (req.files !== null) {
        if (req.files.profile) {
            const profile_file = req.files.profile;
            const store_file_path = "src/public/member/profile/";
            const concat_file_name = nanoid();
            const new_member_profile = single_file_upload(profile_file, concat_file_name, store_file_path);
            if (new_member_profile) {
                req.body.profile = "member/profile/" + new_member_profile;
            }
        }
    }
    // if(req.body.id) req.body.id = parseInt(req.body.id)
    if (req.body.subCategoryIds) {
        req.body.subCategoryIds = JSON.parse(req.body.subCategoryIds)
    }
    const { error, value } = updateMemberValidation(req.body);
    // console.log(value);
    if (error) return res.status(400).json({ msg: error.details[0].message, data: {} });
    // res.end();
    const memberData = await prisma.member.findUnique({
        where: {
            id: value.id
        }
    })
    if (!memberData) return res.status(404).json({ msg: 'Member Data not found', data: {} });
    // const { mobile_number, email } = req.body;
    const ids = value.subCategoryIds
    delete value.subCategoryIds;

    if (memberData.profile != "") {
        if (fs.existsSync(`public/${memberData.profile}`)) {
            fs.unlinkSync(`public/${memberData.profile}`);
        }
    }
    // console.log(memberExistsNumber);

    const updateMember = await prisma.member.update({
        where: { 
            id: value.id 
        },
        data: value
    });
    if (ids) {
        await prisma.memberSubCategory.deleteMany({
            where: {
                memberId: value.memberId
            }
        })
    }
    ids.map(async (cat) => {

        await prisma.memberSubCategory.create({
            data: {
                memberId: value.id,
                subCategoryId: cat
            }
        })
    })
    res.status(200).json({ msg: 'Member register successful', data: updateMember });
}));

// router.get('/', isLoggedIn, catchAsync(async (req, res, next) => {
//     // const { error, value } = deleteServiceValidation(req.body);
//     // if (error) return res.status(400).json({ msg: error.details[0].message, data: {} });

//     const services = await prisma.services.findMany({
//         // select: {
//         // 	name: true,
//         // 	id: true,
//         // 	categoryId: true,
//         // 	subCategoryId: true
//         // }
//         include: {
//             Category: {
//                 select: {
//                     name: true
//                 }
//             },
//             SubCategory: {
//                 select: {
//                     name: true
//                 }
//             }
//         },
//         // select :{
//         // 	id: true,
//         // 	name: true
//         // }
//     });

//     return res.status(200).json({ msg: 'Service found successful', data: services });
// }));

// if (req.files !== null) {
// 	if (req.files.profile_image) {
// 		const profile_image_file = req.files.profile_image;
// 		const store_file_path = "./public/customer/profile/";
// 		const concat_file_name = nanoid();
// 		const new_customer_profile_image = single_file_upload(profile_image_file, concat_file_name, store_file_path);
// 		if (new_customer_profile_image) {
// 			updateObject.profile_image = "customer/profile/" + new_customer_profile_image;
// 		}
// 		// if(guest_find_object[0].guest_profile_image != "") {
// 		// 	if(fs.existsSync(`public/${guest_find_object[0].guest_profile_image}`)) {
// 		// 		fs.unlinkSync(`public/${guest_find_object[0].guest_profile_image}`); 
// 		// 	}
// 		// }
// 	}
// }

module.exports = router;
