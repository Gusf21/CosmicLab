
function set_random_planet() {
    let element = document.getElementsByClassName("img");
    var request = XMLHttpRequest();
    request.open("GET", "https://localhost:7168/api/Data/GetUserCreations?userId=0", false)

    console.log("Setting planet");
    console.log(element[0].getAttribute("src"));

    let file = "../images/planets/planet" + Math.round((Math.random() * 19)+1) + ".gif";

    console.log(file);

    element[0].setAttribute("src", file);
}

window.onload = set_random_planet();