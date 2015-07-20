# Angular Google Analytics
Google Analytics wrapper for Angular

## Usage

### Reference script
```html
<script src="ng-google-analytics.min.js"></script>
```

### Inject `vtex.ga`
```coffeescript
angular.module 'yourApp', ['vtex.ga']
```

### Extend gaConfig with any properties needed and it will all be submitted when creating the tracker

```coffeescript
.config (gaConfig) ->
    gaConfig.trackingId = 'XX-XXXXXXXX-X'
    gaConfig.appId = vtex.topbar.utils.config.application.name
    gaConfig.userId = vtex.topbar.utils.user.id
```

**Disable auto tracking of *virtual* pageviews:**
```coffeescript
.config (gaConfig) -> gaConfig.enableVirtualPageviews = false
```

### Directive and binding
Defaults and shortcuts:
- `ga-event`
- `ga-category`: "button"
- `ga-action`: "click" ( *serves as trigger if `ga-on` isn't specified.* )
- `ga-label`: element's `label`, `name` or `id` attributes
- `ga-value`: element's `value` attribute
- `ga-on`: `ga-action`'s value or "click" ( *this is what fires events to GA*, e.g: "hover", "mouseleave" )

An example taking advantage of defaults:
```html
<button id="sign-up" class="btn btn-primary" value="Sign Up" ga-event></button>
```

Full usage:
```html
<button class="btn btn-primary"
        ga-event ga-category="button" ga-action="click"
        ga-label="sign-up" ga-value="Sign up" ga-on="click">Sign Up</button>
```

### Development
Inside `src` you can find this module source code, written in **CoffeeScript**. To build the `.js` and uglify it, install npm dev-dependencies and run grunt:

    (sudo) npm i
    grunt

**Don't forget to build after updating the version and before committing any changes, since it's version appears in minified files.**
