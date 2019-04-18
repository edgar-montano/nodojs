const program=  require('commander');
const term =    require( 'terminal-kit' ).terminal ;
const fs=       require('fs');


program
    .version('0.0.1')
    .option('-f, --file <file>', 'path to todo list file')
    .option('-h, --header <header>', 'path to custom header')
    .option('-c, --header-color <integer>', 'pass an integer between 1,256 for header color ')
    .option('-a, --add [items...]', 'add a new item to list')
    .parse(process.argv)

// determines header and header color from params or pass default value
const header = fs.readFileSync(program.header||'headers/todo_header', 'utf8');
term.color256(program.headerColor||Math.random() * (255)+1,header)

