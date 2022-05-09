const { PrismaClient } = require('@prisma/client');
const chalk = require('chalk');

const prisma = new PrismaClient();

prisma.$use(async (params, next) => {
	const before = Date.now()

	const result = await next(params)

	const after = Date.now()

	console.log(chalk.redBright(`Query ${params.model}.${params.action} took ${after - before}ms`))

	return result
});

module.exports = prisma;
