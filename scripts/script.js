const mtpApp = {};

mtpApp.workouts = [];

mtpApp.setUpEventListeners = () => {
  const yearPicker = document.getElementById('form-year');
  yearPicker.addEventListener('change', () => { mtpApp.checkYear(yearPicker.value) });
  const monthPicker = document.getElementById('form-month');
  monthPicker.addEventListener('change', () => { mtpApp.checkMonth(monthPicker.value) });
  const datePicker = document.getElementById('form-date');
  datePicker.addEventListener('change', () => { mtpApp.checkDate(datePicker.value) });
}

mtpApp.checkYear = (year) => {
  if (year !== "-") {
    mtpApp.raceYear = parseInt(year);
    const monthPicker = document.getElementById('form-month');
    monthPicker.disabled = false;
  }
}

mtpApp.checkMonth = (month) => {
  mtpApp.raceMonth = parseInt(month);
  mtpApp.buildDatePicker(mtpApp.raceMonth);
  const datePicker = document.getElementById('form-date');
  datePicker.disabled = false;
}

mtpApp.checkDate = (date) => {
  mtpApp.raceDate = parseInt(date);
  // set date object based on selection
  mtpApp.raceDay = new Date(mtpApp.raceYear, mtpApp.raceMonth, mtpApp.raceDate);
  mtpApp.assignWorkoutDates();
}

mtpApp.buildDatePicker = (month) => {
  let numberOfDays = 31;
  if (month === 1) {
    numberOfDays = 28;
    //account for leap years
    if (mtpApp.raceYear % 4 === 0) {
      numberOfDays = 29;
      if (mtpApp.raceYear % 100 === 0 && mtpApp.raceYear % 400 != 0) {
        numberOfDays = 28;
      }
    }
  } else if (month === 3 || month === 5 || month === 8 || month === 10) {
    numberOfDays = 30;
  }
  const datePicker = document.getElementById('form-date');
  let optionElement = ``;
  for (i=0; i<numberOfDays; i++) {
    optionElement = optionElement + `<option value='${i + 1}'>${i+1}</option>`;
  }
  datePicker.innerHTML = optionElement;
}

mtpApp.getWorkoutData = () => {
  const requestURL = 'scripts/data.json';
  const request = new XMLHttpRequest();
  request.open('GET', requestURL);
  request.responseType = 'json';
  request.send();
  request.onload = function(){
    mtpApp.workouts = request.response;
  }
}

// last workout object in training plan array is assigned race date, and we work backwards from there to assign dates to everything
mtpApp.assignWorkoutDates = () => {
  const reversedWorkouts = mtpApp.workouts.reverse();
  for (let i = 0; i < mtpApp.workouts.length; i++) {
    reversedWorkouts[i].date = new Date(mtpApp.raceDay);
    const nextDate = mtpApp.raceDay.getDate() - i;
    reversedWorkouts[i].date.setDate(nextDate);
  }
  mtpApp.workouts = reversedWorkouts.reverse();
  mtpApp.drawTrainingPlan();
}

// display plan on screen in calendar view
mtpApp.drawTrainingPlan = () => {
  const grid = document.getElementById('calendar-grid');
  let calendarContent = ``;
  for (let i = 0; i < mtpApp.workouts.length; i++){
    if (i === 0 || mtpApp.workouts[i].date.getDate() === 1) {
      calendarContent = calendarContent + mtpApp.buildMonthMarker(mtpApp.workouts[i].date.getMonth(), mtpApp.workouts[i].date.getFullYear());
    }
    calendarContent = calendarContent + mtpApp.buildDateCard(mtpApp.workouts[i], i);
  }
  grid.innerHTML = calendarContent;
}

mtpApp.buildMonthMarker = (monthIndex, year) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  let contents = `
    <div class="month-marker">
      <h3 class="calendar-month">${months[monthIndex]} ${year}</h3>
      <div class="calendar-weekday">Monday</div>
      <div class="calendar-weekday">Tuesday</div>
      <div class="calendar-weekday">Wednesday</div>
      <div class="calendar-weekday">Thursday</div>
      <div class="calendar-weekday">Friday</div>
      <div class="calendar-weekday">Saturday</div>
      <div class="calendar-weekday">Sunday</div>
    </div>`
  return contents;
}

mtpApp.buildDateCard = (day, key) => {
  let cardContents = `
    <div id="day${key}" class="calendar-day day${day.date.getDay()}">
    <div class="card-date">${day.date.getDate()}</div>
    <h4 class="card-${day.workout}">${day.workout}</h4>`;
  if (day.distance !== 0) cardContents = cardContents + `<p class="card-distance">${day.distance}km</p>`
  if (day.notes) cardContents = cardContents + `<p class="card-notes">${day.notes}</p>`
  cardContents = cardContents + `</div>`;

  return cardContents;
}

mtpApp.getWorkoutData();
mtpApp.setUpEventListeners();
