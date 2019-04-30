const program = require("commander");
const term = require("terminal-kit").terminal;
const fs = require("fs");
const readlineSync = require("readline-sync");

program
  .version("0.0.1")
  .option("-f, --file <file>", "path to todo list file")
  .option("-h, --header <header>", "path to custom header")
  .option("-m, --no-menu", "hides the help menu under todo")
  .option(
    "-c, --header-color <integer>",
    "pass an integer between 1,256 for header color "
  )
  .option("--no-help", "hides help menu from being displayed")
  .option("-n, --new-list <file>", "make a new todo list file")
  .option("-a, --add [items...]", "add a new item to list")
  .parse(process.argv);

// determines header and header color from params or pass default value
const header = fs.readFileSync(program.header || "headers/todo_header", "utf8");
//term.color256(program.headerColor || Math.random() * 255 + 1, header);

let hideHelp = program.help;

// ensure that a file is specified
const filePath = program.file || program.args[0] || program.newList;
if (!filePath) {
  term.bold.red("ERR: ").defaultColor("No todo list specified or created\n");
  term.bold
    .yellow("WARN: ")
    .defaultColor(
      "Please specify a file using the --new-list or the --file flag\n"
    );
  return -1;
}
let list = "";
try {
  list = fs.readFileSync(filePath, "utf8");
} catch (e) {
  term.bold.red("ERR: ").defaultColor("Specified file not found");
}

//filter list for any EOF characters.
let filteredList = list.split("\n").filter(item => item.length > 1);

if (program.newList) {
  term.grabInput(false);
  term.clear().green("Insert mode activated\n");
  let newTodo = readlineSync.question("Add a new todo item: ");
  if (newTodo != "") filteredList.push("- [ ] " + newTodo);
  term.grabInput(true);
}

// function menuStable() {
//   displayHeader();
//   term.singleColumnMenu(filteredList, (err, response) => {
//     let index = response.selectedIndex;
//     if (filteredList[index].includes("[]"))
//       filteredList[index] = filteredList[index].replace("[]", "[x]");
//     else filteredList[index] = filteredList[index].replace("[x]", "[]");
//     choose();
//   });
// }

// insert a header above index 
const insertHeader = (index, headerSize) => {
  headerSize = Number(headerSize);
  if (isNaN(index) || headerSize < 0)
    choose("Could not propery insert header");

  term.grabInput(false);
  let userInput = readlineSync.question("New header item > ");
  if (userInput == '') choose("Input not inserted");
  let headerAmount = "#".repeat(headerSize);
  let item = headerAmount + " " + userInput;
  filteredList.splice(index, 0, item);
  term.grabInput(true);
}

const displayMenu = (command, helpMenu = true) => {
  let err = "";
  displayHeader(helpMenu);
  term.singleColumnMenu(filteredList, (err, response) => {
    let index = response.selectedIndex;
    switch (command[0]) {
      case 'header':
      case 'h':
        insertHeader(index, command[1]);
        break;
      case 'i':
      case 'insert':
        insert(index);
        break;
      case 'append':
      case 'a':
        append(index);
        break;
      case '':
      case 'm':
        selectItem(index);
        break;
      case 'd':
        err = deleteItem(index);
        break;
      default:
        choose(`Command "${command}" not found`);
        break;
    }
    choose(err);
  });
}

const deleteItem = (index) => {
  if (isNaN(index)) return "Error occured in deleting item";
  filteredList.splice(index, 1);
}

const saveList = (list,
  proceed = true) => {
  let formatedString = list.join("\n");
  fs.writeFileSync(filePath, formatedString, function (err) {
    if (err) {
      term
        .clear()
        .bold()
        .red(err);
      return -1;
    }
  });
  if (proceed)
    choose("File has been written successfully \n");
  else
    process.exit();
}

//selects item in list 
const selectItem = (index) => {
  if (filteredList[index].includes("[ ]"))
    filteredList[index] = filteredList[index].replace("[ ]", "[x]");
  else filteredList[index] = filteredList[index].replace("[x]", "[ ]");
}
// append an item below list
const append = (index) => {
  term.grabInput(false);
  let userInput = readlineSync.question("New todo item > ");
  if (userInput === '') choose(`Input ${userInput} invalid`);
  userInput = "    - [ ] " + userInput;
  filteredList.splice(index + 1, 0, userInput);
  term.grabInput(true);
}

// insert an item below list
const insert = (index) => {
  term.grabInput(false);
  let userInput = readlineSync.question("New todo item > ");
  if (userInput === '') choose(`Input ${userInput} invalid`);
  userInput = "- [ ] " + userInput;
  filteredList.splice(index + 1, 0, userInput);
  term.grabInput(true);
}

const displayHeader = (helpMenu = true) => {
  term.clear();
  term.color256(program.headerColor || Math.random() * 255 + 1, header);
  if (helpMenu) {
    term.green(
      "\nCommands available: (m)enu, (a)ppend below, (i)nsert mode, (d)elete mode, (h)elp, or CTRL_C to escape\n"
    );
  }
}

const choose = (msg = "") => {
  displayHeader(hideHelp);
  term(`${msg}\n`);
  filteredList.forEach(item => term(`${item}\n`));
  term.grabInput(false);
  let userInput = readlineSync.question("\nPlease enter a command > ");
  userInput = userInput.split(" ")
  term.grabInput(true);
  switch (userInput[0]) {
    case 'header':
    case 'h':
    case '':
    case 'm':
    case 'append':
    case 'a':
    case 'd':
    case 'i':
      displayMenu(userInput, hideHelp);
      break;
    case 'sq':
      saveList(filteredList, false);
    case 'q':
    case 'quit':
    case 'exit':
      saveList(filteredList, false);
      break;
    case 'save':
    case 's':
      saveList(filteredList);
      break;
    default:
      choose(`Command "${userInput}" not found`)
  }
}

choose();