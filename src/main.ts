import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import router from './routes/bookings';

const app = express();
app.use(bodyParser.json());
dotenv.config();

app.use('/bookings', router);

// Test the server
app.use('/', (req: Request, res: Response) => {
  res.send('Server OK');
});

app.listen(process.env.PORT || 3005, (err) => {
  if (err) {
    console.log(`[error] Server error at port ${process.env.PORT || 3005}`);
    return;
  }

  console.log(
    `[info] Server started at http://localhost:${process.env.PORT || 3000}`
  );
});
