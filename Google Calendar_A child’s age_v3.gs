/*
 * Для всех молодых отцов - сколько месяцев и годов ребенку отроду, ежемесячная напоминалка в Гугл календаре.
 * A child’s age in months and years, with a monthly reminder
 *
 * (c) 2022.08 Mikhail Shardin https://shardin.name/
 *
 * Этот скрипт модификация моего скрипта января 2022 года: https://habr.com/ru/post/645935/
 *
 * Спасибо @Sergey_050krd (это ссылка на телеграм) за склонение год, лет, года и прочие мелочи.
 *
 */

// Вычисляем значимые даты и добавляем всё это в выбраный календарь
function AddCalendarCurrentAge() { 
    eval(UrlFetchApp.fetch('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment-with-locales.min.js').getContentText());
    moment.locale('ru');
    
// Триггер из TriggersCreateTimeDriven работает в 1-й день месяца, но сам день рождения ведь в другой день, то есть если день рождения ребёнка 9 числа, то offset = 9
    const offset = 5;
    var now = moment().add(offset, 'days'); 

// Данные о рождении папы. Вычисляем возраст папы: полных лет, месяцев
    const fatherBirthday = '1999-04-22'
    var fatherFullYears = ~~(moment(now).diff(fatherBirthday, 'months', false) / 12);
    var fathermonth = (moment().diff(fatherBirthday, 'months', false)-fatherFullYears*12); 
    fatherText = "Папа родился " + fatherFullYears + ' ' + textYear(fatherFullYears) + ' ' + "и " + fathermonth + ' ' + textMonth(fathermonth) + ' ' + "назад";

// Данные о рождении мамы. Вычисляем возраст мамы: полных лет, месяцев
    const motherBirthday = '2000-11-16'
    var motherFullYears = ~~(moment(now).diff(motherBirthday, 'months', false) / 12);
    var mothermonth = (moment().diff(motherBirthday, 'months', false)-motherFullYears*12); 
    motherText = "Мама родилась " + motherFullYears + ' ' + textYear(motherFullYears) + ' ' + "и " + mothermonth + ' ' + textMonth(mothermonth) + ' ' + "назад";    

// Данные о рождении ребёнка. Вычисляем возраст ребёнка: полных лет, месяцев
    const childBirthday = '2019-04-05'
    var childFullYears = ~~(moment(now).diff(childBirthday, 'months', false) / 12);
    var childmonth = (moment().diff(childBirthday, 'months', false)-childFullYears*12);
    childText = "Ребёнок родился " + childFullYears + ' ' + textYear(childFullYears) + ' ' + "и " + childmonth + ' ' + textMonth(childmonth) + ' ' + "назад";

// // Данные о начале отношений. Вычисляем возраст: полных лет, месяцев
    const relationshipStart = '2012-04-15'
    const relationshipEnd = moment().format('YYYY-MM-DD');
    var relationshipFullYears = ~~(moment(relationshipEnd).diff(relationshipStart, 'months', false) / 12);
    var relationshipmonth = ~~(moment(relationshipEnd).diff(relationshipStart, 'months', false)-relationshipFullYears*12);
    relationshipText = `Отношениям ${relationshipFullYears} лет и ${moment(relationshipEnd).diff(relationshipStart, 
    'months',  false)-relationshipFullYears*12} месяцев (с ${relationshipStart} по ${relationshipEnd}).`
    relationshipText = "Отношениям папы и мамы " + relationshipFullYears + ' ' + textYear(relationshipFullYears) + ' ' + "и " + relationshipmonth + ' ' + textMonth(relationshipmonth);
    
// Склоняем возраст в годах
function textYear(age) { 
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

// Склоняем возраст в месяцах
function textMonth(month) { 
    var month;
    count = month % 100;
    if (count >= 5 && count <= 20) {
        month = 'месяцев';
    } else {
        count = count % 10;
    if (count == 1) {
        month = 'месяц';
    } else if (count >= 2 && count <= 4) {
        month = 'месяца';
    } else {
        month = 'месяцев';
    }
  }
    return month;
}

Logger.log(childText + '\n' + fatherText + '\n' + motherText + '\n' + relationshipText);

// Создаем события в календаре по умолчанию
    var defaultCal = CalendarApp.getDefaultCalendar(); 

// Создаем события в другом календаре. Узнать идентификатор календаря через функцию get_calendars ниже
    // var defaultCal = CalendarApp.getCalendarById('54r4muXXXXXXXXXvgh4vr2h8@group.calendar.google.com'); 

// Получаем список идентификаторов всех доступных календарей
//function getCalendars() { 
//    var calendars = CalendarApp.getAllCalendars();
//    Logger.log('Этот пользователь подписан на %s календарей:', calendars.length);
//    for (var i = 0; i < calendars.length; i++) {
//        var calendar = calendars[i];
//        Logger.log((i + 1) + 'й календарь: "' + calendar.getName() + '",\n ID: "' + calendar.getId() + '"\n');
//    }
//}
    var title = `Сегодня ребёнку исполняется ${childFullYears} ${textYear(childFullYears)} и ${moment().diff(childBirthday, 'months', false)-childFullYears*12} ${textMonth(childmonth)}`;
    var event = defaultCal.createAllDayEvent(title,
        new Date(now), {
            // location: "58.0100442,56.2275679",
            description: fatherText + '\n' + motherText + '\n\n' + relationshipText
        });
    event.setColor(CalendarApp.EventColor.RED);
    event.addPopupReminder(24 * 60 * 2 - 9 * 60); // за 2 дня в 09:00
    event.addPopupReminder(24 * 60 * 1 - 9 * 60); // за 1 день в 09:00
    event.addPopupReminder(4 * 60); // за 1 день в 20:00
    event.addPopupReminder(0); // в тот же день в  00:00
}

// Автоматически создаем новые триггеры для запуска
function TriggersCreateTimeDriven() { 
    // Deletes all triggers in the current project.
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
        ScriptApp.deleteTrigger(triggers[i]);
    }
    // а теперь создаем
    ScriptApp.newTrigger("AddCalendarCurrentAge")
        .timeBased()
        .onMonthDay(1) //триггер на 1й день месяца
        .atHour(2)
        .create();
}
