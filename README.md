# Angular Google Analytics
Google Analytics wrapper for Angular

## Usage

### Reference script and Universal GA snippet
```html
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
</script>

<script src="ng-google-analytics.min.js"></script>
```

Check official docs for up-to-date snippet

### Inject `vtex.ga`
```coffeescript
angular.module 'yourApp', ['vtex.ga']
```

### Extend gaConfig with any properties needed and it will all be submitted when creating the tracker

```coffeescript
.config (gaConfig) ->
  gaConfig.trackingId = 'XX-XXXXXXXX-X'
  gaConfig.appId = 'your_app_ID'
  gaConfig.userId = 'current_user_ID'
```

**Disable auto tracking of *virtual* pageviews:**
```coffeescript
.config (gaConfig) -> gaConfig.enableVirtualPageviews = false
```

**Auto tracking of $http errors with `gaInterceptor`**
```coffeescript
.config ($httpProvider) -> $httpProvider.interceptors.push 'gaInterceptor'
```

### Directive and binding
Defaults and shortcuts:
- `ga-event`
- `ga-category`: "button"
- `ga-action`: "click" ( *serves as trigger if `ga-on` isn't specified.* )
- `ga-label`: element's `label`, `name` or `id` attributes
- `ga-on`: `ga-action`'s `attrs.value` or "click" ( *this is what fires events to GA*, e.g: "hover" )

An example taking advantage of defaults:
```html
<button id="sign-up" class="btn btn-primary" ga-event>Sign Up</button>
```

Full usage:
```html
<button class="btn btn-primary"
        ga-event ga-category="button" ga-action="click"
        ga-label="sign-up" ga-on="click">Sign Up</button>
```

### API `gaService`
#### trackEvent [eventData]
- Object containing event data: `category`, `action`, `label`, `value`
- Optional `metadata` Object as well
- `value` must be a `number`, not required (check Universal Analytics docs)

e.g.:

```coffeescript
eventData =
  category: 'button'
  action: 'click'
  label: 'Sign Up'
  value: 10
```

#### trackPageview page
- `page` is a string, e.g.: `location.href`, default: (`location.pathname` + `location.hash`)

#### trackClick label, value
- Shortcut to

```coffeescript
@trackEvent
  category: 'button'
  action: 'click'
  label: `label`
  value: `value`
```

### Changelog
- **v2.0.0**: `gaService.trackEvent` now expects *Object* instead of *Array* for better validation of properties values and order before dispatching everything to GA. Refactors code and *README* in order to optimize usage for new **Universal Analytics**.

### Development
Inside `src` you can find this module source code, written in **CoffeeScript**. To build the `.js` and uglify it, install npm dev-dependencies and run grunt:

    (sudo) npm i
    grunt
