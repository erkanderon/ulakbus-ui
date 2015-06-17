/**
 * Copyright (C) 2015 ZetaOps Inc.
 *
 * This file is licensed under the GNU General Public License v3
 * (GPLv3).  See LICENSE.txt for details.
 */

'use strict';

/**
 * student module is base module object for student operations
 */

var student = angular.module('zaerp.student.add', ['ngRoute', 'schemaForm', 'formService']);

/**
 * StudentAddCtrl
 * to add student, provide form with form generator
 */

student.controller('StudentAddCtrl', function($scope, $http, $timeout, $log, $routeParams, Generator){
    $scope.schema = Generator.get_form('add_student', $routeParams);
    $log.info($scope.schema);
});