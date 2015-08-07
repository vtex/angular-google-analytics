(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    slice = [].slice;

  angular.module('vtex.ga', []).constant('gaConfig', {
    enableVirtualPageviews: true
  }).factory('GAEvent', function() {
    var GAEvent;
    return GAEvent = (function() {
      function GAEvent(data) {
        var parsedValue, ref;
        if (data == null) {
          data = {};
        }
        if ((!angular.isObject(data)) || (angular.isArray(data))) {
          return;
        }
        parsedValue = (ref = parseInt(data.value)) != null ? ref : data.value;
        this.category = data.category;
        this.action = data.action;
        this.label = gaConfig.appId ? gaConfig.appId + ': ' + data.label : data.label;
        this.value = typeof parsedValue === 'number' ? parsedValue : null;
        this.metadata = angular.isObject(data.metadata) ? data.metadata : {};
      }

      return GAEvent;

    })();
  }).service('gaService', function($rootScope, $window, $timeout, gaConfig, GAEvent) {
    var GAService;
    return new (GAService = (function() {
      var class1;

      function GAService() {
        this.trackHttpError = bind(this.trackHttpError, this);
        this.trackClick = bind(this.trackClick, this);
        return class1.apply(this, arguments);
      }

      class1 = GAService.create;

      GAService.prototype.create = function() {
        var config, data, k, v;
        config = {};
        for (k in gaConfig) {
          v = gaConfig[k];
          if (k !== 'trackingId') {
            config[k] = v;
          }
        }
        data = gaConfig.userId ? config : 'auto';
        return $window.ga('create', gaConfig.trackingId, data);
      };

      GAService.prototype.trackPageview = function(page) {
        return $window.ga('send', 'pageview', page != null ? page : location.pathname + location.hash);
      };

      GAService.prototype.trackEvent = function(data) {
        var event, filteredData, k, ref, v;
        if (data == null) {
          data = {};
        }
        event = new GAEvent(data);
        filteredData = [];
        ref = angular.copy(event);
        for (k in ref) {
          v = ref[k];
          if ((v != null) || (v != null ? v.length : void 0)) {
            filteredData.push(v);
          }
        }
        return $window.ga.apply($window, ['send', 'event'].concat(slice.call(filteredData)));
      };

      GAService.prototype.trackClick = function(label, value) {
        if (value == null) {
          value = null;
        }
        return this.trackEvent({
          category: 'button',
          action: 'click',
          label: label,
          value: value
        });
      };

      GAService.prototype.trackHttpError = function(rejection) {
        var ref, ref1;
        return this.trackEvent({
          category: 'http',
          action: 'error',
          label: rejection.config.method + " " + rejection.config.url + " (" + rejection.status + ")",
          value: null,
          metadata: {
            status: rejection.status,
            statusText: rejection.statusText,
            message: (ref = rejection.data.error) != null ? ref.message : void 0,
            exception: (ref1 = rejection.data.error) != null ? ref1.exception : void 0,
            url: rejection.config.url,
            params: rejection.config.params,
            headers: rejection.config.headers,
            userAgent: $window.navigator.userAgent
          }
        });
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
        var appId, trigger;
        appId = gaConfig.appId;
        trigger = attrs.gaOn || 'click';
        return angular.element(elem).bind(trigger, function() {
          var data, ref;
          data = {
            category: attrs.gaCategory,
            action: attrs.gaAction,
            label: (ref = attrs.gaLabel) != null ? ref : attrs.name || attrs.label || attrs.id,
            value: attrs.gaValue,
            metadata: attrs.gaMetadata || attrs.metadata
          };
          if (!(data.category || data.action)) {
            return;
          }
          return gaService.trackEvent(data);
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
