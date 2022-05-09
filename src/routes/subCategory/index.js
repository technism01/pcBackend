const router = require("express").Router();
const fs = require('fs');

// * Prisma
// const prisma = require("../../../helpers/prisma");
const prisma = require("../../helpers/prisma");

// * Data validation
const { addSubCategoryValidation } = require("../../helpers/validation");

// * TOKEN
const generateToken = require("../../helpers/generateToken");

// * MIDDLEWARE
const { isLoggedIn } = require("../../middlewares/auth");
const catchAsync = require("../../helpers/catchAsync");
const { nanoid } = require("nanoid");
const { single_file_upload } = require("../../helpers/fileUpload");

router.post('/add', isLoggedIn, catchAsync(async (req, res, next) => {

    const { error, value } = addSubCategoryValidation(req.body);
    console.log(error);
    if (error) return res.status(400).json({ msg: error.details[0].message, data: {} });
    console.log(value);
    const addSubCategory = await prisma.subCategory.createMany({ data: value.subCategories });

    res.status(201).json({ msg: 'Sub Category add successful', data: addSubCategory });
}));

router.get('/view', isLoggedIn, catchAsync(async (req, res, next) => {


    // const { mobile_number, email } = req.body;
    const category = await prisma.category.findMany({
        orderBy: {
            name: "asc"
        },
        include:{
            subCategory: {
                orderBy: {
                    name: "asc"
                }
            }
        }
    });
    // console.log(category);
    if (category.length == 0) return res.status(404).json({ msg: `Category not found`, data: [] });
    res.status(200).json({ msg: 'Category SubCategory found successful', data: category });
}));



module.exports = router;
