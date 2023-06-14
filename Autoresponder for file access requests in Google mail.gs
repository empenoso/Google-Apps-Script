// Подробное описание в статье https://habr.com/ru/articles/739168/

function autoReply() {
    for (const filename of [
            `Имя файла 1`,
            `Имя файла 2`,
            `Имя файла 3`
        ]) {
        var threads = GmailApp.search(`is:inbox is:unread Запрос доступа к файлу "${filename}"`);
        for (var i = 0; i < threads.length; i++) {
            var thread = threads[i];
            console.log(`Результат поиска: "${filename}": ${i} из ${threads.length}:\n---- ${thread.getMessages()[thread.getMessageCount() - 1].getReplyTo()};`)
            from = thread
                .getMessages()[thread.getMessageCount() - 1].getFrom()
                .split(' (через')[0]
                .replace(/\"/g, '')
            thread.reply(`Привет, ${from}!\nБлагодарю Вас за интерес к моему файлу "${filename}". Бла бла бла \n\nС уважением, Михаил Шардин.`);
            GmailApp.moveThreadsToTrash(threads.slice(i, i + 1));

            console.log(`Был обработан и удалён запрос от ${thread.getMessages()[thread.getMessageCount() - 1].getReplyTo()} к ${filename}`)
        }
    }
}