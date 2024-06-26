const booking_model = document.querySelector('.booking_modele');
const booking_modele_paystack = document.querySelector('.booking_modele_paystack');
const booking_model_btn = document.querySelector('.booking_modele > .booking_btn');
const booking_modele_paystack_btn_prev = document.querySelector('.booking_modele_paystack > .booking_btn_prev');
const booking_modele_paystack_btn = document.querySelector('#paymentForm');
const loadingAnimation = document.querySelector('.loading_anim');
const booking_cls_btn = document.querySelectorAll('.booking_cls_btn');
const success_error_modele = document.querySelector('.success_error_modele');
const bookedFlightsId_El = document.querySelector('#bookedFlightsId');
const inner_booked_wrapper_El = document.querySelector('#bookedFlightsId > .inner_booked_wrapper');
const bookedFlightsId_close_btn_El = document.querySelector('#bookedFlightsId > button');
const bookingCretarials = {}
let data = null;
let domArr = []
let isAdminCheck = false;

document.querySelector('.available_flights').addEventListener('click', deleteFlight_bookFlight);
document.querySelector('.inner_booked_wrapper').addEventListener('click', deleteFlight_bookFlight);

document.querySelector('#seeBookedFlightsBtn').addEventListener('click', async function (e) {
  const userid = e.target.dataset.userid;

  if (userid !== 'admin') {
    isAdminCheck = false;
    const response = await fetch(`/api/dashboard/get-booked-flights/${userid}`);
    data = await response.json();
  } else {
    console.log("admin getting st!!!");
    isAdminCheck = true;
    const response = await fetch(`/api/admin/dashboard/get-all-booked-flights`);
    data = await response.json();
  }
  console.log(data.booked_flights);
  // //////////////
  data.booked_flights.forEach(flightsBooked => {
    domArr.push(computed_booked_flights(flightsBooked, isAdminCheck ? true : false, true));
  })
  // display it 
  inner_booked_wrapper_El.innerHTML = domArr;
  data = null;
  domArr = [];
  bookedFlightsId_El.classList.add("activeBlock");
});

document.querySelector('#adminGetAllUnBookedFlights').addEventListener('click', async function (e) {
  isAdminCheck = true;
  const response = await fetch(`/api/admin/dashboard/get-all-unbooked-flights`);
  data = await response.json();
  console.log(data.booked_flights);
  // //////////////
  data.booked_flights.forEach(flightsBooked => {
    domArr.push(computed_booked_flights(flightsBooked, isAdminCheck ? true : false));
  });
  // display it
  inner_booked_wrapper_El.innerHTML = domArr;
  data = null;
  domArr = [];
  bookedFlightsId_El.classList.add("activeBlock");
});

document.querySelector('#bookedFlightsId > button').addEventListener('click', function () {
  bookedFlightsId_El.classList.remove("activeBlock");
});

async function deleteFlight_bookFlight(e) {
  console.log(433)
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
  location.replace('/api/dashboard/');
  // window.location.href = '/api/dashboard/';
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
});

// functions
function computed_booked_flights(obj, isAdmin = false, isBooked = false) {

  const getDateTime = (isoString) => {
    const date = new Date(isoString);
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // getUTCMonth() returns 0-based month
    const day = date.getUTCDate().toString().padStart(2, '0');
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    const formattedTime = `${hours}:${minutes}:${seconds}`;
    return `${formattedDate} ${formattedTime}`;
  };

  if (isBooked) {
    console.log("first")
    return (`
  <div class="${isAdmin ? "addGreenInner parentWrapper" : "parentWrapper"}">
  <div>
    <span style="margin-bottom: .5rem;">
        Flight Name:${obj.flightinfo.flight_name}
    </span>
    <span>
        Flight Class:${obj.booked_class}
    </span>
  </div>
  <div>
    <span style="margin-bottom: .5rem;">
        Booked Date:${getDateTime(obj.booking_date)}
    </span>
    <span>
        Booked ID:${obj.booking_reference}
    </span>
  </div>
  <div>
    <span style="margin-bottom: .5rem;">
        Booked Amount:${obj.paid_price}
    </span>
    <span>
        Booked persons:${obj.passenger_count}
    </span>
  </div>
  <div>
    <span style="margin-bottom: .5rem;">
        Seats-NO(s):${obj.seat_numbers}
    </span>
    <span>
        Seats-NO(s):${obj.seat_numbers}
    </span>
  </div>
  <div>
    <span style="margin-bottom: .5rem;">
        depart.from:${obj.flightinfo.depart_from}
    </span>
    <span>
        arrive.at:${obj.flightinfo.arrive_at}
    </span>
  </div>
  <div>
    <span style="margin-bottom: .5rem;">
        Takeoff time:
        <span>
        ${getDateTime(obj.flightinfo.takeoff_time)}
        </span>
        </span>
    <span style="margin-bottom: .5rem;">
        Landing time:
        <span>
        ${getDateTime(obj.flightinfo.landing_time)}
        </span>
    </span>
    <span>
        total no seat:
        <span>
        ${obj.flightinfo.no_seats}
        </span>
    </span>
  </div>
  </div>`);
  } else {
    console.log("second")
    return (`
    <div class="parentWrapper"
    data-flightld="${obj.id}" data-price="${obj.price}"
    data-availableseats="${obj.available_seats}">
    <div>
        <span style="margin-bottom: .5rem;">
            ${obj.flight_name}
        </span>
        <span>
            labele Seats:${obj.available_seats}
        </span>
    </div>
    <div>
        <span>
            ${obj.depart_from}
        </span>
    </div>
    <div>
        <span>
            ${obj.arrive_at}
        </span>
    </div>
    <div>
        <span>
            ${obj.takeoff_time}
        </span>
    </div>
    <div>
        <span>
            ${obj.landing_time}
        </span>
    </div>
    <div>
        <span style="margin-bottom: .5rem;">
            First Class:
            ₦<span>
                ${obj.price * 3}
            </span>
        </span>
        <span style="margin-bottom: .5rem;">
            Economy:
            ₦<span>
                ${obj.price * 2}
            </span>
        </span>
        <span>
            Business:
            ₦<span>
                ${obj.price}
            </span>
        </span>
    </div>
    <button class="delete-btn" style="color: white; font-size: 2rem; font-weight:bolder; background: red;"
        data-ischeck="admin">
        Delete Flight
    </button>
</div>
    `)
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  let flightId = urlParams.get('flightId');
  let price = urlParams.get('price');
  console.log(flightId, price);

  if (flightId && price) {
    bookingCretarials.flightId = flightId
    bookingCretarials.userid = booking_model.dataset.userid;
    bookingCretarials.useremail = booking_model.dataset.useremail;
    bookingCretarials.userfirstname = booking_model.dataset.userfirstname;
    bookingCretarials.userlastname = booking_model.dataset.userlastname;
    bookingCretarials.basePrice = price;
    booking_model.classList.add('active');
  }
});