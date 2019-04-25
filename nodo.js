const program = require('commander');
const term = require('terminal-kit').terminal;
const fs = require('fs');
const readlineSync = require('readline-sync');

program
    .version('0.0.1')
    .option('-f, --file <file>', 'path to todo list file')
    .option('-h, --header <header>', 'path to custom header')
    .option('-c, --header-color <integer>', 'pass an integer between 1,256 for header color ')
    .option('-n, --new-list <file>', 'make a new todo list file')
    .option('-a, --add [items...]', 'add a new item to list')
    .parse(process.argv)

// determines header and header color from params or pass default value
const header = fs.readFileSync(program.header || 'headers/todo_header', 'utf8');
term.color256(program.headerColor || Math.random() * (255) + 1, header)

// ensure that a file is specified
const filePath = program.file || program.args[0] || program.newList;
if (!filePath) {

    term.bold.red("ERR: ").defaultColor("No todo list specified or created\n");
    term.bold.yellow("WARN: ").defaultColor("Please specify a file using the --new-list or the --file flag\n");
    return -1;
}
let list = "";
try {
    list = fs.readFileSync(filePath, 'utf8');
} catch (e) {
    term.bold.red("ERR: ").defaultColor('Specified file not found');
}

//Display status bar informing us of what todo list we are operating on
term.saveCursor();
term.moveTo.bgWhite.black(1, 1).eraseLine();
term(`Operating on ${filePath}`);
term.white.bgBlack();
term.restoreCursor();


//filter list for any EOF characters.
let filteredList = list.split("\n").filter(item => item.length > 1);

function menu() {
    term.clear();
    term.color256(program.headerColor || Math.random() * (255) + 1, header)
    term.green('Commands available: (m)enu, (i)nsert mode, (d)elete mode, (h)elp, or CTRL_C to escape\n')
    term.singleColumnMenu(filteredList, (err, response) => {
        let index = response.selectedIndex;
        if (filteredList[index].includes("[]")) filteredList[index] = filteredList[index].replace("[]", "[x]");
        else filteredList[index] = filteredList[index].replace("[x]", "[]");
        menu();


    });
}

function choose() {
    term.clear();
    term.color256(program.headerColor || Math.random() * (255) + 1, header)
    term.green('Commands available: (m)enu, (i)nsert mode, (d)elete mode, (h)elp, or CTRL_C to escape')
    term.grabInput();
    term.on('key', function (name, matches, data) {
        if (name === 'CTRL_C') {
            let formatedString = filteredList.join('\n');
            fs.writeFileSync(filePath, formatedString, function (err) {
                if (err) {
                    term.clear().bold().red(err);
                    return -1;
                }
            });
            term.bold.green("File successfully saved\n");
            process.exit();
        }
    });
    term.on('key', function (name, matches, data) {
        if (name === 'h') {
            term.clear().green(`Note press m or escape for a refresh\n
            Available options are: \n
            (m)enu - used for refreshing menu\n
            (i)nsert mode - escapes grab input from terminal kit and allows you to add items\n
            (h)elp menu - displays this menu :) \n
            CTRL_C - escapes file and automatically saves list`);
        }
    });
    term.on('key', function (name, matches, data) {
        if (name === 'i') {
            term.grabInput(false);
            term.clear().green('Insert mode activated\n');
            let newTodo = readlineSync.question('Add a new todo item: ');
            if (newTodo != '') filteredList.push("[] " + newTodo);
            term.grabInput(true);

        }
    });

    term.on('key', function (name, matches, data) {
        if (name === 'd') {
            term.grabInput(false);
            term.clear().yellow("Select an element to delete starting with index 0\n");
            filteredList.forEach((item, index) => term(`${index} ${item} \n`));
            let selectToDelete = readlineSync.question('Select an item to delete: ');

            filteredList.splice(selectToDelete, 1);
            term.grabInput(true);
        }
    });


    term.on('key', function (name, matches, data) {
        if (name === 'ESCAPE') menu();
    });
    term.on('key', function (name, matches, data) {
        if (name === 'm') menu();
    })
    menu();
}

choose();