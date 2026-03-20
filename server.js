// Root server.js - Serves both trust and billing shop folders
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const {connect} = require('./db.js');
const Trust = require('./model.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Data file for storing member and payment data
const DATA_FILE = path.join(__dirname, 'data.json');



// Middleware
app.use(cors());
app.use(bodyParser.json());

async function ensureDbConnected(req, res, next) {
  try {
    await connect();
    return next();
  } catch (err) {
    return res.status(500).json({
      isOk: false,
      message: 'Database connection failed'
    });
  }
}

// Only connect to DB for routes that need it (serverless-friendly).
app.use(['/api', '/collection-stats'], ensureDbConnected);

// Serve static files from trust folder
app.use('/trust', express.static(path.join(__dirname, 'trust')));

// Serve static files from billing shop folder
app.use('/billing', express.static(path.join(__dirname, 'billing shop')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'trust', 'index.html'));
});

// Utility: load data
function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE);
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load data', err);
    return [];
  }
}

// Utility: save data
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// API Routes for data management
app.get('/api/data', async (req, res) => {
  const data = await Trust.find({ isDeleted: false });
  res.json(data);
});

app.get("/collection-stats", async (req, res) => {
  try {

    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const monthly = await Trust.aggregate([
      {
        $match: {
          isDeleted: false,
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    const sixMonths = await Trust.aggregate([
      {
        $match: {
          isDeleted: false,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    const yearly = await Trust.aggregate([
      {
        $match: {
          isDeleted: false,
          createdAt: { $gte: startOfYear }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    res.json({
      monthly: monthly[0]?.total || 0,
      sixMonths: sixMonths[0]?.total || 0,
      yearly: yearly[0]?.total || 0
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/status", async (req, res) => {
  try {

    const { status } = req.query;

    let filter = {
      isDeleted: false
    };

    // status filter
    if (status) {
      filter.status = status;
    }

    const data = await Trust.find(filter);

    res.json(data);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

app.post('/api/data', async (req, res) => {
  try {
    const payload = req.body;
    const createtrust = await Trust.create(payload);
    res.json({ isOk: true, data: createtrust });
  } catch (error) {
    res.status(400).json({
      isOk: false,
      message: error.message
    });
  }
});

app.delete("/api/data/:id", async (req, res) => {
  try {

    const id = req.params.id;

    const record = await Trust.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({
        isOk: false,
        message: "Record not found"
      });
    }

    res.json({
      isOk: true,
      message: "Record soft deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      isOk: false,
      message: error.message
    });

  }
});

app.put("/api/trust/:id", async (req, res) => {
  try {

    const id = req.params.id;

    const updatedRecord = await Trust.findByIdAndUpdate(
      id,
      { status: "approved" },   // change pending → approved
      { new: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({
        isOk: false,
        message: "Record not found"
      });
    }

    res.json({
      isOk: true,
      message: "Status approved successfully",
      data: updatedRecord
    });

  } catch (error) {

    res.status(500).json({
      isOk: false,
      message: error.message
    });

  }
});



// Start server
async function start() {
  await connect();
  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`📁 Trust folder: http://localhost:${PORT}/trust`);
    console.log(`📁 Billing folder: http://localhost:${PORT}/billing`);
    console.log(`📊 API: http://localhost:${PORT}/api/data`);
  });
}

if (require.main === module) {
  start().catch((err) => {
    console.error('❌ Unable to start server.', err);
    process.exit(1);
  });
}

module.exports = app;
