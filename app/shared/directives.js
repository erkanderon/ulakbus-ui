/**
 * @license Ulakbus-UI
 * Copyright (C) 2015 ZetaOps Inc.
 *
 * This file is licensed under the GNU General Public License v3
 * (GPLv3).  See LICENSE.txt for details.
 */

angular.module('ulakbus')
    /**
     * @memberof ulakbus
     * @ngdoc directive
     * @name logout
     * @description logout directive provides a button with click event. When triggered it post to
     * '/logout' path of the API.
     */
    .directive('logout', function ($http, $location, RESTURL, AuthService) {
        return {
            link: function ($scope, $element, $rootScope) {
                $element.on('click', function () {
                    AuthService.logout();
                    //$http.post(RESTURL.url + 'logout', {}).then(function () {
                    //    $rootScope.loggedInUser = false;
                    //    $location.path("/login");
                    //});
                });
            }
        };
    })
    /**
     * @memberof ulakbus
     * @ngdoc directive
     * @name headerNotification
     * @description This directive is responsible to get and show notification.
     * It calls API's /notify path with given interval and broadcasts `notifications` application-wide.
     * There are 4 types of notifications:
     * 1: tasks, 2: messages, 3: announcements, 4: recents
     * - Notifications can be disabled in /dev/settings page
     */
    .directive('headerNotification', function (WSOps, $rootScope, $cookies, $interval, RESTURL, $uibModal) {
        return {
            templateUrl: 'shared/templates/directives/header-notification.html',
            restrict: 'E',
            replace: true,
            scope: {},
            controller: function ($scope, $log) {
                // notification categories:
                // 1: tasks, 2: messages, 3: announcements, 4: recents
                $scope.notifications = {1: [], 2: [], 3: [], 4: []};
                /**
                 * Group notifications
                 * @param notifications
                 */
                
                $scope.popModal = function(item){
                     var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'shared/templates/notificationsModalContent.html',
                        controller: function($scope){
                            $scope.notification = item;
                            $scope.cancel = function() {
                                modalInstance.dismiss('cancel');
                            };
                        },
                        size: 'lg'
                    });
                }

                $scope.groupNotifications = function (notifications) {

                    $scope.notifications = {1: [], 2: [], 3: [], 4: []};

                    angular.forEach(notifications, function (value, key) {
                        $scope.notifications[value.type].push(value);
                    });
                    $scope.$apply();
                };

                /**
                 * When "notifications" send via websocket, parse notifications by type.
                 */
                $scope.$on("notifications", function (event, data) {
                    $log.debug("Notification!", data);
                    $scope.groupNotifications(data);
                });

                /**
                 * When clicked mark the notification as read.
                 * @param items
                 * @todo: do it in detail page of notification
                 */
                $scope.markAsRead = function (event,item, group, index) {
                    //Added event parameter to stop propagate, so that behaviour of outsideClick won't be interrupted.
                    event.stopPropagation();
                    WSOps.doSend(angular.toJson({data: {view: 'notify', id:item.id}}));
                    $scope.notifications[group].splice(index,1);

                    $event.preventDefault();
                    $event.stopPropagation();
                    return false;
                };

                // if markasread triggered outside the directive
                // $scope.$on("markasread", function (event, data) {
                //     $scope.markAsRead(data);
                // });
            }
        };
    })
    /**
     * @memberof ulakbus
     * @ngdoc directive
     * @name searchDirective
     * @description This directive provides reusable search form application-wide.
     * When search form submitted and response returns, it broadcasts the result with key `updateObjects`.
     */
    .directive('searchDirective', function (Generator, $log, $rootScope) {
        return {
            templateUrl: 'shared/templates/directives/search.html',
            restrict: 'E',
            replace: true,
            link: function ($scope) {
                $scope.searchForm = [{key: 'searchbox', htmlClass: "pull-left"}, {
                    type: "submit",
                    title: "Ara",
                    style: "btn-info",
                    htmlClass: "pull-left"
                }];
                $scope.searchSchema = {
                    type: "object",
                    properties: {
                        searchbox: {
                            type: "string",
                            minLength: 2,
                            title: "Ara",
                            "x-schema-form": {placeholder: "Arama kriteri giriniz..."}
                        }
                    },
                    required: []
                };
                $scope.searchModel = {searchbox: ''};

                $scope.searchSubmit = function (form) {
                    $scope.$broadcast('schemaFormValidate');
                    if (form.$valid) {
                        var searchparams = {
                            token: $scope.$parent.token,
                            object_id: $scope.$parent.object_id,
                            form_params: {
                                wf: $scope.$parent.wf,
                                model: $scope.$parent.form_params.model,
                                cmd: $scope.$parent.reload_cmd,
                                flow: $scope.$parent.form_params.flow,
                                query: $scope.searchModel.searchbox
                            }
                        };

                        Generator.submit(searchparams);
                    }
                };
            }
        };
    })
    /**
     * @memberof ulakbus
     * @ngdoc directive
     * @name sortDirective
     * @description Sort directive is responsible to post sorting params to API and process the response to the screen.
     * @todo test and implement when backend ready
     */
    .directive('sortDirective', function (Generator, $log) {
        return {
            templateUrl: 'shared/templates/directives/sort.html',
            restrict: 'E',
            replace: true,
            link: function ($scope) {

                // titleMap will be list
                $scope.titleMap = [{value: "artan", name: "Artan"}, {value: "azalan", name: "Azalan"}];
                $scope.sortForm = [
                    {key: 'sortbox', htmlClass: "pull-left", type: "select", titleMap: $scope.titleMap},
                    {type: "submit", title: "Sırala", htmlClass: "pull-left"}];
                $scope.sortSchema = {
                    type: "object",
                    properties: {
                        sortbox: {
                            type: "select",
                            title: "Sırala"
                        }
                    },
                    required: ['sortbox']
                };
                $scope.sortModel = {sortbox: ''};

                $scope.sortSubmit = function (form) {
                    $scope.$broadcast('schemaFormValidate');
                    if (form.$valid) {
                        var sortparams = {
                            url: $scope.wf,
                            token: $scope.$parent.token,
                            object_id: $scope.$parent.object_id,
                            form_params: {
                                model: $scope.$parent.form_params.model,
                                cmd: $scope.$parent.reload_cmd,
                                flow: $scope.$parent.form_params.flow,
                                param: 'sort',
                                id: $scope.sortModel.sortbox
                            }
                        };

                        Generator.submit(sortparams);
                    }
                }
            }
        };
    })
    /**
     * @memberof ulakbus
     * @ngdoc directive
     * @name collapseMenu
     * @description Toggle collapses sidebar menu when clicked menu button
     */
    .directive('collapseMenu', function ($timeout, $window, $cookies) {
        return {
            templateUrl: 'shared/templates/directives/menuCollapse.html',
            restrict: 'E',
            replace: true,
            scope: {},
            controller: function ($scope, $rootScope) {
                $rootScope.collapsed = false;
                $rootScope.sidebarPinned = $cookies.get('sidebarPinned') || 1;

                $scope.collapseToggle = function () {
                    if ($window.innerWidth > '768') {
                        if ($rootScope.collapsed === false) {
                            jQuery(".sidebar").css("width", "62px");
                            jQuery(".manager-view").css("width", "calc(100% - 62px)");
                            $rootScope.collapsed = true;
                            $rootScope.sidebarPinned = 0;
                            $cookies.put('sidebarPinned', 0);
                        } else {
                            jQuery("span.menu-text, span.arrow, .sidebar footer").fadeIn(400);
                            jQuery(".sidebar").css("width", "250px");
                            jQuery(".manager-view").css("width", "calc(100% - 250px)");
                            $rootScope.collapsed = false;
                            $rootScope.sidebarPinned = 1;
                            $cookies.put('sidebarPinned', 1);
                        }
                    }
                };

                $timeout(function () {
                    if ($cookies.get('sidebarPinned') === "0") {
                        $scope.collapseToggle();
                    }
                });
            }
        };
    })
    /**
     * @memberof ulakbus
     * @ngdoc directive
     * @name headerSubmenu
     * @description Contains breadcrumb elements and loading animation
     */
    .directive('headerSubMenu', function ($location) {
        return {
            templateUrl: 'shared/templates/directives/header-sub-menu.html',
            restrict: 'E',
            replace: true,
            link: function ($scope) {
                $scope.style = 'width:calc(100% - 300px);';
                $scope.$on('$routeChangeStart', function () {
                    $scope.style = $location.path() === '/dashboard' ? 'width:calc(100% - 300px);' : 'width:%100 !important;';
                });
            }
        };
    })
    /**
     * @memberof ulakbus
     * @ngdoc directive
     * @name breadcrumb
     * @description Produces breadcrumb with related links
     */
    .directive('headerBreadcrumb', function ($location) {
        return {
            templateUrl: 'shared/templates/directives/header-breadcrumb.html',
            restrict: 'E',
            replace: false,
            link: function ($scope) {
                $scope.goBack = function () {
                    $location.state();
                }
            }
        };
    })
    /**
     * @memberof ulakbus
     * @ngdoc directive
     * @name sidebar
     * @description Changes breadcrumb when an item selected consists of menu items of related user or transaction
     * controller communicates with dashboard controller to shape menu items and authz.
     */
    .directive('sidebar', ['$location', function () {
        return {
            templateUrl: 'shared/templates/directives/sidebar.html',
            restrict: 'E',
            replace: true,
            scope: {},
            controller: function ($scope, $rootScope, $cookies, $route, AuthService, WSOps, RESTURL, $log, $location, $window, $timeout) {
                $scope.prepareMenu = function (menuItems) {
                    var newMenuItems = {};
                    angular.forEach(menuItems, function (value, key) {
                        angular.forEach(value, function (v, k) {
                            newMenuItems[k] = v;
                        });
                    });
                    return newMenuItems;
                };

                // check login status
                // AuthService.check_auth();

                var generate_dashboard = function () {
                    if ($rootScope.current_user !== true){
                        return;
                    }
                    if ($rootScope.websocketIsOpen) {
                        var sidebarmenu = $('#side-menu');
                        sidebarmenu.metisMenu();
                        WSOps.request({view: 'dashboard'})
                            .then(function (data) {
                                $scope.allMenuItems = angular.copy(data);

                                // regroup menu items based on their category
                                function reGroupMenuItems(items, baseCategory) {
                                    var newItems = {};
                                    angular.forEach(items, function (value, key) {
                                        newItems[value.kategori] = newItems[value.kategori] || [];
                                        // value['baseCategory'] = baseCategory;
                                        newItems[value.kategori].push(value);
                                    });
                                    return newItems;
                                }

                                angular.forEach($scope.allMenuItems, function (value, key) {
                                    if (key !== 'current_user' && key !== 'settings') {
                                        $scope.allMenuItems[key] = reGroupMenuItems(value, key);
                                    }
                                });

                                // quick menus to dashboard via rootscope

                                $rootScope.quick_menu = reGroupMenuItems(data.quick_menu, 'quick_menus');
                                $rootScope.quick_menu = data.quick_menu;
                                delete data.quick_menu;
                                $log.debug('quick menu', $rootScope.quick_menu);

                                // broadcast for authorized menu items, consume in dashboard to show search inputs and/or
                                // related items
                                $rootScope.$broadcast("authz", data);
                                $rootScope.searchInputs = data;

                                if (data.current_user) {
                                    // $rootScope.$broadcast("ws_turn_on");
                                    // to display main view without flickering
                                    // $rootScope.$broadcast("user_ready");
                                }

                                $rootScope.current_user = data.current_user;
                                if (data.ogrenci || data.personel) {
                                    $rootScope.current_user.can_search = true;
                                }
                                $rootScope.settings = data.settings;

                                $scope.menuItems = $scope.prepareMenu({other: $scope.allMenuItems.other});

                                $timeout(function () {
                                    sidebarmenu.metisMenu();
                                });
                            });
                            // .error(function (data, status, headers, config) {
                            //     $log.error('menu not retrieved', data);
                            //     $log.info('design switch', DESIGN.switch);
                            //     if (!DESIGN.switch) {
                            //         $location.path('/login');
                            //     }
                            // });
                    } else {
                        $timeout(function () {
                            generate_dashboard();
                        }, 500);
                    }
                };
                $scope.$on("generate_dashboard", function () {
                    generate_dashboard();
                });
                // generate_menu();

                // changing menu items by listening for broadcast
                $scope.$on("menuitems", function (event, data) {
                    var menu = {};
                    menu[data] = $scope.allMenuItems[data];
                    $rootScope.$broadcast("usermenuitems", $scope.prepareMenu(menu));
                });

                $scope.$on('selectedUser', function ($event, data) {
                    $scope.selectedUser = data;
                });

                $scope.deselectUser = function () {
                    delete $scope.selectedUser;
                    delete $scope.selectedMenuItems;
                };

                // $scope.openSidebar = function () {
                //     if ($window.innerWidth > '768') {
                //         if ($rootScope.sidebarPinned === 0) {
                //             jQuery("span.menu-text, span.arrow, .sidebar footer, #side-menu").fadeIn(400);
                //             jQuery(".sidebar").css("width", "250px");
                //             jQuery(".manager-view").css("width", "calc(100% - 250px)");
                //             $rootScope.collapsed = false;
                //         }
                //     }
                // };
                //
                // $scope.closeSidebar = function () {
                //     if ($window.innerWidth > '768') {
                //         if ($rootScope.sidebarPinned === 0) {
                //             jQuery(".sidebar").css("width", "62px");
                //             jQuery(".manager-view").css("width", "calc(100% - 62px)");
                //             $rootScope.collapsed = true;
                //         }
                //     }
                // };

                $rootScope.$watch(function ($rootScope) {
                        return $rootScope.section;
                    },
                    function (newindex, oldindex) {
                        if (newindex > -1) {
                            $scope.menuItems = [$scope.allMenuItems[newindex]];
                            $scope.collapseVar = 0;
                        }
                    });

                $scope.selectedMenu = $location.path();
                $scope.collapseVar = 0;
                $scope.multiCollapseVar = 0;

                $scope.check = function (x) {

                    if (x === $scope.collapseVar) {
                        $scope.collapseVar = 0;
                    } else {
                        $scope.collapseVar = x;
                    }

                };

                // breadcrumb function changes breadcrumb items and itemlist must be list
                $scope.breadcrumb = function (itemlist, $event) {
                    $rootScope.breadcrumblinks = itemlist;
                };

                $scope.multiCheck = function (y) {

                    if (y === $scope.multiCollapseVar) {
                        $scope.multiCollapseVar = 0;
                    } else {
                        $scope.multiCollapseVar = y;
                    }
                };
            }
        };
    }])
    /**
     * @memberof ulakbus
     * @ngdoc directive
     * @name rightSidebar
     * @description placeholder
     */
    .directive('rightSidebar', ['$location', function () {
        return {
            templateUrl: 'shared/templates/directives/right-sidebar.html',
            restrict: 'E',
            replace: true,
            scope: {},
            controller: function ($scope, $rootScope, $cookies, $route, $http, RESTURL, $log, $location, $window, $timeout) {
                var sidebarUserMenu = $('#side-user-menu');
                sidebarUserMenu.metisMenu();

                $scope.$on("usermenuitems", function (event, data) {
                    $scope.selectedMenuItems = data;
                    $timeout(function () {
                        sidebarUserMenu.metisMenu();
                    });
                    jQuery(".right-sidebar").css("width", "300px");
                    jQuery(".manager-view-inner").css("width", "calc(100% - 300px)");
                });

                $scope.$on('selectedUser', function ($event, data) {
                    $scope.selectedUser = data;
                });

                $scope.deselectUser = function () {
                    jQuery(".right-sidebar").css("width", "0px");
                    jQuery(".manager-view-inner").css("width", "");
                    delete $scope.selectedUser;
                    delete $scope.selectedMenuItems;
                };

                $rootScope.$watch(function ($rootScope) {
                        return $rootScope.section;
                    },
                    function (newindex, oldindex) {
                        if (newindex > -1) {
                            $scope.menuItems = [$scope.allMenuItems[newindex]];
                            $scope.collapseVar = 0;
                        }
                    });

                $scope.selectedMenu = $location.path();
                $scope.collapseVar = 0;
                $scope.multiCollapseVar = 0;

                $scope.check = function (x) {
                    if (x === $scope.collapseVar) {
                        $scope.collapseVar = 0;
                    } else {
                        $scope.collapseVar = x;
                    }
                };

                $scope.multiCheck = function (y) {
                    if (y === $scope.multiCollapseVar) {
                        $scope.multiCollapseVar = 0;
                    } else {
                        $scope.multiCollapseVar = y;
                    }
                };
            }
        }
    }])
    /**
     * @memberof ulakbus
     * @ngdoc directive
     * @name stats
     * @description Statistical data directive.
     * @todo unused for now
     */
    .directive('stats', function () {
        return {
            templateUrl: 'shared/templates/directives/stats.html',
            restrict: 'E',
            replace: true,
            scope: {
                'model': '=',
                'comments': '@',
                'number': '@',
                'name': '@',
                'colour': '@',
                'details': '@',
                'type': '@',
                'goto': '@'
            }

        };
    })
    /**
     * @memberof ulakbus
     * @ngdoc directive
     * @name notifications
     * @description Holds notifications template with related rootscope items.
     */
    .directive('notifications', function () {
        return {
            templateUrl: 'shared/templates/directives/notifications.html',
            restrict: 'E',
            replace: true
        };
    })
    /**
     * @memberof ulakbus
     * @ngdoc directive
     * @name msgbox
     * @description Holds msgbox template with related rootscope items.
     */
    .directive('msgbox', function () {
        return {
            templateUrl: 'shared/templates/directives/msgbox.html',
            restrict: 'E',
            replace: false
        };
    })
    /**
     * @memberof ulakbus
     * @ngdoc directive
     * @name alertBox
     * @description Triggers when `alertBox` broadcasted with alert data..
     */
    .directive('alertBox', function ($timeout) {
        return {
            templateUrl: 'shared/templates/directives/alert.html',
            restrict: 'E',
            replace: true,
            link: function ($scope) {
                $scope.$on('alertBox', function ($event, data) {
                    $timeout(function () {
                        delete $scope.alerts;
                    }, 5000);
                    $scope.alerts = [data];
                });
            }
        };
    })
    /**
     * @memberof ulakbus
     * @ngdoc directive
     * @name sidebarSearch
     * @description unused for now
     */
    .directive('sidebarSearch', function () {
        return {
            templateUrl: 'shared/templates/directives/sidebar-search.html',
            restrict: 'E',
            replace: true,
            scope: {},
            controller: function ($scope) {
                $scope.selectedMenu = 'home';
            }
        };
    })
    /**
     * @memberof ulakbus
     * @ngdoc directive
     * @name fileread
     * @description Fileread directive is responsible for reading uploaded file and replace it to related model item.
     * @todo implement preview only for images
     */
    .directive("fileread", function ($timeout) {
        return {
            scope: {
                fileread: "="
            },
            link: function (scope, element, attributes) {
                element.bind("change", function (changeEvent) {
                    var reader = new FileReader();
                    reader.onload = function (loadEvent) {
                        scope.$apply(function () {
                            scope.fileread = loadEvent.target.result;
                        });
                        $timeout(function () {
                            scope.$parent.model[changeEvent.target.name] = {
                                file_name: changeEvent.target.files[0].name,
                                file_content: scope.$parent.model[changeEvent.target.name]
                            }
                            document.querySelector('#image-preview').src = URL.createObjectURL(changeEvent.target.files[0]);
                        });
                    }
                    reader.readAsDataURL(changeEvent.target.files[0]);
                });
            }
        }
    });
