const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files (HTML, CSS, JS)

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/restaurant', { useNewUrlParser: true, useUnifiedTopology: true });

const OrderSchema = new mongoose.Schema({
    table: String,
    items: Array,
    total: Number,
    dateTime: String,
    status: String
});

const Order = mongoose.model('Order', OrderSchema);

// Routes

// Create new order
app.post('/api/orders', async (req, res) => {
    const { table, items, total, dateTime, status } = req.body;
    const newOrder = new Order({ table, items, total, dateTime, status });
    await newOrder.save();
    res.status(201).json(newOrder);
});

// Get all orders
app.get('/api/orders', async (req, res) => {
    const orders = await Order.find();
    res.status(200).json(orders);
});

// Update order status
app.put('/api/orders/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });
    res.status(200).json(updatedOrder);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
