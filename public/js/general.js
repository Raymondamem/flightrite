// Simple search algorithm, ideally there's alot to be done for the search but no time left
const inputElOne = document.querySelector('#inputsFieldOne');
const inputElTwo = document.querySelector('#inputsFieldTwo');
let searchArr = null;

inputElOne.addEventListener("keyup", inPutOneFunc);
inputElTwo.addEventListener("keyup", inPutTwoFunc);

function inPutOneFunc(e) {
    let filter, a, i;

    filter = inputElOne.value.toUpperCase();
    let search_results = document.querySelectorAll('.search_results > .available_flights > div');

    for (i = 0; i < search_results.length; i++) {
        a = search_results[i].querySelector("div > span[data-depfrm]");
        console.log(a);

        if (a.innerHTML.toUpperCase()
            .indexOf(filter) > -1) {
            search_results[i].style.display = "";
            searchArr = filter;
            console.log("Array ", filter);
        } else {
            search_results[i].style.display = "none";
        }
    }
}

function inPutTwoFunc(e) {
    let filter, a, i;

    filter = inputElTwo.value.toUpperCase();
    let search_results = document.querySelectorAll('.search_results > .available_flights > div');

    for (i = 0; i < search_results.length; i++) {
        a = search_results[i].querySelector("div > span[data-arvat]");
        console.log(a);

        if (a.innerHTML.toUpperCase()
            .indexOf(filter) > -1) {
            search_results[i].style.display = "";
            searchArr.push(filter);
            console.log("Array ", filter);
        } else {
            search_results[i].style.display = "none";
        }
    }
}

document.querySelector("#available_flights").addEventListener("click", function (e) {
    const parentElement = e.target.closest('.parentWrapper');
    const id = parentElement.dataset.flightld;
    const price = parentElement.dataset.price;
    console.log(id, price);
    window.location.href = `/api/dashboard?flightId=${id}&price=${price}`;
});

