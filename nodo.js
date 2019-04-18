const program=  require('commander');
const term =    require( 'terminal-kit' ).terminal ;
const fs=       require('fs')
program
    .version('0.0.1')
    .option('-f, --file <file>', 'path to todo list file')
    .option('-h, --header <header>', 'path to custom header')
    .option('-a, --add [items...]', 'add a new item to list')
    .parse(process.argv)

fs.readFileSync('path','utf8',(err,data) => {
    if(err) term.red("err");
})
console.log(program.add);
