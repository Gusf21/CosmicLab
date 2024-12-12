
document.addEventListener("DOMContentLoaded", () => {
    set_random_planet();
})

function set_random_planet() {
    let elements = document.getElementsByClassName("img");

    for (let tile of elements) {
        let file = "../images/planets/planet" + Math.round((Math.random() * 19)+1) + ".gif";

        tile.setAttribute("src", file);
    }
}