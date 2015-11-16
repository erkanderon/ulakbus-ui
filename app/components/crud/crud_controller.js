/**
 * Copyright (C) 2015 ZetaOps Inc.
 *
 * This file is licensed under the GNU General Public License v3
 * (GPLv3).  See LICENSE.txt for details.
 */

'use strict';

var crud = angular.module('ulakbus.crud', ['ui.bootstrap', 'schemaForm', 'formService']);

/**
 *
 */
crud.service('CrudUtility', function () {
    return {
        generateParam: function (scope, routeParams) {
            // define api request url path
            scope.url = routeParams.wf;
            angular.forEach(routeParams, function (value, key) {
                if (key.indexOf('_id') > -1) {
                    scope.param = key;
                    scope.param_id = value;
                }
            });
            scope.form_params = {
                model: routeParams.model,
                param: scope.param,
                id: scope.param_id,
                wf: routeParams.wf,
                object_id: routeParams.key
            };
            return scope;
        },
        listPageItems: function (scope, pageData) {
            angular.forEach(['objects', 'model', 'addLink'], function (value, key) {
                scope[value] = pageData[value];
            });
        }
    }
});

/**
 *
 */
crud.controller('CRUDCtrl', function ($scope, $routeParams, Generator, CrudUtility) {
    CrudUtility.generateParam($scope, $routeParams);
    Generator.get_wf($scope);
});

/**
 * CRUDAddEditCtrl is a controller
 * which provide a form with form generator.
 */

crud.controller('CRUDAddEditCtrl', function ($scope, $rootScope, $location, $http, $log, $modal, $timeout, Generator, $routeParams, CrudUtility) {
    CrudUtility.generateParam($scope, $routeParams);

    $scope.form_params['cmd'] = 'form';

    // get form with generator
    if ($routeParams.pageData) {
        console.log(Generator.getPageData());
        Generator.generate($scope, Generator.getPageData());
    } else {
        Generator.get_form($scope);
    }

    $scope.onSubmit = function (form) {
        $scope.$broadcast('schemaFormValidate');
        if (form.$valid) {
            Generator.submit($scope);
        }
    };

});

/**
 * CRUD List Controller
 */

crud.controller('CRUDListCtrl', function ($scope, $rootScope, Generator, $routeParams, CrudUtility) {
    CrudUtility.generateParam($scope, $routeParams);
    $scope.form_params['cmd'] = 'list';

    if ($routeParams.pageData) {
        var pageData = Generator.getPageData();
        CrudUtility.listPageItems($scope, pageData);
    }
    else {
        // call generator's get_list func
        Generator.get_list($scope)
            .then(function (res) {
                CrudUtility.listPageItems($scope, res.Data);
            });
    }
});

/**
 * CRUD Show Controller
 */
crud.controller('CRUDShowCtrl', function ($scope, $rootScope, $location, Generator, $routeParams, CrudUtility) {
    CrudUtility.generateParam($scope, $routeParams);
    $scope.form_params['cmd'] = 'show';
    // call generator's get_single_item func
    Generator.get_single_item($scope).then(function (res) {
        $scope.listobjects = {};
        $scope.object = res.data.object;

        angular.forEach($scope.object, function (value, key) {
            if (typeof value == 'object') {
                $scope.listobjects[key] = value;
                delete $scope.object[key];
            }
        });

        $scope.model = $routeParams.model;
    });
});