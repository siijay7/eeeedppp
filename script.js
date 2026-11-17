// Simple Notification Functions
function showNotification() {
    const popup = document.getElementById("successPopup");
    if (popup) {
        popup.style.display = "flex";
    }
}

function hideNotification() {
    const popup = document.getElementById("successPopup");
    if (popup) {
        popup.style.display = "none";
    }
}

// Close button click
document.addEventListener("click", function(e) {
    if (e.target && e.target.id === "closePopupBtn") {
        hideNotification();
    }
});

const STORAGE_KEY = "smashBurgerReservations";
const CART_KEY = "smashBurgerCart";
const MIN_ORDER_AMOUNT = 800;
const DOWN_PAYMENT_AMOUNT = 250;

const allowedDays = [1, 3, 5, 6];

const timeSlots = [
    { value: "10:00", label: "10:00 AM – 12:00 PM" },
    { value: "12:00", label: "12:00 PM – 2:00 PM" },
    { value: "14:00", label: "2:00 PM – 4:00 PM" },
    { value: "16:00", label: "4:00 PM – 6:00 PM" },
    { value: "18:00", label: "6:00 PM – 7:00 PM" }
];

const MAX_GROUPS = 2;
const MAX_GUESTS = 4;

// Cart
let cart = [];

// Elements
const form = document.getElementById("reservationForm");
const customerName = document.getElementById("customerName");
const contact = document.getElementById("contact");
const bookingDate = document.getElementById("bookingDate");
const bookingTime = document.getElementById("bookingTime");
const guestCount = document.getElementById("guestCount");
const availability = document.getElementById("availability");
const message = document.getElementById("message");
const downPaymentPaid = document.getElementById("downPaymentPaid");
const paymentFromNumber = document.getElementById("paymentFromNumber");
const calendarToggle = document.getElementById("calendarToggle");
const calendarPopup = document.getElementById("calendarPopup");
const calendarDays = document.getElementById("calendarDays");
const monthYear = document.getElementById("monthYear");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");
const cartItems = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const clearCartBtn = document.getElementById("clearCartBtn");

const today = new Date();
today.setHours(0, 0, 0, 0);
let displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let reservations = loadReservations();

// ========== CART FUNCTIONS ==========
function loadCart() {
    try {
        const saved = localStorage.getItem(CART_KEY);
        cart = saved ? JSON.parse(saved) : [];
    } catch { cart = []; }
    updateCartDisplay();
}

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(name, price) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, price: Number(price), qty: 1 });
    }
    saveCart();
    updateCartDisplay();
}

function updateQty(name, delta) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            cart = cart.filter(i => i.name !== name);
        }
    }
    saveCart();
    updateCartDisplay();
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartDisplay();
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function updateCartDisplay() {
    if (!cartItems || !cartTotalEl) return;
    
    cartItems.innerHTML = "";
    
    if (cart.length === 0) {
        cartItems.innerHTML = "<p class='no-items'>No items in cart yet.</p>";
        cartTotalEl.textContent = "0.00";
        return;
    }

    cart.forEach(item => {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <span>${item.name}</span>
            <div class="cart-item-qty">
                <button type="button" class="minus" data-name="${item.name}">−</button>
                <span>${item.qty}</span>
                <button type="button" class="plus" data-name="${item.name}">+</button>
                <span>₱${(item.price * item.qty).toFixed(2)}</span>
            </div>
        `;
        cartItems.appendChild(div);
    });

    cartTotalEl.textContent = getCartTotal().toFixed(2);
}

// Add to Cart Buttons
document.addEventListener("click", e => {
    if (e.target.classList.contains("add-to-cart")) {
        addToCart(e.target.dataset.name, e.target.dataset.price);
    }
    if (e.target.classList.contains("minus")) {
        updateQty(e.target.dataset.name, -1);
    }
    if (e.target.classList.contains("plus")) {
        updateQty(e.target.dataset.name, 1);
    }
});

if (clearCartBtn) {
    clearCartBtn.addEventListener("click", clearCart);
}

// ========== RESERVATION FUNCTIONS ==========
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function loadReservations() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(saved) ? saved : [];
    } catch { return []; }
}

function saveReservations() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
}

function isAllowedDay(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString + "T12:00:00");
    return allowedDays.includes(date.getDay());
}

function renderCalendar() {
    if (!calendarDays || !monthYear) return;
    
    calendarDays.innerHTML = "";
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();

    monthYear.textContent = displayedMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    if (prevMonth) {
        prevMonth.disabled = year === today.getFullYear() && month === today.getMonth();
    }

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("span");
        calendarDays.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        currentDate.setHours(0, 0, 0, 0);
        const dateString = formatDate(currentDate);
        const allowed = allowedDays.includes(currentDate.getDay());
        const isPast = currentDate < today;

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = day;

        if (isPast || !allowed) {
            button.disabled = true;
        }

        if (dateString === formatDate(today)) {
            button.classList.add("today");
        }

        if (bookingDate && dateString === bookingDate.value) {
            button.classList.add("selected");
        }

        button.addEventListener("click", () => {
            if (button.disabled) return;
            if (bookingDate) bookingDate.value = dateString;
            if (message) message.textContent = "";
            if (calendarPopup) calendarPopup.hidden = true;
            updateTimeSlots();
            renderCalendar();
        });

        calendarDays.appendChild(button);
    }
}

function toggleCalendar() {
    if (!calendarPopup || !bookingDate) return;
    calendarPopup.hidden = !calendarPopup.hidden;
    if (!calendarPopup.hidden) {
        if (bookingDate.value) {
            const selected = new Date(bookingDate.value + "T12:00:00");
            displayedMonth = new Date(selected.getFullYear(), selected.getMonth(), 1);
        }
        renderCalendar();
    }
}

// Calendar Events
if (calendarToggle) calendarToggle.addEventListener("click", toggleCalendar);
if (bookingDate) bookingDate.addEventListener("click", toggleCalendar);

if (prevMonth) prevMonth.addEventListener("click", () => {
    displayedMonth.setMonth(displayedMonth.getMonth() - 1);
    renderCalendar();
});

if (nextMonth) nextMonth.addEventListener("click", () => {
    displayedMonth.setMonth(displayedMonth.getMonth() + 1);
    renderCalendar();
});

document.addEventListener("click", (event) => {
    if (!event.target.closest(".calendar-wrapper") && calendarPopup) {
        calendarPopup.hidden = true;
    }
});

function getSlotCount(date, time) {
    return reservations.filter(r => r.date === date && r.time === time).length;
}

function findSlot(time) {
    return timeSlots.find(slot => slot.value === time);
}

function updateTimeSlots() {
    if (!bookingDate || !bookingTime || !availability) return;
    
    const selectedDate = bookingDate.value;
    bookingTime.innerHTML = '<option value="">Select a date first</option>';
    if (message) message.textContent = "";

    if (!selectedDate) {
        availability.textContent = "Select a date to check available slots.";
        availability.className = "availability";
        return;
    }

    if (!isAllowedDay(selectedDate)) {
        availability.textContent = "Reservations are only available on Monday, Wednesday, Friday, and Saturday.";
        availability.className = "availability full";
        return;
    }

    let availableSlots = 0;
    timeSlots.forEach(slot => {
        const bookedGroups = getSlotCount(selectedDate, slot.value);
        const remainingGroups = MAX_GROUPS - bookedGroups;
        const option = document.createElement("option");
        option.value = slot.value;

        if (remainingGroups <= 0) {
            option.textContent = slot.label + " - FULL";
            option.disabled = true;
        } else {
            option.textContent = slot.label + " - " + remainingGroups + " group(s) left";
            availableSlots++;
        }
        bookingTime.appendChild(option);
    });

    if (availableSlots === 0) {
        availability.textContent = "All time slots are fully booked.";
        availability.className = "availability full";
    } else {
        availability.textContent = availableSlots + " time slot(s) available. Max 2 groups per slot.";
        availability.className = "availability available";
    }
}

function isSlotAvailable(date, time) {
    return getSlotCount(date, time) < MAX_GROUPS;
}

function validateForm() {
    if (!customerName || !contact || !bookingDate || !bookingTime || !guestCount || !paymentFromNumber) {
        return "Please complete all fields.";
    }
    
    const name = customerName.value.trim();
    const phone = contact.value.trim();
    const date = bookingDate.value;
    const time = bookingTime.value;
    const guests = Number(guestCount.value);
    const senderNumber = paymentFromNumber.value.trim();
    const cartTotal = getCartTotal();

    if (!name || !phone || !date || !time || !senderNumber) {
        return "Please complete all reservation and payment fields.";
    }

    if (cartTotal < MIN_ORDER_AMOUNT) {
        return `Minimum order is ₱${MIN_ORDER_AMOUNT}. Your current total is ₱${cartTotal}.00 — please add more items.`;
    }

    if (!downPaymentPaid.checked) {
        return "Please confirm that you have paid the ₱250 down payment to complete your booking.";
    }

    if (!isAllowedDay(date)) {
        return "Please select Monday, Wednesday, Friday, or Saturday.";
    }

    if (date < formatDate(today)) {
        return "You cannot reserve a past date.";
    }

    if (!findSlot(time)) {
        return "Please select a valid time slot.";
    }

    if (!/^[0-9+()\- ]{7,20}$/.test(phone)) {
        return "Please enter a valid contact number.";
    }

    if (!/^[0-9+()\- ]{7,20}$/.test(senderNumber)) {
        return "Please enter a valid sender/GCash number.";
    }

    if (!Number.isInteger(guests) || guests < 1 || guests > MAX_GUESTS) {
        return "A reservation must have between 1 and 4 guests.";
    }

    if (!isSlotAvailable(date, time)) {
        updateTimeSlots();
        return "Sorry! This time slot is already fully booked. Please choose another slot.";
    }

    return null;
}

function addReservation(event) {
    event.preventDefault();

    const error = validateForm();
    if (error) {
        if (message) {
            message.textContent = error;
            message.className = "error";
        }
        return;
    }

    const date = bookingDate.value;
    const time = bookingTime.value;
    const cartTotal = getCartTotal();

    if (!isSlotAvailable(date, time)) {
        updateTimeSlots();
        if (message) {
            message.textContent = "This time slot is full. Please select another.";
            message.className = "error";
        }
        return;
    }

    const reservation = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
        code: "SB-" + Math.floor(100000 + Math.random() * 900000),
        name: customerName.value.trim(),
        contact: contact.value.trim(),
        paymentFromNumber: paymentFromNumber.value.trim(),
        date: date,
        time: time,
        timeLabel: findSlot(time)?.label || time,
        guests: Number(guestCount.value),
        cart: [...cart],
        cartTotal: cartTotal,
        minOrderAmount: MIN_ORDER_AMOUNT,
        downPayment: DOWN_PAYMENT_AMOUNT,
        balanceDue: cartTotal - DOWN_PAYMENT_AMOUNT,
        paymentConfirmed: false,
        createdAt: new Date().toISOString()
    };

    reservations.push(reservation);
    saveReservations();
    
    // Clear cart after successful reservation
    clearCart();

    if (message) {
        message.textContent =
            "✅ Reservation successful! Booking code: " + reservation.code +
            ". Total Order: ₱" + cartTotal.toFixed(2) +
            ". We'll verify your payment shortly.";
        message.className = "success";
            showNotification();

    }
    

    form.reset();
    if (bookingDate) bookingDate.value = "";
    if (guestCount) guestCount.value = "1";
    updateTimeSlots();
}

// Form Submit
if (form) form.addEventListener("submit", addReservation);

if (bookingTime) bookingTime.addEventListener("change", () => {
    const date = bookingDate.value;
    const time = bookingTime.value;
    if (date && time && !isSlotAvailable(date, time)) {
        updateTimeSlots();
        if (message) {
            message.textContent = "This time slot is full. Please choose another.";
            message.className = "error";
        }
    }
});

// Initialize on page load
loadCart();
renderCalendar();
updateTimeSlots();