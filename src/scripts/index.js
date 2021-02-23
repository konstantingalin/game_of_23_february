import '../styles/index.scss';
import anime from 'animejs/lib/anime.es.js';

if (process.env.NODE_ENV === 'development') {
    require('../index.html');
}
let isMobile = false;
if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
    )
) {
    isMobile = true;
}
//fullpage

const gamePage = document.querySelector('#game');
const finalPage = document.querySelector('#final');
const startPage = document.querySelector('#start');

if (startPage && isMobile) {
    const textInstr = startPage.querySelector('#instruction');

    textInstr.innerHTML = 'Успевайте кликать на&nbsp;вирусы,';
}
if (gamePage || startPage) {
    (function (window, document) {
        var sectionsCount = document.querySelectorAll('.section').length;

        var sectionsAnchors = [];
        for (var i = 1; i <= sectionsCount; i++) {
            sectionsAnchors.push('' + i);
        }

        $('#fullpage').fullpage({
            scrollingSpeed: 500,
            anchors: sectionsAnchors,
            // paddingBottom: '60px',
            responsiveWidth: 500,
            afterLoad: function afterLoad(origin, destination, direction) {},
        });

        $.fn.fullpage.setAllowScrolling(false);
    })(window, document);
}

if (gamePage) {
    window.addEventListener('load', (e) => {
        start();
    });
    const microbialParams = [
        {
            points: 100,
            width: 50,
            height: 50,
        },
        {
            points: 50,
            width: 80,
            height: 80,
        },
        {
            points: 25,
            width: 100,
            height: 100,
        },
    ];
    const gameContainer = gamePage.querySelector('#gameContainer');
    const currentPointsText = gamePage.querySelector('#count');
    const mistakes = gamePage.querySelectorAll('.mistake');
    const bestResult = document.querySelector('#best-result');
    let arrayCurrentMicrobe;
    let points = 0;
    let lifes = 2;
    let duration = 2000;
    let isFinish = false;

    const gameContainerHeight = gameContainer.clientHeight;
    const gameContainerWidth = gameContainer.clientWidth;
    const leftPositionGameContainer = gameContainer.getBoundingClientRect()
        .left;

    bestResult.innerHTML = +localStorage.getItem('bestResult');

    function start() {
        let quantity;
        if (isMobile) {
            quantity = randomInteger(1, 5);
        } else {
            quantity = randomInteger(1, 15);
        }
        let isAkrihin = randomInteger(1, 4);

        arrayCurrentMicrobe = new Array();

        createMicrobial(quantity);
        createBomb();
        if (isAkrihin == 1) {
            createAkrihin();
        }
        addArrayOnPage();
        addAnimation();
        if (isMobile) {
            console.log('mobile');
            addActionMob();
        } else {
            console.log('desktop');
            addActionDesk();
        }
        startTimer();
    }

    function addAnimation() {
        const parents = document.querySelectorAll('.parent');
        const items = document.querySelectorAll('.parent .inner');
        let x = Math.trunc(gameContainerWidth - leftPositionGameContainer);

        parents.forEach((parent) => {
            let j = randomInteger(
                (3 * gameContainerHeight) / 4,
                gameContainerHeight,
            );

            animate({
                duration: duration,
                timing: function (timeFraction) {
                    return timeFraction;
                },
                draw: function (progress) {
                    parent.style.transform = `translateY(${-j * progress}px)`;
                    if (progress == 1) {
                        let y = parseInt(
                            getComputedStyle(parent).transform.split(',')[5],
                        );

                        parent.style.transform = `translateY(${y}px)`;

                        animate({
                            duration: duration,
                            timing: function (timeFraction) {
                                return timeFraction;
                            },
                            draw: function (progress) {
                                parent.style.transform = `translateY(${
                                    y + progress * j
                                }px)`;
                                if (progress == 1) {
                                    isFinish = true;
                                }
                            },
                        });
                    }
                },
            });
        });
        items.forEach((item) => {
            let i;

            if (isMobile) {
                i = randomInteger(0, x);
            } else {
                i = randomInteger(leftPositionGameContainer, x);
            }
            item.style.transform = `translateX(${i}px)`;
        });
    }
    setInterval(() => {
        if (isFinish) {
            isFinish = false;
            newLv();
            console.log('finish');
        }
    }, 1000);
    function animate(options) {
        var start = performance.now();

        requestAnimationFrame(function animate(time) {
            // timeFraction от 0 до 1
            var timeFraction = (time - start) / options.duration;
            if (timeFraction > 1) timeFraction = 1;

            // текущее состояние анимации
            var progress = options.timing(timeFraction);

            options.draw(progress);

            if (timeFraction < 1) {
                requestAnimationFrame(animate);
            }
        });
    }

    function createMicrobial(quantity) {
        for (var i = 0; i < quantity; i++) {
            createElement();
        }
    }

    function createElement() {
        const container = createParentContainer();
        const item = document.createElement('img');
        const selectedParam = microbialParams[randomInteger(0, 2)];

        item.src = `public/microb_${randomInteger(1, 5)}.png`;
        container.style.width = `${selectedParam.width}px`;
        container.style.height = `${selectedParam.height}px`;
        item.setAttribute('data-point', selectedParam.points);
        item.classList.add('microb');

        container.firstChild.appendChild(item);
        arrayCurrentMicrobe.push(container);
    }
    function createBomb() {
        const bomb = document.createElement('img');
        const container = createParentContainer();

        bomb.src = 'public/bomb.png';
        container.style.width = '100px';
        container.style.height = '100px';
        bomb.setAttribute('data-point', 'life');

        container.firstChild.appendChild(bomb);
        arrayCurrentMicrobe.push(container);
    }

    function createAkrihin() {
        const akrihin = document.createElement('img');
        const container = createParentContainer();

        akrihin.src = 'public/pack.png';
        container.style.width = '100px';
        container.style.height = '100px';
        akrihin.setAttribute('data-point', 'akrihin');

        container.firstChild.appendChild(akrihin);
        arrayCurrentMicrobe.push(container);
    }

    function createParentContainer() {
        const container = document.createElement('div');
        const conteinerInner = document.createElement('div');

        conteinerInner.classList.add('inner');
        container.classList.add('parent');

        container.appendChild(conteinerInner);
        return container;
    }
    function addArrayOnPage() {
        arrayCurrentMicrobe.forEach((item) => {
            gameContainer.appendChild(item);
        });
    }

    function addActionDesk() {
        const microbs = document.querySelectorAll('[data-point]');
        let selectedItem;

        microbs.forEach((microb) => {
            microb.addEventListener('mouseover', function (e) {
                let data = this.dataset.point;

                if (selectedItem == this) {
                    return;
                }
                selectedItem = this;

                if (data != 'life' && data != 'akrihin') {
                    microbeAction(this);
                } else if (data == 'life') {
                    bombAction(this);
                } else if (data == 'akrihin') {
                    akrihinAction();
                    // akrihinAction().then(() => {
                    //     setTimeout(() => {
                    //         destroy(this);
                    //     }, 1000);
                    // });
                }
                setTimeout(() => {
                    destroy(this);
                }, 1000);
            });
        });
    }

    function addActionMob() {
        const microbs = document.querySelectorAll('[data-point]');
        let selectedItem;

        microbs.forEach((microb) => {
            var mc = new Hammer(microb);

            mc.on('panleft panright tap press', function (ev) {
                console.log(microb);
                let data = microb.dataset.point;
                if (selectedItem == microb) {
                    return;
                }
                selectedItem = microb;
                if (data != 'life' && data != 'akrihin') {
                    microbeAction(microb);
                } else if (data == 'life') {
                    bombAction(microb);
                } else if (data == 'akrihin') {
                    akrihinAction();
                }
                setTimeout(() => {
                    destroy(microb);
                }, 1000);
            });
            // microb.addEventListener('touchstart', function (e) {
            //     let data = this.dataset.point;
            //     if (selectedItem == this) {
            //         return;
            //     }
            //     selectedItem = this;
            //     if (data != 'life' && data != 'akrihin') {
            //         microbeAction(this);
            //     } else if (data == 'life') {
            //         bombAction(this);
            //     } else if (data == 'akrihin') {
            //         akrihinAction();
            //     }
            //     setTimeout(() => {
            //         destroy(this);
            //     }, 1000);
            // });
        });
    }

    function microbeAction(item) {
        let data = item.dataset.point;

        points = +data + points;
        item.classList.add('_destroy');
        currentPointsText.innerHTML = points;
    }

    function bombAction(item) {
        mistakes[lifes].src = 'public/cross_2.png';
        lifes = lifes - 1;

        gamePage.classList.add('_quake');
        setTimeout(() => gamePage.classList.remove('_quake'), 2000);
        item.src = 'public/explosion.png';

        if (lifes < 0) {
            endGame('lifes');
        }
    }

    function akrihinAction() {
        gamePage.classList.add('_freezing');
        duration = 5000;
        setTimeout(() => {
            gamePage.classList.remove('_freezing');
            duration = 2000;
        }, 3000);
    }
    function destroy(item) {
        item.remove();
    }

    function newLv() {
        console.log('new');
        gameContainer.innerHTML = '';
        start();
    }
    function randomInteger(min, max) {
        let rand = min + Math.random() * (max - min);
        return Math.round(rand);
    }

    function startTimer() {
        let i = 0;
        let timer = setInterval(() => {
            i++;
            if (i == 180) {
                clearInterval(timer);
                endGame('time');
            }
        }, 1000);
    }

    function endGame(reason) {
        document.location.href = 'final.html';

        localStorage.setItem('currentResult', points);
        if (+localStorage.getItem('bestResult') < +points) {
            localStorage.setItem('bestResult', +points);
        }

        //отправка в га переменной reason
        ga('oselt.send', 'event', 'end_game', reason);
    }
}

if (finalPage) {
    const currentResult = document.querySelector('#result');
    const textResult = document.querySelector('#record p');
    let currentPoints = +localStorage.getItem('currentResult');
    let bestPoints = +localStorage.getItem('bestResult');

    currentResult.innerHTML = localStorage.getItem('currentResult');

    if (currentPoints > bestPoints) {
        textResult.innerHTML = 'новый рекорд!';
    } else if (currentPoints < bestPoints) {
        textResult.innerHTML = 'Ваш результат!';
    }

    $('.carousel').on('slide.bs.carousel', function (event) {
        ga('oselt.send', 'event', 'slide', event.from);
    });
    //modal
    var modal = new tingle.modal({
        footer: false,
        stickyFooter: false,
        closeMethods: ['overlay', 'button', 'escape'],
        closeLabel: 'Close',
        cssClass: ['custom-class-1', 'custom-class-2'],
        onOpen: function () {
            console.log('modal open');
        },
        onClose: function () {
            console.log('modal closed');
        },
        beforeClose: function () {
            // here's goes some logic
            // e.g. save content before closing the modal
            return true; // close the modal
            return false; // nothing happens
        },
    });

    const literatureButtons = document.querySelectorAll('.literature');
    literatureButtons.forEach((literatureButton) => {
        literatureButton.addEventListener('click', (e) => {
            modal.setContent(`
        
        <p class="title _md text-bold  text-transform text-grey">
        АКРИХИН 
      </p>
      <p class='text-margin text-transform' style='font-size: 18px'>лидирующий российский производитель препаратов по доступной цене<sup>11</sup></p>
      <p class="text-grey text-margin">
        * По данным за 2017 г., гриппом переболело 50 000 человек (34,8 случая на 100 000 человек населения)<sup>3</sup>.<br>
        **Во всем мире, данные ВОЗ<sup>4</sup>.<br>
        *** https://www.who.int/ru/news-room/detail/14-12-2017-up-to-650-000-people-die-of-respiratory-diseases-linked-to-seasonal-flu-each-year
        <br><br>
        1. Острая респираторная вирусная инфекция (ОРВИ) у детей. Клинические рекомендации. Москва, 2018. – 33
        с. С. 7.<br>
        2. Викулов Г.Х. ОРВИ, грипп и герпес: что общего и в чем разница при диагностике и терапии. Взгляд
        клинического иммунолога и инфекциониста // Русский медицинский журнал, 2015. № 17. С. 1032–1037.<br>
        3. Российский статистический ежегодник. 2018: Стат. сб. / Росстат. – М., 2018. – 694 с. С. 214.<br>
        4. Грипп у взрослых. Клинические рекомендации. Москва, 2017. – 57 с. С. 10, 11, 56.<br>
        5. Грипп у детей. Клинические рекомендации. Москва, 2017. – 43 с. С. 8.<br>
        6. Лазарева Н.Б., Журавлева М.В., Пантелеева Л.Р. Клинико-фармакологические подходы к современной
        противовирусной терапии гриппа // Медицинский совет, 2018. № 6. С. 50–54.<br>
        7. Грипп у детей. Клинические рекомендации. Москва, 2017. – 43 с. 3.<br>
        8. Сологуб Т.В., Токин И.И. Тактика ведения больных гриппом на современном этапе // Эффективная
        фармакотерапия, 2017. № 10. С. 14–18.<br>
        9. Инструкция по медицинскому применению лекарственного препарата Осельтамивир-Акрихин. РУ ЛП-005146.<br>
        10. На основании сравнения со средневзвешенной ценой Тамифлю 75 мг № 10 по данным IQVIA Russia, Retail
        MATm08 2020. Препараты, входящие в портфель «МНН-Акрихин», дешевле оригинальных ЛС с аналогичной
        формой выпуска, количеством единиц лекформ и концентрацией действующего вещества<br>
        11. АО «АКРИХИН» занимает 1-е место по продажам в упаковках по 10 МНН в розничном канале среди всех
        компаний, по данным IQVIA, Russia, Retail channel, MATm08 2020.<br>
        12. По данным IQVIA MATm05 2019, оптовые цены дистрибьюторов. Препараты, входящие в портфель
        «МНН-Акрихин», дешевле оригинальных ЛС с аналогичной формой выпуска, количеством единиц лек. форм и
        концентрацией действующего вещества.<br>
        13. 19 октября 1936 года была получена первая промышленная партия Акрихина.<br>
        14. Все производственные площадки, осуществляющие продукцию препаратов МНН-Акрихин, сертифицированы по
        стандартам Надлежащей производственной практики GMP.<br>
        15. АО «АКРИХИН» входит в топ-10 производителей с наиболее узнаваемыми препаратами среди провизоров
        первого стола, по данным Ipsos Healthcare, Pharma-Q, Spring, 2018.<br>
        16. Доля продаж АО «АКРИХИН» в рублях в сегменте CBG + МНН препаратов. Анализ произ- веден по
        следующим МНН: ацикловир, диклофенак, клотримазол, бромгексин, ибупрофен, лоперамид, лоратадин,
        метопролол, омепразол, флуоцинолона ацетонид. IQVIA, Russia, Retail channel, CBG/INN market, MATm08
        2020.

      </p>
        `);
            modal.open();
        });
    });
}

if (!isMobile) {
    const footer = document.querySelector('#footer_container');
    let isClose = false;

    footer.addEventListener('click', (e) => {
        if (isClose) {
            footer.classList.remove('_hidden');
            isClose = false;
        } else {
            footer.classList.add('_hidden');
            isClose = true;
        }
    });
}
