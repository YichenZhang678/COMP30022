<template>
    <!-- cookie pop up -->
    <div v-if="showPopUp" class="modal-backdrop">
      <div class="modal-content">
        <p id="cookieTop"><i class="fa-solid fa-cookie-bite"></i> Cookie</p>
        <p id="cookieWords">{{ cookieWords1 }}</p>
        <p id="cookieWords">{{ cookieWords2 }}</p>
        <button id="accept-btn" @click="accept">Accept</button>
        <button id="reject-btn" @click="reject">Reject</button>
      </div>
    </div>
    <!-- cookie pop up --> 

  <div class="generator" @click="closeDropdowns">
    <nav class="top" v-if="!loading">
      <div class="header">
        <img src="/App/logo.png" alt="Logo" class="top-logo" />
        <div class="web-name">Learnr</div>
      </div>
      <div class="nav-links">
        <div @click="cleanCookies" class="nav-link"></div>
        <router-link to="/AdminLogin" class="nav-link">Admin</router-link>
        <div @click="historyBotton" class="nav-link">History</div>
      </div>
    </nav>
    <div class="main-content" v-if="!loading">
      <div class="descript">
        <img src="/App/logo.png" alt="Logo" class="logo" />
        <h1>Question Generator</h1>
        <div>
          Get Started by selecting a topic and context from the dropdown menus below!
        </div>
      </div>
      <!-- Dropdown menus and send button at the bottom -->
      <div class="dropdown-container">
        <div class="dropdown">
          <button @click="toggleDropdown1" class="dropdown-button">
            {{ selectedTopic ? selectedTopic : 'Select a Topic' }}
            <span class="iconfont icon--shanglajiantou"></span>
          </button>
          <div v-if="isTopicDropdownVisible" class="dropdown-menu">
            <div 
              v-for="item in items1" 
              :key="item" 
              class="dropdown-item" 
              @click="selectTopic(item)"
            >
              {{ item }}
            </div>
          </div>
        </div>

        <div class="dropdown">
          <button @click="toggleDropdown2" class="dropdown-button">
            {{ selectedContext ? selectedContext : 'Select Context' }}
            <span class="iconfont icon--shanglajiantou"></span>
          </button>
          <div v-if="isContextDropdownVisible" class="dropdown-menu">
            <div 
              v-for="item in items2" 
              :key="item" 
              class="dropdown-item" 
              @click="selectContext(item)"
            >
              {{ item }}
            </div>
          </div>
        </div>

        <button class="send-button" @click="sendData" :disabled="loading">
          <span class="iconfont icon-fasong"></span>
        </button>
      </div>
    </div>
    <div v-if="loading" class="loading-overlay">
      <!-- <img src="../loading3.gif" width="50" height="50" lass="loading-icon"/> -->
      <div class="spinner"></div>
      <p class="loading-text">{{ loadingWord }}</p>
    </div>

    <div id="errorMessage" v-if="showError" style="display: flex;">
                <button id="escape-btn" @click="closePop"><i class="fa-solid fa-xmark"></i></button>
                <p>{{ errorMessage }}</p>
                <div id="button-container">
                    <button id="error-retry-btn" @click="closePop" class="finish-button">Try Again</button>
                </div>
      </div>
  </div>
</template>

<script>

import axios from 'axios';

import { getUserID } from "../libs/user.js"
import LZString from 'lz-string';
import { compress } from 'lz-string';


export default {
  name: 'Generator',
  data() {
    return {
      cookieWords1: "We use Cookies to keep track of what questions you've done in the past, \
      and provide you with data analysis in the History Page.",
      cookieWords2: "By clicking 'Accept', you agree with the storing of cookies on your device for these purposes.",
      showPopUp: true, 
      loadingWord: "Generating questions may take some time, please be patient...",

      isTopicDropdownVisible: false,
      isContextDropdownVisible: false,
      // Store the selected topic
      selectedTopic: '', 
      // Store the selected context
      selectedContext: '', 
      // Options for the topic dropdown menu
      items1: [
        'Correlation',
        'DataFrame',
        'Decision Tree Classifier',
        'Linear Regression',
        'NMI (Normalised Mutual Information)',
        'Reading/Writing CSV files',
        'Sentence splitting using nltk (i.e. nltk.sent_tokenize())'
        ],
      // Options for the context dropdown menu
      items2: [
        'Customer Purchase Behavior',
        'Global Temperature Trends',
        'Koala Population in Australia',
        'Predicting Disease Outbreaks',
        'Stock Market Prediction',
        'Student Performance Prediction',
        'Sales Forecasting',
        'Traffic Flow Analysis',
        'Inventory Management'
      ],
      loading: false,
      showError: false,
    };
  },

  mounted () {
      // sessionStorage.setItem('UserID', 12);
      // const sessionData = sessionStorage.getItem('UserID');
      // console.log(typeof(sessionData) + ' ' + sessionData); -> String

      this.checkPopUp();
      // const userID = getUserID()
      // console.log(userID)
  },
  // -----------------------
  methods: {
    cleanCookies() {
      this.$cookies.remove('acception');
      this.$cookies.remove('userID');
      this.$router.go(0);
    },

    historyBotton() {
      this.$router.push({
        path: '/History',
        query: {
          // isAdmin: false,
          // // userID: getCookie("userID")
          // userID: this.$cookies.get('userID')
          from: "Generator"
        }
      })
    },

    closePop(){
            this.showError = false;
        },
    showErrorPop(errorMessage){
            this.errorMessage = errorMessage;
            this.showError = true;
    },

    // cookie pop up 
    async accept() {       // handle acceptance
      this.showPopUp = false;
      this.$cookies.set('acception', true, '3m');
      const userID = await getUserID()
      // console.log(userID)
      this.$cookies.set('userID', userID, '3m');
      // console.log("get ID: " + userID)
    },
    reject() {       // handle rejection
      this.showPopUp = false;
      this.$cookies.set('acception', false, '7d');
    },
    checkPopUp() {
      const acception = this.$cookies.isKey("acception")

      if (!acception) {
        // console.log("acception not exist: ")
        this.showPopUp = true
      }
      else {
        console.log("acception already exist: " + acception)
        // if accept the cookie, then refresh the cookies
        if (acception == 'true') {
          this.$cookies.set('acception', true, '3m');
          this.$cookies.set('userID', this.$cookies.get('userID'), '3m');
        }
        this.showPopUp = false
      }
    },
    toggleDropdown1(event) {
      this.isTopicDropdownVisible = !this.isTopicDropdownVisible;
      this.isContextDropdownVisible = false;
      event.stopPropagation(); 
    },
    toggleDropdown2(event) {
      this.isContextDropdownVisible = !this.isContextDropdownVisible;
      this.isTopicDropdownVisible = false;
      event.stopPropagation(); 
    },
    selectTopic(item) {
      this.selectedTopic = item;
      this.isTopicDropdownVisible = false;
    },
    selectContext(item) {
      this.selectedContext = item;
      this.isContextDropdownVisible = false;
    },
    closeDropdowns(event) {
      if (!event.target.closest('.dropdown')) {
        this.isTopicDropdownVisible = false;
        this.isContextDropdownVisible = false;
      }
    },
    sendData() {
      if (!this.selectedTopic || !this.selectedContext) {
        var errorMessage;
        if(!this.selectedTopic && !this.selectedContext){
          errorMessage = 'Please select both a topic and a context before proceeding.';
        }
        else{
          if(!this.selectedTopic){
            errorMessage = 'Please select a topic before proceeding.';
          }
          else{
            errorMessage = 'Please select a context before proceeding.';
          }
        }


        this.showErrorPop(errorMessage);
        return; // Stop execution if no topic or context is selected
      }
      var payload;
      if (this.$cookies.isKey("userID")) {
        payload = {
          topic: this.selectedTopic,
          context: this.selectedContext,
          userID : this.$cookies.get("userID"),
          //Can't use booleans as they will be converted into string by the get request for URL
          regeneration: "no"
        };
      } else {
        payload = {
          topic: this.selectedTopic,
          context: this.selectedContext,
          //Can't use booleans as they will be converted into string by the get request for URL
          regeneration: "no"
        };
      }
       
      console.log('Sending data to backend:', payload);

      this.loading = true;

      axios.get('http://localhost:8383/api/question/generateQuestion', {
        params: payload,  // This sends topic, context, and userID as query parameters
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        console.log('Data received successfully:', response.data);
        console.log(response.data.questionID);
        // Push to Problem page, passing the received data via query parameters
        // Encoding again to ensure the shareLink is still randomized characters, and not a JSON obj
        //const compressedData = LZString.compressToEncodedURIComponent(JSON.stringify(response.data));
        //console.log(compressedData);
        this.$router.push({
          path: '/Problem', 
          query: {
            shareLink: response.data.question,  //response.data.question encodes all the question details
            questionID : response.data.questionID,

            // response: JSON.stringify(response.data),  // assuming the result is in response.data.result
            topic: this.selectedTopic, 
            context: this.selectedContext 
          }
        });
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      })
      .finally(() => {
        this.loading = false; 
      });
    }
  }
};
</script>

<style scoped>
/* cookie pop up  */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.183);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  
}

.modal-content {
  display: flex;
  padding: 20px;
  background-color: rgb(204, 223, 197);
  border-radius: 10px;
  flex-direction: column;
  border:2px solid #156B3A;
  max-width: 81%;
}
#cookieTop{
  font-size: 30px;
  font-weight: 700;
  margin: 0;
  font-family: "Font Awesome 5 Free";
}
#cookieTop i{
  padding-right: 3px;
}

#cookieWords{
  font-size: 22px;
  margin: 10px;
  margin-left: 0px
}
#accept-btn, #reject-btn{
  width: 60%;
  height: 40%;
  padding: 3px;
  background-color: rgba(0, 255, 255, 0);
  border: 1.5px solid rgb(0, 0, 0);
  margin: 10px;
  transition: all 0.3s ease;
  font-size: 18px;
  font-weight: 600;
}
#accept-btn:hover, #reject-btn:hover{
  background-color: #dd8b33f4;
}
/* ----------------------------- */

.generator {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 15px;
  text-align: center;
  color: black;
  font-size: 20px;
  font-weight: 500;
  line-height: 40px;
  word-wrap: break-word;
}

.logo {
  height: 40px;
}

.dropdown-container {
  display: flex;
  justify-content: space-between;
  position: fixed;
  bottom: 0;
  width: 97%;
  padding: 13px;
}

.dropdown {
  position: relative;
  flex: 1;
  margin-right: 10px;
}

.dropdown-button {
  background-color: white;
  color: black;
  padding: 10px 20px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 15px;
  font-weight: bold;
  width: 100%;
}

.dropdown-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  max-height: 43vh; 
  overflow-y: auto;
  width: 100%;
}


.dropdown-item {
  font-size: 15px;
  padding: 5px 20px;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #d7efd5;
}

.send-button {
  background-color: #156B3A;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh; 
}

/* 加载动画，别动 */
/* 加载动画，别动 */
/* 加载动画，别动 */
/* 要改叫我，我来改 */
/* If need change, just tell me, i will do it */
.spinner {
    --size: 35px;
    --first-block-clr: #17743f;
    --second-block-clr: #FF8E54;
    --clr: #111;
    width: 200px;
    height: 200px;
    position: relative;
}

.spinner::after,.spinner::before {
    box-sizing: border-box;
    position: absolute;
    content: "";
    width: var(--size);
    height: var(--size);
    top: 50%;
    animation: up 2.4s cubic-bezier(0, 0, 0.24, 1.21) infinite;
    left: 50%;
    background: var(--first-block-clr);
}

.spinner::after {
    background: var(--second-block-clr);
    top: calc(50% - var(--size));
    left: calc(50% - var(--size));
    animation: down 2.4s cubic-bezier(0, 0, 0.24, 1.21) infinite;
}

@keyframes down {
    0%, 100% {
        transform: none;
    }

    25% {
        transform: translateX(100%);
    }

    50% {
        transform: translateX(100%) translateY(100%);
    }

    75% {
        transform: translateY(100%);
    }
}

@keyframes up {
    0%, 100% {
        
    }

    25% {
        transform: translateX(-100%);
    }

    50% {
        transform: translateX(-100%) translateY(-100%);
    }

    75% {
        transform: translateY(-100%);
    }
}
/* 加载动画，别动 */
/* 加载动画，别动 */
/* 加载动画，别动 */
/* 要改叫我，我来改 */
/* If need change, just tell me, i will do it */

.loading-text {
  margin-top: 60px;
  color: #333; /* Darker color for contrast */
  font-size: 20px;
  font-weight: bold;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header {
  display: flex;
  align-items: center;
  padding: 15px;
}

.top-logo {
  height: 25px; /* Adjust as needed */
  margin-right: 10px;
}

.web-name {
  font-size: 21px;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 20px;
  width: auto; /* Set width to auto to adjust based on content */
  margin-right: 30px; /* Move nav bar slightly away from the right edge */
  cursor: pointer;
}

.nav-link {
  text-decoration: none;
  color: #333333;
  font-weight: bold;
}

.nav-link:hover {
  color: #156B3A;
}
#errorMessage {
        font-size: 14px;
    }

#errorMessage {
    height: 10%;
    width: 40%;
    display: none;
    position: fixed;
    flex-direction: column;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 30px;
    background-color: rgb(224, 247, 216);
    border: 1px solid black;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    z-index: 1000;
    border-radius: 10px;
    text-align: center;
    align-self: center;
    font-size: 18px;
}

#escape-btn {
    width: 25px;
    padding: 0%;
    margin: 0%;
    position: absolute;
    /* left: 15px; */
    right: 3px;
    top: 15px;
    background-color: transparent;
    border: none;
    display: inline-flex;
}

#escape-btn i {
    display: inline-block;
    transition: transform 0.5s ease;
    transform-origin: 30% 50%;
}

#escape-btn:hover i {
    transform: scale(2.0) rotate(360deg);
    /* box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5); */
}

#button-group {
    display: flex;
    justify-content: center;
    gap: 20%;
    margin-top: 5px;
    margin-bottom: 5px;
}

#button-group i {
    font-size: 14px;
}

#button-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    text-align: center;
    justify-content: center;
    gap: 50px;
}

#button-container button {
    padding: 3px;
    background-color: rgba(0, 255, 255, 0);
    border: 1px solid rgb(0, 0, 0);
    border-radius: 5px;
    margin: 10px;
    transition: all 0.3s ease;
    font-size: 14px;
    cursor: pointer;
    font-weight: 500;
}


</style>
