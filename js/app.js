/*
    IDEAS:
        Create function to measure distance from currentdate in increments of 1 based on our basic calendar day.
        Tie this "date identifer to the desired search within the firebase query"
*/

//DOM elements
const calendarDisplay = document.getElementById('calendarDisplay')


function countDaysPastStartingDate(input) { //consider incorporating daysPast as a closure of this function for "private access"
  const today = new Date();
  //convert this to midnight so that we can a calendar that is not behind (consider making this work for user Time Zones)
  const midnight = input //new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  console.log("Midnight:" + midnight)
  const startingDate = new Date(2023, 0, 1);
  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
  const diff = midnight - startingDate;
  const daysPast = Math.round(diff / oneDay);
  return daysPast;
}

///
let daysPast;
let maxCalendarPages;

//Moving code that makes API call here to check user location against the appropriate timezone for appropriate live calendar
function convertUserTimeZone(timezoneFormatted){
  const dateString = timezoneFormatted;
  const date = new Date(dateString);
  const year = date.getFullYear();
  console.log(typeof(year))
  const month = date.getMonth(); // 0-based, so subtract 1 to get the correct month number
  const day = date.getDate();
  const today = new Date(year, month, day);
  return today;
}

if (!navigator.geolocation) {
  console.error("Geolocation is not supported by this browser.");
}

let latitude;
let longitude;

navigator.geolocation.getCurrentPosition(
  (position) => {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    // use the latitude and longitude to determine the timezone
    const API_KEY = "D8P5FGQAGGFN";
    const API_URL = `https://api.timezonedb.com/v2.1/get-time-zone?key=${API_KEY}&format=json&by=position&lat=${latitude}&lng=${longitude}`;

    fetch(API_URL)
      .then((response) => {
        console.log(response)
        return response.json()
      })
      .then((data) => {
        console.log(data)
        return convertUserTimeZone(data.formatted)
        
      })
      .then((formatted_data) =>{
        console.log(formatted_data)
        ///set daysPast counter that follows the user desired calendar distance from current date
        daysPast = countDaysPastStartingDate(formatted_data);
        /// set variable that sets users calendar limit
        maxCalendarPages = daysPast;
        console.log(maxCalendarPages)

        //Set TODAY
        renderDateToPage(ensure3Digit(daysPast))
      })
      // .catch((error) => {
      //   console.error("Error while retrieving timezone:", error);
      // });
  },
  (error) => {
    console.error("Error while retrieving geolocation:", error);
    const today = new Date();
  //convert this to midnight so that we can a calendar that is not behind (consider making this work for user Time Zones)
    const estimatedMidnightDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    daysPast = countDaysPastStartingDate(estimatedMidnightDate)
    maxCalendarPages = daysPast
    //Set TODAY
    renderDateToPage(ensure3Digit(daysPast))

  }
);



//function to convert daysPast to the appropriate day string identifier
function getDateString(daysPast) {
    const date = new Date(2023, 0, 1 + daysPast);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = date.toLocaleDateString('en-US', options);
    return dateString;
  }

//Function that makes sure the dateCounter can always be converted to the appropriate key for Firebase DB
const ensure3Digit = function(num) {
    return String(num).padStart(3, "0");
}

//Firebase variables
pathToDb = `calendarDays`
const myCollection = firebase.database().ref(pathToDb);


//Firebase Access/Control
const renderDateToPage = function(currentVariable){
    myCollection.once('value').then(function(snapshot) {
    // currentVariable = dateToString();
    const value = snapshot.val();
    const current =  value[currentVariable]
    
    
    //separate into necessary identities
    const calendarDate = getDateString(daysPast)
    const methodName = current.method;
    const methodDescription = current.description;
    const methodExamplesArray = current.examples;
    let methodExamplesCodeArray = []
    methodExamplesArray.forEach(function(element){
      const text = methodExamplesArray.shift()
      let lineText = text.split(";")
      lineText.map(function(innerElement){
          let innerText = lineText.shift()
          lineText.push(`<code><h4>${innerText}</h4></code>`)
      })
      let codeBlockText = lineText.join(" ")
      let codeBlock = `<div class="individual-example-container">
                          <!-- Add content here -->
                          <h5>
                            ${codeBlockText}
                          </h5>
                        </div>`
                      
         methodExamplesArray.push(codeBlock)
         console.log(codeBlock)
    })
    
    
    //append daily date to the page   /*NEED to dynamically add the day identifier*/
    calendarDisplay.innerHTML = `<div class="date-container">${calendarDate}</div>
    <div class="method-name-display">${methodName}</div>
    <div class="method-description">
      ${methodDescription}
    </div>
    <div class="method-example-container">
      <h3 style="margin:0;padding:0;">EXAMPLE:</h3>
        <div id="individual-exampleS-container">
          ${methodExamplesArray[0]}
          ${methodExamplesArray[1]}
          ${methodExamplesArray[2]}
        </div>
    </div>`
    })
}

//set event listener to change the data changed based upon the selector
document.getElementById('example-select').addEventListener('change', function(){
  const currentLanguage = document.getElementById('example-select').value;
  pathToDb = currentLanguage;

  ///Never CHANGED OG DATABASE KEY FROM TEST VALUE :-(!!!!!!!!!
  if (pathToDb === "javascript"){
    pathToDb = 'calendarDays'
  }
  
  let myCollection2 = firebase.database().ref(pathToDb);
  myCollection2.once('value').then(function(snapshot) {
    // currentVariable = dateToString();
    const value = snapshot.val();
    console.log(value)
    const number = ensure3Digit(daysPast)
    console.log(number)
    const current =  value[number]
    console.log(current)
    
    //separate into necessary identities
    const calendarDate = getDateString(daysPast)
    const methodName = current.method;
    const methodDescription = current.description;
    const methodExamplesArray = current.examples;
    let methodExamplesCodeArray = []
    methodExamplesArray.forEach(function(element){
      const text = methodExamplesArray.shift()
      let lineText = text.split(";")
      lineText.map(function(innerElement){
          let innerText = lineText.shift()
          lineText.push(`<code><h4>${innerText}</h4></code>`)
      })
      let codeBlockText = lineText.join(" ")
      let codeBlock = `<div class="individual-example-container">
                          <!-- Add content here -->
                          <h5>
                            ${codeBlockText}
                          </h5>
                        </div>`
                      
         methodExamplesArray.push(codeBlock)
         console.log(codeBlock)
    })
    
    
    //append daily date to the page   /*NEED to dynamically add the day identifier*/
    calendarDisplay.innerHTML = `<div class="date-container">${calendarDate}</div>
    <div class="method-name-display">${methodName}</div>
    <div class="method-description">
      ${methodDescription}
    </div>
    <div class="method-example-container">
      <h3 style="margin:0;padding:0;">EXAMPLE:</h3>
        <div id="individual-exampleS-container">
          ${methodExamplesArray[0]}
          ${methodExamplesArray[1]}
          ${methodExamplesArray[2]}
        </div>
    </div>`
    })
})



/* if string is: const clothing = ['shoes', 'shirts', 'socks', 'sweaters'] console.log(clothing.length); // Expected output: 4,let arr = [1, 2, 3, 4, 5]; arr.length = 3; console.log(arr); // [1, 2, 3],let arr = [1, 2, 3, 4, 5]; for (let i = 0; i < arr.length; i++) {     console.log(arr[i]); },,let arr = [1, 2, 3, 4, 5]; arr.length = 2; console.log(arr)
we can use:
```
const lines = string.split(',\n\n');
for (let i = 0; i < lines.length; i++) {
  let code = lines[i].split('\n');
  for (let j = 0; j < code.length; j++) {
    console.log(code[j]);
  }
}

///prints out ( exactly as we)
const clothing = ['shoes', 'shirts', 'socks', 'sweaters']
console.log(clothing.length); // Expected output: 4
let arr = [1, 2, 3, 4, 5];
arr.length = 3;
console.log(arr); // [1, 2, 3]
let arr = [1, 2, 3, 4, 5];
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}
let arr = [1, 2, 3, 4, 5];
arr.length = 2;
console.log(arr);

```
*/



//EVENT LISTENERS

//Go to Previous Days UP and UNTIL the Beginning of the Year
document.getElementById('rightPageArrow').addEventListener('click', function(){
    if (daysPast + 1 > maxCalendarPages){
      return;
    }
    daysPast++;
    renderDateToPage(ensure3Digit(daysPast));
    console.log(maxCalendarPages)
});

//Go to proceeding days UP and UNTIL the CURRENT DATE 
document.getElementById('leftPageArrow').addEventListener('click', function(){
  if (daysPast - 1 < 0){
    return;
  }
    daysPast--;
    renderDateToPage(ensure3Digit(daysPast));
    console.log(maxCalendarPages)
});



/////TEST IDEA CODE <<TO BE "DELETED" upon finalization>>








