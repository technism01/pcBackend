const aws = require("aws-sdk");

const crypto = require("crypto");
const { promisify } = require("util");

const randomBytes = promisify(crypto.randomBytes);

const region = "us-west-2";
const bucketName = "pcbackendbucket";
const accessKeyId = "AKIA4N4ZABISXN7EFVEF";
const secretAccessKey = "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";

const s3 = new aws.S3({
	region,
	accessKeyId,
	secretAccessKey,
	signatureVersion: "v4",
});

module.exports.generateS3UploadUrl = async () => {
	const rawBytes = await randomBytes(8);
	const objectName = rawBytes.toString("hex")

	const params = {
		Bucket: bucketName,
		Key: objectName,
		Expires: 60 * 5,
	};

	const url = await s3.getSignedUrlPromise("putObject", params);
	return url;
};
