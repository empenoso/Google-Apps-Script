/*
 * Создает события (дни рождения и юбилеи) с указанием
 * прошедших лет в календаре
 * (c) 2019.03 Mikhail Shardin <mikhail.shardin@gmail.com>
 * Меня, как пользователя телефона с системой Android,
 * всегда не очень устраивал тот факт, что в моём
 * календаре были обозначены дни рождения контактов, но
 * без указания возраста человека.
 * Также и с юбилеями контактов - вроде бы юбилей есть, а
 * сколько времени прошло с этого события непонятно.
 * Переходить в сам контакт и смотреть год рождения или
 * дату юбилея, а потом что-то рассчитывать - на это
 * времени никогда не было.
 * Решил сам себе упростить жизнь и написал Google Apps Script,
 * который сначала ищет эти события в специальном
 * календаре, который по умолчанию выводит эти события. А
 * зачем на втором шаге рассчитывает возраст для
 * конкретных контактов и уже создает события в основном
 * календаре. 
 * 
 * https://script.google.com/d/1RbhIKYv473Ee6dO9X0WECHWcl4iuo7MjNo49uaPAlFMbW0pl4aDPEYPR/edit?usp=sharing
 *
 * Для начала работы Файл/Создать копию и выполнить
 * TriggersCreateTimeDriven - создаст автозапуск каждого 1го числа
 * месяца и делает расчет на 31 день вперед
 *
 * На основе кодов Bryan Patterson - scripts@bryanp.com
 * https://productforums.google.com/forum/#!topic/calendar/B-i5hoBhTiw
 */
        
 
/* exported birthdayAgeToCalendar, anniversaryAgeToCalendar, TriggersCreateTimeDriven */

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
    defaultCal = CalendarApp.getDefaultCalendar(); // создаем события в календаре по умолчанию
    // var defaultCal = CalendarApp.getCalendarById('regrncqXXXXXXp07eihepag74@group.calendar.google.com'); //или другой календарь

    now = new Date();
    fromDate = new Date(now.getTime());
    toDate = new Date(now.getTime() + 31 * (1000 * 60 * 60 * 24)); // + 31 дней от текущей даты
    Logger.log('С даты: ' + Utilities.formatDate(fromDate, 'Asia/Yekaterinburg', 'MMMM dd, yyyy HH:mm:ss Z'));
    Logger.log('По дату: ' + Utilities.formatDate(toDate, 'Asia/Yekaterinburg', 'MMMM dd, yyyy HH:mm:ss Z'));
    events = contactsCal.getEvents(fromDate, toDate);
    Logger.log('Найдено событий: ' + events.length);
})();

function birthdayAgeToCalendar() { //дни рождения
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
            try {
                defaultCal.createAllDayEvent(name + " – день рождения, " + years + " лет (года)",
                    new Date(bdayMonthName + ' ' + bday[0].getDay() + ', ' + new Date().getFullYear()));
                Logger.log("Создано: " + name + " – день рождения, " + years + " лет (года)");
            } catch (error) {}
        }
    }
}

function anniversaryAgeToCalendar() { //юбилеи
    for (var i in events) {
        Logger.log('anniversaryAgeToCalendar. Юбилеи. Найдено: ' + events[i].getTitle());
        var name = events[i].getTitle().split("Юбилей у пользователя ")[1];
        var contacts = ContactsApp.getContactsByName(name);
        Logger.log('anniversaryAgeToCalendar. юбилеи. Name: ' + name);

        for (var c in contacts) {
            var bday = contacts[c].getDates(ContactsApp.Field.ANNIVERSARY); //существующие типы данных https://developers.google.com/apps-script/reference/contacts/field
            var bdayMonthName, bdayYear, bdayDate;
            try {
                bdayMonthName = bday[0].getMonth();
                bdayYear = bday[0].getYear();
                bdayDate = new Date(bdayMonthName + ' ' + bday[0].getDay() + ', ' + bdayYear);
                Logger.log('anniversaryAgeToCalendar. bdayDate: ' + bdayDate);
            } catch (error) {}

            var years = parseInt(new Date().getFullYear()) - bdayYear;
            try {
                defaultCal.createAllDayEvent("Юбилей у пользователя " + name + ", " + years + " лет (года)",
                    new Date(bdayMonthName + ' ' + bday[0].getDay() + ', ' + new Date().getFullYear()));
                Logger.log("Создано: " + "Юбилей у пользователя " + name + ", " + years + " лет (года)");
            } catch (error) {}
        }
    }
}

function TriggersCreateTimeDriven() { //автоматически создаем новые триггеры для запуска
    // Deletes all triggers in the current project.
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
        ScriptApp.deleteTrigger(triggers[i]);
    }
    // а теперь создаем
    ScriptApp.newTrigger("birthdayAgeToCalendar") //дни рождения
        .timeBased()
        .onMonthDay(1) //день месяца
        .atHour(1)
        .create();
    ScriptApp.newTrigger("anniversaryAgeToCalendar") //юбилеи
        .timeBased()
        .onMonthDay(1)
        .atHour(2)
        .create();
}

 
/* exported birthdayAgeToCalendar, anniversaryAgeToCalendar, TriggersCreateTimeDriven */

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
    defaultCal = CalendarApp.getDefaultCalendar(); // создаем события в календаре по умолчанию
    // var defaultCal = CalendarApp.getCalendarById('regrncqXXXXXXp07eihepag74@group.calendar.google.com'); //или другой календарь

    now = new Date();
    fromDate = new Date(now.getTime());
    toDate = new Date(now.getTime() + 31 * (1000 * 60 * 60 * 24)); // + 31 дней от текущей даты
    Logger.log('С даты: ' + Utilities.formatDate(fromDate, 'Asia/Yekaterinburg', 'MMMM dd, yyyy HH:mm:ss Z'));
    Logger.log('По дату: ' + Utilities.formatDate(toDate, 'Asia/Yekaterinburg', 'MMMM dd, yyyy HH:mm:ss Z'));
    events = contactsCal.getEvents(fromDate, toDate);
    Logger.log('Найдено событий: ' + events.length);
})();

function birthdayAgeToCalendar() { //дни рождения
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
            try {
                defaultCal.createAllDayEvent(name + " – день рождения, " + years + " лет (года)",
                    new Date(bdayMonthName + ' ' + bday[0].getDay() + ', ' + new Date().getFullYear()));
                Logger.log("Создано: " + name + " – день рождения, " + years + " лет (года)");
            } catch (error) {}
        }
    }
}

function anniversaryAgeToCalendar() { //юбилеи
    for (var i in events) {
        Logger.log('anniversaryAgeToCalendar. Юбилеи. Найдено: ' + events[i].getTitle());
        var name = events[i].getTitle().split("Юбилей у пользователя ")[1];
        var contacts = ContactsApp.getContactsByName(name);
        Logger.log('anniversaryAgeToCalendar. юбилеи. Name: ' + name);

        for (var c in contacts) {
            var bday = contacts[c].getDates(ContactsApp.Field.ANNIVERSARY); //существующие типы данных https://developers.google.com/apps-script/reference/contacts/field
            var bdayMonthName, bdayYear, bdayDate;
            try {
                bdayMonthName = bday[0].getMonth();
                bdayYear = bday[0].getYear();
                bdayDate = new Date(bdayMonthName + ' ' + bday[0].getDay() + ', ' + bdayYear);
                Logger.log('anniversaryAgeToCalendar. bdayDate: ' + bdayDate);
            } catch (error) {}

            var years = parseInt(new Date().getFullYear()) - bdayYear;
            try {
                defaultCal.createAllDayEvent("Юбилей у пользователя " + name + ", " + years + " лет (года)",
                    new Date(bdayMonthName + ' ' + bday[0].getDay() + ', ' + new Date().getFullYear()));
                Logger.log("Создано: " + "Юбилей у пользователя " + name + ", " + years + " лет (года)");
            } catch (error) {}
        }
    }
}

function TriggersCreateTimeDriven() { //автоматически создаем новые триггеры для запуска
    // Deletes all triggers in the current project.
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
        ScriptApp.deleteTrigger(triggers[i]);
    }
    // а теперь создаем
    ScriptApp.newTrigger("birthdayAgeToCalendar") //дни рождения
        .timeBased()
        .onMonthDay(1) //день месяца
        .atHour(1)
        .create();
    ScriptApp.newTrigger("anniversaryAgeToCalendar") //юбилеи
        .timeBased()
        .onMonthDay(1)
        .atHour(2)
        .create();
}
