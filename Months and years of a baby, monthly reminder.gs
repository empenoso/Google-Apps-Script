/*
 * Для всех молодых отцов - сколько месяцев и годов ребенку отроду, ежемесячная напоминалка.
 * (c) 2019.10 Mikhail Shardin <mikhail.shardin@gmail.com>, https://www.facebook.com/mikhail.shardin
 *
 * Написал код, который облегчает жизнь молодым отцам.
 * Ведь в то время как все бабушки отлично помнят день
 * рождения своего внука/внучки и поздравляют с этим
 * событием ежемесячно - мне никак не удавалось удержать
 * это в памяти. Решил слегка автоматизировать процесс и
 * заодно разобраться как работать с датами в Google Apps Script.
 * И конечно же сделать, чтобы эта напоминалка появлялась
 * заблаговременно, а не в день рождения малыша!

 * Для начала работы Файл/Создать копию и задать
 * начальное значение offset из того расчета, что триггер на
 * автоматический запуск скрипта 1 числа каждого месяца,
 * но сам день рождения например 8 числа, то есть offset
 * должен быть равен 7. 
 
 * Функция TriggersCreateTimeDriven создаст
 * автозапуск расчетов каждого 1го числа месяца.
 * 
 * На основе кода Eric Koleda
 * https://stackoverflow.com/questions/16149760/calculating-year-month-days-between-dates-in-google-apps-script/16928369
 */
 
function AddCalendarCurrentAge() { //вычисляем возраст всех участников и добавляем в выбраный календарь
    eval(UrlFetchApp.fetch('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment-with-locales.min.js').getContentText());
    moment.locale('ru');
    var offset = 7;
    var now = new Date(new Date().setDate(new Date().getDate() + offset)); // триггер из TriggersCreateTimeDriven работает в 1й день месяца, но само день рождение ведь в другой день, поэтому + n дней

    var child = new Date('April 17, 2017'); //https://translate.google.com/#view=home&op=translate&sl=ru&tl=en&text=17%20%D0%B0%D0%BF%D1%80%D0%B5%D0%BB%D1%8F%202017%20%D0%B3%D0%BE%D0%B4%D0%B0
    var childAge = getDuration(child, now);
    childAge = childAge.replace(/years/g, "года");
    childAge = childAge.replace(/months/g, "месяцев");
    childAge = childAge.replace(/days/g, "дней");
    Logger.log("child age = %s", childAge);

    var relations = new Date('June 11, 2014 15:00:00 +0500');
    var relationsAge = getDuration(relations, now);
    relationsAge = relationsAge.replace(/years/g, "лет");
    relationsAge = relationsAge.replace(/months/g, "месяцев");
    relationsAge = relationsAge.replace(/days/g, "дней");
    Logger.log("relationship age = %s", relationsAge);

    var fathersAge = moment("19880515", "YYYYMMDD").fromNow();
    Logger.log("father's age = %s", fathersAge);

    var motherAge = moment("19900418", "YYYYMMDD").fromNow();
    Logger.log("mother age = %s", motherAge);

    // добавляем в календарь
    var defaultCal = CalendarApp.getDefaultCalendar(); // создаем события в календаре по умолчанию
    //var defaultCal = CalendarApp.getCalendarById('XXXXXXX@group.calendar.google.com'); //или другом календаре. узнать идентификатор через функцию get_calendars ниже
    var title = "XXXXXXX сегодня " + childAge;
    var event = defaultCal.createAllDayEvent(title,
        now, {
            location: "XXXXXXX",
            description: 'Мама родилась ' + motherAge + ', папа ' + fathersAge + '.\n' + 'Первая встреча мамы и папы ' + relationsAge + ' назад.'
        });
    event.setColor(CalendarApp.EventColor.RED);
    event.addPopupReminder(12 * 60 + 5 * 24 * 60); //за 5 дней
}

function TriggersCreateTimeDriven() { //автоматически создаем новые триггеры для запуска
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

function getDuration(startDate, endDate) { // функция вычисляющая возраст в днях
    var start = moment(startDate);
    var end = moment(endDate);
    var units = ['years', 'months', 'days'];
    var parts = [];
    units.forEach(function(unit, i) {
        var diff = Math.floor(end.diff(start, unit, true));
        if (diff > 0 || i == units.length - 1) {
            end.subtract(unit, diff);
            parts.push(diff + ' ' + unit);
        }
    })
    return parts.join(', ');
}

//=================================================================================================

function get_calendars() { //получить список всех доступных календарей
    var calendars = CalendarApp.getAllCalendars();
    Logger.log('This user owns or is subscribed to %s calendars.', calendars.length);
    for (var i = 0; i < calendars.length; i++) {
        var calendar = calendars[i];
        Logger.log((i + 1) + 'й календарь: "' + calendar.getName() + '",\n ID: "' + calendar.getId() + '"\n');
    }
}
