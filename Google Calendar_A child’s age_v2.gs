/*
 * Скрипт, который ежемесячно создаёт событие в гугл календаре, в котором точно указан возраст ребенка, а также значимые события из жизни родителей
 * (c) 2022.01. Mikhail Shardin https://shardin.name/
 * 
 * Дополнительные инструкции: https://habr.com/ru/post/645935/
 * Исходное размещение: https://github.com/empenoso/Google-Apps-Script/ 
 */

function AddCalendarCurrentAge() { //вычисляем значимые даты и добавляем всё это в выбраный календарь
    eval(UrlFetchApp.fetch('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment-with-locales.min.js').getContentText());
    moment.locale('ru');
    
    const offset = 9;
    var now = moment().add(offset, 'days'); // триггер из TriggersCreateTimeDriven работает в 1й день месяца, но сам день рождения ведь в другой день, то есть если день рождения ребёнка 9 числа, то offset = 9

    const childBirthday = '2017-03-07'
    var childFullYears = ~~(moment(now).diff(childBirthday, 'months', false) / 12)
    childText = `Ребенок родился ${childFullYears} года и ${moment().diff(childBirthday, 'months', false)-childFullYears*12} месяцев назад.`

    const fatherBirthday = '1991-06-15'
    var fatherFullYears = ~~(moment(now).diff(fatherBirthday, 'months', false) / 12)
    fatherText = `Папа родился ${fatherFullYears} лет и ${moment().diff(fatherBirthday, 'months', false)-fatherFullYears*12} месяцев назад.`

    const motherBirthday = '1995-07-18'
    var motherFullYears = ~~(moment(now).diff(motherBirthday, 'months', false) / 12)
    motherText = `Мама родилась ${motherFullYears} лет и ${moment().diff(motherBirthday, 'months', false)-motherFullYears*12} месяцев назад.`

    const relationshipStart = '2015-06-16'
    const relationshipEnd = moment().format('YYYY-MM-DD') // или поставьте дату :(
    var relationshipFullYears = ~~(moment(relationshipEnd).diff(relationshipStart, 'months', false) / 12)
    relationshipText = `Отношениям ${relationshipFullYears} лет и ${moment(relationshipEnd).diff(relationshipStart, 'months', false)-relationshipFullYears*12} месяцев (с ${relationshipStart} по ${relationshipEnd}).`
    Logger.log(childText + '\n' + fatherText + '\n' + motherText + '\n' + relationshipText);

    // добавляем в календарь
    var defaultCal = CalendarApp.getDefaultCalendar(); // создаем события в календаре по умолчанию
    // var defaultCal = CalendarApp.getCalendarById('54r4muXXXXXXXXXvgh4vr2h8@group.calendar.google.com'); //или другом календаре. узнать идентификатор через функцию get_calendars ниже

    var title = `Ребенку сегодня исполняется ${childFullYears} года и ${moment().diff(childBirthday, 'months', false)-childFullYears*12} месяцев`;
    var event = defaultCal.createAllDayEvent(title,
        new Date(now), {
            location: "58.0100442,56.2275679",
            description: motherText + '\n' + fatherText + '\n\n' + relationshipText
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

//=================================================================================================

function getCalendars() { //получить список идентификаторов всех доступных календарей
    var calendars = CalendarApp.getAllCalendars();
    Logger.log('Этот пользователь подписан на %s календарей:', calendars.length);
    for (var i = 0; i < calendars.length; i++) {
        var calendar = calendars[i];
        Logger.log((i + 1) + 'й календарь: "' + calendar.getName() + '",\n ID: "' + calendar.getId() + '"\n');
    }
}
