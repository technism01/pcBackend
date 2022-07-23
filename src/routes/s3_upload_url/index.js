const router = require('express').Router();
const { nanoid } = require('nanoid');
const catchAsync = require('../../helpers/catchAsync');
const { generateS3UploadUrl } = require('../../helpers/s3');

/**
 * @desc Get S3 Upload URL
 */

router.get(
	'/',
	catchAsync(async (req, res) => {
		const url = await generateS3UploadUrl();

		res.status(200).json({ url });
	})
);

module.exports = router;
