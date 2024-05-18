const signup_form = document.querySelector('#signup_form');

signup_form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(signup_form);

    console.log(formData.values());
})