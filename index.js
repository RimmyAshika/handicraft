// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDb0VVf4hYAUgzSXhUX4-JAsRu_6KItB8k",
    authDomain: "handicraft-92072.firebaseapp.com",
    projectId: "handicraft-92072",
    storageBucket: "handicraft-92072.appspot.com",
    messagingSenderId: "449559750628",
    appId: "1:449559750628:web:ff106a7fb1a79ed6c709f1"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// Initialize variables
const auth = firebase.auth()
const database = firebase.database()

// If user on login page
try{
    document.getElementById("login_form").addEventListener('submit', (e)=>{
        e.preventDefault();
    })
    document.getElementById("register_form").addEventListener('submit', (e)=>{
        e.preventDefault();
    })
}catch(err){
    // console.error(err);
}

let userIsLoggedIn = getCookie("userIsLoggedIn");
// let idToken = getCookie("idToken");
console.log(`Cookie read: "userIsLoggedIn: ${userIsLoggedIn}"`);
console.log(`Cookie read: "uid: ${getCookie("uid")}"`);
// console.log(`Cookie read: "idToken: ${getCookie("idToken")}"`);


if(userIsLoggedIn === "true"){
    const pageTitle =  document.querySelector('title').innerHTML;
    if(pageTitle==="Login"){
        updateLoginPage();
    }
    document.getElementById('loginHeader').innerHTML="loading..."
    updateNavbar();
    // updateLoginPage();
}


auth.onAuthStateChanged(function(user) {
    if (user) {
    //   User is signed in.
    console.log("User is logged in")

    //   updateNavbar();
    }else{
        console.log("User is logged out")
    }
  });

function logout() {
    auth.signOut()
      .then(() => {
        // Log out successful
        console.log('User logged out');
        userIsLoggedIn = true;
        setCookie("userIsLoggedIn", false, 1);
        setCookie("uid", "", 1);
        setCookie("idToken", "", 1);
        setCookie("userFullName","",1);
        alert("user logged out")
        location.reload();
      })
      .catch((error) => {
        // Handle logout error
        console.error('Logout error:', error);
      });
}

// Set up our register function
function register () {
    // Get all our input fields
    email = document.getElementById('register_email').value
    password = document.getElementById('register_password').value
    confirmPassword = document.getElementById('confirmPassword').value
    full_name = document.getElementById('full_name').value

    // Validate input fields
    if (validate_field(full_name) == false ) {
        alert('Please enter your full name!')
        return
    }
    if (validate_email(email) == false) {
        alert('Please enter your email')
        return
    }
    if (validate_password(password) == false) {
        alert('Please enter a password of more than 6 digits!')
        return
    }
    if (validate_password(confirmPassword) == false) {
        alert('Please re-enter your password. Make sure they are same!')
        return
    }
    if(password != confirmPassword) {
        alert("Password and confirm password are different. Please enter again!");
        document.getElementById('register_password').value = "";
        document.getElementById('confirmPassword').value = "";
        return;
    }
    


    // Move on with Auth
    auth.createUserWithEmailAndPassword(email, password)
    .then(function() {
        // Declare user variable
        var user = auth.currentUser

        // Add this user to Firebase Database
        var database_ref = database.ref()

        // Create User data
        var user_data = {
            email : email,
            full_name : full_name,
            last_login : Date.now()
        }

        // Push to Firebase Database
        database_ref.child('users/' + user.uid).set(user_data)

        // DOne
        alert('User Registered! You can now proceed to login.')
        const login_tab = document.getElementById('login_tab');
        toggleLogin(login_tab);
    })
    .catch(function(error) {
        // Firebase will use this to alert of its errors
        var error_code = error.code
        var error_message = error.message

        alert(error_message)
    })
}

// Set up our login function
function login () {
    // Get all our input fields
    email = document.getElementById('login_email').value
    password = document.getElementById('login_password').value

    // Validate input fields
    if (validate_email(email) == false) {
        alert('Please enter your email!')
        return
        // Don't continue running the code
    }
    if (validate_login_password(password) == false) {
        alert('Please enter your password!')
        return
        // Don't continue running the code
    }

    auth.signInWithEmailAndPassword(email, password)
    .then(function() {
        // Declare user variable
        var user = auth.currentUser

        // Add this user to Firebase Database
        var database_ref = database.ref()

        // Create User data
        var user_data = {
        last_login : Date.now()
        }

        // Push to Firebase Database
        database_ref.child('users/' + user.uid).update(user_data)

        // Done
        // alert('User Logged In!!');

        auth.currentUser.getIdToken(/* forceRefresh */ true).then((idToken) => {
            // Store the ID Token securely (e.g., in a cookie or localStorage)
            // Proceed with data fetching using the ID Token
            setUserAsLoggedIn(user.uid, idToken); // Pass UID to setUserAsLoggedIn
            updateLoginPage();
            updateNavbar();

          }).catch((error) => {
            console.error('Error getting ID token:', error);
        });
          
        // setUserAsLoggedIn(user.uid); // Pass UID to setUserAsLoggedIn
        // updateLoginPage();

    })
    .catch(function(error) {
        // Firebase will use this to alert of its errors
        var error_code = error.code
        var error_message = error.message
        console.log(error_message)
        try{
            const errorReceived = JSON.parse(error_message);
            if(errorReceived && errorReceived.error.message === "INVALID_LOGIN_CREDENTIALS"){
                alert("Incorrect login credentials! Please enter the correct details!")
                document.getElementById('login_email').value = "";
                document.getElementById('login_password').value = "";
            }
        }catch{
            alert(error_message);
        }
    })
}
function setUserAsLoggedIn(uid, idToken){
    userIsLoggedIn = true;
    setCookie("userIsLoggedIn", true, 1);
    setCookie("uid", uid, 1);
    setCookie("idToken", idToken, 1);

    getUserData().then(userData => {
        const userFullName = userData.full_name;
        setCookie("userFullName", userFullName, 1);
    }).catch(error => {
        console.error('Error fetching user data:', error.message);
    });
    // console.log(`Cookie saved: "userIsLoggedIn: ${getCookie("userIsLoggedIn")}"`);
    // console.log(`Cookie saved: "uid: ${getCookie("uid")}"`);
    // console.log(`Cookie saved: "idToken: ${getCookie("idToken")}"`);

}
function updateLoginPage(){
    document.getElementById('userInfoBox').classList.toggle('hiddenBlock')
    document.getElementById('authBox').classList.toggle('hiddenBlock')

    const userFullName = getCookie("userFullName");
    if(userFullName){
        document.getElementById('userName').innerHTML= userFullName;

        return;
    }

    getUserData().then(userData => {
        const userFullName = userData.full_name;
        document.getElementById('userName').innerHTML= userFullName;
    }).catch(error => {
        console.error('Error fetching user data:', error.message);
    });

    
}
function updateNavbar(){
    const userFullName = getCookie("userFullName");
    if(userFullName){
        document.getElementById('loginHeader').innerHTML = userFullName;
        return;
    }
    getUserData().then(userData => {
        const userFullName = userData.full_name;
        document.getElementById('loginHeader').innerHTML = userFullName;
    }).catch(error => {
        console.error('Error fetching user data:', error.message);
    });
}

function getUserData() {
    return new Promise((resolve, reject) => {
        const uid = getCookie("uid");
        if (uid) {
            const userRef = database.ref('users/' + uid);
            userRef.once('value', function(snapshot) {
                const userData = snapshot.val();
                console.log('User Data:', userData);
                resolve(userData);
            }, function(error) {
                reject(error);
            });
        } else {
            reject(new Error('User not logged in.'));
        }
    });
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }


// Validate Functions
function validate_email(email) {
    expression = /^[^@]+@\w+(\.\w+)+\w$/
    if (expression.test(email) == true) {
        // Email is good
        return true
    } else {
        // Email is not good
        return false
    }
}

function validate_password(password) {
    // Firebase only accepts lengths greater than 6

    if (password.length < 6) {
        return false
    } else {
        return true
    }
}
function validate_login_password(password) {
    // Firebase only accepts lengths greater than 6
    if (password) {
        return true
    } else {
        return false
    }
}
function validate_field(field) {
    if (field == null) {
        return false
    }

    if (field.length <= 0) {
        return false
    } else {
        return true
    }
}