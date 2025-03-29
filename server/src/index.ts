/**
 * Flight Indicators Monitor - Server
 *
 * Description:
 * This server handles telemetry data from a flight monitoring system.
 * It performs the following tasks:
 *
 * 1. Connects to a MongoDB database named 'flightMonitor'.
 * 2. Defines a schema and model for telemetry data, including:
 *    - Altitude (0 to 3000 meters)
 *    - HIS (Horizontal Situation Indicator, 0 to 360 degrees)
 *    - ADI (Attitude Direction Indicator, -100 to 100)
 * 3. Provides two main endpoints:
 *    - POST /api/telemetry: Accepts telemetry data and stores it in the database after validation.
 *    - GET /api/telemetry: Retrieves all telemetry data sorted by the most recent entry.
 * 4. Listens for incoming requests on port 5001.
 *
 * Technologies Used:
 * - Express for the server
 * - Mongoose for MongoDB interaction
 * - CORS to handle cross-origin requests
 */
import express, { Request, Response } from 'express';
import mongoose, { Schema, Document } from 'mongoose';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/flightMonitor');

interface ITelemetry extends Document {
  Altitude: number;
  HIS: number;
  ADI: number;
}


const telemetrySchema = new Schema<ITelemetry>({
  Altitude: { type: Number, min: 0, max: 3000, required: true },
  HIS: { type: Number, min: 0, max: 360, required: true },
  ADI: { type: Number, min: -100, max: 100, required: true },
});

const Telemetry = mongoose.model<ITelemetry>('Telemetry', telemetrySchema);

app.post('/api/telemetry', async (req: Request, res: Response): Promise<void> => {
  try {
    const { Altitude, HIS, ADI } = req.body;
    if (
      typeof Altitude !== 'number' ||
      typeof HIS !== 'number' ||
      typeof ADI !== 'number'
    ) {
      res.status(400).send('Invalid input: all fields must be numbers');
      return;
    }
    const data = new Telemetry({ Altitude, HIS: HIS % 360, ADI });
    await data.save();
    res.status(201).send('Data saved');
  } catch (err) {
    console.error('Save error:', err);
    res.status(400).send((err as Error).message);
  }
});

app.get('/api/telemetry', async (_req: Request, res: Response): Promise<void> => {
  const data = await Telemetry.find().sort({ _id: -1 });
  res.json(data);
});

app.listen(5001, () => console.log('Server running on port 5001'));