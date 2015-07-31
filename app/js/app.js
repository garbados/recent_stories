require('angular').module('app', [
  require('angular-route')  
])
// URL router
.config([
  '$routeProvider',
  function ($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: 'list.html',
      controller: 'ListCtrl'
    });

    $routeProvider.when('/story/:id', {
      templateUrl: 'show.html',
      controller: 'ShowCtrl'
    });
  }
])
// constants
.constant('yaml', require('js-yaml'))
.constant('md', require('marked'))
.constant('stories', [
    'the_tunnels_pt_1.md',
    'robot_capitalism.md'
])
.constant('months', [
  "January", 
  "February", 
  "March", 
  "April", 
  "May", 
  "June",
  "July", 
  "August", 
  "September", 
  "October", 
  "November", 
  "December"
])
// factories
.factory('parseStory', [
  'yaml', 'md', '$sce', 'months',
  function (yaml, md, $sce, months) {
    return function (res) {
      var end_of_metadata = res.data.indexOf('\n\n');
      var metadata = yaml.safeLoad(res.data.slice(0, end_of_metadata));
      var story_date = metadata.date.split(', ');
      story_date = new Date(story_date[1], months.indexOf(story_date[0]));
      var text = md(res.data.slice(end_of_metadata + 2));
      var story_id_prefix = 'stories/';
      var story_id_index = res.config.url.indexOf(story_id_prefix);
      var story_id = res.config.url.slice(story_id_index + story_id_prefix.length);
      return {
        title: metadata.title,
        date_string: metadata.date,
	date: story_date,
        summary: metadata.summary,
        text: $sce.trustAsHtml(text),
        id: story_id
      };
    };
  }
])
.factory('getStory', [
  'parseStory', '$http',
  function (parseStory, $http, stories) {
    return function (story) {
      var story_url = ['stories', story].join('/');
      return $http.get(story_url).then(parseStory);
    };
  }
])
.factory('getStories', [
    'stories', 'getStory', '$q',
    function (stories, getStory, $q) {
      return $q.all(stories.map(getStory));
    }
])
// controllers
.controller('ListCtrl', [
    'getStories', '$scope',
    function (getStories, $scope) {
      getStories.then(function (results) {
        $scope.stories = results;
      });
    }
])
.controller('ShowCtrl', [
    'getStory', '$routeParams', '$scope',
    function (getStory, $routeParams, $scope) {
      getStory($routeParams.id).then(function (res) {
        $scope.story = res;
        $scope.story.expand = true;
        $scope.story.hide_buttons = true;
      });
    }
]);
