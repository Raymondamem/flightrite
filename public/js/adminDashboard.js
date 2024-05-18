document.querySelector('.available_flights').addEventListener('click', deleteFlight_bookFlight);
const booking_model = document.querySelector('.booking_modele');
const booking_modele_paystack = document.querySelector('.booking_modele_paystack');
const booking_model_btn = document.querySelector('.booking_modele > .booking_btn');
const booking_modele_paystack_btn_prev = document.querySelector('.booking_modele_paystack > .booking_btn_prev');
const booking_modele_paystack_btn = document.querySelector('#paymentForm');
const loadingAnimation = document.querySelector('.loading_anim');
const booking_cls_btn = document.querySelectorAll('.booking_cls_btn');
const success_error_modele = document.querySelector('.success_error_modele');
const bookingCretarials = {}

async function deleteFlight_bookFlight(e) {
  if (e.target.classList.contains('delete-btn') && e.target.dataset.ischeck === 'admin') {
    // delete flight by admin
    const flightId = e.target.parentElement.dataset.flightld;
    const confirmDeletion = confirm("Are you sure you want to delete flight?");
    if (!confirmDeletion) return;
    const response = await fetch(`/api/admin/delete-flight/${flightId}`, {
      method: "delete",
    });

    const data = await response.json();
    alert(data.message);
    location.reload();

  } else if (e.target.classList.contains('delete-btn') && e.target.dataset.ischeck === 'user') {
    // book the flight
    bookingCretarials.flightId = e.target.parentElement.dataset.flightld;
    bookingCretarials.userid = e.target.parentElement.dataset.userid;
    bookingCretarials.useremail = e.target.parentElement.dataset.useremail;
    bookingCretarials.userfirstname = e.target.parentElement.dataset.userfirstname;
    bookingCretarials.userlastname = e.target.parentElement.dataset.userlastname;
    bookingCretarials.basePrice = e.target.parentElement.dataset.price;
    // console.log(`userid: ${e.target.parentElement.dataset.userid}, flightId: ${e.target.parentElement.dataset.flightld}, user-Type: ${e.target.dataset.ischeck}`);
    booking_model.classList.add('active');
  }
}

function payWithPaystack() {
  alert("done")
}

async function storeUserSuccessPaymentToDB(userObj) {
  const response = await fetch(`/api/dashboard/book-flight/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userObj)
  });

  const data = await response.json();
  alert(data.message);
  location.reload();
}

booking_model_btn.addEventListener("click", async function () {
  if (!booking_model.querySelector('#passenger_count').value ||
    !booking_model.querySelector('#flight_class').value ||
    !booking_model.querySelector('#flight_note').value) {
    alert("Invalid or Empty fields!!!");
    return;
  }

  if (booking_model.querySelector('#passenger_count').value > 9) {
    alert("Can not book more than 9 seat at a time please!");
    return;
  }
  // check available seats first b4 procced
  const response = await fetch(`/api/dashboard/check-available-flights/${bookingCretarials.flightId}/${booking_model.querySelector('#passenger_count').value}`);
  const data = await response.json();
  console.log(data.message, data.seats)
  if (data.seats === 'null') {
    alert(data.message);
    return;
  } else {
    bookingCretarials.availableSeats = data.seats;
    bookingCretarials.computedAmount = (booking_model.querySelector('#flight_class').value === "A") ?
      (bookingCretarials.basePrice * 3) * parseInt(booking_model.querySelector('#passenger_count').value) :
      (booking_model.querySelector('#flight_class').value === "B") ? (bookingCretarials.basePrice * 2) *
        parseInt(booking_model.querySelector('#passenger_count').value) :
        bookingCretarials.basePrice * parseInt(booking_model.querySelector('#passenger_count').value);

    booking_modele_paystack.querySelector('#pay_email').value = bookingCretarials.useremail
    booking_modele_paystack.querySelector('#pay_amount').value = bookingCretarials.computedAmount
    booking_modele_paystack.querySelector('#pay_firstname').value = bookingCretarials.userfirstname
    booking_modele_paystack.querySelector('#pay_lastname').value = bookingCretarials.userlastname

    bookingCretarials.passenger_count = booking_model.querySelector('#passenger_count').value;
    bookingCretarials.flight_class = booking_model.querySelector('#flight_class').value;
    bookingCretarials.flight_note = booking_model.querySelector('#flight_note').value;
    booking_model.classList.remove('active');
    loadingAnimation.classList.add('active');
    // creat animation 
    let callPaystack = setTimeout(function () {
      loadingAnimation.classList.remove('active');
      booking_modele_paystack.classList.add('active');
      clearTimeout(callPaystack);
    }, 2000);
  }
});

booking_modele_paystack_btn_prev.addEventListener('click', function () {
  booking_modele_paystack.classList.remove('active');
  booking_model.classList.add('active');
});

booking_modele_paystack_btn.addEventListener('submit', function (e) {
  e.preventDefault();
  // will do stuffs here bro 🥂
  if (!booking_modele_paystack.querySelector('#pay_email').value ||
    !booking_modele_paystack.querySelector('#pay_amount').value ||
    !booking_modele_paystack.querySelector('#pay_firstname').value ||
    !booking_modele_paystack.querySelector('#pay_lastname').value) {
    alert("Invalid or Empty fields!!!");
    return;
  }
  // clear fields
  booking_model.querySelector('#passenger_count').value = "";
  booking_model.querySelector('#flight_class').value = "";
  booking_model.querySelector('#flight_note').value = "";
  booking_modele_paystack.querySelector('#pay_email').value = "";
  booking_modele_paystack.querySelector('#pay_amount').value = "";
  booking_modele_paystack.querySelector('#pay_firstname').value = "";
  booking_modele_paystack.querySelector('#pay_lastname').value = "";
  booking_modele_paystack.classList.remove('active');
  // handle payment here###
  let handler = PaystackPop.setup({
    key: 'pk_test_c3f86bec087df1cc38252b08b33f0343165f124a', // Replace with your public key
    email: bookingCretarials.useremail,
    amount: bookingCretarials.computedAmount * 100,
    ref: '' + Math.floor((Math.random() * 1000000000) + 1), // generates a pseudo-unique reference. Please replace with a reference you generated. Or remove the line entirely so our API will generate one for you
    // label: "Optional string that replaces customer email"
    onClose: function () {
      alert("windows closed.");
    },
    callback: function (response) {
      let message = 'Payment complete! Reference: ' + response.reference;
      bookingCretarials.paymentReference = response.reference;
      bookingCretarials.paymentMessage = response.message;
      console.log("bookingCretarials", bookingCretarials);
      console.log("response", response);
      alert(message);
      // store to DB
      storeUserSuccessPaymentToDB(bookingCretarials);
    }
  });
  handler.openIframe();
});

booking_cls_btn.forEach(el => {
  el.addEventListener('click', function () {
    booking_model.querySelector('#passenger_count').value = "";
    booking_model.querySelector('#flight_class').value = "";
    booking_model.querySelector('#flight_note').value = "";
    booking_modele_paystack.querySelector('#pay_email').value = "";
    booking_modele_paystack.querySelector('#pay_amount').value = "";
    booking_modele_paystack.querySelector('#pay_firstname').value = "";
    booking_modele_paystack.querySelector('#pay_lastname').value = "";
    booking_model.classList.remove('active');
    booking_modele_paystack.classList.remove('active');
  })
})

