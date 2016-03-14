/**
 * @license Ulakbus-UI
 * Copyright (C) 2015 ZetaOps Inc.
 *
 * This file is licensed under the GNU General Public License v3
 * (GPLv3).  See LICENSE.txt for details.
 */

"use strict";

angular.module('ulakbus.auth')
    /**
     * @memberof ulakbus.auth
     * @ngdoc service
     * @name AuthService
     * @description  provides generic functions for authorization process.
     */
    .factory('AuthService', function ($http, $rootScope, $location, $log, $route, Generator, RESTURL, WSOps) {
        var authService = {};

        authService.get_form = function (scope) {
            return $http
                .post(Generator.makeUrl(scope), scope.form_params)
                .then(function (res) {
                    return Generator.generate(scope, res.data);
                });
        };

        /**
         * @memberof ulakbus.auth
         * @ngdoc function
         * @function login
         * @description login function post credentials to API and handles login.
         * If login req returns success then interceptor will redirects to related path.
         *
         * @param url
         * @param credentials
         * @returns {*}
         */
        authService.login = function (url, credentials) {
            credentials['cmd'] = "do";
            return $http
                .post(RESTURL.url + url, credentials)
                .success(function (data, status, headers, config) {
                    //$window.sessionStorage.token = data.token;
                    Generator.button_switch(true);
                    if (data.status_code !== 403) {
                        $rootScope.loggedInUser = true;
                        $rootScope.$broadcast("regenerate_menu");
                        $location.path('/dashboard');
                    }
                    if (data.status_code === 403) {
                        data.title = "İşlem başarısız oldu. Lütfen girdiğiniz bilgileri kontrol ediniz.";
                        return data;
                    }
                })
                .error(function (data, status, headers, config) {
                    // Handle login errors here
                    data.title = "İşlem başarısız oldu. Lütfen girdiğiniz bilgileri kontrol ediniz.";
                    return data;
                });
        };

        /**
         * @memberof ulakbus.auth
         * @ngdoc controller
         * @function logout
         * @description logout function posts logout request to API and redirects to login path
         *
         * @returns {*}
         */
        authService.logout = function () {

            $rootScope.loginAttempt = 0;
            WSOps.request({wf: 'logout'}).then(function (data) {
                $rootScope.loggedInUser = false;
                $log.debug("loggedout");
                $location.path("/login");
                WSOps.close();
            });
        };

        return authService;
    });