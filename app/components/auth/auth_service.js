/**
 * Copyright (C) 2015 ZetaOps Inc.
 *
 * This file is licensed under the GNU General Public License v3
 * (GPLv3).  See LICENSE.txt for details.
 */

"use strict";

// TODO: login url change with correct one

auth.factory('LoginService', function ($http, $rootScope, $location, $log, $cookies, Session, RESTURL) {
    var loginService = {};

    loginService.login = function (credentials) {
        // TODO: change this getParams var to service to use app-wide
        var getParams = "?";
        for (var k in credentials){
            getParams += k+"="+credentials[k]+"&";
        }
        return $http
            .get(RESTURL.url + 'login' + getParams)
            .then(function (res) {
                $log.info(res.data[0]);
                res.data = res.data[0];
                if (res.data.success){
                    $rootScope.loggedInUser = true;
                    $location.path("/dashboard");
                    var session = Session.create(res.data.id, res.data.user.id,
                        res.data.user.role);
                    $log.info(session);
                    $cookies.put('sessionId', 123456);
                    console.log($cookies.getAll());
                    return res.data.user;
                }
            });
    };

    loginService.isAuthenticated = function () {
        return !!Session.userId;
    };

    loginService.isAuthorized = function (authorizedRoles) {
        if (!angular.isArray(authorizedRoles)) {
            authorizedRoles = [authorizedRoles];
        }
        return (loginService.isAuthenticated() &&
        loginService.indexOf(Session.userRole) !== -1);
    };

    loginService.isValidEmail = function(email){
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return re.test(email);
    };

    return loginService;
});

// TODO: initial service not working!!

auth.service('Session', function () {
    this.create = function (sessionId, userId, userRole) {
        this.id = sessionId;
        this.userId = userId;
        this.userRole = userRole;
    };
    this.destroy = function () {
        this.id = null;
        this.userId = null;
        this.userRole = null;
    };
});