const searchEl = document.querySelector('#searcher');
const inputElOne = document.querySelector('#inputsFieldOne');
const inputElTwo = document.querySelector('#inputsFieldTwo');
const data_arvat = document.querySelectorAll('span[data-arvat]');
const data_depfrm = document.querySelectorAll('span[data-depfrm]');
const err_one = document.querySelector('#err_one');
let searchArr = [];

inputElOne.addEventListener('input', function (e) {
    const inputVal = e.target.value.trim().toLowerCase();
    data_depfrm.forEach(el => {
        const elText = el.textContent.trim().toLowerCase();
        if (inputVal === elText) {
            if (inputVal === elText) {
                const result = searchArr.find(({ feild1 }) => feild1 === elText);
                if (result) {
                    // searchArr.push({ feild1: elText });
                } else {
                    searchArr.push({ feild1: elText });
                }
            }
        }
    });
});

inputElTwo.addEventListener('input', function (e) {
    if (inputElOne.value.trim() !== "") {
        const inputVal = e.target.value.trim().toLowerCase();
        data_arvat.forEach(el => {
            const elText = el.textContent.trim().toLowerCase();
            if (inputVal === elText) {
                const result = searchArr.find(({ feild2 }) => feild2 === elText);
                if (result) {
                    // searchArr.push({ feild2: elText });
                } else {
                    searchArr.push({ feild2: elText });
                }
            }
        });
        // will filter DOM here
        const fss = setTimeout(function () {
            console.log(searchArr, ", final run!")
            searchArr = [];
            clearTimeout(fss);
        })
    } else {
        err_one.innerHTML = "Empty Field!";
        inputElTwo.value = "";
    }
});
