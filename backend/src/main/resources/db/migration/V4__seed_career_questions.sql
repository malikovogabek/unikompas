-- =====================================================================
-- RIASEC career-interest questionnaire (FR-4.1, FR-9.6): 6 types × 6 items,
-- answered on a 1–5 Likert scale. Items are original wording inspired by
-- Holland's typology (not a copy of any licensed instrument). Order numbers
-- interleave the types (R, I, A, S, E, C, R, I, ...) so blocks are not obvious.
-- =====================================================================

CREATE TEMP TABLE q (t CHAR(1), k INT, uz TEXT, ru TEXT, en TEXT) ON COMMIT DROP;

INSERT INTO q VALUES
-- Realistic
('R',1,'Asbob-uskunalar bilan ishlash, narsalarni yig‘ish yoki ta’mirlash menga yoqadi.','Мне нравится работать с инструментами, собирать или ремонтировать вещи.','I enjoy working with tools and assembling or repairing things.'),
('R',2,'Ochiq havoda, tabiat qo‘ynida yoki dalada ishlashni afzal ko‘raman.','Я предпочитаю работать на открытом воздухе, на природе или в поле.','I prefer working outdoors, in nature or in the field.'),
('R',3,'Mashinalar, texnika va mexanizmlar qanday ishlashi menga qiziq.','Мне интересно, как устроены машины, техника и механизмы.','I am curious how machines, vehicles and mechanisms work.'),
('R',4,'Qo‘l bilan bajariladigan, aniq natija beradigan ish menga yoqadi.','Мне нравится работа руками с конкретным, ощутимым результатом.','I like hands-on work that produces a tangible result.'),
('R',5,'Chizmalar asosida biror narsa qurish yoki yasashni xohlardim.','Я хотел(а) бы строить или изготавливать что-то по чертежам.','I would like to build or make things from technical drawings.'),
('R',6,'O‘simliklar yoki hayvonlarni parvarish qilish menga yoqadi.','Мне нравится ухаживать за растениями или животными.','I enjoy taking care of plants or animals.'),
-- Investigative
('I',1,'Murakkab masalalarni mantiqiy fikrlash orqali yechish menga yoqadi.','Мне нравится решать сложные задачи с помощью логики.','I enjoy solving complex problems through logical reasoning.'),
('I',2,'Tajriba o‘tkazish va uning natijalarini tahlil qilish menga qiziq.','Мне интересно проводить эксперименты и анализировать результаты.','I am interested in running experiments and analysing the results.'),
('I',3,'Ilmiy maqolalar va ilm-fan yangiliklarini o‘qishni yoqtiraman.','Я люблю читать научные статьи и новости науки.','I like reading scientific articles and science news.'),
('I',4,'Biror hodisaning sababini tushunmagunimcha izlanishda davom etaman.','Я не успокоюсь, пока не пойму причину происходящего.','I keep digging until I understand why something happens.'),
('I',5,'Matematika va raqamlar bilan ishlash menga oson va qiziqarli.','Математика и работа с числами даются мне легко и интересны.','Mathematics and working with numbers come easily to me and interest me.'),
('I',6,'Kompyuter dasturlari va algoritmlar qanday ishlashini o‘rganishni xohlayman.','Я хочу разобраться, как работают программы и алгоритмы.','I want to learn how computer programs and algorithms work.'),
-- Artistic
('A',1,'Rasm chizish, dizayn yoki fotografiya bilan shug‘ullanish menga yoqadi.','Мне нравится рисовать, заниматься дизайном или фотографией.','I enjoy drawing, design or photography.'),
('A',2,'Hikoya, she’r yoki maqola yozishni yoqtiraman.','Я люблю писать рассказы, стихи или статьи.','I like writing stories, poems or articles.'),
('A',3,'Musiqa, teatr yoki kino sohasida ishlashni orzu qilaman.','Я мечтаю работать в сфере музыки, театра или кино.','I dream of working in music, theatre or film.'),
('A',4,'Qat’iy qoidalarsiz, erkin va ijodiy ishlashni afzal ko‘raman.','Я предпочитаю свободную творческую работу без жёстких правил.','I prefer free, creative work without strict rules.'),
('A',5,'Yangi g‘oyalar va noodatiy yechimlar o‘ylab topish menga yoqadi.','Мне нравится придумывать новые идеи и необычные решения.','I like coming up with new ideas and unusual solutions.'),
('A',6,'Interyer, kiyim yoki mahsulot ko‘rinishini chiroyli qilishga e’tibor beraman.','Я обращаю внимание на красивое оформление интерьера, одежды или продукта.','I pay attention to making interiors, clothes or products look beautiful.'),
-- Social
('S',1,'Boshqalarga biror narsani tushuntirish va o‘rgatish menga yoqadi.','Мне нравится объяснять и обучать других.','I enjoy explaining things and teaching others.'),
('S',2,'Odamlarni tinglash va muammolarini hal qilishda yordam berishni xohlayman.','Я хочу выслушивать людей и помогать им решать проблемы.','I want to listen to people and help them solve their problems.'),
('S',3,'Kasal yoki yordamga muhtoj odamlarga g‘amxo‘rlik qilishga tayyorman.','Я готов(а) заботиться о больных и нуждающихся.','I am ready to care for people who are ill or in need.'),
('S',4,'Jamoada ishlash yolg‘iz ishlashdan ko‘ra menga yoqimliroq.','Работать в команде мне приятнее, чем в одиночку.','I enjoy working in a team more than working alone.'),
('S',5,'Volontyorlik va ijtimoiy loyihalarda qatnashish menga yoqadi.','Мне нравится участвовать в волонтёрских и социальных проектах.','I like taking part in volunteering and social projects.'),
('S',6,'Odamlar bilan oson til topishaman va ularni yaxshi tushunaman.','Я легко нахожу общий язык с людьми и хорошо их понимаю.','I get along with people easily and understand them well.'),
-- Enterprising
('E',1,'Guruhga rahbarlik qilish va qaror qabul qilish menga yoqadi.','Мне нравится руководить группой и принимать решения.','I like leading a group and making decisions.'),
('E',2,'Odamlarni biror g‘oyaga ishontirish menda yaxshi chiqadi.','У меня хорошо получается убеждать людей в своей идее.','I am good at persuading people of an idea.'),
('E',3,'O‘z biznesimni ochish yoki loyihani boshqarishni orzu qilaman.','Я мечтаю открыть свой бизнес или управлять проектом.','I dream of starting my own business or running a project.'),
('E',4,'Raqobat va yuqori natijaga intilish meni ruhlantiradi.','Конкуренция и стремление к высоким результатам меня вдохновляют.','Competition and striving for top results motivate me.'),
('E',5,'Muzokara olib borish, sotish yoki taqdimot qilish menga yoqadi.','Мне нравится вести переговоры, продавать или выступать с презентациями.','I enjoy negotiating, selling or giving presentations.'),
('E',6,'Tavakkal qilishga va mas’uliyatni o‘z zimmamga olishga tayyorman.','Я готов(а) рисковать и брать ответственность на себя.','I am willing to take risks and take responsibility.'),
-- Conventional
('C',1,'Hujjatlar, jadvallar va ma’lumotlarni tartibga solish menga yoqadi.','Мне нравится упорядочивать документы, таблицы и данные.','I like organising documents, spreadsheets and data.'),
('C',2,'Aniq ko‘rsatma va qoidalar asosida ishlashni afzal ko‘raman.','Я предпочитаю работать по чётким инструкциям и правилам.','I prefer working by clear instructions and rules.'),
('C',3,'Hisob-kitoblardagi xatolarni topish va aniqlikni tekshirish menga yoqadi.','Мне нравится находить ошибки в расчётах и проверять точность.','I enjoy spotting errors in calculations and checking accuracy.'),
('C',4,'Ishimni oldindan rejalashtirib, jadval asosida bajaraman.','Я заранее планирую работу и выполняю её по графику.','I plan my work in advance and follow a schedule.'),
('C',5,'Moliya, buxgalteriya yoki statistika bilan ishlash menga qiziq.','Мне интересно работать с финансами, бухгалтерией или статистикой.','I am interested in finance, accounting or statistics.'),
('C',6,'Puxta va aniq ishlash men uchun tezlikdan muhimroq.','Тщательность и аккуратность для меня важнее скорости.','Being thorough and precise matters more to me than speed.');

INSERT INTO career_questions (text_uz, text_ru, text_en, riasec_type, order_no)
SELECT uz, ru, en, t, (k - 1) * 6 + strpos('RIASEC', t)
FROM q
ORDER BY (k - 1) * 6 + strpos('RIASEC', t);
