const router = require("express").Router();

// * Prisma
const prisma = require("../../helpers/prisma");

// * Data validation
const { } = require("../../helpers/validation");


// * MIDDLEWARE
const { isLoggedIn } = require("../../middlewares/auth");
const catchAsync = require("../../helpers/catchAsync");


router.delete('/delete/:leadId', isLoggedIn, catchAsync(async (req, res) => {
    const id = parseInt(req.params.leadId);

    if (!id)
        return res.status(400).json({
            msg: `Please Provide Valid Id`,
            data: {},
        });

    const lead = await prisma.lead.findUnique({
        where: {
            id: id
        }
    })
    if (!lead) return res.status(404).json({ msg: "Lead not found", data: {} })
    const lead_remove = await prisma.lead.delete({
        where: {
            id: id
        }
    })
    res.status(200).json({ msg: "Your Lead deleted successful", data: lead_remove })
}));


router.get('/:memberId', isLoggedIn, catchAsync(async (req, res) => {
    
    const id = parseInt(req.params.memberId);

    if (!id)
        return res.status(400).json({
            msg: `Please Provide Valid Id`,
            data: {},
        });

    const lead = await prisma.memberSubCategory.findMany({
        where: {
            memberId: id
        },
        include: {
            SubCategory : {
                select : {
                    Category: true,
                    name: true,
                    id: true
                }
            }
        }
    })

    if (lead.length == 0) return res.status(404).json({ msg: `Lead not found`, data: [] });
    
    let new_array = [];
    for(let i = 0 ; i < lead.length ; i ++) {
        if(i == 0 ) {
            new_array.push({
                id: lead[i].SubCategory.Category.id,
                name: lead[i].SubCategory.Category.name,
                subCategory: [{
                    id: lead[i].SubCategory.id,
                    name: lead[i].SubCategory.name,
                    member: []
                }]
            })
        } else {
            let check = 0;
            for(let j = 0 ; j < new_array.length ; j ++) {
                if(new_array[j].id == lead[i].SubCategory.Category.id) {
                    new_array[j].subCategory.push({
                        id: lead[i].SubCategory.id,
                        name: lead[i].SubCategory.name,
                        member: []
                    })
                    check = 1;
                }
            }
            if(check == 0) { 
                new_array.push({
                    id: lead[i].SubCategory.Category.id,
                    name: lead[i].SubCategory.Category.name,
                    subCategory: [{
                        id: lead[i].SubCategory.id,
                        name: lead[i].SubCategory.name,
                        member: []
                    }]
                })
            }
        }
    }
    for(let i = 0 ; i < new_array.length ; i ++) {
        for (let j = 0; j < new_array[i].subCategory.length; j++) {
            const lead_member = await prisma.need.findMany({
                where: {
                    AND:[
                        {categoryId: new_array[i].id},
                        {subCategoryId: new_array[i].subCategory[j].id},
                        {status: "Active"}
                    ],
                    NOT: [
                        {memberId: id}
                    ]
                },
                select:{
                    Member: true
                }
            }) 
            let lead = []
            for(let k = 0 ; k < lead_member.length ; k ++) {
                // console.log(lead_member[]);
                lead.push(lead_member[k].Member)
            }
            new_array[i].subCategory[j].member = lead;
        }
    }


    res.status(200).json({ msg: 'Lead found successful', data: new_array });
}));

module.exports = router;