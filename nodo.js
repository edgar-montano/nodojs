const program=  require('commander');
const term =    require( 'terminal-kit' ).terminal ;
const fs=       require('fs');


program
    .version('0.0.1')
    .option('-f, --file <file>', 'path to todo list file')
    .option('-h, --header <header>', 'path to custom header')
    .option('-c, --header-color <integer>', 'pass an integer between 1,256 for header color ')
    .option('-n, --new-list <file>', 'make a new todo list file')
    .option('-a, --add [items...]', 'add a new item to list')
    .parse(process.argv)

// determines header and header color from params or pass default value
const header = fs.readFileSync(program.header||'headers/todo_header', 'utf8');
term.color256(program.headerColor||Math.random() * (255)+1,header)

// ensure that a file is specified
const filePath = program.file || program.args[0] || program.newList;
if(!filePath){

    term.bold.red("ERR: ").defaultColor("No todo list specified or created\n");
    term.bold.yellow("WARN: ").defaultColor("Please specify a file using the --new-list or the --file flag\n");
    return -1;
}

let list = "";
try{
    list = fs.readFileSync(filePath, 'utf8');
    //console.log(list)

}catch(e){
    term.bold.red("ERR: ").defaultColor('Specified file not found');
}

//Display status bar informing us of what todo list we are operating on
term.saveCursor() ;
term.moveTo.bgWhite.black( 1 , 1 ).eraseLine() ;
term(`Operating on ${filePath}`) ;
term.white.bgBlack() ;
term.restoreCursor() ;

list = list.split("\n");
term.singleColumnMenu(list, (err,response) => {
    term.moveTo.bgWhite.black(1,1).eraseLine();
    process.exit();
});
