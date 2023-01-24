import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import init from "./init";
import betterLoggin from "better-logging";
import logger from "./utils/logger";

import publicRoute from "./routes/public-route";
import userRoute from "./routes/user-route";
import roleRoute from "./routes/role-route";

betterLoggin(console);

dotenv.config();

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors());
app.use(express.json());
app.use("/iamv2/profile", express.static("public"));
app.use("/iamv2", publicRoute);
app.use("/iamv2/users", userRoute);
app.use("/iamv2/roles", roleRoute);

app.get("/iamv2", (req, res) => {
  res.send(
    `<h1 style="height: 100vh; display: flex; justify-content: center; align-items: center">Welcome from IAM version 2 app</h1>`
  );
});

app.listen(PORT, () => {
  init();
  logger.info(`Server listening on port ${PORT}`);
});
