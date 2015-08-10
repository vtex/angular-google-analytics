angular.module('vtex.ga', [])

.constant 'gaConfig',
  enableVirtualPageviews: true


.factory 'GAEvent', ->
  class GAEvent
    constructor: (data = {}) ->
      return if (not angular.isObject data) or (angular.isArray data)
      parsedValue = parseInt(data.value) ? data.value

      @category = data.category
      @action = data.action
      @label = if gaConfig.appId then (gaConfig.appId + ': ' + data.label) else data.label
      @value = if typeof parsedValue is 'number' then parsedValue else null
      @metadata = if angular.isObject data.metadata then data.metadata else {}


.service 'gaService', ($rootScope, $window, $timeout, gaConfig, GAEvent) ->
  new class GAService
    constructor: -> @create()

    create: ->
      config = {}
      config[k] = v for k, v of gaConfig when k isnt 'trackingId'

      data = if gaConfig.userId then config else 'auto'
      $window.ga 'create', gaConfig.trackingId, data

    trackPageview: (page) -> $window.ga 'send', 'pageview', (page ? (location.pathname + location.hash))

    trackEvent: (data = {}) ->
      event = new GAEvent data

      filteredData = []
      filteredData.push v for k, v of angular.copy event when v? or v?.length

      $window.ga 'send', 'event', filteredData...

    trackClick: (label, value = null) =>
      @trackEvent
        category: 'button'
        action: 'click'
        label: label
        value: value

    trackHttpError: (rejection) =>
      @trackEvent
        category: 'http'
        action: 'error'
        label: "#{rejection.config.method} #{rejection.config.url} (#{rejection.status})"
        value: null
        metadata:
          status: rejection.status
          statusText: rejection.statusText
          message: rejection.data.error?.message
          exception: rejection.data.error?.exception
          url: rejection.config.url
          params: rejection.config.params
          headers: rejection.config.headers
          userAgent: $window.navigator.userAgent


.service 'gaInterceptor', ($q, gaService) ->
  new class GAInterceptor
    responseError: (rejection) ->
      gaService.trackHttpError rejection
      $q.reject rejection


.directive 'gaEvent', ($window, gaConfig, gaService) ->
  restrict: 'A'
  link: (scope, elem, attrs) ->
    appId = gaConfig.appId
    trigger = attrs.gaOn or 'click'

    angular.element(elem).bind trigger, ->

      data =
        category: attrs.gaCategory
        action: attrs.gaAction
        label: attrs.gaLabel ? (attrs.name or attrs.label or attrs.id)
        value: attrs.gaValue
        metadata: attrs.gaMetadata or attrs.metadata

      return if not (data.category or data.action)

      gaService.trackEvent data


.run ($rootScope, $window, $timeout, gaConfig, gaService) ->
  if gaConfig.enableVirtualPageviews
    $rootScope.$on '$stateChangeSuccess', -> $timeout gaService.trackPageview
