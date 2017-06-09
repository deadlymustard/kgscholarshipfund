// script.js

    // create the module and name it wiffle
        // also include ngRoute for all our routing needs
    var wiffle = angular.module('wiffle', ['ngRoute', 'paypal-button']);

    // configure our routes
    wiffle.config(function ($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix('');
    $routeProvider

            // route for the home page
            .when('/', {
                templateUrl : 'pages/about.html',
                controller  : 'mainController'
            })

            .when('/event', {
                templateUrl : 'pages/event.html',
                controller  : 'eventController'
            })

            .when('/rules', {
                templateUrl : 'pages/rules.html',
                controller  : 'rulesController'
            })

            .when('/register_friendly', {
                templateUrl : 'pages/register_friendly.html',
                controller  : 'registerFriendlyController'
            })

            .when('/register_competitive', {
                templateUrl : 'pages/register_competitive.html',
                controller  : 'registerCompetitiveController'
            })
            .when('/register/team/:team_id',  {
                templateUrl : 'pages/confirmation.html',
                controller  : 'confirmationController'
            })
    });

    // create the controller and inject Angular's $scope
    wiffle.controller('mainController', function($scope) {
        // create a message to display in our view
        $scope.message = 'Everyone come and see how good I look!';
    });

    wiffle.controller('eventController', function($scope) {
        $scope.message = 'Look! I am an event page.';
    });

    wiffle.controller('rulesController', function($scope) {


    });

    wiffle.controller('registerFriendlyController', function($scope) {
        $scope.message = 'Rule us! JK. This is just a demo.';
    });

    wiffle.controller('registerCompetitiveController', function($scope, $http, $location) {
        $scope.isDisabled = false;
        $scope.members = [{id: 'member1'}, {id: 'member2'}, {id: 'member3'}, {id: 'member4'}];
        $scope.isDisabled = false;
        calculateTotals = function() {
            $scope.memberCount = $scope.members.length - 4;
            $scope.memberTotal = $scope.memberCount * 25;
            $scope.finalTotal = 100 + $scope.memberTotal;
        };
        calculateTotals();

        $scope.addNewMember = function() {
            var newItemNo = $scope.members.length+1;
            $scope.members.push({'id':'member'+newItemNo});
            calculateTotals();
        };

        $scope.removeMember = function() {
            if($scope.memberCount <= 0) {
                alert("You cannot have less than 4 members on a team.");
            } else {
                var lastItem = $scope.members.length-1;
                $scope.members.splice(lastItem);
                calculateTotals();

            } 
        };

        $scope.submitTeam = function() {

            var valid = true;

            if($scope.team_name == null || $scope.team_name == "" || 
                $scope.phone == null || $scope.phone == "" || 
                $scope.email == null || $scope.email == "") 
            {
                valid = false;
            }

            for(var i = 0; i < $scope.members.length; i++) {
                if($scope.members[i].name == null || $scope.members[i].name == "" ||
                    $scope.members[i].number == null || $scope.members[i].number == "" ||
                    $scope.members[i].shirt_size == null || $scope.members[i].shirt_size == "") 
                {
                    valid = false;
                }
            }

            if(valid == true) {
                var teamOutput = {
                    "name": $scope.team_name,
                    "email": $scope.email,
                    "phone": $scope.phone,
                    "members": [
                        $scope.members
                    ],
                    "price": $scope.finalTotal
                };

                console.log("Outbound JSON: " + JSON.stringify(teamOutput, null, 2));

                // $scope.isDisabled = true;
                $http({
                  method: 'POST',
                  data: teamOutput,
                  url: '/register'
                }).then(function successCallback(response) {
                    var hash = response.data.hash;
                    $location.path('/register/team/team_id=' + hash);
                  }, function errorCallback(response) {
                    console.log(response);
                  });
            } else {
                alert("One or more fields is blank. Please fill in all fields.");
            }   
        };      
    });

    wiffle.controller('confirmationController', function($scope, $http, $routeParams) {
        // $scope.isDisabled = true;


        var params = $routeParams.team_id;
        var query = '/register/team/' + params;


        console.log(query);
        $http({
          method: 'GET',
          url: query
        }).then(function successCallback(response) {
            console.log(response);

            paypal.Button.render({

            env: 'sandbox', // sandbox | production

            // PayPal Client IDs - replace with your own
            // Create a PayPal app: https://developer.paypal.com/developer/applications/create
            client: {
                sandbox:    'AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF4eYXlewfBP4-8aqX3PiV8e1GWU6liB2CUXlkA59kJXE7M6R',
                production: '<insert production client id>'
            },

            // Show the buyer a 'Pay Now' button in the checkout flow
            commit: true,

            // payment() is called when the button is clicked
            payment: function(data, actions) {

                // Make a call to the REST api to create the payment
                return actions.payment.create({
                    transactions: [
                        {
                            amount: { total: response.data.price, currency: 'USD' }
                        }
                    ]
                });
            },

            // onAuthorize() is called when the buyer approves the payment
            onAuthorize: function(data, actions) {

                // Make a call to the REST api to execute the payment
                return actions.payment.execute().then(function() {
                    window.alert('Payment Complete!');
                });
            }

            }, '#paypal-button-container');



           
            // this callback will be called asynchronously
            // when the response is available
          }, function errorCallback(response) {
            console.log(response);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });





    });
