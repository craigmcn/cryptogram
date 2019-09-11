(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var startCryptogram = document.getElementById('start-cryptogram'),
    enterCryptogram = document.getElementById('enter-cryptogram'),
    cryptogramText = document.getElementById('cryptogram-text'),
    cryptogramSolution = document.getElementById('cryptogram-solution'),
    alphabet = document.getElementById('alpha'),
    actionButtons = document.getElementById('action-buttons'),
    editButton = document.getElementById('edit-button'),
    clearButton = document.getElementById('clear-button'),
    newButton = document.getElementById('new-button');
enterCryptogram.addEventListener('submit', function (e) {
  e.preventDefault();
  if (cryptogramText.value) initCryptogram();
});
editButton.addEventListener('click', function (e) {
  show(startCryptogram);
  hide(alphabet);
  hide(actionButtons);
  empty(cryptogramSolution);
  e.target.blur();
});
newButton.addEventListener('click', function (e) {
  empty(cryptogramSolution);
  cryptogramText.value = '';
  show(startCryptogram);
  hide(alphabet);
  hide(actionButtons);
  e.target.blur();
});
clearButton.addEventListener('click', function (e) {
  initCryptogram();
  e.target.blur();
});

var initCryptogram = function initCryptogram() {
  empty(cryptogramSolution);
  hide(startCryptogram);
  show(actionButtons);
  show(alphabet, 'flex');
  alphabet.querySelectorAll('.alpha__letter').forEach(function (l) {
    l.classList.remove('used', 'error');
    l.dataset.count = 0;
  });
  var text = cryptogramText.value.toUpperCase().split(' ');
  var crypto = text.map(function (t) {
    var letters = t.split('').map(function (l) {
      var input = l.match(/[A-Z]/) ? "<input class=\"solution__input\" type=\"text\" maxlength=\"2\" data-puzzle=\"".concat(l, "\">") : l;
      return "<div class=\"flex flex--column\"><div class=\"solution__item flex flex--ai-end flex--jc-center\">".concat(input, "</div><div class=\"solution__puzzle\">").concat(l, "</div></div>");
    });
    return "<div class=\"flex flex__contained\">".concat(letters.join(''), "</div>");
  });
  cryptogramSolution.classList.remove('solution--complete');
  cryptogramSolution.innerHTML = crypto.join('');
  var inputs = cryptogramSolution.querySelectorAll('.solution__input');
  inputs.forEach(function (i) {
    i.addEventListener('input', function (e) {
      var value = e.target.value.slice(-1).toUpperCase();
      var puzzle = e.target.dataset.puzzle;
      var oldValue = e.target.dataset.oldValue;

      if (value && (value === puzzle || !value.match(/[A-Z]/))) {
        e.target.value = '';
        return false;
      }

      e.target.value = value;
      inputs.forEach(function (i) {
        if (i.dataset.puzzle === puzzle) {
          i.value = value;
          i.dataset.oldValue = value;
        }
      });
      var alphaLetter;
      console.log();

      if (value && value != oldValue) {
        alphaLetter = alphabet.querySelector("[data-letter=\"".concat(value, "\"]"));
        alphaLetter.dataset.count = parseInt(alphaLetter.dataset.count) + 1;

        if (parseInt(alphaLetter.dataset.count) > 1) {
          alphaLetter.classList.add('error');
        } else {
          alphaLetter.classList.add('used');
        }

        if (oldValue) {
          alphaLetter = alphabet.querySelector("[data-letter=\"".concat(oldValue, "\"]"));
          alphaLetter.dataset.count = parseInt(alphaLetter.dataset.count) - 1;

          if (parseInt(alphaLetter.dataset.count) === 1) {
            alphaLetter.classList.remove('error');
          } else if (parseInt(alphaLetter.dataset.count) === 0) {
            alphaLetter.classList.remove('used');
          }
        }
      } else if (!value && oldValue) {
        alphaLetter = alphabet.querySelector("[data-letter=\"".concat(oldValue, "\"]"));
        alphaLetter.dataset.count = parseInt(alphaLetter.dataset.count) - 1;

        if (parseInt(alphaLetter.dataset.count) === 1) {
          alphaLetter.classList.remove('error');
        } else if (parseInt(alphaLetter.dataset.count) === 0) {
          alphaLetter.classList.remove('used');
        }
      }

      e.target.dataset.oldValue = value;
      var complete = true;
      inputs.forEach(function (i) {
        if (!i.value && complete) {
          complete = false;
        }
      });
      cryptogramSolution.classList.toggle('solution--complete', complete);
    });
    i.addEventListener('focus', function (e) {
      inputs.forEach(function (i) {
        if (i.dataset.puzzle === e.target.dataset.puzzle) {
          i.classList.add('active');
        }
      });
    });
    i.addEventListener('blur', function (e) {
      inputs.forEach(function (i) {
        if (i.dataset.puzzle === e.target.dataset.puzzle) {
          i.classList.remove('active');
        }
      });
    });
  });
};

var show = function show(el) {
  var display = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'block';
  el.style.display = display;
};

var hide = function hide(el) {
  el.style.display = 'none';
};

var empty = function empty(el) {
  el.innerHTML = '';
};
},{}]},{},[1]);
