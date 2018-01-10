function validatePassword(event) {
  var pw1 = document.getElementById("password1");
  var pw2 = document.getElementById("password2");
  var form = document.getElementById("changePasswordForm");

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
 var changePasswordForm = document.getElementById("changePasswordForm");
  signupForm.addEventListener("submit",stopSubmit);

  var signupBtn = document.getElementById("changePasswordBtn");
  signupBtn.addEventListener("click",validatePassword);

}
$("document").ready(loaded);