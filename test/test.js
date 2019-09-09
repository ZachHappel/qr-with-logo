const QRLogo = require('../index.js');

const data = JSON.stringify({
    name: "Zacharie Happel",
    job:  "Student/Intern",
    grade: "Senior"
});


async function testPNG() {
    await QRLogo.generateQRWithLogo(data, "test/node-js-logo.png", {}, "PNG", "qrlogo.png", async function(b64) {
        console.log("Base64: \n" + b64);
    });
}

async function testBase64() {

}


async function performTests () {
    await testPNG();
    //await
}

performTests();