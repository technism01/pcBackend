const router = require("express").Router();
const fs = require('fs');

// * Prisma
// const prisma = require("../../../helpers/prisma");
const prisma = require("../../helpers/prisma");

// * Data validation
const { addCategoryValidation } = require("../../helpers/validation");

// * TOKEN
const generateToken = require("../../helpers/generateToken");

// * MIDDLEWARE
const { isLoggedIn } = require("../../middlewares/auth");
const catchAsync = require("../../helpers/catchAsync");
const { nanoid } = require("nanoid");
const { single_file_upload } = require("../../helpers/fileUpload");

router.post('/add', isLoggedIn, catchAsync(async (req, res, next) => {

    const { error, value } = addCategoryValidation(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message, data: {} });

    const addCategory = await prisma.category.createMany({ data: value.categories, skipDuplicates: true });

    res.status(201).json({ msg: 'Category add successful', data: addCategory });
}));

router.get('/view', isLoggedIn, catchAsync(async (req, res, next) => {


    // const { mobile_number, email } = req.body;
    const category = await prisma.category.findMany({
        orderBy: {
            createdAt: "desc"
        }
    });
    // console.log(category);
    if (category.length == 0) return res.status(404).json({ msg: `Category not found`, data: [] });
    res.status(200).json({ msg: 'Category found successful', data: category });
}));

router.get('/category_amount', isLoggedIn, catchAsync(async (req, res, next) => {

    const category = await prisma.category.findMany({
        orderBy: {
            total_amount: "asc"
        },
        select: {
            name: true,
            total_amount: true
        }
    });
    if (category.length == 0) return res.status(404).json({ msg: `Category not found`, data: [] });

    const total_amount = await prisma.category.aggregate({
        _sum: {
            total_amount: true
        }
    })

    const data = {
        total_amount: total_amount._sum.total_amount,
        categories: category
    }
    res.status(200).json({ msg: 'Category found successful', data: data });
}));

router.delete('/delete', isLoggedIn, catchAsync(async (req, res, next) => {


    const categoryFind = await prisma.category.findUnique({
        where: {
            id: req.body.id
        }
    });
    if (!categoryFind) return res.status(404).json({ msg: `Category not found`, data: {} });

    const category = await prisma.category.delete({
        where: {
            id: req.body.id
        }
    });
    // console.log(category);
    res.status(200).json({ msg: 'Category delete successful', data: category });
}));



module.exports = router;
