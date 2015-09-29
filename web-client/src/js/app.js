/**
* @author Valentin Agafonov <agafonov@sirena2000.ru>
* @name Meteo web-client
* @purpose Nice application for home meteostation
*/

/*jslint browser: true, nomen: true */
/*global require, module, console, $, _, Promise, moment, Ractive*/

window.Ractive = require('ractive');
window._ = require('underscore');
window.$ = require('zepto-browserify').$;
window.moment = require('moment');

var template = require('./templates/main.html');


(function (window) {
    
    'use strict';
            
    $(function () {
        
        $('body').css('background', 'url(../img/wallpapers/autumn' + (Math.round(Math.random() * 4) + 1) + '.jpg) no-repeat center center');

        
        
        var todayStr = moment().format('DD-MM-YYYY'),
            yesterdayStr = moment().subtract(1, 'days').format('DD-MM-YYYY'),
            scale = {
                x: function (i) {
                    return i * 3.5 + 2;
                },
                yTemp: function (t) {
                    return 40 - t;
                },
                yHumidity: function (h) {
                    return 80 - 0.8 * h;
                },
                yPressure: function (p) {
                    return 40 - (p - 750) * 2;
                }
            };
        
        $.getJSON('./storage/' + todayStr + '.json', function (todayData) {
            $.getJSON('./storage/' + yesterdayStr + '.json', function (yesterdayData) {
                
                var records = _.last(yesterdayData.records.concat(todayData.records), 48),
                    current = _.last(yesterdayData.records.concat(todayData.records)),
                    max = {
                        t: (_.max(records, function (rec) {
                            return rec.t;
                        })).t,
                        h: (_.max(records, function (rec) {
                            return rec.h;
                        })).h,
                        p: (_.max(records, function (rec) {
                            return rec.p;
                        })).p
                    },
                    min = {
                        t: (_.min(records, function (rec) {
                            return rec.t;
                        })).t,
                        h: (_.min(records, function (rec) {
                            return rec.h;
                        })).h,
                        p: (_.min(records, function (rec) {
                            return rec.p;
                        })).p
                    },
                    mainRactive = new Ractive({
                        el: 'app',
                        data: {
                            records: records,
                            current: current,
                            max: max,
                            min: min,
                            scale: scale
                        },
                        template: template
                    });
                
                _.each(records, function (rec, i) {
                    console.log(i, moment(rec.u, 'X').format('DD-MM-YYYY HH:mm'));
                });
                
            });
        });
        

    });

}(window));

