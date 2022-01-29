import path from "path";
import fs from "fs";

export const writeDataUrlToFile = (dataUrl: string, fileName: string) => {
  const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
  const fname = fileName + "_" + Date.now();

  fs.writeFileSync(
    path.join(__dirname, "..", "public", fname),
    base64Data,
    "base64"
  );
  return `/iamv2/profile/${fname}`;
};

// export const writeBase64File = async (
//   base64Data: string,
//   fileName: string,
//   filePath: string
// ): Promise<string> => {

//   const file = Buffer.from(base64Data, "base64");
//   const filePathWithFileName = path.join(filePath, fileName);
//   await fs.writeFileSync(filePathWithFileName, file);
//   return filePathWithFileName;
// };
