'use strict';

describe('ValidationService Tests', function() {

  var $rootScope, $compile, $window, $filter, moment, amTimeAgoConfig, originalTimeAgoConfig, angularMomentConfig,
    originalAngularMomentConfig, amMoment;

  // var mockScope =  {
  //   markers: {
  //     validate:{
  //         PhoneUA:{
  //             aField_ID:['privatePhone','workPhone', 'phone', 'tel']
  //         }, Mail:{
  //             aField_ID:['privateMail','email']
  //         }, AutoVIN:{
  //             aField_ID:['vin_code', 'vin_code1', 'vin']
  //         }, TextUA: { 
  //           aField_ID: ['bankIdaddress']
  //         }, TextRU: {
  //           aField_ID: []
  //         }, DateFormat: {
  //           aField_ID: ['bankIdaddress'],
  //           sFormat: 'YYYY-MM-DD' //
  //         }, DateElapsed: {
  //           aField_ID: ['dateOrder'],
  //           bFuture: false, //если true то дата должна быть в будущем
  //           bLess: true, //если true то 'дельта' между датами должна быть 'менее чем' (указана нижними параметрами)
  //           nDays: 3,
  //           nMonths: 0,
  //           nYears: 1
  //         }
  //     }
  //   }
  // };

  beforeEach(function() {
    module('app');
    module('angularMoment');
  });

  var validationService;
  // var angularMoment;

  beforeEach(inject(function($injector) {
    validationService = $injector.get('ValidationService');

    $rootScope = $injector.get('$rootScope');
    $compile = $injector.get('$compile');
    $window = $injector.get('$window');
    $filter = $injector.get('$filter');
    moment = $injector.get('moment');
    amMoment = $injector.get('amMoment');
    amTimeAgoConfig = $injector.get('amTimeAgoConfig');
    angularMomentConfig = $injector.get('angularMomentConfig');
    originalTimeAgoConfig = angular.copy(amTimeAgoConfig);
    originalAngularMomentConfig = angular.copy(angularMomentConfig);

    // Ensure the locale of moment.js is set to en by default
    // (moment.locale || moment.lang)('uk');
    // Add a sample timezones for tests
    // moment.tz.add('UTC|UTC|0|0|');
    // moment.tz.add('Pacific/Tahiti|LMT TAHT|9W.g a0|01|-2joe1.I');

    //console.log('angularMomentConfig = ', angularMomentConfig );
  }));

  // describe('ValidationService', function(){

  it('Should be defined: ValidationService and Moment', function() {
    // ValidationService.validateByMarkers( form, mockScope.markers );
    expect(validationService).toBeDefined();
  });

  it('Mail validation:', function() {

    var self = this;

    this.validatorByName = {
      'Mail': 'email',
      'AutoVIN': 'autovin',
      'PhoneUA': 'tel',
      'TextUA': 'textua',
      'TextRU': 'textru',
      'DateFormat': 'dateformat',
      'DateElapsed': 'dateelapsed'
    };

    //field.$validators[fieldByName] = self.getValidatorByName(validatorName, field);

    var isDebugMode = true;

    function doValidate(validatorName, value, toBeOrNotToBe, options) {
      var fValidator = validationService.getValidatorByName(validatorName);
      var fValidatorCall;
      if (typeof fValidator === 'function') {
        if (isDebugMode) {
          var isValid = prevalidate(validatorName, value, toBeOrNotToBe, options);
          var sValid = isValid ? colr(' is valid.', 'green') : colr(' is invalid', 'red');
          var sExpectedValid = toBeOrNotToBe ? colr('to be valid.', 'green') : colr('to be invalid', 'red');
          var validationFail = isValid === toBeOrNotToBe ? colr(' - validator OK', 'green') : colr(' - validatir FAILED FAILED FAILED', 'red');
            //, (options ? options : ''),
          console.log('' + validatorName + ', value of ' + value + sValid + ' - ' + sExpectedValid + validationFail );
        } else {
          fValidatorCall = fValidator.call(this, value, options);
          expect(fValidatorCall).toBe(toBeOrNotToBe);
        }
      }
    }

    function prevalidate(validatorName, value, toBeOrNotToBe, options) {
      var fValidator = validationService.getValidatorByName(validatorName);
      var result = null;
      if (typeof fValidator === 'function') {
        result = fValidator.call(self, value, options);
      }
      return result;
    }

    function validateArray(arrayToValidate, validatorName, toBeOrNotToBe, options) {
      var cl = colr(toBeOrNotToBe, toBeOrNotToBe ? 'green' : 'red');

      console.log(colr('\n=== Array Validation by ' + validatorName + ' validator' + ' to be ' + cl + ':', 'white'));

      for (var value in arrayToValidate) {

        doValidate(validatorName, arrayToValidate[value], toBeOrNotToBe, options);

      }
    }

    // Validate Emails:

    var emailRight = ['hello@email.org', 'a12@email.org'];
    var emailWrong = ['hello@email', '@email.org', 'asfasail.org', 'a', ''];

    // Validate Ukrainian Texts:

    var textUASamplesRight = [
      'Їжак чує грім',
      'ААБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯабвгґдеєжзиіїйклмнопрстуфхцчшщьюя'
    ];

    var textUASamplesWrong = [
      'Ёжик слышит гром',
      'ЁёЪъЫыЭэ',
      'P.S. Вже написавши цей комент, я зрозумів, що Сергій уже йде.'
    ];

    // Validate Russian Texts:

    var textRUSamplesRight = [
      'Ёжик слышит гром, но не боится',
      'АаБбВвГгДдЕеЁёЖжЗзИиЙйКкЛлМмНнОоПпРрСсТтУуФфХхЦцЧчШшЩщЪъЫыЬьЭэЮюЯя'
    ];

    var textRUSamplesWrong = [
      'Ёжик Їжак',
      'ЄЁ', // FIXME
      'Їжак чує грім',
      'ҐЄІЇґєії'
    ];

    // Validate Dates:

    var datesRight = [
      '2015-08-12',
      '2015-1-1'
    ];

    var datesWrong = [
      '0-2015',
      '-1-2015',
      'August 11 2015',
      '11 Aug 2015'
    ];

    // Validate Date Elapsed:

    // validateArray( emailRight, 'Mail', true );
    // validateArray( emailWrong, 'Mail', false );
    // validateArray( textUASamplesRight, 'TextUA', true );
    // validateArray( textUASamplesWrong, 'TextUA', false );
    // validateArray( textRUSamplesRight, 'TextRU', true );
    // validateArray( textRUSamplesWrong, 'TextRU', false );

    // validateArray( datesRight, 'DateFormat', true, { sFormat: 'DD-MM-YYYY' } );
    // validateArray( datesWrong, 'DateFormat', false, { sFormat:'DD-MM-YYYY' } );

    //  function doValidate( validatorName, value, toBeOrNotToBe, options ) {
    //  Параметри:
    // *  bFuture: false  - якщо true, то дата modelValue має бути у майбутньому
    // *  bLess: true     - якщо true, то diff між modelValue та now  має бути 'менше ніж' вказано у нижніх параметрах:
    // *  nDays: 3
    // *  nMonths: 0
    // *  nYears: 1
    var now = moment();
    var oneDayAfter = moment().add(1, 'd');
    var weekAfter = moment().add(1, 'w');
    var monthAfter = moment().add(1, 'M');
    var yearAfter = moment().add(1, 'y');

    var oneDayBefore = moment().subtract(1, 'd');
    var weekBefore = moment().subtract(1, 'w');
    var monthBefore = moment().subtract(1, 'M');
    var yearBefore = moment().subtract(1, 'y');

    function m(mValue) {
      return mValue.format('YYYY-MM-DD');
    }

    // Дата має бути у майбутньому, а ця - рік тому: 
    doValidate('DateElapsed', m(yearBefore), false, {
      bFuture: true
    });

    // Дата має бути у майбутньому, а ця - учора: 
    doValidate('DateElapsed', m(oneDayBefore), false, {
      bFuture: true
    });

    // Дата має бути у майбутньому, а ця - сьогодні: 
    doValidate('DateElapsed', m(now), false, {
      bFuture: true
    });

    // Дата має бути у майбутньому, і ця - післязавтра: 
    doValidate('DateElapsed', m(oneDayAfter.add(1, 'd')), true, {
      bFuture: true
    });

    // Дата має бути у майбутньому, і ця - на місяць уперед: 
    doValidate('DateElapsed', m(monthAfter), true, {
      bFuture: true
    });

    console.log( colr( 'BLESS BLESS BLESS', 'blue') );

    // bLess:
    
    // Дата має бути у майбутньому, різниця - менш ніж 1 день.
    // monthAfter - на місяць уперед: 
    doValidate('DateElapsed', m(monthAfter), false, {
      bFuture: true,
      bLess: true,
      nDays: 1,
      nMonths: 0,
      nYears: 0
    });

    console.log( colr( 'BFUTURE = FALSE = BFUTURE = FALSE = BFUTURE = FALSE', 'blue') );

    // минуле:

    // Дата не має бути у майбутньому, а ця - рік тому: 
    doValidate('DateElapsed', m(yearBefore), true, {
      bFuture: false
    });

    // Дата не має бути у майбутньому, а ця - учора: 
    doValidate('DateElapsed', m(oneDayBefore), true, {
      bFuture: false
    });

    // Дата не має бути у майбутньому, а ця - сьогодні: 
    doValidate('DateElapsed', m(now), true, {
      bFuture: false
    });

    // Дата не має бути у майбутньому, і ця - післязавтра: 
    doValidate('DateElapsed', m(oneDayAfter.add(1, 'd')), false, {
      bFuture: false
    });

    // Дата не має бути у майбутньому, і ця - на місяць уперед: 
    doValidate('DateElapsed', m(monthAfter), false, {
      bFuture: false
    });

    console.log( colr( 'BFUTURE = FALSE - BLESS = TRUE', 'blue') );

    // Дата має бути у минулому, різниця - менш ніж 1 день.
    // Дана monthAfter - на місяць уперед, помилкова:
    doValidate('DateElapsed', m(monthAfter), false, {
      bFuture: false,
      bLess: true,
      nDays: 1,
      nMonths: 0,
      nYears: 0
    });

    // Від сьогодні до 19-08 має пройти менше, ніж 0 днів.
    // validate( 'DateElapsed',
    //           '19-08-2015',
    //           true,
    //           {
    //             bFuture: true,
    //             bLess: true, 
    //             nDays: 0, 
    //             nMonths: 0, 
    //             nYears: 0
    //           });

    // validate( 'DateElapsed', 
    //           '20-08-2015', 
    //           false, 
    //           { 
    //             bFuture: true,
    //             bLess: false, 
    //             nDays: 10, 
    //             nMonths: 0, 
    //             nYears: 0
    //           });

    // validate( 'DateElapsed', '17-08-2015', false, { bFuture: false, bLess: true, nDays: 0, nMonths: 0, nYears: 0 } );
    // validateArray( eDatesRight, 'DateElapsed', true, false, false, 1, 0, 0 );
    // validateArray( eDatesRight, 'DateElapsed', true, true, false, 1, 0, 0 );
    // validateArray( eDatesRight, 'DateElapsed', true, true, true, 1, 0, 0 );

    /* Uncomment to check moment pluralizations 
    console.log ( colr( validationService.pluralize( 0, 'days' ), 'green' )); 
    console.log ( colr( validationService.pluralize( 1, 'days' ), 'green' )); // день
    console.log ( colr( validationService.pluralize( 4, 'days' ), 'green' )); // дні
    console.log ( colr( validationService.pluralize( 5, 'days' ), 'green' )); // днів
    console.log ( colr( validationService.pluralize( 0, 'months' ), 'green' )); 
    console.log ( colr( validationService.pluralize( 1, 'months' ), 'green' )); // день
    console.log ( colr( validationService.pluralize( 4, 'months' ), 'green' )); // дні
    console.log ( colr( validationService.pluralize( 5, 'months' ), 'green' )); // днів
    console.log ( colr( validationService.pluralize( 0, 'years' ), 'green' )); 
    console.log ( colr( validationService.pluralize( 1, 'years' ), 'green' )); // день
    console.log ( colr( validationService.pluralize( 4, 'years' ), 'green' )); // дні
    console.log ( colr( validationService.pluralize( 5, 'years' ), 'green' )); // днів

    console.log ( colr( 'validationService.fromDateToDate', 'white' )); 

    console.log ( colr( validationService.fromDateToDate( '12-08-2015', '12-08-2015' ), 'green' )); 
    console.log ( colr( validationService.fromDateToDate( '12-08-2015', '13-08-2015' ), 'green' )); 
    console.log ( colr( validationService.fromDateToDate( '12-08-2015', '14-08-2015' ), 'green' )); 
    console.log ( colr( validationService.fromDateToDate( '12-08-2015', '15-08-2015' ), 'green' )); 
    console.log ( colr( validationService.fromDateToDate( '12-08-2015', '16-08-2015' ), 'green' )); 
    console.log ( colr( validationService.fromDateToDate( '12-08-2015', '17-08-2015' ), 'green' )); 
    console.log ( colr( validationService.fromDateToDate( '12-08-2015', '18-08-2015' ), 'green' )); 
    console.log ( colr( validationService.fromDateToDate( '12-08-2015', '18-09-2015' ), 'green' )); 
    console.log ( colr( validationService.fromDateToDate( '12-08-2015', '18-09-2016' ), 'green' )); 
    console.log ( colr( validationService.fromDateToDate( '12-08-2015', '18-09-2026' ), 'green' )); */

    function colr(msg, sColor) {
      var colrs = {
        reset: '\u001B[0m',
        black: '\u001B[30m',
        red: '\u001B[31m', //\u001b[31;1m
        green: '\u001B[32m',
        yellow: '\u001B[33m',
        blue: '\u001B[34m',
        purple: '\u001B[35m',
        cyan: '\u001B[36m',
        white: '\u001B[37m'
      };
      var pattrn = colrs[sColor] + '\u001b{TEXT}\u001b[0m';
      return pattrn.replace('{TEXT}', msg);
    }

  });

  // });
});