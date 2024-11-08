  /*REGISTER*/

document.getElementById("registerForm").addEventListener("submit", function(event) {
    event.preventDefault();
  
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
  
    if (name && email && username && password) {
        alert("Registration successful!");
    } else {
        alert("Please fill in all fields.");
    }
  });

  /*LOGIN*/

  document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (email && password) {
        alert("Login successful!");
    } else {
        alert("Please enter both email and password.");
    }
});

  