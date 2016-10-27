'use strict';

angular.module('knowledges').controller('KnowledgesController', ['$scope', '$stateParams', '$location', 'Authentication', 'KnowledgesService', 'KnowingUserService',
    function($scope, $stateParams, $location, Authentication, KnowledgesService, KnowingUserService) {
        $scope.authentication = Authentication;

        $scope.add = {
            name : '',
            parents : []
        };

        $scope.addParent = function(){
            $scope.add.parents.push('');
        };

        $scope.addKnowledge = function(){
            KnowledgesService.add($scope.add, function(response) {
                $scope.create = {
                    name : '',
                    parents : []
                };
                $scope.success = true;
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });

        };

        $scope.exampleKwoningData = {
            email : $scope.authentication.user ? $scope.authentication.user.email : null,
            appName : 'ExampleApp1',
            tags : []
        };

        $scope.example1 = function(){
            $scope.exampleKwoningData.tags = ['Noticias', 'Deportes', 'Boca'];
            $scope.exampleKnowingSend();
        };

        $scope.example2 = function(){
            $scope.exampleKwoningData.tags = ['Salud', 'Psicologia'];
            $scope.exampleKnowingSend();
        };

        $scope.exampleKnowingSend = function(){
            KnowingUserService.sendTags($scope.exampleKwoningData, function(response){
                $scope.success = response;
            }, function (error){
                $scope.error = error.data.message;
            });
        };
    }
]);
