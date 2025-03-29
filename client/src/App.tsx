/**
 * Flight Indicators Monitor - Client
 *
 * Description:
 * This React application provides a user interface to display and manage telemetry data
 * for a flight simulation system. It includes:
 *
 * 1. Visual and Text Modes:
 *    - Visual Mode: Displays data using Altitude Bar, Compass, and Horizon Gauge.
 *    - Text Mode: Displays telemetry data in a tabular-like format.
 *
 * 2. CRUD Operations:
 *    - Fetches telemetry data from the server using Axios.
 *    - Allows the user to submit new telemetry data using a form.
 *    - Retrieves and displays data automatically upon application load.
 *
 * 3. Main Components:
 *    - `AltitudeBar`: Shows altitude as a bar graph.
 *    - `Compass`: Displays the HIS (Horizontal Situation Indicator) with rotation.
 *    - `HorizonGauge`: Displays the ADI (Attitude Direction Indicator) with color changes.
 *    - `VisualDisplay`: Combines all visual indicators.
 *    - `TextDisplay`: Shows raw telemetry data in text format.
 *
 * 4. User Interactions:
 *    - Allows switching between Text and Visual mode.
 *    - Provides a form to submit new telemetry data.
 *    - Displays an error message if the server is unavailable.
 *
 * 5. API Communication:
 *    - Sends and retrieves data from the backend server at `http://localhost:5001/api/telemetry`.
 *
 * Technologies Used:
 * - React with TypeScript
 * - Axios for HTTP requests
 * - CSS for basic styling
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

interface Telemetry {
  Altitude: number;
  HIS: number;
  ADI: number;
}

const AltitudeBar: React.FC<{ value: number }> = ({ value }) => {
  const height = (value / 3000) * 200;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '20px' }}>
      <div style={{ fontSize: '12px' }}>ALT</div>
      <div style={{ width: '30px', height: '200px', border: '1px solid black', backgroundColor: '#f0f0f0', position: 'relative' }}>
        {[0, 1000, 2000, 3000].map((label) => (
          <div key={label} style={{ position: 'absolute', bottom: `${(label / 3000) * 200}px`, left: '35px', fontSize: '10px' }}>{label}</div>
        ))}
        <div style={{ height: `${height}px`, backgroundColor: 'black', width: '100%', position: 'absolute', bottom: 0 }}></div>
      </div>
    </div>
  );
};

const Compass: React.FC<{ value: number }> = ({ value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '20px' }}>
    <div style={{ fontSize: '12px' }}>HIS</div>
    <div style={{ width: '100px', height: '100px', border: '1px solid gray', borderRadius: '50%', position: 'relative' }}>
      {[{ label: '0', top: '-10px', left: '50%', transform: 'translateX(-50%)' },
        { label: '180', top: '100%', left: '50%', transform: 'translate(-50%, -100%)' },
        { label: '270', top: '50%', left: '0%', transform: 'translate(0%, -50%)' },
        { label: '90', top: '50%', left: '100%', transform: 'translate(-100%, -50%)' }].map((tick, i) => (
        <div key={i} style={{ position: 'absolute', fontSize: '10px', top: tick.top, left: tick.left, transform: tick.transform }}>{tick.label}</div>
      ))}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '2px',
          height: '45px',
          backgroundColor: 'gray',
          transform: `translate(-50%, -100%) rotate(${value}deg)`,
          transformOrigin: 'bottom center'
        }}
      />
    </div>
  </div>
);

const HorizonGauge: React.FC<{ value: number }> = ({ value }) => {
  const getBackgroundColor = () => {
    if (value === 100) return 'blue';
    if (value === 0) return 'green';
    return 'white';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ fontSize: '12px' }}>ADI</div>
      <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '1px solid black', backgroundColor: getBackgroundColor() }}></div>
    </div>
  );
};

const VisualDisplay: React.FC<{ data: Telemetry[] }> = ({ data }) => (
  <div>
    {data.map((d, i) => (
      <div key={i} style={{ display: 'flex', gap: '40px', alignItems: 'center', marginTop: '30px', justifyContent: 'center' }}>
        <AltitudeBar value={d.Altitude} />
        <Compass value={d.HIS} />
        <HorizonGauge value={d.ADI} />
      </div>
    ))}
  </div>
);

const TextDisplay: React.FC<{ data: Telemetry[] }> = ({ data }) => (
  <div style={{ marginTop: '20px', fontSize: '16px' }}>
    {data.map((d, i) => (
      <div key={i}>
        <div>Altitude: {d.Altitude}</div>
        <div>HIS: {d.HIS}</div>
        <div>ADI: {d.ADI}</div>
        <hr />
      </div>
    ))}
  </div>
);

const App: React.FC = () => {
  const [form, setForm] = useState<Partial<Telemetry>>({});
  const [mode, setMode] = useState<'text' | 'visual'>('text');
  const [records, setRecords] = useState<Telemetry[]>([]);
  const [showDialog, setShowDialog] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: Number(e.target.value) });
  };

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:5001/api/telemetry', form);
      const { data } = await axios.get('http://localhost:5001/api/telemetry');
      setRecords(data);
      setForm({});
      setShowDialog(false);
    } catch (error) {
      console.error("Network Error:", error);
      alert("Could not connect to server at port 5001. Is it running?");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('http://localhost:5001/api/telemetry');
        setRecords(data);
      } catch (err) {
        console.error("Failed to load data on startup:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '600px', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center' }}>Flight Simulator Monitor</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setShowDialog(true)}>+</button>
        <button onClick={() => setMode('text')}>Text</button>
        <button onClick={() => setMode('visual')}>Visual</button>
      </div>

      {showDialog && (
        <div style={{ border: '1px solid #aaa', padding: '20px', background: '#fefefe' }}>
          <h4>Enter Telemetry Data</h4>
          <input name="Altitude" placeholder="Altitude (0-3000)" value={form.Altitude ?? ''} onChange={handleChange} /><br />
          <input name="HIS" placeholder="HIS (0-360)" value={form.HIS ?? ''} onChange={handleChange} /><br />
          <input name="ADI" placeholder="ADI (-100 to 100)" value={form.ADI ?? ''} onChange={handleChange} /><br />
          <button onClick={handleSubmit}>Send</button>
          <button onClick={() => setShowDialog(false)} style={{ marginLeft: '10px' }}>Cancel</button>
        </div>
      )}

      {mode === 'text' ? <TextDisplay data={records} /> : <VisualDisplay data={records} />}
    </div>
  );
};

export default App;