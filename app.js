let {PythonShell} = require('python-shell');
var microtime = require('microtime')

const createCsvWriter = require('csv-writer').createObjectCsvWriter;

function generateCSV(){

    // let myArrayOfStrings = array.split(',');
    let arrayOfValues = delays.map(function(x) {
        return {value:parseInt(x)}
    });

    const csvWriter = createCsvWriter({
        path: 'outRadeksPayload.csv',
        header: [
            {id: 'value', title: 'Value'}
        ]
    });

    csvWriter
        .writeRecords(arrayOfValues)
        .then(()=> console.log('The CSV file was written successfully'));
}

// Configuration object
let defaultOptions = {
    mode: 'text',
    scriptPath: './',
    pythonOptions: ['-u'], // get print results in real-time
    args: ['1', '2', '3']
};

let delays = [];

class PythonInterpreter{

    static spawn(url, onMessageCallback, options = defaultOptions){

        let pInterpreter = new PythonShell(url, options);


        pInterpreter.on('message', onMessageCallback);
        pInterpreter.on('close', ()=>{console.log('\x1b[36m%s\x1b[0m', "Script " + url + " has been exited. \n")});
        pInterpreter.on('error', function (stderr) {
            pInterpreter.end(()=>{
                console.log('\x1b[33m%s\x1b[0m', "Critical error at script: " + url + ". Finished this script to prevent server failure. Try again.")
                console.log("\nError message for python fans:\n")
                console.log('\x1b[31m%s\x1b[0m', stderr)
            })
        });
        // TODO: jesli jest critical error na ktorms ze skryptow to zablokuj mozliwosc jego uzycia.

        return pInterpreter;
    }

}

let myInterpreter = PythonInterpreter.spawn("script.py", receiveMessage)

function receiveMessage(message) {


    let currentTime = microtime.now()
    let receivedTime = Number(message)

    let timedifference = currentTime - receivedTime;

    console.log("TimeDiff:" + timedifference);

    delays.push(timedifference);

    if(delays.length === 1000){
        generateCSV()
        clearInterval(timer);
        console.log((delays.reduce((sum, el) => {return sum + el}))/1000);
    }

}
function sendMessage() {

    let myJSON = {
        timestamp: microtime.now(),
        data1: "9876543",
        data2: "876543"
    }

    myInterpreter.send(JSON.stringify(myJSON))
}

let timer = setInterval(sendMessage, 10)

