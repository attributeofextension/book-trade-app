function showMyTrade(event) {
  var myTradeDiv = document.getElementById("myTrade");
  var yourTradeDiv = document.getElementById("yourTrade");

 
  yourTradeDiv.classList.add("hidden");
  
  if(myTradeDiv.classList.contains("hidden")) {
    myTradeDiv.classList.remove("hidden");
  } else {
    myTradeDiv.classList.add("hidden");
  }
}

function showYourTrade(event) {
  var myTradeDiv = document.getElementById("myTrade");
  var yourTradeDiv = document.getElementById("yourTrade");

  myTradeDiv.classList.add("hidden");
  
  if(yourTradeDiv.classList.contains("hidden")) {
    yourTradeDiv.classList.remove("hidden");
  } else {
    yourTradeDiv.classList.add("hidden");
  }


}




function loaded(event) {
  var myReqBtn = document.getElementById("myReqBtn");
  myReqBtn.addEventListener("click",showMyTrade);
  var yourReqBtn = document.getElementById("yourReqBtn");
  yourReqBtn.addEventListener("click",showYourTrade);
}

$("document").ready(loaded);