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
    'beings_from_beyond.md',
    'black_dog_bark.md',
    'born_at_dusk.md',
    'chimera.md',
    'death_coffin_maker.md',
    'fear_itself.md',
    'indomitable.md',
    'interview_with_a_genejack.md',
    'myleton_motor_inn.md',
    'names.md',
    'night_judge.md',
    'no_greater_act.md',
    'self_defense.md',
    'spei_mythos.md',
    'the_buddha_of_accounting.md',
    'the_human_spirit.md',
    'the_secret_life_of_accountants.md',
    'the_specter.md',
    'willful_ignorance.md'
])
// factories
.factory('parseStory', [
  'yaml', 'md', '$sce',
  function (yaml, md, $sce) {
    return function (res) {
      console.log(res);
      var end_of_metadata = res.data.indexOf('\n\n');
      var metadata = yaml.safeLoad(res.data.slice(0, end_of_metadata));
      var text = md(res.data.slice(end_of_metadata + 2));
      var story_id_prefix = 'stories/';
      var story_id_index = res.config.url.indexOf(story_id_prefix);
      var story_id = res.config.url.slice(story_id_index + story_id_prefix.length);
      return {
        title: metadata.title,
        date: metadata.date,
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
