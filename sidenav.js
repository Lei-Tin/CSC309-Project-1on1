document.querySelector('.navbar-toggler').addEventListener('click', function () {
    var sidenav = document.getElementById("loginSidenav");
    if (sidenav.style.width === '250px') {
    sidenav.style.width = '0';
    } else {
    sidenav.style.width = '250px';
    }
});