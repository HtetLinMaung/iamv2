import path from "path";
import moment from "moment";
import fs from "fs";

const writeLogToFile = (message: string, level: string) => {
  const filePath = path.join(
    __dirname,
    "..",
    "logs",
    `${moment().format("YYYY-MM-DD")}.txt`
  );
  if (fs.existsSync(filePath)) {
    fs.appendFileSync(
      filePath,
      `[${moment().format("HH:mm:ss")}] [${level}] ${message}\n`
    );
  } else {
    fs.writeFileSync(filePath, `${moment().format("HH:mm:ss")} - ${message}\n`);
  }
};

const logger = {
  info: (message: string) => {
    console.log(message);
    writeLogToFile(message, "INFO");
  },
  error: (message: any) => {
    console.error(message);
    writeLogToFile(message, "ERROR");
  },
};

export default logger;
