const router = require("express").Router();

// * Prisma
const prisma = require("../../helpers/prisma");

// * Data validation
const { addMyProductValidation } = require("../../helpers/validation");


// * MIDDLEWARE
const { isLoggedIn } = require("../../middlewares/auth");
const catchAsync = require("../../helpers/catchAsync");

router.post('/add', isLoggedIn, catchAsync(async (req, res) => {

    const { error, value } = addMyProductValidation(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message, data: {} });

    await prisma.my_product.deleteMany({
        where: {
            memberId: value.memberId
        }
    })
    delete value.memberId;

    const addProduct = await prisma.my_product.createMany({
        data: value.data,
        skipDuplicates: true
    });

    res.status(201).json({ msg: 'Product add successful', data: addProduct });
}));

router.get('/:memberId', isLoggedIn, catchAsync(async (req, res, next) => {

    const memberId = parseInt(req.params.memberId);

    if (!memberId)
        return res.status(400).json({
            msg: `Please Provide Valid memberId`,
            data: {},
        });

    const product = await prisma.my_product.findMany({
        where: {
            memberId: memberId
        },
        include: {
            Product: {
                select: {
                    name: true,
                    Category: {
                        select: {
                            name: true
                        }
                    },
                    SubCategory: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    });
    if (product.length == 0) return res.status(404).json({ msg: `Product not found`, data: [] });

    res.status(200).json({ msg: 'Product found successful', data: product });
}));

router.delete('/delete/:my_product_id', isLoggedIn, catchAsync(async (req, res, next) => {

    const my_product_id = parseInt(req.params.my_product_id);

    if (!my_product_id)
        return res.status(400).json({
            msg: `Please Provide Valid memberId`,
            data: {},
        });


    const productFind = await prisma.my_product.findUnique({
        where : {
            id: my_product_id
        }
    });
    if (!productFind) return res.status(404).json({ msg: `Product not found`, data: {} });
    
    const my_product = await prisma.my_product.delete({
        where : {
            id: my_product_id
        }
    });
    res.status(200).json({ msg: 'Product delete successful', data: my_product });
}));


module.exports = router;
