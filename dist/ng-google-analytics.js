(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    slice = [].slice;

  angular.module('vtex.ga', []).constant('gaConfig', {
    enableVirtualPageviews: true
  }).service('gaService', function($rootScope, $window, $timeout, gaConfig) {
    var GAService;
    return new (GAService = (function() {
      function GAService() {
        this.trackHttpError = bind(this.trackHttpError, this);
        this.trackClick = bind(this.trackClick, this);
        this.create();
      }

      GAService.prototype.create = function() {
        var data;
        data = gaConfig.userId ? _.omit(gaConfig, 'trackingId') : 'auto';
        return $window.ga('create', gaConfig.trackingId, data);
      };

      GAService.prototype.generateLabel = function(label) {
        if (gaConfig.appId) {
          return gaConfig.appId + ': ' + label;
        } else {
          return label;
        }
      };

      GAService.prototype.trackPageview = function(page) {
        return $window.ga('send', 'pageview', page != null ? page : location.pathname + location.hash);
      };

      GAService.prototype.trackEvent = function(metadata) {
        if (metadata == null) {
          metadata = [];
        }
        return $window.ga.apply($window, ['send', 'event'].concat(slice.call(metadata)));
      };

      GAService.prototype.trackClick = function(label, value) {
        if (value == null) {
          value = null;
        }
        return this.trackEvent(['button', 'click', this.generateLabel(label), value]);
      };

      GAService.prototype.trackHttpError = function(rejection) {
        var label, ref, ref1;
        label = this.generateLabel(rejection.config.method + " " + rejection.config.url + " (" + rejection.status + ")");
        return this.trackEvent([
          'http', 'error', label, {
            status: rejection.status,
            statusText: rejection.statusText,
            message: (ref = rejection.data.error) != null ? ref.message : void 0,
            exception: (ref1 = rejection.data.error) != null ? ref1.exception : void 0,
            url: rejection.config.url,
            params: rejection.config.params,
            headers: rejection.config.headers,
            userAgent: $window.navigator.userAgent
          }
        ]);
      };

      return GAService;

    })());
  }).service('gaInterceptor', function($q, gaService) {
    var GAInterceptor;
    return new (GAInterceptor = (function() {
      function GAInterceptor() {}

      GAInterceptor.prototype.responseError = function(rejection) {
        gaService.trackHttpError(rejection);
        return $q.reject(rejection);
      };

      return GAInterceptor;

    })());
  }).directive('gaEvent', function($window, gaConfig, gaService) {
    return {
      restrict: 'A',
      link: function(scope, elem, attrs) {
        var action, category, label, metadata, ref, ref1, trigger, value;
        category = attrs.gaCategory;
        action = attrs.gaAction;
        label = (ref = attrs.gaLabel) != null ? ref : attrs.name || attrs.label || attrs.id;
        value = (ref1 = attrs.gaValue) != null ? ref1 : attrs.value;
        trigger = attrs.gaOn;
        if (!label) {
          return;
        }
        category || (category = 'button');
        action || (action = 'click');
        if (gaConfig.appId) {
          label = gaConfig.appId + ' ' + label;
        }
        metadata = _.filter([category, action, label, value], function(data) {
          return data != null;
        });
        return angular.element(elem).bind(trigger != null ? trigger : action, function() {
          return gaService.trackEvent(metadata);
        });
      }
    };
  }).run(function($rootScope, $window, $timeout, gaConfig, gaService) {
    if (gaConfig.enableVirtualPageviews) {
      return $rootScope.$on('$stateChangeSuccess', function() {
        return $timeout(gaService.trackPageview);
      });
    }
  });

}).call(this);
