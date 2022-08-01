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
            SubCategory: {
                select: {
                    Category: true,
                    name: true,
                    id: true
                }
            }
        }
    })

    if (lead.length == 0) return res.status(404).json({ msg: `Lead not found`, data: [] });

    let new_array = [];
    for (let i = 0; i < lead.length; i++) {
        if (i == 0) {
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
            for (let j = 0; j < new_array.length; j++) {
                if (new_array[j].id == lead[i].SubCategory.Category.id) {
                    new_array[j].subCategory.push({
                        id: lead[i].SubCategory.id,
                        name: lead[i].SubCategory.name,
                        member: []
                    })
                    check = 1;
                }
            }
            if (check == 0) {
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
    for (let i = 0; i < new_array.length; i++) {
        for (let j = 0; j < new_array[i].subCategory.length; j++) {
            console.log(`Category_id => ${new_array[i].id}`);
            console.log(`Sub_Category_id => ${new_array[i].subCategory[j].id}`);
            const member = await prisma.lead.findMany({
                where: {
                    memberId: id,
                    status: "Active",
                    Need: {
                        categoryId: new_array[i].id,
                        subCategoryId: new_array[i].subCategory[j].id
                    }
                },
                select: {
                    id: true,
                    status: true,
                    Need: {
                        select: {
                            Member: true,
                            priority: true,
                            product: true,

                        }
                    }
                }
            })
            let member_array = [];
            for (let v = 0; v < member.length; v++) {

                const member_category_sub_category_product = await prisma.memberSubCategory.findMany({
                    where: {
                        memberId: member[v].Need.Member.id
                    },
                    select: {
                        SubCategory: {
                            select: {
                                id: true,
                                name: true,
                                Category: true,
                            }
                        },
                    }
                })
                //  TODO: this for loop refactor
                let memberCategory = [];
                for (let k = 0; k < member_category_sub_category_product.length; k ++) {


                    const pro = await prisma.my_product.findMany({
                        where: {
                            AND: [
                                { memberId: member[v].Need.Member.id },
                                {
                                    Product: {
                                        categoryId: member_category_sub_category_product[k].SubCategory.Category.id,
                                        subCategoryId: member_category_sub_category_product[k].SubCategory.id
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
                            id: member_category_sub_category_product[k].SubCategory.Category.id,
                            name: member_category_sub_category_product[k].SubCategory.Category.name,
                            subCategory: [{
                                id: member_category_sub_category_product[k].SubCategory.id,
                                name: member_category_sub_category_product[k].SubCategory.name,
                                product: pro
                            }]
                        })
                    } else {
                        let check = 0;
                        for (let d = 0; d < memberCategory.length; d++) {
                            if (memberCategory[d].id == member_category_sub_category_product[k].SubCategory.Category.id) {
                                memberCategory[d].subCategory.push({
                                    id: member_category_sub_category_product[k].SubCategory.id,
                                    name: member_category_sub_category_product[k].SubCategory.name,
                                    product: pro
                                })
                                check = 1;
                            }
                        }
                        if (check == 0) {
                            memberCategory.push({
                                id: member_category_sub_category_product[k].SubCategory.Category.id,
                                name: member_category_sub_category_product[k].SubCategory.Category.name,
                                subCategory: [{
                                    id: member_category_sub_category_product[k].SubCategory.id,
                                    name: member_category_sub_category_product[k].SubCategory.name,
                                    product: pro
                                }]
                            })
                        }
                    }
                }


                member_array.push({
                    leadId: member[v].id,
                    id: member[v].Need.Member.id,
                    name: member[v].Need.Member.name,
                    mobileNumber: member[v].Need.Member.mobileNumber,
                    pcGroup: member[v].Need.Member.pcGroup,
                    companyName: member[v].Need.Member.companyName,
                    email: member[v].Need.Member.email,
                    profile: member[v].Need.Member.profile,
                    google_my_business_link: member[v].Need.Member.google_my_business_link,
                    website_link: member[v].Need.Member.website_link,
                    instagram: member[v].Need.Member.instagram,
                    facebook: member[v].Need.Member.facebook,
                    linkedin: member[v].Need.Member.linkedin,
                    business_given: member[v].Need.Member.business_given,
                    business_receive: member[v].Need.Member.business_receive,
                    createdAt: member[v].Need.Member.createdAt,
                    priority: member[v].Need.priority,
                    product: member[v].Need.product,
                    category: memberCategory
                })
            }
            new_array[i].subCategory[j].member = member_array
        }
    }


    res.status(200).json({ msg: 'Lead found successful', data: new_array });
}));
// router.get('/:memberId', isLoggedIn, catchAsync(async (req, res) => {

//     const id = parseInt(req.params.memberId);

//     if (!id)
//         return res.status(400).json({
//             msg: `Please Provide Valid Id`,
//             data: {},
//         });

//     const lead = await prisma.memberSubCategory.findMany({
//         where: {
//             memberId: id
//         },
//         include: {
//             SubCategory: {
//                 select: {
//                     Category: true,
//                     name: true,
//                     id: true
//                 }
//             }
//         }
//     })

//     if (lead.length == 0) return res.status(404).json({ msg: `Lead not found`, data: [] });

//     let new_array = [];
//     for (let i = 0; i < lead.length; i++) {
//         if (i == 0) {
//             new_array.push({
//                 id: lead[i].SubCategory.Category.id,
//                 name: lead[i].SubCategory.Category.name,
//                 subCategory: [{
//                     id: lead[i].SubCategory.id,
//                     name: lead[i].SubCategory.name,
//                     member: []
//                 }]
//             })
//         } else {
//             let check = 0;
//             for (let j = 0; j < new_array.length; j++) {
//                 if (new_array[j].id == lead[i].SubCategory.Category.id) {
//                     new_array[j].subCategory.push({
//                         id: lead[i].SubCategory.id,
//                         name: lead[i].SubCategory.name,
//                         member: []
//                     })
//                     check = 1;
//                 }
//             }
//             if (check == 0) {
//                 new_array.push({
//                     id: lead[i].SubCategory.Category.id,
//                     name: lead[i].SubCategory.Category.name,
//                     subCategory: [{
//                         id: lead[i].SubCategory.id,
//                         name: lead[i].SubCategory.name,
//                         member: []
//                     }]
//                 })
//             }
//         }
//     }
//     for (let i = 0; i < new_array.length; i++) {
//         for (let j = 0; j < new_array[i].subCategory.length; j++) {
//             const lead_member = await prisma.need.findMany({
//                 where: {
//                     AND: [
//                         { categoryId: new_array[i].id },
//                         { subCategoryId: new_array[i].subCategory[j].id },
//                         { status: "Active" }
//                     ],
//                     NOT: [
//                         { memberId: id }
//                     ],

//                 },
//                 select: {
//                     id: true,
//                     Member: true,
//                     memberId: true,
//                     priority: true,
//                     product: true
//                 }
//             })
//             console.log("lead_member=> ",lead_member);
//             // console.log(lead_member);
//             let lead = []
//             for (let k = 0; k < lead_member.length; k++) {
//                 // * for member according category -> subCategory -> products start 
//                 const data = await prisma.memberSubCategory.findMany({
//                     where: {
//                         memberId: lead_member[k].Member.id
//                     },
//                     select: {
//                         SubCategory: {
//                             select: {
//                                 id: true,
//                                 name: true,
//                                 Category: true
//                             }
//                         }
//                     }
//                 })

//                 let memberCategory = [];
//                 for (let v = 0; v < data.length; v++) {


//                     const pro = await prisma.my_product.findMany({
//                         where: {
//                             AND: [
//                                 { memberId: lead_member[k].Member.id },
//                                 {
//                                     Product: {
//                                         categoryId: data[v].SubCategory.Category.id,
//                                         subCategoryId: data[v].SubCategory.id
//                                     }
//                                 }
//                             ]
//                         },
//                         select: {
//                             Product: true
//                         }
//                     })

//                     if (v == 0) {
//                         memberCategory.push({
//                             id: data[v].SubCategory.Category.id,
//                             name: data[v].SubCategory.Category.name,
//                             subCategory: [{
//                                 id: data[v].SubCategory.id,
//                                 name: data[v].SubCategory.name,
//                                 product: pro
//                             }]
//                         })
//                     } else {
//                         let check = 0;
//                         for (let d = 0; d < memberCategory.length; d++) {
//                             if (memberCategory[d].id == data[v].SubCategory.Category.id) {
//                                 memberCategory[d].subCategory.push({
//                                     id: data[v].SubCategory.id,
//                                     name: data[v].SubCategory.name,
//                                     product: pro
//                                 })
//                                 check = 1;
//                             }
//                         }
//                         if (check == 0) {
//                             memberCategory.push({
//                                 id: data[v].SubCategory.Category.id,
//                                 name: data[v].SubCategory.Category.name,
//                                 subCategory: [{
//                                     id: data[v].SubCategory.id,
//                                     name: data[v].SubCategory.name,
//                                     product: pro
//                                 }]
//                             })
//                         }
//                     }
//                 }
//                 // * find lead id
//                 // const find_lead_id = await prisma.lead.findFirst({
//                 //     where: {
//                 //         memberId: id,
//                 //         Need: {
//                 //             categoryId: new_array[i].id,
//                 //             subCategoryId: new_array[i].subCategory[j].id,
//                 //             memberId: lead_member[k].memberId
//                 //         }
//                 //     }
//                 // })
//                 // const need_id_find = await prisma.need.findFirst({
//                 //     where: {
//                 //         status: "Active",
//                 //         categoryId: new_array[i].id,
//                 //         subCategoryId: new_array[i].subCategory[j].id,
//                 //         memberId: lead_member[k].memberId
//                 //     }
//                 // })
//                 // console.log(`need_id_find.id => ${need_id_find.id}`);
//                 // console.log(`id => ${id}`);
//                 const find_lead_id = await prisma.lead.findFirst({
//                     where: {
//                         memberId: id,
//                         status: "Active",
//                         // needId: need_id_find.id
//                         needId: lead_member[k].id
//                     }
//                 })
//                 console.log("find_lead_id => ",find_lead_id);
//                 lead_member[k].Member.category = memberCategory;
//                 lead_member[k].Member.priority = lead_member[k].priority;
//                 lead_member[k].Member.product = lead_member[k].product;
//                 // lead_member[k].Member.leadId = find_lead_id.id;
//                 // * for member according category -> subCategory -> products start
//                 lead.push(lead_member[k].Member)
//             }
//             new_array[i].subCategory[j].member = lead;
//         }
//     }


//     res.status(200).json({ msg: 'Lead found successful', data: new_array });
// }));

module.exports = router;