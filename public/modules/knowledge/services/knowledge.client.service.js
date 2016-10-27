'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('knowledges')
    .factory('KnowledgesService', ['$resource',
        function($resource) {
            return $resource('/knowledge', null,
                {
                    'add': {
                        method:'POST'
                    }
                });
        }
    ])
    .factory('KnowingUserService', ['$resource',
        function($resource) {
            return $resource('/knowing', null,
                {
                    'sendTags': {
                        method:'POST',
                        isArray: true
                    }
                });
        }
    ]);
