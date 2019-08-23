async function hello(name, callback) {
    console.log('Hello, ' + name + '! ');

    if (!callback) {
        console.log('Callback does not exist');
    }
}


//hello('Zach');



const ERRORS = {
    "INSUFF_PARAMS": {
        name: "InsufficientParameters Error",
        message: " is required when outputting QR code as "
    }
};




async function timeWait(){

    let counter = 0;

    function throwErr(err_obj){
        throw err_obj;
    }

    async function waitForMe(){
        throw SyntaxError(        JSON.stringify({name: ERRORS["INSUFF_PARAMS"].name, message: "saveas_file_name" + ERRORS["INSUFF_PARAMS"].message + " PNG"}));

    }

    await waitForMe();
}



timeWait();









async function theCheck(input, callback){

    try{
        if(input == "123"){
            throw {name: ERRORS["INSUFF_PARAMS"].name, message: "saveas_file_name" + ERRORS["INSUFF_PARAMS"].message + " PNG"};
        } else {
            callback(true);
        }
    } catch (err) {
        await throwThatErrorBoi(err);
    }
}
