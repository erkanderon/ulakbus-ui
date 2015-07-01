/**
 * Copyright (C) 2015 ZetaOps Inc.
 *
 * This file is licensed under the GNU General Public License v3
 * (GPLv3).  See LICENSE.txt for details.
 */

'use strict';

// TODO: fill up the test cases correctly

describe('zaerp.auth module', function () {

    // load dependencies of modules e.g REST_URL
    beforeEach(module('zaerp'));
    beforeEach(module('zaerp.auth'));

    describe('login controller and service', function () {

        it('should have a login controller', inject(function () {
            expect('zaerp.auth.LoginCtrl').toBeDefined();
        }));

        it('should validate email', inject(['LoginService',
                function (LoginService) {
                    expect(LoginService.isValidEmail).not.toBe(null);

                    // test cases - testing for success
                    var validEmails = [
                        'test@test.com',
                        'test@test.co.uk',
                        'test734ltylytkliytkryety9ef@jb-fe.com'
                    ];

                    // test cases - testing for failure
                    var invalidEmails = [
                        'test@testcom',
                        'test@ test.co.uk',
                        'ghgf@fe.com.co.',
                        'tes@t@test.com',
                        ''
                    ];

                    // you can loop through arrays of test cases like this
                    for (var i in validEmails) {
                        var valid = LoginService.isValidEmail(validEmails[i]);
                        expect(valid).toBeTruthy();
                    }
                    for (var i in invalidEmails) {
                        var valid = LoginService.isValidEmail(invalidEmails[i]);
                        expect(valid).toBeFalsy();
                    }

                }])
        );

        it('ensures user can log in', function() {
            // expect current scope to contain username
        });
        it('ensures path has changed', function() {
            // expect path to equal '/dashboard'
        });

        it('should get login success',
            inject(function(LoginService, $httpBackend) {

                $httpBackend.expectGET('http://127.0.0.1:8000/login?email=test@test.com&password=password&')
                    .respond(204, {'id': 1, 'user': {'id': 12, 'role': 'admin'}});

                var cred = {email: 'test@test.com', password: 'password'};
                LoginService.login(cred)
                    .then(function(data) {
                        expect(data).not.toBe(null);
                    });

                $httpBackend.flush();
            })
        );

    });
});