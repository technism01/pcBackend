const router = require("express").Router();

// * Prisma
const prisma = require("../../helpers/prisma");

// * Data validation
const { addNeedValidation, needCompletedValidation } = require("../../helpers/validation");


// * MIDDLEWARE
const { isLoggedIn } = require("../../middlewares/auth");
const catchAsync = require("../../helpers/catchAsync");

router.post('/add', isLoggedIn, catchAsync(async (req, res) => {

    const { error, value } = addNeedValidation(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message, data: {} });

    const existsNeed = await prisma.need.findFirst({
        where: {
            memberId: value.memberId,
            subCategoryId: value.subCategoryId,
            categoryId: value.categoryId,
            product: value.product,
            status: "Active"
        }
    })
    if (existsNeed) return res.status(409).json({ msg: "This Need already exists in your profile", data: {} })

    const addNeed = await prisma.need.create({
        data: value
    });
    const forLeadMember = await prisma.memberSubCategory.findMany({
        where: {
            subCategoryId: value.subCategoryId,
            NOT: {
                memberId: value.memberId
            }
        }
    })
    let new_array = [];
    for (let i = 0; i < forLeadMember.length; i++) {
        const obj = {
            needId: addNeed.id,
            memberId: forLeadMember[i].memberId
        }
        new_array.push(obj);
    }
    await prisma.lead.createMany({
        data: new_array
    })

    res.status(201).json({ msg: 'Need add successful', data: addNeed });
}));
router.delete('/cancel/:needId', isLoggedIn, catchAsync(async (req, res) => {
    const id = parseInt(req.params.needId);

    if (!id)
        return res.status(400).json({
            msg: `Please Provide Valid Id`,
            data: {},
        });


    const need = await prisma.need.findUnique({
        where: {
            id: id
        }
    })
    if (!need) return res.status(404).json({ msg: "Need not found", data: {} })
    const need_remove = await prisma.need.delete({
        where: {
            id: id
        }
    })
    res.status(200).json({ msg: "Your Need deleted successful", data: need_remove })
}));

router.post('/need_completed', isLoggedIn, catchAsync(async (req, res) => {

    //! need ma status update
    //! lead status update
    //! lead ma delete other lead
    //! category ma amount update 
    // !Notification add
    const { error, value } = needCompletedValidation(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message, data: {} });

    const lead = await prisma.lead.findFirst({
        where: {
            id: value.leadId,
            status: "Active"
        },
        // include: {
        //     Member: true,
        //     Need: {
        //         select : {
        //             Category: true,
        //             SubCategory: true,
        //             Member: true,
        //             product: true
        //         }
        //     }
        // }
        select: {
            id: true,
            Member: true,
            Need: {
                select: {
                    Member: true,
                    Category: true,
                    SubCategory: true,
                    product: true,
                    priority: true,
                    id: true
                }
            }
        }
    })
    if (!lead) return res.status(404).json({ msg: "Lead not found", data: {} })

    const entry_data = await prisma.notification.create({
        data: {
            leadMember: lead.Member,
            needMember: lead.Need.Member,
            amount: value.amount
        }
    })
    await prisma.need.update({
        where: {
            id: lead.Need.id
        },
        data: {
            status: "Completed"
        }
    })
    await prisma.lead.update({
        where: {
            id: value.leadId
        },
        data: {
            status: "Completed"
        }
    })
    await prisma.lead.deleteMany({
        where: {
            AND: [
                { needId: lead.Need.id },
                { status: "Active" }
            ]
        }
    })
    await prisma.category.update({
        where: {
            id: lead.Need.Category.id
        },
        data: {
            total_amount: {
                increment: value.amount
            }
        }
    })
    await prisma.member.update({
        where: {
            id: lead.Member.id
        },
        data: {
            business_receive: {
                increment: value.amount
            }
        }
    })
    await prisma.member.update({
        where: {
            id: lead.Need.Member.id
        },
        data: {
            business_given: {
                increment: value.amount
            }
        }
    })
    res.status(200).json({ msg: "Congratulation for your transaction", data: entry_data })
}));

/**
 * @_My_Need
 * @params_memberId
 */
router.get('/:memberId', isLoggedIn, catchAsync(async (req, res) => {

    const id = parseInt(req.params.memberId);

    if (!id)
        return res.status(400).json({
            msg: `Please Provide Valid Id`,
            data: {},
        });

    const need = await prisma.need.findMany({
        where: {
            AND: [
                { memberId: id },
                { status: "Active" }
            ]
        },
        include: {
            Category: true,
            SubCategory: true,
            Lead: {
                select: {
                    Member: true,
                    id: true
                }
            }
        }
    });

    for (let i = 0; i < need.length; i++) {
        for (let j = 0; j < need[i].Lead.length; j++) {
            const data = await prisma.memberSubCategory.findMany({
                where: {
                    memberId: need[i].Lead[j].Member.id
                },
                select: {
                    SubCategory: {
                        select: {
                            id: true,
                            name: true,
                            Category: true
                        }
                    }
                }
            })

            let memberCategory = [];
            for (let v = 0; v < data.length; v++) {

                const pro = await prisma.my_product.findMany({
                    where: {
                        AND: [
                            { memberId: need[i].Lead[j].Member.id },
                            {
                                Product: {
                                    categoryId: data[v].SubCategory.Category.id,
                                    subCategoryId: data[v].SubCategory.id
                                }
                            }
                        ]
                    },
                    select: {
                        Product: true
                    }
                })

                if (v == 0) {
                    memberCategory.push({
                        id: data[v].SubCategory.Category.id,
                        name: data[v].SubCategory.Category.name,
                        subCategory: [{
                            id: data[v].SubCategory.id,
                            name: data[v].SubCategory.name,
                            product: pro
                        }]
                    })
                } else {
                    let check = 0;
                    for (let d = 0; d < memberCategory.length; d++) {
                        if (memberCategory[d].id == data[v].SubCategory.Category.id) {
                            memberCategory[d].subCategory.push({
                                id: data[v].SubCategory.id,
                                name: data[v].SubCategory.name,
                                product: pro
                            })
                            check = 1;
                        }
                    }
                    if (check == 0) {
                        memberCategory.push({
                            id: data[v].SubCategory.Category.id,
                            name: data[v].SubCategory.Category.name,
                            subCategory: [{
                                id: data[v].SubCategory.id,
                                name: data[v].SubCategory.name,
                                product: pro
                            }]
                        })
                    }
                }
            }
            need[i].Lead[j].Member.category = memberCategory;

        }
    }
    if (need.length == 0) return res.status(404).json({ msg: `Need not found`, data: [] });

    res.status(200).json({ msg: 'Need found successful', data: need });
}));



module.exports = router;
