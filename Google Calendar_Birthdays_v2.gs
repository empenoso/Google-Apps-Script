/*
 * Отображение возраста контактов в Гугл календаре в день их рождения
 * Displaying birthday and age in Google's Calendar
 * (c) 2022 Mikhail Shardin https://shardin.name/
 * 
 * Инструкции как пользоваться: https://habr.com/ru/post/683188/
 * Актуальная версия: https://github.com/empenoso/Google-Apps-Script/
 * 
 * Этот скрипт модификация моей версии 2019 года: https://habr.com/ru/post/481858/
 *
 * Спасибо @Sergey_050krd (это ссылка на телеграм) за склонение год, лет, года и создание комментариев.
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
(function () {
    contactsCal = CalendarApp.getCalendarById('addressbook#contacts@group.v.calendar.google.com');

    // Создаем события в календаре по умолчанию
    defaultCal = CalendarApp.getDefaultCalendar();

    // Или создаем события в любом другом календаре
    // var defaultCal = CalendarApp.getCalendarById('regrncqXXXXXXp07eihepag74@group.calendar.google.com'); 

    // Устанавливаем время конкретно для своего региона, например для Москвы 'Europe/Moscow'. Вы можете выбрать для себя свой часовой пояс http://joda-time.sourceforge.net/timezones.html
    now = new Date();
    fromDate = new Date(now.getTime());
    toDate = new Date(now.getTime() + 31 * (1000 * 60 * 60 * 24)); // + 31 дней от текущей даты
    Logger.log('С даты: ' + Utilities.formatDate(fromDate, 'Asia/Yekaterinburg', 'MMMM dd, yyyy HH:mm:ss Z'));
    Logger.log('По дату: ' + Utilities.formatDate(toDate, 'Asia/Yekaterinburg', 'MMMM dd, yyyy HH:mm:ss Z'));
    events = contactsCal.getEvents(fromDate, toDate);
    Logger.log('Найдено событий: ' + events.length);
})();

// Дни рождения
function birthdayAgeToCalendar() {
    for (var i in events) {
        Logger.log('birthdayAgeToCalendar. Дни рождения. Найдено: ' + events[i].getTitle());
        var name = events[i].getTitle().split(" – день рождения")[0];
        var contacts = ContactsApp.getContactsByName(name);
        // Logger.log('birthdayAgeToCalendar. Дни рождения. Name: ' + name);

        for (var c in contacts) {
            var bday = contacts[c].getDates(ContactsApp.Field.BIRTHDAY);
            var bdayMonthName, bdayYear, bdayDate;
            try {
                bdayMonthName = bday[0].getMonth();
                bdayDay = bday[0].getDay()
                bdayYear = bday[0].getYear();
                bdayDate = new Date(bdayMonthName + ' ' + bdayDay + ', ' + bdayYear);
                // Logger.log('birthdayAgeToCalendar. bdayDate: ' + bdayMonthName + ' ' + bdayDay + ', ' + bdayYear);
            } catch (error) {}

            var years = parseInt(new Date().getFullYear()) - bdayYear;
            Logger.log('birthdayAgeToCalendar. Дни рождения. ' + name + ', ' + years + ' ' + text(years) + '.');
        }

        // Заголовок уведомления для дней рождения
        // Если задан номер мобильного телефона
        try {
            // Получаем номер телефона контакта для дней рождения. Необходимо чтобы у контакта (именинника) он был записан в формате +7 918 123-45-67 и обязательно стоял ярлык мобильный или мобильное устройство
            var contacts = ContactsApp.getContactsByName(name);
            var phones = contacts[0].getPhones(ContactsApp.Field.MOBILE_PHONE); // https://developers.google.com/apps-script/reference/contacts/field?hl=en                

            var event = defaultCal.createAllDayEvent(name + " – день рождения, " + years + " " + text(years),
                new Date(bdayMonthName + ' ' + bdayDay + ', ' + new Date().getFullYear()), {
                    // Устанавливаем локацию для дней рождения (можно отредактировать под себя)
                    location: "Пермь",
                    // Устанавливаем описание события для дней рождения (можно отредактировать под себя)
                    description: "Сегодня " + name + " празднует день рождения - " + years + " " + text(years) + "!!!\n\nС Днём Рождения! 🎂🎁🙂🎈💃🕺\n☎️ " + phones[i].getPhoneNumber() + ""
                });
            // Если мобильного телефона нет или указан в неправильном формате
        } catch (e) {
            e = e.message.replace(/\s/g, '+').replace(/\'/g, '')
            console.log(`birthdayAgeToCalendar. Мобильного телефона нет или указан в неправильном формате, пропускаем в ${new Date().toLocaleTimeString()} с ошибкой: "https://www.google.ru/search?ie=UTF-8&q=javascript+${e}".`)
            var event = defaultCal.createAllDayEvent(name + " – день рождения, " + years + " " + text(years),
                new Date(bdayMonthName + ' ' + bdayDay + ', ' + new Date().getFullYear()), {
                    // Устанавливаем локацию для дней рождения (можно отредактировать под себя)
                    location: "Пермь",
                    // Устанавливаем описание события для дней рождения (можно отредактировать под себя)
                    description: "Сегодня " + name + " празднует день рождения - " + years + " " + text(years) + "!!!\n\nС Днём Рождения! 🎂🎁🙂🎈💃🕺"
                });
        }

        // Устанавливаем любой цвет для события дней рождения
        // event.setColor(CalendarApp.EventColor.RED); 

        // Устанавливаем время уведомлений для дней рождения
        event.addPopupReminder(0 - 24 * 60); // В день события в 00:00
        event.addPopupReminder(24 * 60 * 1 - 9 * 60); // За день в 09:00
        // event.addPopupReminder(24 * 60 * 2 - 9 * 60); // За 2 дня в 09:00
    }
    logToDrive(); //создаем файл лога на Гугл диске 
}

// Годовщины или юбилеи
function anniversaryAgeToCalendar() {
    for (var i in events) {
        Logger.log('anniversaryAgeToCalendar. Юбилеи. Найдено: ' + events[i].getTitle());
        var name = events[i].getTitle().split("Юбилей у пользователя ")[1];
        var contacts = ContactsApp.getContactsByName(name);
        Logger.log('anniversaryAgeToCalendar. Юбилеи. Name: ' + name);

        for (var c in contacts) {
            var bday = contacts[c].getDates(ContactsApp.Field.ANNIVERSARY);
            var bdayMonthName, bdayYear, bdayDate;
            try {
                bdayMonthName = bday[0].getMonth();
                bdayDay = bday[0].getDay()
                bdayYear = bday[0].getYear();
                bdayDate = new Date(bdayMonthName + ' ' + bdayDay + ', ' + bdayYear);
                // Logger.log('birthdayAgeToCalendar. bdayDate: ' + bdayMonthName + ' ' + bdayDay + ', ' + bdayYear);
            } catch (error) {}

            var years = parseInt(new Date().getFullYear()) - bdayYear;
            Logger.log('birthdayAgeToCalendar. Юбилеи. ' + name + ', ' + years + ' ' + text(years) + '.');
        }

        // Заголовок уведомления для говщин, юбилеев
        try {
            var event = defaultCal.createAllDayEvent("Сегодня юбилей у " + name + ", " + years + " " + text(years),
                new Date(bdayMonthName + ' ' + bdayDay + ', ' + new Date().getFullYear()), {
                    // Устанавливаем локацию для говщин, юбилеев (можно отредактировать под себя)
                    location: "Пермь",
                    // Устанавливаем описание события для дней рождения (можно отредактировать под себя)
                    description: "Сегодня юбилей у " + name + " - " + years + " " + text(years) + "!!!\n\nС памятной датой!\n☎️ "
                });

            // Устанавливаем время уведомлений для говщин, юбилеев
            event.addPopupReminder(0 - 24 * 60); // В день события в 00:00
            event.addPopupReminder(24 * 60 * 1 - 9 * 60); // За день в 09:00
            // event.addPopupReminder(24 * 60 * 2 - 9 * 60); // За 2 дня в 09:00
        } catch (e) {
            e = e.message.replace(/\s/g, '+').replace(/\'/g, '')
            console.log(`anniversaryAgeToCalendar. Юбилея или особой даты нет у пользователя нет, пропускаем в ${new Date().toLocaleTimeString()} с ошибкой: "https://www.google.ru/search?ie=UTF-8&q=javascript+${e}".`)
        }

        // Устанавливаем любой цвет для события говщин, юбилеев
        // event.setColor(CalendarApp.EventColor.RED);         
    }
    logToDrive(); //создаем файл лога на Гугл диске 
}

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
        .onMonthDay(1) // день месяца
        .atHour(1) // час
        .create();

    // Теперь создаем для говщин, юбилеев     
    ScriptApp.newTrigger("anniversaryAgeToCalendar")
        .timeBased()
        .onMonthDay(1) // день месяца
        .atHour(2) // час
        .create();
}

function logToDrive() { //создаем файл лога на диске    
    var id = ScriptApp.getScriptId();
    var name = DriveApp.getFileById(id).getName();
    // определяем имя папки - начало
    var file = DriveApp.getFileById(id);
    var folders = file.getParents();
    while (folders.hasNext()) {
        var folder_name = folders.next().getName();
        Logger.log("logToDrive. Имя папки: " + folder_name)
    }
    // определяем имя папки - конец
    var fileName = name + "_GoogleAppsLog.txt";
    try {
        var dir = DriveApp.getFoldersByName(folder_name).next(); //если в какой-то папке
    } catch (error) {
        var dir = DriveApp.getRootFolder(); //если корень диска
    }

    var files = dir.getFiles();
    while (files.hasNext()) {
        var file = files.next();
        Logger.log("logToDrive. Файлы в папке: " + file.getName())
        if (file.getName() === fileName) {
            file.setTrashed(true); //удаляем предыдущий лог файл
            break;
        }
    }
    var file = dir.createFile(fileName, Logger.getLog()); //создаем лог файл
}
