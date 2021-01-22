let {PythonShell} = require('python-shell');
var microtime = require('microtime')

const createCsvWriter = require('csv-writer').createObjectCsvWriter;

function generateCSV(){

    // let myArrayOfStrings = array.split(',');
    let arrayOfValues = diffs.map(function(x) {
        return {value:parseInt(x)}
    });

    const csvWriter = createCsvWriter({
        path: 'MicroDataDay2.csv',
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
};

let delays = [];
let diffs = [];
let messageCounter = 0;

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


    let messageObject = JSON.parse(message);



        delays[messageObject.id].stop = microtime.now();
        delays[messageObject.id].diff = delays[messageObject.id].stop - delays[messageObject.id].start;
        diffs.push(delays[messageObject.id].diff);

        if(diffs.length === 100){
            generateCSV()
            clearInterval(timer);
            console.log((diffs.reduce((sum, el) => {return sum + el}))/100);

        }


}
function sendMessage() {

    let myJSON = {
        data1: `1234567890`,
        id: messageCounter,
        start: microtime.now(),
        data2: `2.783715859041540064e-01`
    }


    myInterpreter.send(JSON.stringify(myJSON))
    delays.push(myJSON);

    messageCounter++;

}

let timer = setInterval(sendMessage, 200)

