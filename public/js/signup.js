function redirectToLogin(event) {
  window.location = "/login";
}
function validatePassword(event) {
  var pw1 = document.getElementById("password1");
  var pw2 = document.getElementById("password2");
  var form = document.getElementById("signupForm");

  if(form.checkValidity()) {
    if(pw1.value != pw2.value ) {
      pw2.setCustomValidity("Passwords don't match!");
      console.log(pw1.value);
      console.log(pw2.value);
    } else {
      form.submit();
    }
  }
}
function stopSubmit(event) {
    event.preventDefault();
}
function loaded(event) {
  var signupForm = document.getElementById("signupForm");
  signupForm.addEventListener("submit",stopSubmit);

  var signupBtn = document.getElementById("signupBtn");
  signupBtn.addEventListener("click",validatePassword);

  var loginBtn = document.getElementById("loginBtn");
  loginBtn.addEventListener("click",redirectToLogin);

}
$("document").ready(loaded);