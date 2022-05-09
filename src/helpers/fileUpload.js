const path = require('path');

module.exports.single_file_upload = (file, concat_file_name, store_file_path) => {
	// 10 digit random number find 
	// var seq = (Math.floor(Math.random() * 1000000000) + 9999999999).toString().substring(1);    

	let image_url = "";
	const filExe = path.extname(file.name).toLowerCase();
	if (filExe == ".jpg" || filExe == ".jpeg" || filExe == ".png" ) {
		image_url = concat_file_name + filExe;
		file.mv(store_file_path + image_url, function (err) {
			if (err) {
				// image_url = "file_upload_error";
				console.log(`Error in file upload :: ` + err)
			}
		});
	} else {
		// image_url = "File type must be .jpg or .jpeg or .png .JPEG";
	}
	return image_url;
}

module.exports.icon_file_upload = (file, concat_file_name, store_file_path) => {
	// 10 digit random number find 
	// var seq = (Math.floor(Math.random() * 1000000000) + 9999999999).toString().substring(1);    

	let image_url = "";
	const filExe = path.extname(file.name);
	if (filExe == '.svg' ) {
		image_url = concat_file_name + filExe;
		file.mv(store_file_path + image_url, function (err) {
			if (err) {
				// image_url = "file_upload_error";
				console.log(`Error in file upload :: ` + err)
			}
		});
	} else {
		// image_url = "File type must be .jpg or .jpeg or .png .JPEG";
	}
	return image_url;
}


module.exports.report_file_upload = (file, concat_file_name, store_file_path) => {
	// 10 digit random number find 
	// var seq = (Math.floor(Math.random() * 1000000000) + 9999999999).toString().substring(1);    

	let image_url = "";
	const filExe = path.extname(file.name).toLowerCase();
	if (filExe == ".jpg" || filExe == ".jpeg" || filExe == ".png" || filExe == ".pdf") {
		image_url = concat_file_name + filExe;
		file.mv(store_file_path + image_url, function (err) {
			if (err) {
				// image_url = "file_upload_error";
				console.log(`Error in file upload :: ` + err)
			}
		});
	} else {
		// image_url = "File type must be .jpg or .jpeg or .png .JPEG";
	}
	return image_url;
}

module.exports.multi_files_upload = (file, concat_file_name, store_file_path) => {
	// 10 digit random number find 

	let files_arr = file;
	const file_count = files_arr.length;
	let image_url = [];
	// console.log(file_count);
	if (file_count > 0) {
		for (i = 0; i < file_count; i++) {
			// const seq = (Math.floor(Math.random() * 1000000000) + 9999999999).toString().substring(1);
			const filExe = path.extname(files_arr[i].name);
			if (filExe == ".jpg" || filExe == ".jpeg" || filExe == ".png" || filExe == ".JPG" || filExe == ".JPEG" || filExe == ".PNG" || filExe == ".pdf" || filExe == ".PDF") {
				const new_file_name = concat_file_name + filExe;
				files_arr[i].mv(store_file_path + new_file_name, function (err) {
					if (err) {
						image_url = "file_upload_error";
					}
				});
				image_url.push("guestId/" + new_file_name);

			} else {
				// image_url = "File type must be proper extension";
			}
		}
	}
	return image_url;
}
