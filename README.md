# jRotator
jRotator — a jQuery rotator plugin. 

A simple jQuery rotator with smart defaults. This rotator uses CSS ```translation``` & ```transform``` to rotate elements across the screen—making it performant for mobile devices.

## Usage

```
<script src="https://code.jquery.com/jquery-2.2.0.min.js"></script>
<script src="src/js/jRotator.min.js"></script>
``` 

Call the jRotator: 

```
$('.parent').jRotator();
```

The markup should look something like so: 
```
<div class="parent">
	<div class="child">
	</div>
	<div class="child">
	</div>
	<div class="child">
	</div>
</div>
```

No restrictions, just make sure the following styles are applied:

```
.parent {
    position: relative;
    overflow: hidden;
}

.child {
    position: absolute;
    vertical-align: middle;
    display: inline-block;
}

.notransition {
    -webkit-transition: none !important;
    -moz-transition: none !important;
    -o-transition: none !important;
    -ms-transition: none !important;
    transition: none !important;
}
```

## Configuration

#translationSpeed

Speed of the jRotator. Lower means slower. Default is ```100```. Override with:

$('.parent').jRotator({translationSpeed: 100});