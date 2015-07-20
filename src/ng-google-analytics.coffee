angular.module('vtex.ga', [])

.constant 'gaConfig',
  enableVirtualPageviews: true


.service 'gaService', ($rootScope, $window, $timeout, gaConfig) ->
  new class GAService
    constructor: -> @create()

    create: ->
      data = if gaConfig.userId then (_.omit gaConfig, 'trackingId') else 'auto'
      $window.ga 'create', gaConfig.trackingId, data

    generateLabel: (label) -> if gaConfig.appId then (gaConfig.appId + ': ' + label) else label

    trackPageview: (page) -> $window.ga 'send', 'pageview', (page ? (location.pathname + location.hash))

    trackEvent: (metadata = []) -> $window.ga 'send', 'event', metadata...

    trackClick: (label, value = null) => @trackEvent ['button', 'click', (@generateLabel label), value]

    trackHttpError: (rejection) =>
      label = @generateLabel("#{rejection.config.method} #{rejection.config.url} (#{rejection.status})")

      @trackEvent ['http', 'error', label, {
        status: rejection.status
        statusText: rejection.statusText
        message: rejection.data.error?.message
        exception: rejection.data.error?.exception
        url: rejection.config.url
        params: rejection.config.params
        headers: rejection.config.headers
        userAgent: $window.navigator.userAgent
      }]


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
      category = attrs.gaCategory
      action = attrs.gaAction
      label = attrs.gaLabel ? (attrs.name or attrs.label or attrs.id)
      value = attrs.gaValue ? attrs.value

      return if not (category or action or label)

      label = appId + ' ' + label if appId
      eventData = _.filter [category, action, label, value], (data) -> data?

      gaService.trackEvent eventData


.run ($rootScope, $window, $timeout, gaConfig, gaService) ->
  if gaConfig.enableVirtualPageviews
    $rootScope.$on '$stateChangeSuccess', -> $timeout gaService.trackPageview
