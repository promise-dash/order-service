import express, { Request, Response } from "express";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

interface OrderItem {
  itemId: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  status: string;
  totalAmount: number;
}

// In-Memory Database
const ordersDb = new Map<string, Order>([
  [
    "101",
    {
      id: "101",
      customerId: "cust_99",
      items: [{ itemId: "item_a", quantity: 2, unitPrice: 15.0 }],
      status: "PENDING",
      totalAmount: 30.0,
    },
  ],
]);

// Endpoints
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "OK", service: "order-service" });
});

app.get("/orders", (_req: Request, res: Response) => {
  const orders = Array.from(ordersDb.values());
  res.status(200).json(orders);
});

app.get("/orders/:id", (req: Request, res: Response) => {
  const order = ordersDb.get(req.params.id);

  if (!order) {
    return res.status(404).json({
      error: "Not Found",
      message: `Order with ID '${req.params.id}' not found`,
    });
  }

  res.status(200).json(order);
});

app.post("/orders", (req: Request, res: Response) => {
  const { customerId, items } = req.body;

  if (!customerId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: "Bad Request",
      message: "customerId and a non-empty items array are required",
    });
  }

  const totalAmount = items.reduce(
    (sum: number, item: OrderItem) => sum + item.quantity * item.unitPrice,
    0,
  );

  const newId = crypto.randomUUID().slice(0, 8);
  const newOrder: Order = {
    id: newId,
    customerId,
    items,
    status: "CREATED",
    totalAmount,
  };

  ordersDb.set(newId, newOrder);
  res.status(201).json(newOrder);
});

app.listen(PORT, () => {
  console.log(`Order service running on port ${PORT}`);
});
