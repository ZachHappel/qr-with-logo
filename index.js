const qrcode = require('qrcode');
const sharp = require('sharp');
const fs = require('fs');

const ERRORS = {
    "INSUFF_PARAMS": {
        name: "InsufficientParameters Error",
        message: " is required when outputting QR code "
    },
    "ERR_CK": {
        name: "ErrorChecking Error",
        message: "Error occurred while error-checking parameters"
    },
    "INVALID_IMGFILE": {
        name: "InvalidImageFilePath Error",
        message: " is an invalid image file path for the parameter "
    }
};


async function generateQRWithLogo(embedded_data, logo_image_path, qr_options, output_type, saveas_file_name, callback) {

    /**
     *
     *
     * Questions for self:
     * -- Currently I am checking to see if there are callbacks, should this be the case? If I were to return
     *    the Base64, would that be fine? I don't see why not..
     *
     * -- How can I effectively throw my error-objects without them being display in console as <Object> ?
     *     -- Inside of async functions, this occurs
     *     -- Can a non-async function be properly awaited on?  [TEST this]
     *     --> Currently throwing a SyntaxError with the a JSON.stringified version of the error object as the message
     */


    let qr_image_path = `init_non_logo_qr_${new Date().getTime()}.png`;
    console.log('This is saveas_file_name: ' + saveas_file_name);
    let is_saveas_file_name_a_string = (typeof saveas_file_name == 'string');
    console.log("saveas_file_name instanceof String: " + is_saveas_file_name_a_string);

    if (embedded_data && logo_image_path && output_type) {

        if(output_type == "PNG") {

            if (!saveas_file_name || ( typeof saveas_file_name != 'string')) {
                throw SyntaxError(JSON.stringify( {name: ERRORS["INSUFF_PARAMS"].name, message: "saveas_file_name" + ERRORS["INSUFF_PARAMS"].message + "to PNG"}));
            } console.log("All PNG parameters");

        }
    }





    if (!output_type) {
        throw SyntaxError(JSON.stringify( {name: ERRORS["INSUFF_PARAMS"].name, message: "output_type" + ERRORS["INSUFF_PARAMS"].message}));

    } else if (!embedded_data && logo_image_path && output_type) {
        throw SyntaxError(JSON.stringify( {name: ERRORS["INSUFF_PARAMS"].name, message: "embedded_data" + ERRORS["INSUFF_PARAMS"].message + "to " + output_type}));
    } else if (!logo_image_path && embedded_data && output_type) {
        throw SyntaxError(JSON.stringify( {name: ERRORS["INSUFF_PARAMS"].name, message: "logo_image_path" + ERRORS["INSUFF_PARAMS"].message + "to " + output_type}));
    }


    if ((logo_image_path.lastIndexOf('.')) == '-1') {
        throw SyntaxError(JSON.stringify( {name: ERRORS["INVALID_IMGFILE"].name, message: logo_image_path + ERRORS["INVALID_IMGFILE"].message + "logo_image_path"}));
    }

    if ((saveas_file_name.lastIndexOf('.')) == '-1') {
        throw SyntaxError(JSON.stringify( {name: ERRORS["INVALID_IMGFILE"].name, message: saveas_file_name + ERRORS["INVALID_IMGFILE"].message + "saveas_file_name  Ensure that .png was included"}));
    }



    if (qr_options.length == 0) {
        qr_options = {errorCorrectionLevel: 'H'}
    }



    await generateQR(embedded_data, qr_options, async function (b64) {

        await saveAsPNG(b64, qr_image_path, async function () {

            if (output_type == "PNG") {

                await addLogoToQRImage(qr_image_path, logo_image_path, "PNG", saveas_file_name, async function () {

                    callback(); // No-parameter callback, in the event
                    /**
                    await fs.stat(qr_image_path, async function (err, stats) {
                        console.log('Stats: ' + stats);//here we got all information of file in stats variable

                        if (err) {
                            console.log("ERRRRRR");
                            throw console.error(err);
                        }

                        await fs.unlink(qr_image_path, function(err){
                            if(err) { throw(err);}
                            console.log('file deleted successfully');
                            callback();
                        });

                       // callback(); // No-parameter callback, in the event
                    });

                    **/
                });

            } else if (output_type == "Base64") {

                await addLogoToQRImage(qr_image_path, logo_image_path, "Base64", saveas_file_name, async function (qrlogo_b64) {

                    //let qrlogo_base64 = qrlogo_b64;

//                    console.log("Base 64 Data: " + qrlogo_b64);

                    await fs.unlink(qr_image_path, async function () {

                        callback(qrlogo_b64);

                    });
                })
            }

        })

    });

}


async function generateQR(embedded_data, options, callback) {

    if (typeof options === "object") {

        try {
            await qrcode.toDataURL(embedded_data, options, function (err, b64) {
                if (b64) { callback(b64); }
                else if (err) { console.log(err); }
            });
        } catch (err) { console.error(err) }

    } else {

        try {
            await qrcode.toDataURL(embedded_data, { errorCorrectionLevel: 'H'}, function (err, b64) {
                if (b64) { callback(b64); }
                else if (err) { console.log(err); }
            });
        } catch (err) { console.error(err) }

    }

};



/** @param callback  file name that it was saved as is passed to the callback function */
async function saveAsPNG(b64, filename, callback) {
    console.log('Saving QR as: ' + filename);
    let base64Data = await b64.replace(/^data:image\/png;base64,/, "");
    fs.writeFile(filename, base64Data, 'base64', function() {
        if (callback) {
            callback(filename);
        }
    });
}



async function addLogoToQRImage(qr_image_path, logo_image_path, output_type, saveas_file_name, callback) {

    if (output_type == "Base64") {
        if (!callback) { console.log('Error: No callback provided'); }

        else {
            console.log('Output: Base64');
            await sharp(qr_image_path)
                .composite([{input: logo_image_path, gravity: 'centre' }])
                .toBuffer((err, data, info) => {

                    if (err) {
                        console.log("Error Converting Image Buffer to Base 64: \n"+err );
                    }

                    if (data) {
                        let base64data = Buffer.from(data, 'binary').toString('base64');
                        callback(base64data);  //console.log(base64data);
                    }


                    /*
                    async function waitForData(cb) {

                        if (data) {
                            console.log('Data exists');
                            await cb(await Buffer.from(data, 'binary').toString('base64'));
                            //console.log('This is data...');
                            //console.log(data);
                            //let base64data = await Buffer.from(data, 'binary').toString('base64');
                            //console.log("Base64 Inside AddLogoToQRImage: \n" + base64data);

                        } else {
                            setTimeout(() => {
                                console.log('Waiting for data...');
                                waitForData(async function(b64){
                                    console.log("Done Waiting For Data: ");
                                    callback(b64)
                                });
                            },100)
                        }
                    }

                    await waitForData(async function(b64){
                      console.log("Done Waiting For Data: ");
                      callback(b64)
                    });

                     */
                });
        }

    } else if (output_type == "PNG") {

        console.log('Output: PNG');
        console.log('SaveAs: ' + saveas_file_name);

        if (saveas_file_name) {

            try {
                sharp(qr_image_path)
                    .composite([{input: logo_image_path, gravity: 'centre' }])
                    .toFile(saveas_file_name);

            } catch(err) {
                console.log("Error encountered when attempting to save QR with logo, check 'saveas_file_name' parameter");
                console.log(err);
            }

        } else {
            console.log("Error: Unable to save QR with logo because 'saveas_file_name' is not defined");
            // throw error *****
        }

    }
}


exports.generateQRWithLogo = generateQRWithLogo;

