import express from "express";
import { createRequestHandler } from "@remix-run/express";
import { resolve } from "path";
import fsPromises from "fs/promises";
import { spawn } from "child_process";
import * as build from "@remix-run/dev/server-build";

const app = express();

const LS = "ls";
const DATA_DIR = resolve(__dirname, "data");
const FORBIDDEN_OPTIONS = ["&&", ";", "|", "`", ",", "'", '"'];
const ALLOWED_SHORT_OPTIONS = "aAbBcCdDfFgGhHiIlLmMnNoOpPqQrRsStTuUvVwWxX1Z";
const ALLOWED_LONG_OPTIONS = [
  "--all",
  "--almost-all",
  "--author",
  "--escape",
  "--block-size",
  "--ignore-backups",
  "--directory",
  "--dired",
  "--classify",
  "--file-type",
  "--format",
  "--full-time",
  "--group-directories-first",
  "--no-group",
  "--human-readable",
  "--si",
  "--dereference-command-line",
  "--dereference-command-line-symlink-to-dir",
  "--hide",
  "--hyperlink",
  "--indicator-style",
  "--inode",
  "--ignore",
  "--kibibytes",
  "--literal",
  "--hide-control-chars",
  "--show-control-chars",
  "--quote-name",
  "--quoting-style",
  "--reverse",
  "--recursive",
  "--size",
  "--sort",
  "--time",
  "--time-style",
  "--tabsize",
  "--width",
  "--context",
  "--zero",
  "--help",
  "--version",
];

function validateCommand(command: string): boolean {
  const parts = command.trim().split(" ");

  if (parts[0] !== LS) {
    return false;
  }

  for (let i = 1; i < parts.length; i++) {
    for (const forbidden of FORBIDDEN_OPTIONS) {
      if (parts[i].includes(forbidden)) {
        return false;
      }
    }

    if (parts[i].startsWith("--")) {
      if (!ALLOWED_LONG_OPTIONS.includes(parts[i])) {
        return false;
      }
    } else if (parts[i].startsWith("-")) {
      for (let j = 1; j < parts[i].length; j++) {
        if (!ALLOWED_SHORT_OPTIONS.includes(parts[i][j])) {
          return false;
        }
      }
    } else {
      continue;
    }
  }

  return true;
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

async function performLsCommand(command: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const commandOptions = command.split(" ").slice(1);
    const dirPath =
      commandOptions.find((option) => !option.startsWith("-")) || DATA_DIR;

    if (await !checkIfPathExist(dirPath)) {
      return reject(new Error("Dir or file does not exist"));
    }

    if (await !checkIfDirectory(dirPath)) {
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

app.use(express.json());

app.post("/api/ls", async (req, res) => {
  const { command } = req.body;
  if (!validateCommand(command)) {
    return res.status(400).json({
      error:
        'Invalid command. Only "ls" commands are allowed and no special characters.',
    });
  }
  try {
    const result = await performLsCommand(command);
    res.json({ data: result });
  } catch (err) {
    res.status(500).json({ error: err.message || "Unknown error occurred" });
  }
});

app.all(
  "*",
  createRequestHandler({
    async getLoadContext() {
      return {
        message: "Hello from server context",
      };
    },
    build,
  })
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
