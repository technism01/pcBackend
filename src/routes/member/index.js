const router = require("express").Router();
const fs = require("fs");

// * Prisma
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
    if (req.body.product) {
        req.body.product = JSON.parse(req.body.product)
    }

    const { error, value } = registerMemberValidation(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message, data: {} });

    const ids = value.subCategoryIds
    delete value.subCategoryIds;
    let products = [];
    if (value.product) {
        products = value.product;
        delete value.product;
    }
    // console.log(products);
    const memberExistsNumber = await prisma.member.findFirst({
        where: {
            mobileNumber: value.mobileNumber
        }
    });
    if (memberExistsNumber) return res.status(409).json({ msg: `Number is already registered`, data: {} });

    const addMember = await prisma.member.create({ data: value });

    // ids.map(async (cat) => {
    //     const data = await prisma.memberSubCategory.create({
    //         data: {
    //             memberId: addMember.id,
    //             subCategoryId: cat
    //         }
    //     })
    //     console.log("DATA=> " + data);
    // })
    for (let i = 0; i < ids.length; i++) {

        await prisma.memberSubCategory.create({
            data: {
                memberId: addMember.id,
                subCategoryId: ids[i]
            }
        })

    }
    for (let i = 0; i < products.length; i++) {

        await prisma.my_product.create({
            data: {
                memberId: addMember.id,
                productId: products[i]
            }
        })
    }

    const mySubCategory = await prisma.memberSubCategory.findMany({
        where: {
            memberId: addMember.id
        },
        select: {
            id: true,
            memberId: true,
            subCategoryId: true,
            createdAt: true,
            SubCategory: {
                select: {
                    Category: {
                        select: {
                            id: true
                        }
                    }
                }
            }
        }
        // include: {
        //     SubCategory: {
        //         select: {
        //             id: true,
        //             name: true,
        //             Category: {
        //                 select: {
        //                     id: true,
        //                     name: true
        //                 }
        //             }
        //         }
        //     }
        // }
    })

    for (let i = 0; i < mySubCategory.length; i++) {
        const products = await prisma.my_product.findMany({
            where: {
                memberId: addMember.id,
                Product: {
                    subCategoryId: mySubCategory[i].subCategoryId
                }
            },
            include: {
                Product: true
            }
        })
        let obj = {
            id: mySubCategory[i].id,
            memberId: mySubCategory[i].memberId,
            subCategoryId: mySubCategory[i].subCategoryId,
            categoryId: mySubCategory[i].SubCategory.Category.id,
            createdAt: mySubCategory[i].createdAt,
            product: products
        };
        mySubCategory[i] = obj;

    }


    const token = generateToken(addMember.id);

    res.setHeader('x-authorization', token);
    res.status(201).json({ msg: 'Member register successful', data: addMember, token: token, mySubCategory: mySubCategory });
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
        select: {
            id: true,
            memberId: true,
            subCategoryId: true,
            createdAt: true,
            SubCategory: {
                select: {
                    Category: {
                        select: {
                            id: true
                        }
                    }
                }
            }
        }
        // include: {
        //     SubCategory: {
        //         select: {
        //             id: true,
        //             name: true,
        //             Category: {
        //                 select: {
        //                     id: true,
        //                     name: true
        //                 }
        //             }
        //         }
        //     }
        // }
    })
    for (let i = 0; i < mySubCategory.length; i++) {
        const products = await prisma.my_product.findMany({
            where: {
                memberId: memberLogin.id,
                Product: {
                    subCategoryId: mySubCategory[i].subCategoryId
                }
            },
            include: {
                Product: true
            }
        })

        let obj = {
            id: mySubCategory[i].id,
            memberId: mySubCategory[i].memberId,
            subCategoryId: mySubCategory[i].subCategoryId,
            categoryId: mySubCategory[i].SubCategory.Category.id,
            createdAt: mySubCategory[i].createdAt,
            product: products
        };
        mySubCategory[i] = obj;

    }
    // console.log(addMember);
    const token = generateToken(memberLogin.id);
    // console.log(token);
    res.setHeader('x-authorization', token);
    res.status(200).json({ msg: 'Login successful', data: memberLogin, token: token, mySubCategory: mySubCategory });
}));

router.patch('/update', catchAsync(async (req, res, next) => {


    if (req.files !== null) {
        if (req.files.profile) {
            console.log(req.files.profile);
            const profile_file = req.files.profile;
            const store_file_path = "src/public/member/profile/";
            const concat_file_name = nanoid();
            const new_member_profile = single_file_upload(profile_file, concat_file_name, store_file_path);
            if (new_member_profile) {
                req.body.profile = "member/profile/" + new_member_profile;
            }
        }
    }
    if (req.body.id) req.body.id = parseInt(req.body.id)
    if (req.body.subCategoryIds) {
        req.body.subCategoryIds = JSON.parse(req.body.subCategoryIds)
    }
    if (req.body.product) {
        req.body.product = JSON.parse(req.body.product)
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

    let products = [];
    if (value.product) {
        products = value.product;
        delete value.product;
    }

    if (value.profile && memberData.profile != null) {
        // console.log("hello 1");
        if (fs.existsSync(`src/public/${memberData.profile}`)) {
            fs.unlinkSync(`src/public/${memberData.profile}`);
            console.log("hello");
        }
    }
    // console.log(memberExistsNumber);

    const updateMember = await prisma.member.update({
        where: {
            id: value.id
        },
        data: value
    });
    // console.log(ids);
    if (ids && ids.length > 0) {
        const data = await prisma.memberSubCategory.deleteMany({
            where: {
                memberId: value.id
            }
        })
        // console.log(data);
        for (let i = 0; i < ids.length; i++) {

            await prisma.memberSubCategory.create({
                data: {
                    memberId: value.id,
                    subCategoryId: ids[i]
                }
            })

        }
        await prisma.my_product.deleteMany({
            where: {
                memberId: value.id
            }
        })
        for (let i = 0; i < products.length; i++) {

            await prisma.my_product.create({
                data: {
                    memberId: value.id,
                    productId: products[i]
                }
            })
        }
        // ids.map(async (cat) => {
        //     // const obj = {
        //     //     memberId: value.id,
        //     //     subCategoryId: cat
        //     // }
        //     await prisma.memberSubCategory.create({
        //         data: {
        //             memberId: value.id,
        //             subCategoryId: cat
        //         }
        //     })
        // })
    }
    const mySubCategory = await prisma.memberSubCategory.findMany({
        where: {
            memberId: value.id
        },
        select: {
            id: true,
            memberId: true,
            subCategoryId: true,
            createdAt: true,
            SubCategory: {
                select: {
                    Category: {
                        select: {
                            id: true
                        }
                    }
                }
            }
        }
        // include: {
        //     SubCategory: {
        //         select: {
        //             id: true,
        //             name: true,
        //             Category: {
        //                 select: {
        //                     id: true,
        //                     name: true
        //                 }
        //             }
        //         }
        //     }
        // }
    })
    // console.log("===============================================");
    // console.log(mySubCategory);
    for (let i = 0; i < mySubCategory.length; i++) {
        const products = await prisma.my_product.findMany({
            where: {
                memberId: value.id,
                Product: {
                    subCategoryId: mySubCategory[i].subCategoryId
                }
            },
            include: {
                Product: true
            }
        })
        let obj = {
            id: mySubCategory[i].id,
            memberId: mySubCategory[i].memberId,
            subCategoryId: mySubCategory[i].subCategoryId,
            categoryId: mySubCategory[i].SubCategory.Category.id,
            createdAt: mySubCategory[i].createdAt,
            product: products
        };
        mySubCategory[i] = obj;

    }
    // console.log("===============================================");
    // console.log(mySubCategory);
    res.status(200).json({ msg: 'Member update successful', data: updateMember, mySubCategory: mySubCategory });
}));

router.delete('/delete', isLoggedIn, catchAsync(async (req, res, next) => {


    const memberFind = await prisma.member.findUnique({
        where: {
            id: req.body.id
        }
    });
    if (!memberFind) return res.status(404).json({ msg: `Member not found`, data: {} });

    // console.log(category);
    res.status(200).json({ msg: 'Member found successful', data: member });
}));

router.post('/viewAllMember', isLoggedIn, catchAsync(async (req, res, next) => {

    const memberFind = await prisma.memberSubCategory.findMany({
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
            },
            Member: true
        }
    });
    let newArray = [];
    for (let i = 0; i < memberFind.length; i++) {
        let obj = {};
        if (i == 0) {
            obj = {
                memberId: memberFind[i].Member.id,
                name: memberFind[i].Member.name,
                mobileNumber: memberFind[i].Member.mobileNumber,
                pcGroup: memberFind[i].Member.pcGroup,
                companyName: memberFind[i].Member.companyName,
                SubCategory: [{
                    subCategoryId: memberFind[i].SubCategory.id,
                    name: memberFind[i].SubCategory.name,
                    Category: {
                        categoryId: memberFind[i].SubCategory.Category.id,
                        name: memberFind[i].SubCategory.Category.name,
                    }
                }]
            }
            newArray.push(obj);
        } else {
            let count = 0;
            for (let j = 0; j < newArray.length; j++) {
                if (newArray[j].memberId == memberFind[i].Member.id) {
                    count = 1;
                    newArray[j].SubCategory.push({
                        subCategoryId: memberFind[i].SubCategory.id,
                        name: memberFind[i].SubCategory.name,
                        Category: {
                            categoryId: memberFind[i].SubCategory.Category.id,
                            name: memberFind[i].SubCategory.Category.name,
                        }
                    })
                }
            }
            if (count == 0) {
                obj = {
                    memberId: memberFind[i].Member.id,
                    name: memberFind[i].Member.name,
                    mobileNumber: memberFind[i].Member.mobileNumber,
                    pcGroup: memberFind[i].Member.pcGroup,
                    companyName: memberFind[i].Member.companyName,
                    SubCategory: [{
                        subCategoryId: memberFind[i].SubCategory.id,
                        name: memberFind[i].SubCategory.name,
                        Category: {
                            categoryId: memberFind[i].SubCategory.Category.id,
                            name: memberFind[i].SubCategory.Category.name,
                        }
                    }]
                }
                newArray.push(obj);
            }
        }
    }
    if (newArray.length == 0) return res.status(404).json({ msg: `Member not found`, data: {} });

    // console.log(category);
    res.status(200).json({ msg: 'Member found successful', no_of_member: newArray.length, data: newArray });
}));

router.get('/my_business_transaction/:memberId', isLoggedIn, catchAsync(async (req, res, next) => {

    const id = parseInt(req.params.memberId);

    if (!id)
        return res.status(400).json({
            msg: `Please Provide Valid Id`,
            data: {},
        });

    const member = await prisma.member.findUnique({
        where: {
            id: id
        },
        select: {
            business_given: true,
            business_receive: true
        }
    })
    if (!member) return res.status(404).json({ msg: `Member not found`, data: [] });

    res.status(200).json({ msg: 'Member found successful', data: member });
}));


module.exports = router;
