const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use('/public', express.static('public'));
app.use(express.static('public'));


// MongoDB
mongoose.connect('mongodb://localhost:27017/juice_shop', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const orderSchema = new mongoose.Schema({
  name: String,
  phone: String,
  lichiJuices: Number,
  beetJuices: Number,
  peachJuices: Number,
  subTotal: Number,   
  tax: Number,       
  totalCost: Number,
});


const Order = mongoose.model('Order', orderSchema);

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/place-order', async (req, res) => {
  const formData = req.body;

  // Calculate the total cost of juices
  const lichiPrice = 3.99;
  const beetPrice = 2.99;
  const peachPrice = 3.49;

  const subTotal = formData.lichiJuices * lichiPrice + formData.beetJuices * beetPrice + formData.peachJuices * peachPrice;

  // Quebec Tax (@ 14.975%)
  const taxRate = 0.14975;
  const tax = subTotal * taxRate;

  // Calculate Total Cost
  const totalCost = subTotal + tax;

  const order = new Order({
    name: formData.name,
    phone: formData.phone,
    lichiJuices: formData.lichiJuices,
    beetJuices: formData.beetJuices,
    peachJuices: formData.peachJuices,
  });

  try {
    await order.save();
    console.log('Order saved to MongoDB');
  } catch (error) {
    console.error('Error saving order:', error);
  }

  res.render('thankyou', {
    order,
    subTotal: subTotal.toFixed(2), 
    tax: tax.toFixed(2), 
    totalCost: totalCost.toFixed(2), 
  });
});

app.get('/view-orders', async (req, res) => {
  const orders = await Order.find();

  // Calculating total values for all orders
  let totalSubTotal = 0;
  let totalTax = 0;
  let totalTotalCost = 0;

  orders.forEach(order => {
    const subTotal = order.lichiJuices * 3.99 + order.beetJuices * 2.99 + order.peachJuices * 3.49;
    const tax = subTotal * 0.14975;
    const totalCost = subTotal + tax;

    totalSubTotal += subTotal;
    totalTax += tax;
    totalTotalCost += totalCost;
  });

  res.render('vieworders', {
    orders,
    totalSubTotal: totalSubTotal.toFixed(2),
    totalTax: totalTax.toFixed(2),
    totalTotalCost: totalTotalCost.toFixed(2),
  });
});





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

