import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import serverless from 'serverless-http';
import userRoutes from './routes/users.js';

const app = express();
app.use(express.json());
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(userRoutes);
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/components/App')); // 返回前端页面的路径
});

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});


export const handler = serverless(app);
