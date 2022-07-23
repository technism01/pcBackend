const router = require("express").Router();

// * Prisma
const prisma = require("../../helpers/prisma");

// * Data validation
const { } = require("../../helpers/validation");


// * MIDDLEWARE
const { isLoggedIn } = require("../../middlewares/auth");
const catchAsync = require("../../helpers/catchAsync");


router.get('/', isLoggedIn, catchAsync(async (req, res) => {

    
    const notification = await prisma.notification.findMany();
    if (notification.length == 0) return res.status(404).json({ msg: `Notification not found`, data: [] });

    res.status(200).json({ msg: 'Notification found successful', data: notification });
}));

module.exports = router;