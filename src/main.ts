import express, { Express } from "express";
import bookingRoutes from "./routes/bookingRoutes";
import * as dotenv from "dotenv";

const app: Express = express();
dotenv.config();

const port = process.env.PORT;

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use("/", bookingRoutes);

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
