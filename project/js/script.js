'use strict';

let fname;
let lname;
let minute = 9;
let sec = 59;
let points = 0;

const formToJSON = elements => [].reduce.call(elements, (data, element) => {
    if (isValidElement(element) && isValidValue(element)) {
        if (isCheckbox(element)) {
            data[element.name] = (data[element.name] || []).concat(element.value);
        } else {
            data[element.name] = element.value;
        }
    }
    return data;
}, {});

//check if element has 'name - value' pair
const isValidElement = element => {
    return element.name && element.value;
};

//check if a value of an element (checkbox/radio) can be saved. Selected or not.
const isValidValue = element => {
    return (!['checkbox', 'radio'].includes(element.type) || element.checked);
};

//check if element is a checkbox. (Multivalue)
const isCheckbox = element => element.type === 'checkbox';

//submit form; DOM manipulations; convert to JSON; perform ajax request to php;
const handleFormSubmit = event => {
    event.preventDefault();
    hideFormDisableButton();
    const DATA = formToJSON(QUIZFORM.elements);
    let dataForServer = sessionStorage.getItem('Firstname');
    let dataForServer_2 = sessionStorage.getItem('Lastname');
    DATA.firstname = dataForServer;
    DATA.lastname = dataForServer_2;
    const stringifiedData = JSON.stringify(DATA);
    let showResult = getPoints(DATA);
    document.getElementById('result').innerHTML = +
        (showResult <= 5) ?
        dataForServer + ', you have answered ' + showResult + ' questions correctly. You can enhance your knowledge <a href="https://www.w3schools.com/" target="_blank">HERE</a>.' :
        (showResult > 9) ?
            dataForServer + ', you have answered ' + showResult + ' questions correctly. Very nice! You got them all right! :)' :
            dataForServer + ', you have answered ' + showResult + ' questions correctly. Not bad! :)';


    // Send result to php and save them into json file
    $.ajax(
        {
            url: "input.php",
            type: "POST",
            data: stringifiedData,
            contentType: 'application/json',
            success: function () {
            },
            error: function (xhr, status, error) {
                console.log(xhr);
                console.log(status);
                console.log(error);
            }
        })
};
const QUIZFORM = document.getElementById('quiz_form');
QUIZFORM.addEventListener('submit', handleFormSubmit);

// show quiz form; disable "start test" button
// Quiz started
function showQuizForm() {
    document.getElementById('quiz_form').style.display = 'block';
    document.getElementById('start-test').disabled = true;
}

function hideFormDisableButton() {
    document.getElementById('quiz_form').style.display = 'none';
    document.getElementById('start-test').disabled = true;
}

// calculate correct answers/questions. Recursive function.
function getPoints(json) {
    for (const i in json) {
        if (Array.isArray(json[i]) || typeof json[i] === 'object') {
            getPoints(json[i]);
        } else {
            if (i === 'script-tag' && json[i] === '<script>') {
                points++;
            }
            if (i === 'syntax' && json[i] == 4) {
                points++;
            }
            if (i === 'script-place' && json[i] === "<script src='xyz.js'>") {
                points++;
            }
            if (i === 'external-js-file' && json[i] === 'false') {
                points++;
            }
            if (i === 'number' && json[i] == 2) {
                points++;
            }
            if (i == 0 && json[i] === 'both') {
                points++;
            }
            if (i === 'list' && json[i] == 1) {
                points++;
            }
            if (i === 'sign' && json[i] == 3) {
                points++;
            }
            if (i === 'div' && json[i] == 1) {
                points++;
            }
            if (i === 'hide' && json[i] == 3) {
                points++;
            }
        }
    }
    return points;
}

// capitalize the first letter on names
// TODO: WHY cahrAt() function unresolved ??
function capitalizeName(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

document.addEventListener("DOMContentLoaded", function (event) {
    // save user credentials in webstorage/session
    // hide user credentials form
    // activate button "Start test"
    $('#send_personal_info').click(function (e) {
        e.preventDefault();
        fname = $('#user_form').serializeArray().reduce(function (obj, item) {
            obj[item.name] = item.value.toLowerCase().trim();
            return obj;
        }, {})['fname'];
        lname = $('#user_form').serializeArray().reduce(function (obj, item) {
            obj[item.name] = item.value.toLowerCase().trim();
            return obj;
        }, {})['lname'];

        if (fname === '' || lname === '') {
            return alert('Please, write your first and second names.');
        }

        fname = fname.charAt(0).toUpperCase() + fname.slice(1);
        lname = lname.charAt(0).toUpperCase() + lname.slice(1);
        // fname = capitalizeName(fname);
        // lname = capitalizeName(lname);

        if (typeof (Storage) !== 'undefined') {
            sessionStorage.setItem('Firstname', `${fname}`);
            sessionStorage.setItem('Lastname', `${lname}`);
        } else {
            alert('Cannot save your credentials. Your browser does not support any storage!');
        }
        $('#start-test').prop("disabled", false);
        $('#user_form').attr('style', 'display:none;');
    });
    let CLOCK;

    // Timer 10 min
    // Submit quiz form, if time ran out
    //Stop timer, if user done!
    function runTimer() {
        CLOCK = setInterval(function () {
            document.getElementById("timer").innerHTML = (sec < 10) ? '0' + minute + ":" + '0' + sec
                : '0' + minute + ":" + sec;
            if (sec != -1) {
                sec--;
            }
            if (minute == 0 && sec == -1) {
                document.getElementById("timer").innerHTML = '00:00';
                stopTimer(CLOCK);
            }
            if (sec == -1) {
                sec = 59;
                if (minute != 0) {
                    minute--;
                } else {
                    sec = -1;
                }
            }
        }, 1000);
    }

    function stopTimer() {
        document.getElementById("send_quiz").click();
        clearInterval(CLOCK);
    }

    function testDone() {
        clearInterval(CLOCK);
    }

    document.getElementById('start-test').addEventListener("click", runTimer);
    document.getElementById('send_quiz').addEventListener("click", testDone);
});
