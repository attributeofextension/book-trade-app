function redirectToSignup(event) {
  window.location = "/signup";
}



function loaded(event) {
  var signupBtn = document.getElementById("signupBtn");
  signupBtn.addEventListener("click",redirectToSignup);
}
$("document").ready(loaded);