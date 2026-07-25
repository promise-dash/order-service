const express = require('express');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON bodies
app.use(express.json());

// --- In-Memory Database ---
const ordersDb = new Map([
  [
    '101',
    {
      id: '101',
      customerId: 'cust_99',
      items: [{ itemId: 'item_a', quantity: 2, unitPrice: 15.0 }],
      status: 'PENDING',
      totalAmount: 30.0,
    },
  ],
]);

// --- Endpoints ---

// GET /health
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'order-service' });
});

// GET /orders
app.get('/orders', (req, res) => {
  const orders = Array.from(ordersDb.values());
  res.status(200).json(orders);
});

// GET /orders/:id
app.get('/orders/:id', (req, res) => {
  const order = ordersDb.get(req.params.id);

  if (!order) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Order with ID '${req.params.id}' not found`,
    });
  }

  res.status(200).json(order);
});

// POST /orders
app.post('/orders', (req, res) => {
  const { customerId, items } = req.body;

  // Basic validation
  if (!customerId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'customerId and a non-empty items array are required',
    });
  }

  // Calculate total amount
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const newId = crypto.randomUUID().slice(0, 8); // Short unique ID
  const newOrder = {
    id: newId,
    customerId,
    items,
    status: 'CREATED',
    totalAmount,
  };

  ordersDb.set(newId, newOrder);
  res.status(201).json(newOrder);
});

app.listen(PORT, () => {
  console.log(`Order service running on port ${PORT}`);
});