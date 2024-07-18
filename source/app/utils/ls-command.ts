import { spawn } from "child_process";
import fsPromises from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const LS = "ls";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../data");

export async function performLsCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const commandOptions = command.split(" ").slice(1);
    const dirPath =
      commandOptions.find((option) => !option.startsWith("-")) || DATA_DIR;

    if (!checkIfPathExist(dirPath)) {
      return reject(new Error("Dir or file does not exist"));
    }

    if (!checkIfDirectory(dirPath)) {
      return reject(new Error("Invalid path or not a directory"));
    }

    const ls = spawn(LS, commandOptions, { cwd: dirPath });

    let dataRes = "";
    let errRes = "";

    ls.stdout.on("data", (data) => {
      dataRes += data;
    });

    ls.stderr.on("data", (err) => {
      errRes += err;
    });

    ls.on("exit", () => {
      if (errRes) {
        reject(errRes);
      } else {
        resolve(dataRes);
      }
    });
  });
}

async function checkIfPathExist(dirPath: string): Promise<boolean> {
  try {
    await fsPromises.access(dirPath);
    return true;
  } catch {
    return false;
  }
}

async function checkIfDirectory(dirPath: string): Promise<boolean> {
  const stat = await fsPromises.stat(dirPath);
  return stat.isDirectory();
}
