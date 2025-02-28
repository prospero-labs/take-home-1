import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

const app = express();
app.use(bodyParser.json());
dotenv.config();

// Test the server
app.use('/', (req: Request, res: Response) => {
  res.send('Server OK');
});

app.listen(process.env.PORT || 3005, (err) => {
  if (err) {
    console.log(`Server error at port ${process.env.PORT || 3005}`);
    return;
  }

  console.log(`Server started at http://localhost:${process.env.PORT || 3000}`);
});
