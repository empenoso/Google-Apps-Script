/*
 * Создает события (дни рождения и юбилеи) с указанием прошедших лет в Гугл календаре
 * Birthdays and anniversaries with dates for your Google Calendar
 * (c) 2022 Mikhail Shardin https://shardin.name/
 * 
 * Этот скрипт модификация моего скрипта 2019 года: https://habr.com/ru/post/481858/
 *
 * Спасибо @Sergey_050krd (это ссылка на телеграм) за склонение год, лет, года и прочие мелочи.
 *
 */

// Глобальные переменные
var contactsCal;
var defaultCal;
var now;
var fromDate;
var toDate;
var events;

// Инициализация
(function() {
  contactsCal = CalendarApp.getCalendarById('addressbook#contacts@group.v.calendar.google.com');

// Создаем события в календаре по умолчанию
  defaultCal = CalendarApp.getDefaultCalendar(); 

// Создаем события в любом другом календаре
// var defaultCal = CalendarApp.getCalendarById('regrncqXXXXXXp07eihepag74@group.calendar.google.com'); 

// Устанавливаем время конкретно для своего региона, в моём случае я выставил 'Europe/Moscow' так как живу в Краснодаре. Вы можете выбрать для себя свой часовой пояс http://joda-time.sourceforge.net/timezones.html
  now = new Date();
  fromDate = new Date(now.getTime());
  toDate = new Date(now.getTime() + 31 * (1000 * 60 * 60 * 24)); // + 31 дней от текущей даты
  Logger.log('С даты: ' + Utilities.formatDate(fromDate, 'Europe/Moscow', 'MMMM dd, yyyy HH:mm:ss Z'));
  Logger.log('По дату: ' + Utilities.formatDate(toDate, 'Europe/Moscow', 'MMMM dd, yyyy HH:mm:ss Z'));
  events = contactsCal.getEvents(fromDate, toDate);
  Logger.log('Найдено событий: ' + events.length);
})();

// Дни рождения
function birthdayAgeToCalendar() { 
  for (var i in events) {
  Logger.log('birthdayAgeToCalendar. дни рождения. Найдено: ' + events[i].getTitle());
  var name = events[i].getTitle().split(" – день рождения")[0];
  var contacts = ContactsApp.getContactsByName(name);
  Logger.log('birthdayAgeToCalendar. дни рождения. Name: ' + name);
  
  for (var c in contacts) {
  var bday = contacts[c].getDates(ContactsApp.Field.BIRTHDAY);
  var bdayMonthName, bdayYear, bdayDate;
  try {
      bdayMonthName = bday[0].getMonth();
      bdayYear = bday[0].getYear();
      bdayDate = new Date(bdayMonthName + ' ' + bday[0].getDay() + ', ' + bdayYear);
      Logger.log('birthdayAgeToCalendar. bdayDate: ' + bdayDate);
      } catch (error) {}

      var years = parseInt(new Date().getFullYear()) - bdayYear;

// Склоняем окончание согласно возраста (лет, год, года) для дней рождения
function text(age) { 
    var years;
    count = age % 100;
    if (count >= 5 && count <= 20) {
        years = 'лет';
    } else {
        count = count % 10;
    if (count == 1) {
        years = 'год';
    } else if (count >= 2 && count <= 4) {
        years = 'года';
    } else {
        years = 'лет';
    }
  }
    return years;
}
  console.log(name + ' ' + years + ' ' + text(years));
}

// Получаем номер телефона контакта для дней рождения
var contacts = ContactsApp.getContactsByName(name);
var phones = contacts[0].getPhones(ContactsApp.Field.MOBILE_PHONE);
for (var i in phones) {
Logger.log(phones[i].getPhoneNumber());
}                                  

// Заголовок уведомления для дней рождения 
var event = defaultCal.createAllDayEvent(name + " – день рождения, " + years + " " + text(years), 
new Date(bdayMonthName + ' ' + bday[0].getDay() + ', ' + new Date().getFullYear()),
        { 
// Устанавливаем локацию для дней рождения (можно отредактировать под себя)
    // location: " The Moon ", 

// Устанавливаем описание события для дней рождения с номером телефона (можно отредактировать под себя)
    description: "Сегодня "+name+" празднует день рождения - "+years+" "+text(years)+" !!! \n Не забудьте поздравить 🎂💐🎉  \n ☎️ "+phones[i].getPhoneNumber()+""
        });

// // Устанавливаем описание события для дней рождения без номера телефона (можно отредактировать под себя)
//     description: "Сегодня "+name+" празднует день рождения - "+years+" "+text(years)+" !!! \n Не забудьте поздравить 🎂💐🎉"
//         });        

// Устанавливаем любой цвет для события дней рождения
    // event.setColor(CalendarApp.EventColor.RED); 

// Устанавливаем время уведомлений для дней рождения
    event.addPopupReminder(0 - 24 * 60); // В день события в 00:00
    event.addPopupReminder(24 * 60 * 1 - 9 * 60); // За день в 09:00
    // event.addPopupReminder(24 * 60 * 2 - 9 * 60); // За 2 дня в 09:00
    
  }
}

// Годовщины или юбилеи
function anniversaryAgeToCalendar() { 
  for (var i in events) {
  Logger.log('anniversaryAgeToCalendar. Юбилеи. Найдено: ' + events[i].getTitle());
  var name = events[i].getTitle().split("Юбилей у пользователя ")[1];
  var contacts = ContactsApp.getContactsByName(name);
  Logger.log('anniversaryAgeToCalendar. юбилеи. Name: ' + name);

  for (var c in contacts) {
  var bday = contacts[c].getDates(ContactsApp.Field.ANNIVERSARY); 
  var bdayMonthName, bdayYear, bdayDate;
  try {
      bdayMonthName = bday[0].getMonth();
      bdayYear = bday[0].getYear();
      bdayDate = new Date(bdayMonthName + ' ' + bday[0].getDay() + ', ' + bdayYear);
      Logger.log('anniversaryAgeToCalendar. bdayDate: ' + bdayDate);
      } catch (error) {}

  var years = parseInt(new Date().getFullYear()) - bdayYear;

// Склоняем окончание согласно возраста (лет, год, года) для говщин (юбилеев)
function text(age) { 
    var years;
    count = age % 100;
    if (count >= 5 && count <= 20) {
        years = 'лет';
    } else {
        count = count % 10;
    if (count == 1) {
        years = 'год';
    } else if (count >= 2 && count <= 4) {
        years = 'года';
    } else {
        years = 'лет';
    }
  }
    return years;
}
  console.log(name + ' ' + years + ' ' + text(years));
}
 // Заголовок уведомления для говщин, юбилеев
var event = defaultCal.createAllDayEvent("Сегодня юбилей у " + name + ", " + years + " " + text(years), 
new Date(bdayMonthName + ' ' + bday[0].getDay() + ', ' + new Date().getFullYear()),
        { 
// Устанавливаем локацию для говщин, юбилеев (можно отредактировать под себя)
    // location: " The Moon ", 

// Устанавливаем описание события для говщин, юбилеев с номером телефона (можно отредактировать под себя)
    description: "Сегодня юбилей у " + name + " - "+years+" "+text(years)+" !!! \n Не забудьте поздравить 🎂💐🎉  \n ☎️ "+phones[i].getPhoneNumber()+""
        });

// Устанавливаем описание события для говщин, юбилеев без номера телефона (можно отредактировать под себя)
    // description: "Сегодня юбилей у " + name + " - "+years+" "+text(years)+" !!! \n Не забудьте поздравить 🎂💐🎉"
    //     }); 

// Устанавливаем любой цвет для события говщин, юбилеев
    // event.setColor(CalendarApp.EventColor.RED); 

// Устанавливаем время уведомлений для говщин, юбилеев
    event.addPopupReminder(0 - 24 * 60); // В день события в 00:00
    event.addPopupReminder(24 * 60 * 1 - 9 * 60); // За день в 09:00
    // event.addPopupReminder(24 * 60 * 2 - 9 * 60); // За 2 дня в 09:00
  }
}

// Автоматически создаем новые триггеры для запуска
function TriggersCreateTimeDriven() { 

// Удаляет все триггеры в текущем проекте
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
  ScriptApp.deleteTrigger(triggers[i]);
  }

// Теперь создаем для дней рождения
  ScriptApp.newTrigger("birthdayAgeToCalendar") 
      .timeBased()
      .onMonthDay(1)  // день месяца
      .atHour(1)  // час
      .create();

// Теперь создаем для говщин, юбилеев     
ScriptApp.newTrigger("anniversaryAgeToCalendar") 
      .timeBased()
      .onMonthDay(1)  // день месяца
      .atHour(2)  // час
      .create();
}
