'use strict';

// Модальное окно

const closeModal = document.querySelector('[data-close]'),
      modal = document.querySelector('.modal'),
      dicitonary = document.querySelector('.dictionary');

function openModal() {
    modal.classList.add('show');
    modal.classList.remove('hide');

    document.body.style.overflow = 'hidden';
    dicitonary.classList.add('blur');
}

function hideModal() {
    modal.classList.add('hide');
    modal.classList.remove('show');

    document.body.style.overflow = '';
    dicitonary.classList.remove('blur');
}

closeModal.addEventListener('click', hideModal);

// Основное

const inputWord = document.querySelector('.dictionary__word'),
      inputTranslate = document.querySelector('.dictionary__translate'),
      inputs = document.querySelectorAll('input'),
      form = document.querySelectorAll('.dictionary__form'),
      listItem = document.querySelectorAll('.dictionary__list_item');

// Проверка полей ввода

function testInput (word, translate) {
    const regNum = /\d/,
          regRus = /[а-я]/i,
          regEng = /[a-z]/i;

    if (word.value.search(regNum) !== -1 || translate.value.search(regNum) !== -1) {
        word.value = word.value.replace(regNum, '');
        translate.value = translate.value.replace(regNum, '');
    }

    if (word.value.search(regRus) !== -1 || translate.value.search(regEng) !== -1) {
        word.value = word.value.replace(regRus, '');
        translate.value = translate.value.replace(regEng, '');
    }
} 

inputs.forEach(item => {
    item.addEventListener('input', () => {
        testInput(inputWord, inputTranslate);
    });
});

form.forEach(item => {
    bindPostData(item);
});

// Отправка данных в БД

const postData = async (url, data) => {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: data
    });

    return await res.json();
};

function bindPostData (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(form);

        const json = JSON.stringify(Object.fromEntries(formData.entries()));

        postData('../db.json', json)
            .then(data => console.log(data))
            .catch(() => {
                openModal();
                setTimeout(hideModal, 5000);
                throw new Error(`Could not post`);
            })
            .finally(() => {
                inputTranslate.value = '';
                inputWord.value = '';
                console.log('Данные занесены в БД');
            });
    });
}

// Получение данных из БД

getData('../db.json')
    .then(data => {
        data.forEach(({word, translate}) => {
            listItem.forEach((item) => {
                if (item.id == word.substr(0, 1)) {
                    const li = document.createElement('li');
                    
                    li.innerHTML = `${word} \u00A0 - \u00A0 ${translate}`;

                    item.appendChild(li);
                }
            });
        });
    });

async function getData (url) {
    let res = await fetch(url);

    if(!res.ok) {
        openModal();
        setTimeout(hideModal, 5000);
        throw new Error(`Could not fetch ${url}, status ${res.status}.`);
    }

    return await res.json();
}