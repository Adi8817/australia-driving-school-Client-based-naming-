/* ============================================================
   Buckle Up Busselton — interactions
   Pure vanilla JS (no dependencies)
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Mobile nav ---------- */
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');

  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // close menu when a link is tapped
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Booking form ---------- */
  var form = document.getElementById('bookingForm');
  if (!form) return;

  var TIME_SLOTS = [
    '7:30 AM – 8:30 AM',
    '9:00 AM – 10:00 AM',
    '10:30 AM – 11:30 AM',
    '12:00 PM – 1:00 PM',
    '1:30 PM – 2:30 PM',
    '3:30 PM – 4:30 PM',
    '5:00 PM – 6:00 PM'
  ];

  var dateInput   = document.getElementById('date');
  var timeInput   = document.getElementById('time');
  var transInput  = document.getElementById('transmission');
  var slotsWrap   = document.getElementById('slots');
  var transSeg    = document.getElementById('transSeg');
  var confirm     = document.getElementById('confirm');

  /* set min date = today */
  var today = new Date();
  var iso = today.toISOString().split('T')[0];
  if (dateInput) dateInput.setAttribute('min', iso);

  /* build time-slot buttons */
  TIME_SLOTS.forEach(function (label) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'slot';
    b.textContent = label;
    b.addEventListener('click', function () {
      slotsWrap.querySelectorAll('.slot').forEach(function (s) { s.classList.remove('active'); });
      b.classList.add('active');
      timeInput.value = label;
      clearError('time');
    });
    slotsWrap.appendChild(b);
  });

  /* transmission segmented control */
  if (transSeg) {
    transSeg.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        transSeg.querySelectorAll('button').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        transInput.value = b.getAttribute('data-val');
        clearError('transmission');
      });
    });
  }

  /* clear error styling on input */
  ['date', 'firstName', 'lastName', 'email', 'phone'].forEach(function (name) {
    var el = document.getElementById(name);
    if (el) el.addEventListener('input', function () { clearError(name); });
    if (el) el.addEventListener('change', function () { clearError(name); });
  });

  function fieldEl(name) { return form.querySelector('[data-field="' + name + '"]'); }
  function clearError(name) { var f = fieldEl(name); if (f) f.classList.remove('invalid'); }
  function setError(name) { var f = fieldEl(name); if (f) f.classList.add('invalid'); }

  function validate() {
    var ok = true;
    var v = getValues();
    var emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

    if (!v.date)               { setError('date'); ok = false; }
    if (!v.time)               { setError('time'); ok = false; }
    if (!v.transmission)       { setError('transmission'); ok = false; }
    if (!v.firstName)          { setError('firstName'); ok = false; }
    if (!v.lastName)           { setError('lastName'); ok = false; }
    if (!v.email || !emailRe.test(v.email)) { setError('email'); ok = false; }
    if (!v.phone)              { setError('phone'); ok = false; }

    return ok;
  }

  function getValues() {
    return {
      date: dateInput.value,
      time: timeInput.value,
      transmission: transInput.value,
      firstName: form.firstName.value.trim(),
      lastName: form.lastName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      pickup: form.pickup.value.trim(),
      details: form.details.value.trim()
    };
  }

  function formatDate(d) {
    if (!d) return '';
    try {
      var dt = new Date(d + 'T00:00:00');
      return dt.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) { return d; }
  }

  /* submit */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) {
      var firstBad = form.querySelector('.field.invalid');
      if (firstBad) {
        var top = firstBad.getBoundingClientRect().top + window.pageYOffset - 120;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
      return;
    }

    var v = getValues();
    var when = formatDate(v.date) + (v.time ? '  ·  ' + v.time : '');

    /* fill confirmation */
    document.getElementById('confirmName').textContent = 'Request received, ' + v.firstName + '!';
    document.getElementById('confirmWhen').textContent = when;
    document.getElementById('confirmType').textContent = v.transmission + ' lesson';

    /* build a mailto so the user can send a copy */
    var body =
      'Hi Jamieson,\n\n' +
      "I'd like to book a driving lesson.\n\n" +
      'Name: ' + v.firstName + ' ' + v.lastName + '\n' +
      'When: ' + when + '\n' +
      'Lesson: ' + v.transmission + '\n' +
      'Phone: ' + v.phone + '\n' +
      'Email: ' + v.email + '\n' +
      'Pickup: ' + (v.pickup || '-') + '\n' +
      'Details: ' + (v.details || '-') + '\n\n' +
      'Thanks!';
    var mailto = 'mailto:buckleupbusso@gmail.com' +
      '?subject=' + encodeURIComponent('Lesson booking request — ' + v.firstName + ' ' + v.lastName) +
      '&body=' + encodeURIComponent(body);
    document.getElementById('emailCopy').setAttribute('href', mailto);

    /* swap form -> confirmation */
    form.style.display = 'none';
    confirm.classList.add('show');
  });

  /* reset / make another booking */
  var resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      form.reset();
      timeInput.value = '';
      transInput.value = '';
      slotsWrap.querySelectorAll('.slot').forEach(function (s) { s.classList.remove('active'); });
      transSeg.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
      form.querySelectorAll('.field.invalid').forEach(function (f) { f.classList.remove('invalid'); });
      confirm.classList.remove('show');
      form.style.display = '';
    });
  }
})();
