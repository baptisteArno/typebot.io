import { executePrismaCommand } from "./executeCommand";

const commandToExecute = process.argv.pop();

if (!commandToExecute) process.exit(1);

executePrismaCommand(commandToExecute, { force: true });
