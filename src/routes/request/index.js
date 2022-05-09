const router = require("express").Router();
const fs = require('fs');

// * Prisma
// const prisma = require("../../../helpers/prisma");
const prisma = require("../../helpers/prisma");

// * Data validation
const { addRequestValidation, myRequestValidation, leadRequestValidation, getRequestValidation } = require("../../helpers/validation");

// * TOKEN
const generateToken = require("../../helpers/generateToken");

// * MIDDLEWARE
const { isLoggedIn } = require("../../middlewares/auth");
const catchAsync = require("../../helpers/catchAsync");
const { nanoid } = require("nanoid");
const { single_file_upload } = require("../../helpers/fileUpload");

router.post('/add', isLoggedIn, catchAsync(async (req, res, next) => {

    const { error, value } = addRequestValidation(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message, data: {} });
    await prisma.request.deleteMany({
        where: {
            memberId: value.memberId
        }
    })
    const addRequest = await prisma.request.createMany({ data: value.requests });

    res.status(201).json({ msg: 'Request successful', data: addRequest });
}));

router.get('/', isLoggedIn, catchAsync(async (req, res, next) => {

    const { error, value } = getRequestValidation(req.query);
    if (error) return res.status(400).json({ msg: error.details[0].message, data: {} });
    const myRequest = await prisma.request.findMany({
        where: {
            memberId: value.memberId
        }
    })
    if (error) return res.status(404).json({ msg: 'My Request not found', data: {} });
    // const addRequest = await prisma.request.createMany({ data: value.requests });

    res.status(200).json({ msg: 'Request successful', data: myRequest });
}));


router.get('/viewRequirement', isLoggedIn, catchAsync(async (req, res, next) => {

    // if(req.query.memberId == "" && req.query.memberId == null) if (error) return res.status(400).json({ msg: 'Member id must be require', data: {} });
    const { error, value } = myRequestValidation(req.query);
    if (error) return res.status(400).json({ msg: error.details[0].message, data: {} });
    console.log(value);
    const array = await prisma.request.findMany({
        where: {
            memberId: parseInt(req.query.memberId)
        },
        include: {
            Category: true,
            SubCategory: true,
        }
    })
    let newArray = [];
    let latestArray = [];
    for (let i = 0; i < array.length; i++) {
        // console.log("hello" + i);
        // console.log(array[i].memberId);
        // if(array[i].memberId == req.query.memberId) {
        // console.log(array[i]);
        let obj = {};
        // console.log("hello" + i+ "if");
        let member = await prisma.memberSubCategory.findMany({
            where: {
                subCategoryId: array[i].subCategoryId,
            },
            include: {
                Member: true
            }
        })
        let memberArray = [];
        for (let j = 0; j < member.length; j++) {
            // console.log(member[j].Member.id);
            if (member[j].Member.id != req.query.memberId) {
                memberArray.push(member[j].Member)
            }
        }
        // console.log(member);
        // console.log("=================");
        if (newArray.length > 0) {
            // console.log("vve" + newArray.length);
            for (v = 0; v < newArray.length; v++) {
                let sameSubCategoryArray = [];
                if (newArray[v].id == array[i].Category.id) {

                    for (let k = 0; k < newArray[v].SubCategory.length; k++) {
                        sameSubCategoryArray.push(newArray[v].SubCategory[k]);
                    }
                    sameSubCategoryArray.push({
                        id: array[i].SubCategory.id,
                        name: array[i].SubCategory.name,
                        Member: memberArray
                    })
                    obj = {
                        id: array[i].Category.id,
                        name: array[i].Category.name,
                        SubCategory: sameSubCategoryArray,
                    }
                    newArray[v] = obj;
                }
            }
        } else {
            obj = {
                id: array[i].Category.id,
                name: array[i].Category.name,
                SubCategory: [{
                    id: array[i].SubCategory.id,
                    name: array[i].SubCategory.name,
                    Member: memberArray
                }],
            }
            newArray.push(obj);
        }
        // console.log(member);
        // console.log("===========================");
        // }
    }
    res.status(200).json({ msg: 'lead found successful', data: newArray });

    // console.log(category);
}));


router.get('/myLead', isLoggedIn, catchAsync(async (req, res, next) => {

    const { error, value } = leadRequestValidation(req.query);
    if (error) return res.status(400).json({ msg: error.details[0].message, data: [] });

    const mySubCategory = await prisma.memberSubCategory.findMany({
        where: {
            memberId: value.memberId
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
    if (mySubCategory.length == 0) return res.status(404).json({ msg: 'Your Sub Category not found', data: [] });
    let newMySubCategory = [];
    for (let i = 0; i < mySubCategory.length; i++) {
        let obj = {};
        if (i == 0) {
            const memberData = await prisma.request.findMany({
                where: {
                    subCategoryId: mySubCategory[i].SubCategory.id
                },
                include: {
                    Member: true
                }
            })
            let member = [];
            memberData.map((mem) => {
                if (value.memberId != mem.Member.id)
                    member.push(mem.Member)
            })
            // console.log(memberData);
            obj = {
                id: mySubCategory[i].SubCategory.Category.id,
                name: mySubCategory[i].SubCategory.Category.name,
                SubCategory: [{
                    id: mySubCategory[i].SubCategory.id,
                    name: mySubCategory[i].SubCategory.name,
                    Member: member
                }]
            }
            newMySubCategory.push(obj);
        } else {
            for (let j = 0; j < newMySubCategory.length; j++) {
                const memberData = await prisma.request.findMany({
                    where: {
                        subCategoryId: mySubCategory[i].SubCategory.id
                    },
                    include: {
                        Member: true
                    }
                })
                let member = [];
                memberData.map((mem) => {
                    if (value.memberId != mem.Member.id)
                    member.push(mem.Member)
                })
                if (newMySubCategory[j].id == mySubCategory[i].SubCategory.Category.id) {
                    newMySubCategory[j].SubCategory.push({
                        id: mySubCategory[i].SubCategory.id,
                        name: mySubCategory[i].SubCategory.name,
                        Member: member
                    })
                } else {
                    obj = {
                        id: mySubCategory[i].SubCategory.Category.id,
                        name: mySubCategory[i].SubCategory.Category.name,
                        SubCategory: [{
                            id: mySubCategory[i].SubCategory.id,
                            name: mySubCategory[i].SubCategory.name,
                            Member: member
                        }]
                    }
                    newMySubCategory.push(obj);
                }
            }

        }
    }

    res.status(200).json({ msg: 'My lead found successful', data: newMySubCategory });
}));



module.exports = router;
