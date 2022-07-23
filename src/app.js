require("dotenv").config({ path: `${__dirname}/../.env` });
const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const fileUpload = require("express-fileupload");

// * INIT
const app = express();
const port = process.env.PORT || 8000;

// * MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(logger(`dev`));
app.use(fileUpload());

// * static images path for access images direct from servers
app.use("/public", express.static(__dirname + "/public"));


// * IMPORTED ROUTES
app.use("/api/member", require("./routes/member"));
app.use("/api/category", require("./routes/category"));
app.use("/api/subCategory", require("./routes/subCategory"));
app.use("/api/request", require("./routes/request"));
app.use("/api/product", require("./routes/product"));
app.use("/api/my_product", require("./routes/my_product"));
app.use("/api/need", require("./routes/need"));
app.use("/api/lead", require("./routes/lead"));
app.use("/api/notification", require("./routes/notification"));
app.use("/api/s3_upload_url", require("./routes/s3_upload_url"));


// * ROUTES
app.get("/", (req, res) => {
	res.status(200).json({ msg: `PC Backend is Working` });
});

app.use("*", function (req, res) {
	res.status(404).json({ msg: "This api not found !", data: {} });
});

app.use((err, req, res, next) => {
	// console.log(err);
	err.statusCode = err.statusCode || 500;
	err.message = err.message;
	console.log(err.message);
	res.status(err.statusCode).json({
		msg: "Internal server error",
		error: err.message,
	});
});


// * SERVER
app.listen(port, console.log(`listening at http://localhost:${port}`));
