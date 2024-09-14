const scanBtn = document.getElementById('scanBtn');
const cameraView = document.getElementById('cameraView');
const orderingSystem = document.getElementById('orderingSystem');
const orderNowBtn = document.getElementById('orderNowBtn');
const foodMenu = document.getElementById('foodMenu');
const foodList = document.getElementById('foodList');
const cartItems = document.getElementById('cartItems');
const totalAmount = document.getElementById('totalAmount');
const bookNowBtn = document.getElementById('bookNowBtn');
const tableNumberDropdown = document.getElementById('tableNumber');
const viewOrdersBtn = document.getElementById('viewOrdersBtn');
const orderHistory = document.getElementById('orderHistory');
const messageDiv = document.getElementById('message');

const foodItems = [
    { name: 'Burger', cost: 5 },
    { name: 'Pizza', cost: 8 },
    { name: 'Pasta', cost: 7 },
    { name: 'Salad', cost: 4 }
];

let cart = [];

// Fetch all orders from the server and display them
async function fetchOrders() {
    const res = await fetch('/api/orders');
    const orders = await res.json();
    orderHistory.innerHTML = '';
    
    orders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.innerHTML = `
            <strong>Table: ${order.table}</strong>
            <p>Date & Time: ${order.dateTime}</p>
            <p>Status: ${order.status}</p>
            <p>Total: $${order.total}</p>
            <ul>
                ${order.items.map(item => `<li>${item.name} - $${item.cost}</li>`).join('')}
            </ul>
            <hr>
        `;
        orderHistory.appendChild(orderDiv);
    });
}

// Simulate scanning the QR code
scanBtn.addEventListener('click', () => {
    cameraView.classList.remove('hidden');
    const html5QrCode = new Html5Qrcode("reader");

    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText, decodedResult) => {
            html5QrCode.stop();
            cameraView.classList.add('hidden');
            orderingSystem.classList.remove('hidden');
        },
        (errorMessage) => {
            console.error(errorMessage);
        }
    ).catch(err => {
        console.error(err);
    });
});

orderNowBtn.addEventListener('click', () => {
    const tableNumber = tableNumberDropdown.value;

    if (!tableNumber) {
        alert('Please select a table number.');
        return;
    }

    foodMenu.classList.remove('hidden');
    foodList.innerHTML = '';

    foodItems.forEach((item, index) => {
        const foodItemDiv = document.createElement('div');
        foodItemDiv.className = 'food-item';
        foodItemDiv.innerHTML = `
            <span>${item.name} - $${item.cost}</span>
            <button onclick="addToCart(${index})">+</button>
        `;
        foodList.appendChild(foodItemDiv);
    });
});

function addToCart(index) {
    const item = foodItems[index];
    cart.push(item);
    updateCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}


// function updateCart() {
//     cartItems.innerHTML = '';
//     let total = 0;
//     cart.forEach(item => {
//         total += item.cost;
//         cartItems.innerHTML += `<div>${item.name} - $${item.cost}</div>`;
//     });
//     totalAmount.textContent = total;
//     bookNowBtn.classList.remove('hidden');
// }



// function for update cat and remove from cart
function updateCart() {
    cartItems.innerHTML = '';
    let total = 0;
    cart.forEach((item, index) => {
        total += item.cost;
        cartItems.innerHTML += `
            <div>${item.name} - $${item.cost} <button onclick="removeFromCart(${index})">Remove</button></div>  
        `;
    });
    totalAmount.textContent = total;
    bookNowBtn.classList.remove('hidden');
}




bookNowBtn.addEventListener('click', async () => {
    if (cart.length === 0) {
        alert('Your cart is empty.');
        return;
    }

    const tableNumber = tableNumberDropdown.value;

    if (!tableNumber) {
        alert('Please select a table number.');
        return;
    }

    const currentDateTime = new Date().toLocaleString();
    
    const orderDetails = {
        table: tableNumber,
        items: cart,
        total: totalAmount.textContent,
        dateTime: currentDateTime,
        // status: 'Food is preparing'
    };

    // Send order details to the backend
    const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderDetails)
    });

    const data = await res.json();
    
    alert('Order booked successfully!');
    cart = [];
    updateCart();
    
    // Show preparing message
    messageDiv.textContent = 'Your food is preparing!';
    messageDiv.classList.remove('hidden');
    
    // Hide preparing message after 5 seconds
    setTimeout(() => {
        messageDiv.classList.add('hidden'); // Hide "Food is preparing!" message
    
        // Wait for the hiding animation (if any) to complete before showing "Food is ready!"
        setTimeout(() => {
            // Send notification that food is ready
            updateOrderStatus(data._id, 'Food is ready!');
            
            // Show "Food is ready!" message
            messageDiv.textContent = 'Your food is ready!';
            messageDiv.classList.remove('hidden');
        }, 100); // Delay slightly (e.g., 100ms) to ensure the previous message is fully hidden
    }, 5000); // 5-second delay for hiding the "Food is preparing!" message
    
    fetchOrders(); // Update the orders section
});

// Update order status in the backend
async function updateOrderStatus(orderId, status) {
    await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
    });
}

viewOrdersBtn.addEventListener('click', fetchOrders);

fetchOrders();
