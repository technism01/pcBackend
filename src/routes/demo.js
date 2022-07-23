const prisma = require("../helpers/prisma");

const update_profile = async () => {
    await prisma.member.updateMany({
        data: {
            profile: null
        }
    })
}

update_profile();