<template>
  <div class="header" onload="checkAdminState">
    <img src="/App/logo.png" alt="Logo" class="logo1" />
    <div class="company-name">Learnr</div>
  </div>
  <div class="login-frame">
    <div class="main-content">
      <img src="/App/logo.png" alt="Logo" class="logo2" />
      <div class="title">Admin Login</div>
      <div class="login-form">
        <div class="form-group">
          <div class="subtitle">Username</div>
          <input
            v-model="email"
            type="text"
            class="login-input"
            placeholder="Enter your Username"
          />
        </div>
        <div class="form-group">
          <div class="subtitle">Password</div>
          <div class="password-input-container">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="login-input"
              placeholder="Enter your Password"
              @keydown="handleKeydown" 
            />
            <!-- Eye icon for toggling password visibility -->
            <i 
              class="fas" 
              :class="showPassword ? 'fa-eye' : 'fa-eye-slash'"
              @click="togglePasswordVisibility"
              @keydown.enter.prevent="handleLogin"
              tabindex="0"
              aria-label="Toggle password visibility"
            ></i>
          </div>
        </div>
      </div>
      <button @click="handleLogin" class="login-button">Login</button>
    </div>
    <div class="warning-container">
      <div class="warning1">Not Admin?</div>
      <div class="warning2" @click="goToGenerator">Go Back to Home</div>
    </div>
  </div>
</template>


<script setup>
import { ref, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router' // Import Vue Router for navigation
import { onMounted } from 'vue';
// import { useCookies } from 'vue-cookies';
// import {getCookie, setCookie} from "../libs/cookie.js"


const email = ref('')
const password = ref('')
const showPassword = ref(false)  // This will toggle password visibility
const router = useRouter() // Initialize the router
// const cookies = useCookies()
const { proxy } = getCurrentInstance();


function handleLogin() {
  // Hardcoded admin credentials
  const adminUsername = 'admin'
  const adminPassword = 'admin123'

  // Check if entered email and password match the admin credentials
  if (email.value === adminUsername && password.value === adminPassword) {
    console.log('Login successful!')

    // record login state to cookie
    // setCookie("Admin", true, 1000) // for test use, only save cookie for 1000 seconds
    proxy.$cookies.set('Admin', true, '100s');

    // Navigate to the AdminProfile page
    router.push('/AdminProfile')
  } else {
    console.log('Invalid login credentials.')
    alert('Invalid Username or Password') // Display an error message
  }
}

function handleKeydown(event) {
  // Trigger login if the Enter key is pressed
  if (event.key === 'Enter') {
    handleLogin()
  }
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

function goToGenerator() {
 router.push('/Generator') // Navigate to the Generator page
}

function checkAdminState() {
  const admin = proxy.$cookies.get('Admin')
  
  console.log("getCookie: "+ admin)
  if (admin) {
    router.push('/AdminProfile')
  }
}

onMounted(() => {
  checkAdminState() // <div>
})
</script>


<style scoped>
.header {
  display: flex;
  align-items: center;
  padding: 15px;
}
.logo1 {
  height: 25px; /* Adjust as needed */
  margin-right: 10px;
}
.company-name {
  font-size: 21px;
  font-weight: bold;
}
.login-frame {
  box-sizing: border-box;
  margin: 3% auto; /* Center the login frame horizontally and add margin at the top */
  width: 90%; /* Adjust width relative to the viewport */
  max-width: 400px; /* Set a maximum width to prevent it from becoming too large */
  min-height: 65vh; /* Ensure the frame doesn't shrink below a reasonable size */
  max-height: 73vh; /* Prevent it from growing too large */
  background: rgba(246, 244, 244, 0.6); /* Semi-transparent background */
  backdrop-filter: blur(30px); /* Apply blur effect */
  border-radius: 30px;
  display: flex;
  flex-direction: column;
}
/* Media query for larger screens (1024px and above) */
@media (min-height: 1964px) {
  .login-frame {
    min-height: 50vh; /* Adjust for larger screens */
    max-height: 80vh; /* set for testing in different size screen */
  }  
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: black;
  font-size: 24px;
  font-weight: 500;
  line-height: 230%;
  word-wrap: break-word;
  margin-bottom: 15%;
  gap: auto; /* Space between all children */
  padding-top: 30px;
}
.logo2 {
  height: 50px; /* Adjust as needed */
  margin-right: 10px;
}
.title {
  font-size: 30px;
  font-weight: bold;
}
.login-form {
  width: 65%;
  max-width: 350px;
  padding-top: 15px;
}
.form-group {
  position: relative;
  width: 85%; /* Ensures input and subtitle take full width */
  margin-bottom: 8%; /* Space between form groups */
  text-align: center; /* Center the content within form group */
}
.subtitle {
  font-size: 12px;
  font-weight: bold;
  line-height: 0.5; /* Set line-height to 1 to minimize any extra space */
  text-align: left; /* Ensure subtitles are aligned to the left */
  width: 100%; /* Ensure subtitle takes full width */
  margin-right: 50px;
}
.login-input {
  width: 110%; /* Adjust width to fit within form group */
  padding: 10px; /* Adjust padding for better appearance */
  border-radius: 3px;
  border: 1px solid #ccc;
  outline: none;
}
.password-input-container {
  position: relative;
  width: 114%;
}
.password-input-container input {
  width: 100%;
  padding-right: 1px;
}
.password-input-container i {
  position: absolute;
  right: 1%;
  top: 55%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #333;
  font-size: 16px;
}
.login-button {
  background-color: #030403;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  width: 45%; /* Adjust button width to fit within form group */
  font-size: 13px;
}
.warning-container {
  position: absolute; /* Position relative to login-frame */
  display: flex; /* Align items in a row */
  justify-content: center; /* Center the items horizontally */
  gap: 8px; /* Adjust the gap between warnings */
  bottom: 3%; /* Position the container at the bottom */
  width: 100%; /* Full width of the parent container */
  padding: 0 20px; /* Optional: add padding for better spacing */
  box-sizing: border-box; /* Ensure padding is included in width calculation */
  text-align: center; /* Center text within the container */
  left: 1%; /* Move the container to the left */
}
.warning1 {
  font-size: 10px;
}
.warning2 {
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;
}

</style>
