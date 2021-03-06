const router = require("express").Router();

// * Prisma
const prisma = require("../../helpers/prisma");

// * Data validation
const { addProductValidation } = require("../../helpers/validation");


// * MIDDLEWARE
const { isLoggedIn } = require("../../middlewares/auth");
const catchAsync = require("../../helpers/catchAsync");

router.post('/add', isLoggedIn, catchAsync(async (req, res) => {

    const { error, value } = addProductValidation(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message, data: {} });

    const exists_product = await prisma.product.findFirst({
        where: {
            name: {
                equals: value.name,
                mode: "insensitive"
            }
        }
    })
    if (exists_product) return res.status(409).json({ msg: "This Product already exists", data: {} });

    const addProduct = await prisma.product.create({
        data: value
    });

    res.status(201).json({ msg: 'Product add successful', data: addProduct });
}));

router.get('/filter_product', isLoggedIn, catchAsync(async (req, res, next) => {

    const categoryId = parseInt(req.query.categoryId);
    const subCategoryId = parseInt(req.query.subCategoryId);


    if (!categoryId || !subCategoryId)
        return res.status(400).json({
            msg: `Please Provide Valid categoryId & subCategoryId`,
            data: {},
        });

    const product = await prisma.product.findMany({
        where: {
            categoryId: categoryId,
            subCategoryId: subCategoryId
        },
        orderBy: {
            name: "asc"
        },
        include: {
            Category: true,
            SubCategory: true
        }
    });
    if (product.length == 0) return res.status(404).json({ msg: `Product not found`, data: [] });

    res.status(200).json({ msg: 'Product found successful', data: product });
}));

router.get('/', isLoggedIn, catchAsync(async (req, res, next) => {

    const product = await prisma.product.findMany({
        orderBy: {
            name: "asc"
        },
        include: {
            Category: true,
            SubCategory: true
        }
    });
    if (product.length == 0) return res.status(404).json({ msg: `Product not found`, data: [] });

    res.status(200).json({ msg: 'Product found successful', data: product });
}));

router.delete('/delete/:id', isLoggedIn, catchAsync(async (req, res, next) => {

    const id = parseInt(req.params.id);

    if (!id)
        return res.status(400).json({
            msg: `Please Provide Valid Id`,
            data: {},
        });

    const find_product = await prisma.product.findUnique({
        where: {
            id: id
        }
    });
    if (!find_product) return res.status(404).json({ msg: `Product not found`, data: {} });

    const product = await prisma.product.delete({
        where: {
            id: id
        }
    });

    res.status(200).json({ msg: 'Product delete successful', data: product });
}));



module.exports = router;
